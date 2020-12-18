import express from "express";
import articleController from "../controllers/articleController";

const router = express.Router();

// [tmp]
import Article from "../database/models/Article";
import config from "../../config";
import messages from "../middlewares/messages";

//? Get all articles - GET /api/v0/articles/
router.get("/", articleController.user.getAllArticles);

//? Get one article - GET /api/v0/articles/:name
router.get("/:name", articleController.user.getOneArticle);

//? Add new article - POST /api/v0/articles/
router.post("/", articleController.user.addArticle);

//? Update one article - PUT /api/v0/articles/:name
router.put("/:name", articleController.user.updateArticle);

//? Delete one article - DELETE /api/v0/articles/:name
router.delete("/:name", articleController.user.deleteArticle);

export = router;
