import { Router } from "express";
import { asyncHandle } from "../../Utils/errorHandle.js";
import { createReview, getReview, updateReview } from "./review.controller.js";
import { auth } from "../../Middelware/authuntication.js";
import { endPoint } from "./review.endPoint.js";

const reviewRouter = Router();

reviewRouter.get('/', asyncHandle(getReview));
reviewRouter.post('/', auth(endPoint.user), asyncHandle(createReview));
reviewRouter.put('/:courseId/:reviewId', auth(endPoint.user), asyncHandle(updateReview));

export default reviewRouter;