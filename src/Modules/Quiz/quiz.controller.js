import courseModel from "../../../DB/Models/course.model.js";
import quizModel from "../../../DB/Models/quiz.model.js";
import { createInvoiceCertificate } from "../../Utils/certificate.pdf.js";
import { sendEmail } from "../../Utils/sendEmail.js";
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from "url"


export const quizModule = async (req, res, next) => {
    const quiz = await quizModel.find({});
    return res.status(200).json({ message: "Quiz Module", quiz });
}
export const createQuiz = async (req, res, next) => {
    const { title, description, questionsText, duration, attempts } = req.body;
    const { courseId } = req.params;
    const instructorId = req.user._id;

    const course = await courseModel.findById(courseId);
    if (!course) {
        return next(new Error("Invalid course ID", { cause: 404 }));
    }

    if (!Array.isArray(questionsText)) {
        return res.status(400).json({ error: 'Invalid question data' });
    }
    const questions = questionsText.map((question) => {
        const { text, options = [], points } = question;
        const formattedOptions = Array.isArray(options)
            ? options.map((option) => {
                const { answer, isCorrect } = option;
                return { answer, isCorrect };
            })
            : [];
        return { text, options: formattedOptions, points };
    });

    const newQuiz = new quizModel({ title, description, questionsText: questions, duration, attempts, instructorId, courseId });
    const savedQuiz = await newQuiz.save();

    return res.status(201).json({ message: "Done", savedQuiz });
}
export const solveQuiz = async (req, res, next) => {
    const { courseId, quizId } = req.params;
    const { questionsText } = req.body;
    const userId = req.user._id;

    let progress = [];
    const course = await courseModel.findById(courseId);
    const quizzes = await quizModel.findById(quizId);

    if (!quizzes || !course) {
        return next(new Error("Invalid course or quiz id", { cause: 400 }));
    }

    for (const pro of course.progressLesson) {
        progress.push(pro.progress);
    }

    if (Math.max(...progress) === 100) {
        let totalScore = 0;
        if (!Array.isArray(questionsText)) {
            return res.status(400).json({ error: 'Invalid question data' });
        }

        const questions = questionsText.map((question) => {
            const { options = [] } = question;
            const formattedOptions = Array.isArray(options)
                ? options.map((option) => {
                    const { answer } = option;
                    return { answer };
                })
                : [];

            return { options: formattedOptions };
        });

        for (const quiz of quizzes.questionsText) {
            for (const optionQustion of quiz.options) {
                for (const question of questions) {
                    for (const option of question.options) {
                        if (optionQustion.answer == option.answer && optionQustion.isCorrect) {
                            //Increment points if isCorrect is true
                            question.points = 1;
                            totalScore += question.points || 0;
                        }
                    }
                }
            }
        }
        // Store the user's results with the calculated total score
        const results = {
            userId: userId,
            score: totalScore,
            completedAt: new Date(),
            answersUser: questions, // Store answers to questions
        };


        const __dirname = path.dirname(fileURLToPath(import.meta.url))
        const certificatePath = path.join(__dirname, 'certificate.pdf'); // Adjust the path as needed

        // generate pdf 
        const invoice = {
            shipping: {
                name: req.user.userName,
                address: "Egypt",
                city: "Cairo",
                state: "Cairo",
                country: "Egypt",
                postal_code: 94111
            },
            items: course.title,
            // subtotal: suptotal,
            // total: payment.finalPrice,
            // invoice_nr: payment._id,
            date: course.createdAt
        };

        await createInvoiceCertificate(invoice, certificatePath);

        // Ensure the file stream is closed before attaching it to the email
        const fileStream = fs.createReadStream(certificatePath);
        fileStream.on('close', () => {
            // Remove the file after it's been attached to the email
            fs.unlinkSync(certificatePath);
        });

        await sendEmail({
            to: req.user.email,
            message: "please check your certificate pdf",
            subject: 'certificate Course',
            attachments: [
                {
                    streamSource: fileStream,
                    contentType: "application/pdf"
                }
            ]
        });

        const savedSolve = await quizModel.findOneAndUpdate({ _id: quizId }, { answersText: questions, results }, { new: true });

        return res.status(200).json({ message: "Done", savedSolve });
    } else {
        return next(new Error("You must see all lesson of course" , {cause : 409}));
    }
}