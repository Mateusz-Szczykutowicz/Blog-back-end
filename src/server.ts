//- Modules
import express from "express";
import morgan from "morgan";
import fileUpload from "express-fileupload";
import cookieParser from "cookie-parser";
import cors from "cors";

//- Files
import config from "./config";
import db from "./v0/database/db";
import messages from "./v0/middlewares/messages";
import errorMiddleware from "./v0/middlewares/error";
import articleRoute from "./v0/routes/articleRoute";
import userRoute from "./v0/routes/userRoute";
import commentRoute from "./v0/routes/commentRoute";

// [tmp]
import Article from "./v0/database/models/Article";
import auth from "./v0/middlewares/auth";
import User from "./v0/database/models/User";
import fs from "fs";
import path from "path";

const app = express();

app.listen(config.PORT, () =>
    console.log(
        messages.server(`Server is running at http://localhost:${config.PORT}`)
    )
);

db.on("error", console.error.bind(console, "connection error"));
db.once("open", () => {
    console.log(messages.server("DB connection - success"));
});

//- Use dev middleware
const morganDev = morgan("dev");
app.use(morganDev);

//- Use production middleware
app.use(cors());
app.use(cookieParser());
app.use(
    fileUpload({
        createParentPath: true,
    })
);

//- Config

//? disable x-powered-by
app.disable("x-powered-by");

//- Routes

//? Article route
app.use("/api/v0/articles", articleRoute);

//? User route
app.use("/api/v0/users", userRoute);

//? Comment route
app.use("/api/v0/comments", commentRoute);

// [tmp] Testowy endpoint
app.post("/test", async (req, res) => {
    req.body = req.body || {};
    // const x: string = Math.random().toString();
    // const pin = auth.pin.createPin(x);
    // console.log(auth.pin.pins);
    // console.log(pin);
    // auth.pin.deletePin(pin);
    // console.log(auth.pin.pins);
    // console.log(auth.pin.getID(pin));
    // const tab = [
    //     { name: "Psikut", ID: 24 },
    //     { name: "Maniuu", ID: 9 },
    // ];
    // let find = tab.findIndex((value) => value.name === "Psikutaa");

    // console.log("find :>> ", find);

    res.send("test");
    // res.status(500).send({ message: "Error" });
});

//? Error page
app.use(errorMiddleware.notFound);

export = app;
