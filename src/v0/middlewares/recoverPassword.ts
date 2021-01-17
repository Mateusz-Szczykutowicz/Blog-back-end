import { NextFunction, Request, Response } from "express";
import User from "../database/models/User";
import sha256 from "sha256";
import config from "../../config";
import messages from "../middlewares/messages";
import { type } from "os";
const nodemailer = require("nodemailer");

interface _Pin {
    pins: object;
    getID(pin: string): string;
    createPin(ID: string): string;
    deletePin(pin: string): void;
}

class Pin_ implements _Pin {
    // pins: Array<object> = [];
    pins = new Map();
    getID(pin: string): string {
        return this.pins.get(pin);
    }
    createPin(ID: string): string {
        const generatePin = (min: number, max: number) => {
            return (
                Math.floor(Math.random() * (max - min + 1)) + min
            ).toString();
        };
        const pin: string = generatePin(10000000, 99999999);
        if (this.pins.has(pin)) {
            return this.createPin(ID);
        }
        this.pins.set(pin, ID);
        setTimeout(() => {
            this.pins.delete(pin);
        }, 1000 * 60 * 15);
        return pin;
    }
    deletePin(pin: string): void {
        this.pins.delete(pin);
    }
}

const myMail = nodemailer.createTransport({
    host: config.nodeMail.host,
    port: config.nodeMail.port,
    secure: false, // upgrade later with STARTTLS
    auth: {
        user: config.nodeMail.login,
        pass: config.nodeMail.password,
    },
    tls: {
        // do not fail on invalid certs
        rejectUnauthorized: false,
    },
});

const sendMail = (email: string, code: string) => {
    const message = {
        from: "DeltaStorm <noreply@deltastorm.pl>",
        to: `${email}`,
        subject: "Recover password",
        html: `
        <html>
        <body>
        <p>Recover your password</p><br/>
        <p style="font-size: 20px;">Your code:  <span style="font-weight=bold;">${code}</span></p>
        </body>
        </html>
        `,
    };
    myMail.sendMail(message, (error: any) => {
        if (error) {
            return console.log(error);
        }
        return true;
    });
};

const Pin = new Pin_();

export = {
    async sendLink(req: Request, res: Response) {
        if (!req.body || !req.body.login) {
            return res
                .status(406)
                .json({ status: 406, message: "Login field is empty!" });
        }
        const login = req.body.login;
        const user = await User.findOne({ login }, "ID email");
        if (!user) {
            return res
                .status(404)
                .json({ status: 404, message: "This login doesn't exist" });
        }
        const ID = user.get("ID");
        const email = user.get("email");
        const code = Pin.createPin(ID);
        sendMail(email, code);
        res.status(200).json({ status: 200, message: "Email sent" });
    },
    async change(req: Request, res: Response) {
        if (!req.body) {
            return res
                .status(406)
                .json({ status: 406, message: "Fields are empty" });
        }
        if (!req.body.password || req.body.password.length < 6) {
            return res
                .status(406)
                .json({ status: 406, message: "Password is too short" });
        }
        const code = req.body.code;
        const ID = Pin.getID(code);
        const user = await User.findOne({ ID }, "password");
        if (!user) {
            return res.status(403).json({ status: 403, message: "Wrong code" });
        }
        const password = sha256(
            `#${req.body.password}-!${config.passwordSalt}`
        );
        user.set("password", password);
        Pin.deletePin(code);
        user.save()
            .then(() => {
                return res
                    .status(200)
                    .json({ status: 200, message: "Password changed" });
            })
            .catch((err) => {
                if (err) {
                    console.log(err);
                }
                return res
                    .status(500)
                    .json({ status: 500, message: messages.status[500] });
            });
    },
};
