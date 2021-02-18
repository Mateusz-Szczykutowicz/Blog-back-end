import express from "express";
import auth from "../middlewares/auth";
import userController from "../controllers/userController";

// [tmp]
import articleController from "../controllers/userController";
import User from "../database/models/User";
import messages from "../middlewares/messages";
import sha256 from "sha256";
import config from "../../config";
import recoverPassword from "../middlewares/recoverPassword";

const router = express.Router();

//? Get user role - GET /api/v0/users/isAdmin
router.get("/isAdmin", auth.checkToken, userController.user.idAdmin);

//? Get user role - GET /api/v0/users/isAdmin
router.get("/", auth.checkToken, userController.user.getInfoAboutAccount);

//? Register new user - POST /api/v0/users
router.post("/", userController.user.registerUser);

//? Login user - POST /api/v0/users/login
router.post("/login", auth.createToken);

//? Logout user - POST /api/v0/users/login
router.post("/logout", auth.deleteToken);

//? Get recover link - POST /api/v0/users/recover
router.post("/recover", recoverPassword.sendLink);

//? Change recover password - PATCH /api/v0/users/recover
router.patch("/recover", recoverPassword.change);

//? Change email - PATCH /api/v0/users/email
router.patch("/email", auth.checkToken, userController.user.changeEmail);

//? Change password - PATCH /api/v0/users/password
router.patch("/password", auth.checkToken, userController.user.changePassword);

//? Delete account - DELETE /api/v0/users/
router.delete("/", auth.checkToken, userController.user.deleteAccount);

export = router;
