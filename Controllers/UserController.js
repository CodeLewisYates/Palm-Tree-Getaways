const UserModel = require("../models/UserModel");
const errorHOF = require("../Utility/ErrorHOF");
const bcrypt = require("bcrypt");

exports.getAllUsers = errorHOF(async (req, res, next) => {
  const Users = await UserModel.find();
  res.status(200).json({
    status: "success",
    data: Users,
  });
});

exports.getUser = errorHOF(async (req, res, next) => {
  const User = await UserModel.findById(req.params.id);
  if (!User) {
    res.status(404).json({
      status: "failed",
      message: "Could not find user with that ID",
    });
    return;
  }
  res.status(200).json({
    status: "success",
    data: User,
  });
});

exports.getMe = errorHOF(async (req, res, next) => {
  res.status(200).json({
    status: "success",
    data: req.userInfo,
  });
});

exports.updateMe = errorHOF(async (req, res, next) => {
  const updatedUser = await UserModel.findByIdAndUpdate(
    req.userInfo._id,
    {
      name: req.body.name,
      email: req.body.email,
    },
    {
      new: true,
      runValidators: true,
    }
  );
  res.status(200).json({
    status: "success",
    data: updatedUser,
  });
});

exports.updatePass = errorHOF(async (req, res, next) => {
  const user = await UserModel.findById(req.userInfo._id).select("+password");
  const currentPass = user.password;
  const correctPass = await user.correctPassword(
    req.body.currentPassword,
    currentPass
  );
  if (!correctPass) return next("Incorrect password!");
  if (req.body.newPassword !== req.body.newPasswordConfirm)
    return next("New passwords do not match!");
  const newPass = await bcrypt.hash(req.body.newPassword, 12);
  const updatedUser = await UserModel.findByIdAndUpdate(req.userInfo._id, {
    password: newPass,
  });
  res.status(200).json({
    status: "success",
    message: "pass updated",
  });
});
