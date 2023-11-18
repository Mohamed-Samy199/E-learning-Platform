import { Router } from "express";
import { createQuiz, quizModule, solveQuiz } from "./quiz.controller.js";
import { asyncHandle } from "../../Utils/errorHandle.js";
import { auth } from "../../Middelware/authuntication.js";
import { endPoint } from "./quiz.endPint.js";

const quizRouter = Router();

quizRouter.get('/', asyncHandle(quizModule));
quizRouter.post('/:courseId', auth(endPoint.instructor), asyncHandle(createQuiz));
quizRouter.post('/:courseId/:quizId', auth(endPoint.user), asyncHandle(solveQuiz));

export default quizRouter;