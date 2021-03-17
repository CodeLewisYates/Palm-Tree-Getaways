const BookingModel = require("../models/BookingsModel");
const errorHOF = require("../Utility/ErrorHOF");
const ListingModel = require("../models/ListingModel");
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);

exports.getAllBookings = errorHOF(async (req, res, next) => {
  const Bookings = await BookingModel.find();
  res.status(200).json({
    status: "success",
    data: Bookings,
  });
});

exports.getUserBooking = errorHOF(async (req, res, next) => {
  const UserBookings = await BookingModel.find({
    userId: req.userInfo._id,
  }).populate("listingId");
  res.status(200).json({
    status: "success",
    data: UserBookings,
  });
});

exports.createBooking = errorHOF(async (req, res, next) => {
  const newBooking = await BookingModel.create({
    userId: req.userInfo._id,
    listingId: req.body.listingId,
    totalPrice: req.body.totalPrice,
    datesBooked: req.body.datesBooked,
  });
  res.status(200).json({
    status: "success",
    message: "Booking created",
  });
});

exports.getCheckoutSession = errorHOF(async (req, res, next) => {
  const listing = await ListingModel.findOne({ slug: req.body.slug });
  const userId = req.userInfo._id;
  console.log(userId);
  // create checkout session
  const session = await stripe.checkout.sessions.create({
    payment_method_types: ["card"],
    line_items: [
      {
        price_data: {
          currency: "gbp",
          unit_amount: req.body.totalPrice * 100,
          product_data: {
            name: `${listing.name}`,
          },
        },
        quantity: 1,
      },
    ],
    success_url: `${req.protocol}://${req.get("host")}/myaccount`,
    cancel_url: `${req.protocol}://${req.get("host")}/getaways/${
      req.body.slug
    }`,
    customer_email: req.userInfo.email,
    mode: "payment",
    client_reference_id: req.body.listingId,
    metadata: {
      userId: userId + "",
      fromDate: req.body.fromDate + "",
      toDate: req.body.toDate + "",
      days: req.body.days + "",
    },
  });
  // send session to client
  res.status(200).json({
    status: "success",
    sessionId: session.id,
  });
});
