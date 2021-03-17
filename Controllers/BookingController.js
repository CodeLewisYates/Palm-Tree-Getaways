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
            images: [`http://localhost:8000/listings/${listing.coverImage}`],
          },
        },
        quantity: 1,
      },
    ],
    success_url: `https://${req.get("host")}/myaccount`,
    cancel_url: `https://${req.get("host")}/getaways/${req.body.slug}`,
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

const createBookingFromCheckout = async (session) => {
  const datesBooked = [session.metadata.fromDate, session.metadata.toDate];
  const booking = await BookingModel.create({
    userId: session.metadata.userId,
    listingId: session.client_reference_id,
    datesBooked: datesBooked,
    totalPrice: session.amount_total / 100,
    days: session.metadata.days,
  });
};

exports.webhookCheckout = (req, res, next) => {
  const signature = req.headers["stripe-signature"];

  let event;

  try {
    event = stripe.webhooks.constructEvent(
      req.body,
      signature,
      process.env.WEBHOOK_SECRET
    );
  } catch (error) {
    return res.status(400).send(`Webhook error: ${error.message}`);
  }

  if (event.type === "checkout.session.completed") {
    createBookingFromCheckout(event.data.object);
  }
  res.status(200).json({
    received: true,
  });
};
