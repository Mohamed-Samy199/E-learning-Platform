import { Router } from "express";
import { asyncHandle } from "../../Utils/errorHandle.js";
import { createUserEnrollment, userModule } from "./enrollment.controller.js";
import { auth } from "../../Middelware/authuntication.js";
import { endPoint } from "./enrollment.endPoint.js";

const enrollmentRouter = Router();

enrollmentRouter.get("/" , asyncHandle(userModule))
enrollmentRouter.post("/:courseId" , auth(endPoint.user) , asyncHandle(createUserEnrollment))

export default enrollmentRouter;