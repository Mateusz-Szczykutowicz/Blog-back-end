import express from "express";
import articleController from "../controllers/articleController";

const router = express.Router();

// [tmp]
import Article from "../database/models/Article";
import config from "../../config";
import messages from "../middlewares/messages";
import auth from "../middlewares/auth";

//? Get all articles - GET /api/v0/articles/
router.get("/", auth.checkToken, articleController.user.getAllArticles);

//? Get one article - GET /api/v0/articles/:name
router.get("/:name", auth.checkToken, articleController.user.getOneArticle);

//? Add new article - POST /api/v0/articles/
router.post("/", auth.checkToken, articleController.user.addArticle);

//? Update one article - PUT /api/v0/articles/:name
router.put("/:name", auth.checkToken, articleController.user.updateArticle);

//? Delete one article - DELETE /api/v0/articles/:name
router.delete("/:name", auth.checkToken, articleController.user.deleteArticle);

export = router;
