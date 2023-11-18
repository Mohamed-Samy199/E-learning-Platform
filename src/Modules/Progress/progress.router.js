import { Router } from "express";
import { asyncHandle } from "../../Utils/errorHandle.js";
import { createPrerequisites, createProgress, progressModule } from "./progress.controller.js";
import { auth } from "../../Middelware/authuntication.js";
import { endPoint } from "./progress.endPoint.js";

const progressRouter = Router();

progressRouter.get("/", asyncHandle(progressModule));
progressRouter.post("/prelesson/:lessonId", auth(endPoint.user), asyncHandle(createPrerequisites));
progressRouter.post("/:courseId/:lessonId", auth(endPoint.user), asyncHandle(createProgress));

export default progressRouter;