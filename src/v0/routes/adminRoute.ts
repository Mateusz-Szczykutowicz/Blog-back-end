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

//? Get all users - GET /api/v0/users
router.get(
    "/user",
    auth.checkToken,
    auth.isAdmin,
    userController.admin.getAllUsers
);

//? Get one user via login - GET /api/v0/users/:user
router.get(
    "/user/:user",
    auth.checkToken,
    auth.isAdmin,
    userController.admin.getOneUser
);

//? Delete one user - DELETE /api/v0/users/:user
router.delete(
    "/user/:user",
    auth.checkToken,
    auth.isAdmin,
    userController.admin.deleteOneUser
);

//? Block user - PATCH /api/v0/users/block
router.patch(
    "/user/:user/block",
    auth.checkToken,
    auth.isAdmin,
    userController.admin.blockAccount
);

export = router;
