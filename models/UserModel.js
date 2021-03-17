const mongoose = require("mongoose");
const bcrypt = require("bcrypt");

const UserSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "A user must have a username"],
  },
  email: {
    type: String,
    required: [true, "A user must have an email"],
    unique: true,
  },
  password: {
    type: String,
    minLength: 6,
    required: [true, "A user must have a password"],
    select: false,
  },
  passwordConfirm: {
    type: String,
    validate: {
      validator: function (v) {
        return this.password === v;
      },
      message: "Passwords do not match!",
    },
  },
  role: {
    type: String,
    default: "user",
    select: false,
  },
});

UserSchema.pre("save", async function (next) {
  this.password = await bcrypt.hash(this.password, 12);
  this.passwordConfirm = undefined;
  next();
});

UserSchema.methods.correctPassword = async function (
  candidatePassword,
  encPassword
) {
  return await bcrypt.compare(candidatePassword, encPassword);
};

const usermodel = mongoose.model("User", UserSchema);

module.exports = usermodel;
