import { Request, Response } from "express";
import config from "../../config";
import User from "../database/models/User";
import messages from "../middlewares/messages";
import sha256 from "sha256";

// [tmp]
import Article from "../database/models/Article";
import auth from "../middlewares/auth";
import { get } from "../database/db";

export = {
    getAllUsers(req: Request, res: Response) {
        User.find({}, "login email", (err, resp) => {
            if (err) {
                console.log("> [error] ", err);
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
    },
    getOneUser(req: Request, res: Response) {
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
    },
    async registerUser(req: Request, res: Response) {
        if (!req.body) {
            return res
                .status(406)
                .json({ status: 406, message: "Fields are empty" });
        }
        const { login, email, password } = req.body;
        if (!login || !email || !password) {
            return res
                .status(406)
                .json({ status: 406, message: "Field is empty" });
        }
        if (password.length < 6) {
            return res
                .status(406)
                .json({ status: 406, message: "Password is too short" });
        }
        let user = await User.findOne({ login });
        if (user) {
            return res
                .status(409)
                .json({ status: 409, message: "User already exists" });
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
    },
    async changeEmail(req: Request, res: Response) {
        if (!req.body) {
            return res
                .status(406)
                .json({ status: 406, message: "Body is empty" });
        }
        if (!req.body.email) {
            return res
                .status(406)
                .json({ status: 406, message: "Email field is empty" });
        }
        const email = req.body.email;
        const token: string = req.cookies.token || "";
        const signature: string = token.split(".")[1];
        const user = await User.findOne({ signature }, "email");
        if (!user) {
            return res
                .status(404)
                .json({ status: 404, message: "User not found!" });
        }
        user.set("email", email);
        user.save()
            .then(() => {
                return res
                    .status(200)
                    .json({ status: 200, message: "Email changed" });
            })
            .catch((err) => {
                console.log(err);
                return res.status(500).json({
                    status: 500,
                    message: "Erorr! Contact the administrator",
                });
            });
    },
    async changePassword(req: Request, res: Response) {
        if (!req.body) {
            return res
                .status(406)
                .json({ status: 406, message: "Body is empty" });
        }
        if (!req.body.newPassword || !req.body.password) {
            return res
                .status(406)
                .json({ status: 406, message: "Password field is empty" });
        }
        if (req.body.newPassword === req.body.password) {
            return res
                .status(406)
                .json({ status: 406, message: "Passwords are the same" });
        }
        const password = sha256(
            `#${req.body.password}-!${config.passwordSalt}`
        );
        const newPassword = sha256(
            `#${req.body.newPassword}-!${config.passwordSalt}`
        );
        const token: string = req.cookies.token || "";
        const signature: string = token.split(".")[1];
        const user = await User.findOne({ signature }, "password");
        if (!user) {
            return res
                .status(404)
                .json({ status: 404, message: "User not found!" });
        }
        if (user.get("password") !== password) {
            return res
                .status(406)
                .json({ status: 406, message: "Wrong password" });
        }
        user.set("password", newPassword);
        user.save()
            .then(() => {
                return res
                    .status(200)
                    .json({ status: 200, message: "Pasword changed" });
            })
            .catch((err) => {
                console.log(err);
                return res.status(500).json({
                    status: 404,
                    message: "Erorr! Contact the administrator",
                });
            });
    },
    async deleteOneUser(req: Request, res: Response) {
        const login = req.params.user.toLowerCase();
        const user = await User.deleteOne({ login });
        if (user.deletedCount === 0) {
            return res
                .status(404)
                .json({ status: 404, message: "User not found!" });
        }
        return res
            .status(200)
            .json({ status: 200, message: "Account deleted" });
    },
    deleteAccount(req: Request, res: Response) {
        const ID = req.body.id;
        console.log(ID);
        User.deleteOne({ ID }, (err) => {
            if (err) {
                return res
                    .status(500)
                    .json({ status: 500, message: messages.status[500] });
            }
            res.status(200).json({ status: 200, message: "Account deleted" });
        });
    },
    async blockAccount(req: Request, res: Response) {
        const login = req.params.user;
        const user = await User.findOne({ login }, "blocked admin");
        if (!user) {
            return res
                .status(404)
                .json({ status: 404, message: "User not found!" });
        }
        if (user.get("admin")) {
            return res
                .status(403)
                .json({ status: 403, message: "Can't block administrator!" });
        }
        user.get("blocked")
            ? user.set("blocked", false)
            : user.set("blocked", true);
        user.save()
            .then(() => {
                return res.status(200).json({
                    status: 200,
                    message: `${
                        user.get("blocked") ? "User blocked" : "User unblocked"
                    }`,
                });
            })
            .catch((err) => {
                console.log(">[error] ", err);
                return res
                    .status(500)
                    .json({ status: 500, message: messages.status[500] });
            });
    },
    async idAdmin(req: Request, res: Response) {
        const user = await User.findOne({ ID: req.body.id }, "admin");
        if (!user) {
            return res
                .status(404)
                .json({ status: 404, message: "User not found!" });
        }
        res.status(200).json({ status: 200, admin: user.get("admin") });
    },
};
