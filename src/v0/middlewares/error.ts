import { ErrorRequestHandler, Request, Response, NextFunction } from "express";
import fs from "fs";
import { Error } from "mongoose";
import path from "path";

const createError = (
    err: Error,
    req: Request,
    res: Response,
    next: NextFunction
) => {
    const date = new Date(2021, 0, 2);
    const errorMessage = `\n---
    Date: ${new Date()}
    ${err.stack}\n---\n`;
    fs.appendFile(
        path.join(
            __dirname,
            `../../logs/error - ${date.getFullYear()}.${
                date.getMonth() + 1 < 10
                    ? "0" + (date.getMonth() + 1)
                    : date.getMonth() + 1
            }.${
                date.getDate() < 10 ? "0" + date.getDate() : date.getDate()
            }.txt`
        ),
        errorMessage,
        (err) => {
            if (err) {
                return res.send(err);
            }
        }
    );
    console.log("> [error]:", err.message);
    return res.status(500).json({
        status: 500,
        message: "Error! Contact the administrator",
    });
};

const notFound = (req: Request, res: Response, next: NextFunction) => {
    return res.status(404).json({ status: 404, message: "Not found!" });
};

export default {
    notFound,
    createError,
};
