import { Router } from "express";
import { authModule, confirmEmail, login, refrashConfirmEmail, signUp } from "./auth.controller.js";
import { asyncHandle } from "../../Utils/errorHandle.js";

const authRouter = Router();

authRouter.get("/", asyncHandle(authModule));
authRouter.post("/signup", asyncHandle(signUp));
authRouter.get("/confirmationEmail/:token", asyncHandle(confirmEmail));
authRouter.get("/refrash/:token", asyncHandle(refrashConfirmEmail));
authRouter.post("/login", asyncHandle(login));


// authRouter.get('/auth/google', googleAuth);
// authRouter.get('/auth/google/callback', googleAuthCallback);

export default authRouter;