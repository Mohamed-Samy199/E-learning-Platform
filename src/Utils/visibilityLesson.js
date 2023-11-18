import userModel from "../../DB/Models/user.model.js";

export const checkLessonVisibility = (visibility) => {
    return async (req, res, next) => {
        try {
            if (visibility === "public") {
                res.locals.typeOfVisibilityLesson = visibility;
            } else if (visibility === "private") {
                if (req.user) {
                    res.locals.typeOfVisibilityLesson = visibility;
                }else{
                    return next(new Error("not authorized user" , {cause : 400}));
                }
            }
            // if you pay for course and already pay show all lesson
            else if (visibility === "payment") {
                const payment = await userModel.findOne({_id : req.user._id }).populate([{
                    path : 'payment'
                }]).select('payment');
            
                if (payment.payment.length > 0) {
                    res.locals.typeOfVisibilityLesson = visibility
                }else{
                    return next(new Error("not found lesson payment" , {cause : 400}));
                }
            }
            
            else{
                return res.status(400).json({ message: 'Invalid lesson visibility.' });
            }

            next(); // Move to the next middleware
        } catch (error) {
            next(error); // Pass any errors to the error handling middleware
        }
    };
};