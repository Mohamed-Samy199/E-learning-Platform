import { Router } from "express";
import { asyncHandle } from "../../Utils/errorHandle.js";
import { addInstructorOnCourse, addToWishlist, courseModule, createCourse, getWishlist, removeInstructor, removeWishlist, updateCourse } from "./course.controller.js";
import { auth } from "../../Middelware/authuntication.js";
import { endPoint } from "./course.endPoint.js";
import { myMulter } from "../../Utils/multer.js";
import lessonRouter from "../Lesson/lesson.router.js";

const courseRouter = Router();

courseRouter.use("/:courseId/lesson", lessonRouter);

courseRouter.get("/", asyncHandle(courseModule));
courseRouter.post("/", auth(endPoint.admin), myMulter({}).single("image"), asyncHandle(createCourse));
courseRouter.put("/:courseId", auth(endPoint.admin), myMulter({}).single("image"), asyncHandle(updateCourse));

courseRouter.post("/instructor/:courseId", auth(endPoint.admin), asyncHandle(addInstructorOnCourse));
courseRouter.delete("/instructor/:courseId", auth(endPoint.admin), asyncHandle(removeInstructor));

courseRouter.get("/wishlist", auth(endPoint.user), asyncHandle(getWishlist));
courseRouter.patch("/wishlist", auth(endPoint.user), asyncHandle(addToWishlist));
courseRouter.patch("/wishlist/remove", auth(endPoint.user), asyncHandle(removeWishlist));

export default courseRouter;