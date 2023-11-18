import passport from "passport";
import DBConnect from "../DB/connect.js";
import authRouter from "./Modules/Auth/auth.router.js";
import cartRouter from "./Modules/Cart/cart.router.js";
import categoryRouter from "./Modules/Category/category.router.js";
import couponRouter from "./Modules/Coupon/coupon.router.js";
import courseRouter from "./Modules/Course/course.router.js";
import enrollmentRouter from "./Modules/Enrollment/enrollment.router.js";
import lessonRouter from "./Modules/Lesson/lesson.router.js";
import paymentRouter from "./Modules/Payment/payment.router.js";
import progressRouter from "./Modules/Progress/progress.router.js";
import quizRouter from "./Modules/Quiz/quiz.router.js";
import reviewRouter from "./Modules/Review/review.router.js";
import userRouter from "./Modules/User/user.router.js";
import { globalError } from "./Utils/errorHandle.js";


const initApp = (app, express) => {
    app.use(express.json({}));
    app.get("/", (req, res) => console.log(res.send('<a href="/auth/google">Authenticate with (Google)</a>')));

    app.use('/auth', authRouter);
    app.use('/user', userRouter);
    
    app.use('/category', categoryRouter);
    app.use('/course', courseRouter);
    app.use('/enroll', enrollmentRouter);
    app.use('/lesson', lessonRouter);
    app.use('/progress', progressRouter);
    app.use('/quiz', quizRouter);
    app.use('/cart', cartRouter);
    app.use('/coupon', couponRouter);
    app.use('/payment', paymentRouter);
    app.use('/review', reviewRouter);

    app.all("*", (req, res, next) => {
        return res.json({ message: `In-valid router - can not access this endPoint ${req.originalUrl}` })
    })
    app.use(passport.initialize());
    app.use(globalError);
    DBConnect();
}
export default initApp;