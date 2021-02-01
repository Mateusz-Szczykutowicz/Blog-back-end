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

//? Register new user - POST /api/v0/users
router.post("/", userController.registerUser);

//? Login user - POST /api/v0/users/login
router.post("/login", auth.createToken);

//? Logout user - POST /api/v0/users/login
router.post("/logout", auth.deleteToken);

//? Get recover link - POST /api/v0/users/recover
router.post("/recover", recoverPassword.sendLink);

//? Change recover password - PATCH /api/v0/users/recover
router.patch("/recover", recoverPassword.change);

//? Get all users - GET /api/v0/users
router.get("/admin", auth.checkToken, auth.isAdmin, userController.getAllUsers);

//? Get one user via login - GET /api/v0/users/:user
router.get(
    "/admin/:user",
    auth.checkToken,
    auth.isAdmin,
    userController.getOneUser
);

//? Change email - PATCH /api/v0/users/email
router.patch("/email", auth.checkToken, userController.changeEmail);

//? Change password - PATCH /api/v0/users/password
router.patch("/password", auth.checkToken, userController.changePassword);

//? Delete one user - DELETE /api/v0/users/:user
router.delete(
    "/:user",
    auth.checkToken,
    auth.isAdmin,
    userController.deleteOneUser
);

//? Delete account - DELETE /api/v0/users/
router.delete("/", auth.checkToken, userController.deleteAccount);

//? Block user - PATCH /api/v0/users/block
router.patch(
    "/:user/block",
    auth.checkToken,
    auth.isAdmin,
    userController.blockAccount
);

router.get("/isAdmin", auth.checkToken, userController.idAdmin);

export = router;
