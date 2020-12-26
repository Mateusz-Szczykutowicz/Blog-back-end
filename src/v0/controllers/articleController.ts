import { Request, Response } from "express";
import Article from "../database/models/Article";
import messages from "../middlewares/messages";

export = {
    user: {
        getAllArticles(req: Request, res: Response): void {
            Article.find(
                {},
                "author title slug content tags createdAt",
                (err, resp) => {
                    if (err) {
                        console.log("> [error] Get all articles :>> ", err);
                        return res
                            .status(500)
                            .send({ message: messages.status[500] });
                    }
                    if (resp[0]) {
                        return res.status(200).json({
                            status: 200,
                            message: `Found ${resp.length} articles`,
                            data: resp,
                        });
                    } else {
                        return res.status(404).json({
                            status: 404,
                            message: "Articles not found",
                        });
                    }
                }
            );
        },
        getOneArticle(req: Request, res: Response): void {
            const slug = req.params.name;
            Article.findOne(
                { slug },
                "author title tags createdAt updatedAt content slug",
                (err, resp) => {
                    if (err) {
                        console.log("[error] Get one article :>> ", err);
                        return res.status(500).json({
                            status: 500,
                            message: messages.status[500],
                        });
                    }
                    if (resp) {
                        return res.status(200).json({
                            status: 200,
                            message: `Article found`,
                            data: resp,
                        });
                    } else {
                        return res.status(404).json({
                            status: 404,
                            message: "Article not found",
                        });
                    }
                }
            );
        },
        addArticle(req: Request, res: Response): Response {
            req.body = req.body || {};

            // [tmp] user(author) tymczasowo na stałe
            // TODO Zmienić pozyskiwanie informacji o użytkowniku
            //! usunąć to po przygotowaniu użytkownika
            req.body.author = "Psikut";

            const author = req.body.author;
            const { title, tags: tag, content } = req.body;
            const tags = tag.split(", ");
            const articleData = {
                author,
                title,
                tags,
                content,
            };
            const article = new Article(articleData);
            article.save();
            return res.status(201).json({ message: "Article added" });
        },
        async updateArticle(req: Request, res: Response) {
            req.body = req.body || {};
            const slug = req.params.name;
            const article = await Article.findOne({ slug });

            if (!article) {
                return res
                    .status(404)
                    .send({ status: 404, message: "Article not found" });
            }
            let tags = article.get("tags");
            if (req.body.tags) {
                tags = req.body.tags.split(", ");
            }
            article.set("title", req.body.title || article.get("title"));
            article.set("content", req.body.content || article.get("content"));
            article.set("tags", tags || article.get("tags"));
            article.set("updatedAt", new Date());
            article.updateOne(article, {}, (err) => {
                if (err) {
                    console.log("[error] ", err);
                }
                return res.status(200).send({
                    status: 200,
                    message: "Article updated",
                });
            });
        },
        deleteArticle(req: Request, res: Response): void {
            const slug = req.params.name;
            Article.findOneAndDelete({ slug }, (err, resp) => {
                if (err) {
                    console.log("[error]: ", err);
                    return res
                        .status(500)
                        .send({ status: 500, message: messages.status[500] });
                }
                if (resp) {
                    return res
                        .status(200)
                        .send({ status: 200, message: "Deleted article" });
                } else {
                    return res
                        .status(404)
                        .send({ status: 404, message: "Article not found" });
                }
            });
        },
    },
};
