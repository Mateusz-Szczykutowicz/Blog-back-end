//- Modules
import express from "express";
import morgan from "morgan";
import fileUpload from "express-fileupload";
import cookieParser from "cookie-parser";

//- Files
import config from "./config";
import db from "./v0/database/db";
import messages from "./v0/middlewares/messages";
import articleRoute from "./v0/routes/articleRoute";
import userRoute from "./v0/routes/userRoute";

// [tmp]
import Article from "./v0/database/models/Article";
import auth from "./v0/middlewares/auth";
import User from "./v0/database/models/User";

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

// [tmp] Testowy endpoint
app.post("/test", auth.checkToken, async (req, res) => {
    const user = await User.findOne({ ID: req.body.id });
    console.log(user);
    res.send("test");
    // res.status(500).send({ message: "Error" });
});

//? Error page
app.use((req, res) => {
    res.status(404).send({ status: 404, message: "404 - Not found" });
});

export = app;
