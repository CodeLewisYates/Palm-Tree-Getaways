const express = require("express");
const AuthController = require("../Controllers/AuthController");

const router = express.Router();

router.route("/signup").post(AuthController.signup);

router.route("/login").post(AuthController.login);

router.route("/isauth").get(AuthController.isAuthorized);

router.route("/logout").get(AuthController.logout);

module.exports = router;
