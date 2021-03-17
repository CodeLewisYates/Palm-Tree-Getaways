const errorHOF = require("../Utility/ErrorHOF");
const UserModel = require("../models/UserModel");
const jwt = require("jsonwebtoken");
const { promisify } = require("util");

const createToken = (user, req, res) => {
  const cookieOptions = {
    expires: new Date(
      Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000
    ),
    httpOnly: true,
    secure: req.secure || req.headers["x-forwarded-proto"] === "https",
  };

  const token = signToken(user._id);

  res.cookie("jwt", token, cookieOptions);

  res.status(200).json({
    status: "success",
  });
};

const signToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });
};

exports.signup = errorHOF(async (req, res, next) => {
  const userExists = await UserModel.find({ email: req.body.email });
  if (userExists.length > 0)
    return next("Account with that email already exists!");
  const newUser = await UserModel.create({
    name: req.body.name,
    email: req.body.email,
    password: req.body.password,
    passwordConfirm: req.body.passwordConfirm,
  });
  createToken(newUser, req, res);
});

exports.login = errorHOF(async (req, res, next) => {
  const { email, password } = req.body;

  // Check if email and password exist
  if (!email || !password) {
    return next("Please provide email and password");
  }
  // Check if user exists and pass is correct
  const user = await UserModel.findOne({ email }).select("+password");
  if (!user || !(await user.correctPassword(password, user.password))) {
    return next("Invalid email or password");
  }
  // if ok, send token to client

  createToken(user, req, res);
});

exports.protect = errorHOF(async (req, res, next) => {
  // get token and check if its there
  let token;
  if (req.cookies.jwt) {
    token = req.cookies.jwt;
  } else {
    return next("You are not logged in");
  }

  // validate token
  const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);

  // Check if user still exists ??
  const freshUser = await UserModel.findById(decoded.id).select("+role");
  if (!freshUser) {
    return next("User no longer exists");
  }
  // check if user is admin
  if (freshUser.role === "user") {
    return next("You're not allowed to access this route for data security");
  }

  req.userInfo = freshUser;
  // access
  next();
});

exports.halfProtect = errorHOF(async (req, res, next) => {
  // get token and check if its there
  let token;
  if (req.cookies.jwt) {
    token = req.cookies.jwt;
  } else {
    return next("You are not logged in");
  }

  // validate token
  const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);

  // Check if user still exists ??
  const freshUser = await UserModel.findById(decoded.id).select("+role");
  if (!freshUser) {
    return next("User no longer exists");
  }

  req.userInfo = freshUser;
  // access
  next();
});

exports.isAuthorized = errorHOF(async (req, res, next) => {
  let token;
  if (req.cookies.jwt) {
    token = req.cookies.jwt;
  }
  if (!token) {
    return next("Not logged in");
  }
  const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);
  const userExists = await UserModel.findById(decoded.id);
  if (!userExists) return next("User does not exist");

  res.status(200).json({
    status: "success",
    message: "authorized",
  });
});

exports.logout = errorHOF(async (req, res, next) => {
  const cookieOptions = {
    expires: new Date(Date.now() - 10 * 1000),
    httpOnly: true,
  };
  res.cookie("jwt", "null", cookieOptions);
  res.status(200).json({
    status: "success",
  });
});
