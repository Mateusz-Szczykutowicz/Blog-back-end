import express from "express";
import auth from "../middlewares/auth";
import userController from "../controllers/userController";

// [tmp]
import articleController from "../controllers/userController";
import User from "../database/models/User";
import messages from "../middlewares/messages";
import sha256 from "sha256";
import config from "../../config";

const router = express.Router();

//? Get all users - GET /api/v0/users
router.get("/", auth.checkToken, userController.getAllUsers);

//? Get one user via login - GET /api/v0/users/:user
router.get("/:user", auth.checkToken, userController.getOneUser);

//? Register new user - POST /api/v0/users
router.post("/", userController.registerUser);

//? Login user - POST /api/v0/users/login
router.post("/login", auth.createToken);

//? Login user - POST /api/v0/users/login
router.post("/logout", auth.deleteToken);

export = router;
