import { Router } from "express";
import { asyncHandle } from "../../Utils/errorHandle.js";
import { clearCart, createCart, deleteCourse, getCartCourses } from "./cart.controller.js";
import { auth } from "../../Middelware/authuntication.js";
import { endPoint } from "./cart.endPoint.js";

const cartRouter = Router();

cartRouter.get('/', auth(endPoint.user), asyncHandle(getCartCourses));
cartRouter.post('/', auth(endPoint.user), asyncHandle(createCart));
cartRouter.patch('/remove', auth(endPoint.user), asyncHandle(deleteCourse));
cartRouter.patch('/clear', auth(endPoint.user), asyncHandle(clearCart));

export default cartRouter;