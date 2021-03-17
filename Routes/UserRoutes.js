const express = require("express");
const UserController = require("../Controllers/UserController");
const AuthController = require("../Controllers/AuthController");

const router = express.Router();

router
  .route("/updateme")
  .post(AuthController.halfProtect, UserController.updateMe);

router
  .route("/updatemypass")
  .post(AuthController.halfProtect, UserController.updatePass);

router.route("/me").get(AuthController.halfProtect, UserController.getMe);

router.route("/:id").get(AuthController.protect, UserController.getUser);

router.route("/").get(AuthController.protect, UserController.getAllUsers);

module.exports = router;
