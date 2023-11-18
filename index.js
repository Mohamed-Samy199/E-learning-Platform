import express from "express";
import { config } from "dotenv";
import initApp from "./src/initApp.js";

const app = express();
config({ path: "./config/.env" });
const port = process.env.PORT;
initApp(app, express);


app.listen(port, () => console.log(`server is running on port ${port}`));