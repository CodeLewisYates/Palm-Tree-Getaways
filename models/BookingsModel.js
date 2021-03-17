const mongoose = require("mongoose");

const BookingSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
  listingId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Listing",
  },
  totalPrice: {
    type: Number,
    required: [true, "A booking must have a totalPrice"],
  },
  datesBooked: {
    type: [String],
    required: [true, "A booking must have booked dates"],
  },
  days: {
    type: String,
    required: [true, "A booking must have amount of days"],
  },
});

const bookingModel = mongoose.model("Booking", BookingSchema);

module.exports = bookingModel;
