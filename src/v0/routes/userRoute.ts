import express from "express";
import articleController from "../controllers/userController";
import User from "../database/models/User";
import messages from "../middlewares/messages";
import sha256 from "sha256";
import config from "../../config";
import auth from "../middlewares/auth";

const router = express.Router();

//? Get all users - GET /api/v0/users
router.get("/", (req, res) => {
    User.find({}, "login email", (err, resp) => {
        if (err) {
            return res
                .status(500)
                .json({ status: 500, message: messages.status[500] });
        }
        if (resp[0]) {
            return res.status(200).json({
                status: 200,
                message: `Found ${resp.length} users`,
                users: resp,
            });
        } else {
            return res
                .status(404)
                .json({ status: 404, message: "Users not found" });
        }
    });
});

//? Get one user via login - GET /api/v0/users/:user
router.get("/:user", (req, res) => {
    const user = req.params.user;
    User.findOne(
        { login: user },
        "login email createdAt updatedAt",
        (err, resp) => {
            if (err) {
                return res
                    .status(500)
                    .json({ status: 500, message: messages.status[500] });
            }
            if (resp) {
                return res.status(200).json({
                    status: 200,
                    message: `User found`,
                    user: resp,
                });
            } else {
                return res
                    .status(404)
                    .json({ status: 404, message: "Users not found" });
            }
        }
    );
});

//? Register new user - POST /api/v0/users
router.post("/", auth.checkToken, async (req, res) => {
    if (!req.body) {
        return res
            .status(406)
            .json({ status: 406, message: "Fields are empty" });
    }
    const { login, email, password } = req.body;
    if (!login || !email || !password) {
        return res.status(406).json({ status: 406, message: "Field is empty" });
    }
    if (password.length < 6) {
        return res
            .status(406)
            .json({ status: 406, message: "Password is too short" });
    }
    let user = await User.findOne({ login });
    if (user) {
        return res
            .status(404)
            .json({ status: 404, message: "User already exists" });
    }
    const hashPass = sha256(`#${password}-!${config.passwordSalt}`);
    user = new User({ login, password: hashPass, email });
    const signature = sha256(
        `!z${config.signatureSalt}@st-${user._id}#r${Math.random()}#`
    );
    const ID = sha256(`$${config.idSalt}#a-s%${signature}id!`);
    user.set("signature", signature);
    user.set("ID", ID);
    user.save().then(() => {
        return res
            .status(201)
            .json({ status: 201, message: "Register success" });
    });
});

//? Login user - POST /api/v0/users/login
router.post("/login", auth.createToken);

export = router;
