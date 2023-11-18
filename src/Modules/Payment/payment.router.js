import { Router } from "express";
import { asyncHandle } from "../../Utils/errorHandle.js";
import { createPayment, getPayment } from "./payment.controller.js";
import { auth } from "../../Middelware/authuntication.js";
import { endPoint } from "./payment.endPoint.js";
import { myMulter } from "../../Utils/multer.js";

const paymentRouter = Router();

paymentRouter.get('/', auth(endPoint.user), asyncHandle(getPayment));
paymentRouter.post('/cash', auth(endPoint.user), myMulter({}).single("image"), asyncHandle(createPayment));
paymentRouter.post('/card', auth(endPoint.user), myMulter({}).single("image"), asyncHandle(createPayment));


export default paymentRouter;