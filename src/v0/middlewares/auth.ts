import config from "../../config";
import User from "../database/models/User";
import sha256 from "sha256";
import { DocumentQuery } from "mongoose";

interface _Token {
    tokens: object;
    create(payload: string, signature: string, time: number): void;
    getAll(): object;
    check(payload: string, signature: string): boolean;
}

class Token implements _Token {
    tokens: any = {};
    create(payload: string, signature: string, time: number): void {
        this.tokens[payload] = signature;
        setTimeout(() => {
            delete this.tokens[payload];
        }, time * 1000 * 60);
    }
    getAll(): object {
        return this.tokens;
    }
    check(payload: string, signature: string): boolean {
        if (this.tokens[payload] === signature) {
            return true;
        }
        return false;
    }
}

const token = new Token();

export = {
    async createToken(req: any, res: any) {
        if (!req.body) {
            return res
                .status(406)
                .json({ status: 406, message: "Fields are empty" });
        }
        if (!req.body.login || !req.body.password) {
            return res
                .status(406)
                .json({ status: 406, message: "Field is empty" });
        }
        const login = req.body.login;
        const password: string = sha256(
            `#${req.body.password}-!${config.passwordSalt}`
        );
        const user = await User.findOne({ login, password }, "signature");
        if (user) {
            const expireTime: number = 1;
            const signature = user.get("signature");
            const payload: string = sha256(
                `#${Math.random()}-mde${config.payloadSalt}!a${signature}`
            );
            token.create(payload, signature, expireTime);
            //* W razie zmiany obsługi z cookie na tokena usunąć "Set-cookie"
            res.setHeader("Set-Cookie", [
                `token=${`${payload}.${signature}`}; max-age=${
                    60 * expireTime
                }; path=/`,
            ]);
            return res.status(200).json({
                status: 200,
                message: "Login - success",
                // token: `${payload}.${signature}`, //* W razie złego zachowywania się aplikacji przywrócić
            });
        }
        return res
            .status(406)
            .json({ statu: 406, message: "Wrong login or password" });
    },
    async checkToken(req: any, res: any, next: any) {
        if (!req.cookies.token) {
            return res
                .status(401)
                .json({ status: 401, message: "You are not logging in" });
        }
        const authToken = req.cookies.token.split(".");
        const payload: string = authToken[0];
        const signature: string = authToken[1];
        if (!payload || !signature) {
            return res
                .status(401)
                .json({ status: 401, message: "You are not logging in" });
        }
        if (token.check(payload, signature)) {
            const user: any = await User.findOne({ signature }, "ID");
            const ID = user.get("ID");
            req.body = req.body || {};
            req.body.id = ID;
            return next();
        }
        return res
            .status(401)
            .json({ status: 401, message: "You are not logging in" });
    },
};
