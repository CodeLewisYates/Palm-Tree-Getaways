const express = require("express");

const ListingsController = require("../Controllers/ListingsController");
const AuthController = require("../Controllers/AuthController");

const router = express.Router();

router.route("/all").post(ListingsController.getListings);
router.route("/:id").get(ListingsController.getView);

router
  .route("/")
  .post(
    AuthController.protect,
    ListingsController.uploadImages,
    ListingsController.resizeImages,
    ListingsController.createListing
  );

module.exports = router;
