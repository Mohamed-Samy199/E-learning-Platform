import { Router } from "express";
import { asyncHandle } from "../../Utils/errorHandle.js";
import { createCategory, updateCategory } from "./category.controller.js";
import { auth } from "../../Middelware/authuntication.js";
import { endPoint } from "./category.endPoint.js";

const categoryRouter = Router();

categoryRouter.post("/", auth(endPoint.admin), asyncHandle(createCategory));
categoryRouter.put("/:categoryId", auth(endPoint.admin), asyncHandle(updateCategory));

export default categoryRouter;