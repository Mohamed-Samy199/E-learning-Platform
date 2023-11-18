import { Router } from "express";
import { asyncHandle } from "../../Utils/errorHandle.js";
import { createAdmin, createInstructor, forgetPassword, profile, sendCode, updatePassword, userModule } from "./user.controller.js";
import { auth, roles } from "../../Middelware/authuntication.js";
import { myMulter } from "../../Utils/multer.js";
import { endPoint } from "./user.endPoint.js";

const userRouter = Router();

userRouter.get("/", asyncHandle(userModule))

userRouter.patch("/sendCode", asyncHandle(sendCode));
userRouter.post("/resetPssword", asyncHandle(forgetPassword));

userRouter.post("/updatePassword", auth(Object.values(roles)), asyncHandle(updatePassword));
userRouter.patch("/profile", auth(Object.values(roles)), myMulter({}).single("image"), asyncHandle(profile));

userRouter.patch("/admin/:newAdminId" , auth(endPoint.admin) , asyncHandle(createAdmin));
userRouter.patch("/instructor/:instructorId" , auth(endPoint.admin) , asyncHandle(createInstructor));

export default userRouter;