import { Router } from "express";
import { asyncHandle } from "../../Utils/errorHandle.js";
import { createLesson, getLesson, getlessonByVisibilty, lessonMedule, likeLesson, unlikeLesson, updateLesson } from "./lesson.controller.js";
import { auth } from "../../Middelware/authuntication.js";
import { endPoint } from "./lesson.endpoint.js";
import { myMulter } from "../../Utils/multer.js";
import { checkLessonVisibility } from "../../Utils/visibilityLesson.js";
import { addComment, addReply, removeComment, removeReply } from "./lessonComment.controller.js";

const lessonRouter = Router({ mergeParams: true });

lessonRouter.get("/", asyncHandle(lessonMedule));
lessonRouter.get("/:courseId", asyncHandle(getLesson));

lessonRouter.get(
    '/lessons/public/:courseId',
    auth(endPoint.user),
    checkLessonVisibility('public'), // Set the desired visibility
    asyncHandle(getlessonByVisibilty)
);
lessonRouter.get(
    '/lessons/private/:courseId',
    auth(endPoint.user),
    checkLessonVisibility('private'), // Set the desired visibility
    asyncHandle(getlessonByVisibilty)
);
lessonRouter.get(
    '/lessons/payment/:courseId',
    auth(endPoint.user),
    checkLessonVisibility('payment'), // Set the desired visibility
    asyncHandle(getlessonByVisibilty)
);

lessonRouter.post("/", auth(endPoint.instructor),
    myMulter({}).fields([
        { name: "video", maxCount: 1 },
        { name: "fileDownload", maxCount: 5 }
    ]), asyncHandle(createLesson)
);
lessonRouter.put("/:lessonId", auth(endPoint.instructor),
    myMulter({}).fields([
        { name: "video", maxCount: 1 },
        { name: "fileDownload", maxCount: 5 }
    ]), asyncHandle(updateLesson)
);

lessonRouter.post("/like/:lessonId" , auth(endPoint.user) , asyncHandle(likeLesson));
lessonRouter.post("/unlike/:lessonId" , auth(endPoint.user) , asyncHandle(unlikeLesson));

lessonRouter.post("/comment/:lessonId" , auth(endPoint.user) , myMulter({}).single("image") , asyncHandle(addComment));
lessonRouter.delete("/comment/delete/:commentId" , auth(endPoint.user) , asyncHandle(removeComment));
lessonRouter.patch("/comment/:lessonId/:commentId/reply" , auth(endPoint.user) , asyncHandle(addReply));
lessonRouter.delete("/comment/:lessonId/:commentId/reply/:replyId" , auth(endPoint.user) , asyncHandle(removeReply));

export default lessonRouter;