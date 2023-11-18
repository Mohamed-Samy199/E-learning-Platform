import cartModel from "../../../DB/Models/cart.model.js";
import courseModel from "../../../DB/Models/course.model.js";

export const getCartCourses = async (req, res, next) => {
    const cart = await cartModel.findOne({ userId: req.user._id }).populate("courses.courseId");
    if (!cart) {
        return next(new Error("no there cart", { cause: 400 }))
    }
    let numOfCartItems = cart.courses.length;
    return res.status(200).json({ message: "Cart Module", cart, numOfCartItems });
}
export const createCart = async (req, res, next) => {
    const { courseId, quntity } = req.body;
    // check course exist
    const course = await courseModel.findById(courseId);
    if (!course) {
        return next(new Error("in-valid course id", { cause: 400 }));
    }
    if (course.seat < quntity || course.isDeleted) {
        await courseModel.updateOne({ _id: courseId }, { $addToSet: { wishUserList: req.user._id } });
        return next(new Error(`in-valid course quntity max avaliable seat ${course.seat}`, { cause: 400 }));
    }
    // check cart exsit
    const cart = await cartModel.findOne({ userId: req.user._id });
    // if not exsit create one
    if (!cart) {
        const newCart = await cartModel.create({ userId: req.user._id, courses: [{ courseId, quntity }] });
        return res.status(201).json({ message: "Done", cart: newCart })
    }
    // if exsit to options
    // 1- update
    let matchCourse = false;
    for (let i = 0; i < cart.courses.length; i++) {
        if (cart.courses[i].courseId.toString() == courseId) {
            cart.courses[i].quntity = quntity;
            matchCourse = true;
            break;
        }
    }
    // 2- push new course
    if (!matchCourse) {
        cart.courses.push({ courseId, quntity })
    }

    await cart.save();
    return res.status(200).json({ message: "Done", cart });
}
export async function deleteCouresFromCart(courseId, userId) {
    const cart = await cartModel.updateOne({ userId }, {
        $pull: {
            courses: {
                courseId: { $in: courseId }
            }
        }
    })
    return cart;
}
export const deleteCourse = async (req, res, next) => {
    const { courseId } = req.body;
    if (!courseId) {
        return next(new Error("In-valid course id", { cause: 409 }));
    }
    const cart = await deleteCouresFromCart(courseId, req.user._id)
    return res.status(200).json({ message: "Done", cart });
}
export async function emptyCart(userId) {
    const cart = await cartModel.updateOne({ userId }, { courses: [] });
    return cart;
}
export const clearCart = async (req, res, next) => {
    const cart = await emptyCart(req.user._id);
    return res.status(200).json({ message: "Done", cart });
}