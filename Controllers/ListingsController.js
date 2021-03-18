const multer = require("multer");
const sharp = require("sharp");
const ListingsModel = require("../models/ListingModel");
const errorHOF = require("../Utility/ErrorHOF");
const slugify = require("slugify");
const path = require("path");

// const multerStorage = multer.diskStorage({
//   destination: (req, file, cb) => {
//     cb(null, "../assets/listings");
//   },
//   filename: (req, file, cb) => {
//     cb(null, `${req.body.name}-${file.originalname}`);
//   },
// });
const multerStorage = multer.memoryStorage();

const upload = multer({
  storage: multerStorage,
});

exports.uploadImages = upload.fields([
  { name: "coverImage", maxCount: 1 },
  { name: "images", maxCount: 4 },
]);

exports.resizeImages = errorHOF(async (req, res, next) => {
  // cover image
  const coverImageName = `${req.body.name}-${
    req.files.coverImage[0].originalname.split(".")[0]
  }.jpeg`;
  req.body.coverImage = coverImageName;

  await sharp(req.files.coverImage[0].buffer)
    .resize(1920, 1080, { fit: "cover" })
    .toFormat("jpeg")
    .toFile(`../frontend/public/listings/${coverImageName}`);

  // other images
  req.body.images = [];
  await Promise.all(
    req.files.images.map((file) => {
      const filename = `${req.body.name}-${
        file.originalname.split(".")[0]
      }.jpeg`;
      sharp(file.buffer)
        .resize(1920, 1080, { fit: "cover" })
        .toFormat("jpeg")
        .toFile(`../frontend/public/listings/${filename}`);
      req.body.images.push(filename);
    })
  );
  next();
});

exports.getListings = async (req, res, next) => {
  const options = {
    page: req.body.requestedPage,
    limit: 9,
  };
  ListingsModel.paginate({}, options, (err, result) => {
    res.status(200).json({
      status: "success",
      data: result,
    });
  });
};

// exports.getListings = async (req, res, next) => {
//   const listings = await ListingsModel.find();
//   res.status(200).json({
//     status: "success",
//     data: listings,
//   });
// };

exports.createListing = errorHOF(async (req, res, next) => {
  const slug = slugify(req.body.name, {
    lower: true,
  });
  req.body.slug = slug;
  const newListing = await ListingsModel.create(req.body);
  res.status(200).json({
    status: "success",
    data: newListing,
  });
});

exports.getView = errorHOF(async (req, res, next) => {
  const view = await ListingsModel.findOne({ slug: req.params.id });
  res.status(200).json({
    status: "success",
    data: view,
  });
});
