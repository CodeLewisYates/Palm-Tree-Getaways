const express = require("express");
const BookingController = require("../Controllers/BookingController");
const AuthController = require("../Controllers/AuthController");

const router = express.Router();

router
  .route("/checkout")
  .post(AuthController.halfProtect, BookingController.getCheckoutSession);

router
  .route("/mybookings")
  .get(AuthController.halfProtect, BookingController.getUserBooking);

router
  .route("/createbooking")
  .post(AuthController.halfProtect, BookingController.createBooking);

router.route("/").get(AuthController.protect, BookingController.getAllBookings);

module.exports = router;
