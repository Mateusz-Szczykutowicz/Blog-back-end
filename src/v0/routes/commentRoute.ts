import express from "express";
import commentController from "../controllers/commentController";
import auth from "../middlewares/auth";
const router = express.Router();

//? Get all comments - GET /api/v0/comments/
router.get("/", commentController.getAll);

//? Get all comments of article - GET /api/v0/comments/article
router.get("/:article", commentController.getAllFromArticle);

//? Create comment - POST /api/v0/comments/
router.post("/", auth.checkToken, commentController.create);

//? Modify comment - PATCH /api/v0/comments/
router.patch("/", commentController.modify);

//? Delete comment - DELETE /api/v0/comments/:id
router.delete("/", commentController.delete);

export = router;
