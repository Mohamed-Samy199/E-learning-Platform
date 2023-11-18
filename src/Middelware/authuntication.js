import userModel from "../../DB/Models/user.model.js";
import { asyncHandle } from "../Utils/errorHandle.js";
import { verifyToken } from "../Utils/generate&verifyToken.js";

export const roles = {
    User : "User",
    Admin : "Admin",
    Instructor : "Instructor"
}
export const auth = (accessRole = []) => {
    return asyncHandle(async (req , res , next) => {
        const {authorization} = req.headers;
        if (!authorization?.startsWith(process.env.BEARER_KEY)) {
            return next(new Error("In-valid bearer key" , {cause : 400}));
        }
        const token = authorization.split(process.env.BEARER_KEY)[1];
        if (!token) {
            return next(new Error("In-valid token" , {cause : 400}));
        }
        const decode = verifyToken({token});
        if (!decode?.id) {
            return next(new Error("In-valid token payload" , {cause : 400}));
        }
        const user = await userModel.findById(decode.id).select("userName role email changePasswordTime");
        if (!user) {
            return next(new Error("user not register" , {cause : 401}));
        }
        // log out from all device when change and update password...
        // console.log({changePasswordTime : parseInt(user.changePasswordTime?.getTime() / 1000) , iat : decode.iat});
        if (parseInt(user.changePasswordTime?.getTime() / 1000) > decode.iat) {
            return next(new Error("Expire Token", { cause: 400 }));
        }
        if (!accessRole.includes(user.role)) {
            return next(new Error("Not authorized user" , {cause : 403}));
        }
        req.user = user;
        return next();
    })
}