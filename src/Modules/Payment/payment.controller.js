import Stripe from "stripe";
import cartModel from "../../../DB/Models/cart.model.js";
import couponModel from "../../../DB/Models/coupon.model.js";
import courseModel from "../../../DB/Models/course.model.js";
import paymentModel from "../../../DB/Models/payment.model.js";
import { deleteCouresFromCart, emptyCart } from "../Cart/cart.controller.js";
import stripePayment from "../../Utils/stripePayment.js";
import { createInvoice } from "../../Utils/pdf.js";
import { sendEmail } from "../../Utils/sendEmail.js";
import userModel from "../../../DB/Models/user.model.js";

export const getPayment = async (req, res, next) => {
    const payment = await userModel.findOne({ _id: req.user._id }).populate([{
        path: 'payment'
    }]).select('payment');

    if (!payment) {
        return next(new Error("not found payment", { cause: 400 }))
    }
    return res.status(200).json({ message: 'Payment Module', payment })
}

export const createPayment = async (req, res, next) => {
    const { paymentType, phone, couponName } = req.body;

    // check if thier courses in cart 
    if (!req.body.courses) {
        const cart = await cartModel.findOne({ userId: req.user._id });
        if (!cart?.courses?.length) {
            return next(new Error("cart is empty", { cause: 400 }));
        }
        req.body.isCart = true;
        req.body.courses = cart.courses;
    }
    // check if their coupon
    if (couponName) {
        const coupon = await couponModel.findOne({ name: couponName.toLowerCase(), usedBy: { $nin: req.user._id } });
        if (!coupon || coupon.expireDate?.getTime() > Date.now()) {
            return next(new Error("in-valid coupon or expire date", { cause: 400 }));
        }
        req.body.coupon = coupon;
    }
    // after check course is found in cart , will check this course avilable
    const couresesIds = [];
    const finalCoursesList = [];
    let suptotal = 0;
    for (let course of req.body.courses) {
        const checkCourse = await courseModel.findOne({
            _id: course.courseId,
            isDeleted: false,
            seat: { $gte: course.quntity }
        });
        if (!checkCourse) {
            return next(new Error(`in-valid course id ${course.courseId}`, { cause: 400 }));
        }
        // check thier data in cart , then add info of course model what is accordding of payment model
        if (req.body.isCart) {
            course = course.toObject();
        }
        couresesIds.push(course.coureseId);

        course.name = checkCourse.title;
        course.image = checkCourse.image;
        course.unitPrice = checkCourse.finalPrice;
        course.finalPrice = course.quntity * checkCourse.finalPrice.toFixed(2);

        finalCoursesList.push(course);
        suptotal += course.finalPrice;
    }
    // create payment model
    let count = finalCoursesList.length;

    const payment = await paymentModel.create({
        userId: req.user._id,
        phone,
        count,
        courses: finalCoursesList,
        couponId: req.body.coupon?._id,
        suptotal,
        finalPrice: suptotal - (suptotal * ((req.body.coupon?.subscrip || 0) / 100)).toFixed(2),
        paymentType
    });
    // decrease course from seat
    for (const course of req.body.courses) {
        await courseModel.updateOne({ _id: course.courseId }, { $inc: { seat: -parseInt(course.quntity) } })
    }
    // push user id in coupon usedBy
    if (req.body.coupon) {
        await couponModel.updateOne({ _id: req.body.coupon?._id }, { $addToSet: { usedBy: req.user._id } })
    }
    if (req.body.isCart) {
        await emptyCart(req.user._id);
    } else {
        await deleteCouresFromCart(couresesIds, req.body._id);
    }
    // payment by stripe
    if (payment.paymentType == 'card') {
        const stripe = new Stripe(process.env.STRIPE_KEY);
        if (req.body.coupon) {
            const coupon = await stripe.coupons.create({ percent_off: req.body.coupon.subscrip, duration: 'once' });
            req.body.couponId = coupon.id;
        }
        const session = await stripePayment({
            stripe: new Stripe(process.env.STRIPE_KEY),
            payment_method_types: ['card'],
            mode: 'payment',
            customer_email: req.user.email,
            metadata: { paymentId: payment._id.toString() },
            success_url: `${process.env.SUCCESS_URL}?paymentId=${payment._id.toString()}`,
            cancel_url: `${process.env.CANCEL_URL}?paymentId=${payment._id.toString()}`,
            discounts: req.body.couponId ? [{ coupon: req.body.couponId }] : [],
            line_items: payment.courses.map((course) => {
                return {
                    price_data: {
                        currency: 'usd',
                        product_data: {
                            name: course.name,
                            images: [course.image.secure_url]
                        },
                        unit_amount: course.unitPrice * 100
                    },
                    quantity: course.quntity
                }
            })
        });
        // generate pdf 
        const invoice = {
            shipping: {
                name: req.user.userName,
                address: "Egypt",
                city: "Cairo",
                state: "Cairo",
                country: "Egypt",
                postal_code: 94111
            },
            items: payment.courses,
            subtotal: suptotal,
            total: payment.finalPrice,
            invoice_nr: payment._id,
            date: payment.createdAt
        };
        await createInvoice(invoice, "invoice.pdf");

        const emailSend = await sendEmail({
            to: "moh246samy@gmail.com",
            message: "please check your invoice pdf",
            subject: 'Payment Invoice',
            attachments: [
                {
                    path: "invoice.pdf",
                    contentType: "application/pdf"
                }
            ]
        })
        if (!emailSend) {
            return res.json({ message: 'Email Rejected' })
        }

        return res.status(201).json({ message: "Done", payment, url: session.url });
    }
    // generate pdf 
    const invoice = {
        shipping: {
            name: req.user.userName,
            address: "Egypt",
            city: "Cairo",
            state: "Cairo",
            country: "Egypt",
            postal_code: 94111
        },
        items: payment.courses,
        subtotal: suptotal,
        total: payment.finalPrice,
        invoice_nr: payment._id,
        date: payment.createdAt
    };
    await createInvoice(invoice, "invoice.pdf");
    await sendEmail({
        to: req.user.email,
        message: "please check your invoice pdf",
        subject: 'Payment Invoice',
        attachments: [
            {
                path: "invoice.pdf",
                contentType: "application/pdf"
            }
        ]
    })

    return res.status(201).json({ message: "Done", payment });
}