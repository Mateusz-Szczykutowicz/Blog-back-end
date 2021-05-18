import { Response, Request, NextFunction } from "express";
import Comment from "../database/models/Comment";
import messages from "../middlewares/messages";
import sha256 from "sha256";
import config from "../../config";
import User from "../database/models/User";

export = {
    getAll(req: Request, res: Response) {
        Comment.find({}, (err, resp) => {
            if (err) {
                console.log(err);
                return res
                    .status(500)
                    .json({ status: 500, message: messages.status[500] });
            }
            if (resp[0]) {
                return res.status(200).json({
                    status: 200,
                    message: `Found ${resp.length} comments`,
                    data: resp,
                });
            } else {
                return res
                    .status(404)
                    .json({ status: 404, message: "Comment not found!" });
            }
        });
    },
    getAllFromArticle(req: Request, res: Response) {
        const article = req.params.article;
        Comment.find({ article }, (err, resp) => {
            if (err) {
                console.log(err);
                return res
                    .status(500)
                    .json({ status: 500, message: messages.status[500] });
            }
            if (resp[0]) {
                return res.status(200).json({
                    status: 200,
                    message: `Found ${resp.length} comments`,
                    data: resp,
                });
            } else {
                return res
                    .status(404)
                    .json({ status: 404, message: "Comment not found!" });
            }
        });
    },
    async create(req: Request, res: Response) {
        if (!req.body || !req.body.article || !req.body.content) {
            return res
                .status(406)
                .json({ status: 406, message: "Field is empty" });
        }
        const { article, content } = req.body;
        const user = await User.findOne({ ID: req.body.id });
        if (!user) {
            return res
                .status(404)
                .json({ status: 404, messege: "User not found!" });
        }
        const author = user.get("login");
        const authorID = user.get("signature");
        const createdAt = new Date();
        const comment = new Comment({
            author,
            article,
            content,
            createdAt,
            authorID,
        });
        const ID = sha256(`${config.idSalt}#${comment.get("_id")}`);
        comment.set("ID", ID);
        comment
            .save()
            .then(() => {
                return res
                    .status(201)
                    .json({ status: 201, message: "Comment added" });
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
    async modify(req: Request, res: Response) {
        if (!req.body || !req.body.content) {
            return res
                .status(406)
                .json({ status: 406, message: "Field is empty" });
        }
        const ID = req.body.id || "";
        const comment = await Comment.findOne({ ID });
        if (!comment) {
            return res
                .status(404)
                .json({ status: 404, message: "Comment not found!" });
        }
        const content = req.body.content;
        comment.set("content", content);
        comment.set("updatedAt", new Date());
        comment.set("modified", true);
        comment
            .save()
            .then(() => {
                return res
                    .status(200)
                    .json({ status: 200, message: "Comment updated" });
            })
            .catch((err) => {
                if (err) {
                    console.log("> [error]: ", err);
                }
                return res
                    .status(500)
                    .json({ status: 500, message: messages.status[500] });
            });
    },
    async delete(req: Request, res: Response) {
        if (!req.body || !req.body.id) {
            return res
                .status(406)
                .json({ status: 406, message: "Field is empty" });
        }
        const ID = req.body.id;
        Comment.deleteOne({ ID })
            .then((result: any) => {
                if (result.deletedCount !== 0) {
                    return res
                        .status(200)
                        .json({ status: 200, message: "Deleted one comment" });
                } else {
                    return res
                        .status(404)
                        .json({ status: 404, message: "Comment not found!" });
                }
            })
            .catch((err: any) => {
                if (err) {
                    console.log("> [error]: ", err);
                }
                return res
                    .status(500)
                    .json({ status: 500, message: messages.status[500] });
            });
    },
};
