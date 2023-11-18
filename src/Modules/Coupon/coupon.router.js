import { Router } from "express";
import { asyncHandle } from "../../Utils/errorHandle.js";
import { createCoupon, getCoupon, updateCoupon } from "./coupon.controller.js";
import { auth } from "../../Middelware/authuntication.js";
import { endPoint } from "./coupon.endPoint.js";
import { myMulter } from "../../Utils/multer.js";

const couponRouter = Router();

couponRouter.get("/", asyncHandle(getCoupon));
couponRouter.post("/", auth(endPoint.user), myMulter({}).single("image"), asyncHandle(createCoupon));
couponRouter.put("/:couponId", auth(endPoint.admin), myMulter({}).single("image"), asyncHandle(updateCoupon));

export default couponRouter;