const mongoose = require("mongoose");
const mongoosePaginate = require("mongoose-paginate-v2");

const Listing = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "A Listing must have a name"],
  },
  detail: {
    bedrooms: {
      type: Number,
      required: [true, "A Listing must have bedrooms"],
    },
    OnSuites: {
      type: Number,
      required: [true, "Must define onsuites or not"],
    },
    Pool: {
      type: Boolean,
      required: [true, "Must define if there is a pool"],
    },
    Total_Rooms: {
      type: Number,
      required: [true, "Must define total number of rooms"],
    },
    Bbq: {
      type: Boolean,
      required: [true, "Must define if listing has access to a BBQ"],
    },
    beach_Nearby: {
      type: Boolean,
      default: true,
    },
  },
  location: {
    type: String,
    required: [true, "A Listing must have a location"],
  },
  coverImage: {
    type: String,
    required: [true, "A Listing must have a cover image"],
  },
  images: [String],
  pricePerNight: {
    type: Number,
    required: [true, "A Listing must have a price per night"],
  },
  ratingsAverage: {
    type: Number,
    default: 5,
  },
  slug: {
    type: String,
  },
});

Listing.plugin(mongoosePaginate);

const ListingModel = mongoose.model("Listing", Listing); // listings

module.exports = ListingModel;
