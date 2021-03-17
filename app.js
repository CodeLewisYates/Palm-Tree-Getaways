const express = require("express");
const ListingsRoutes = require("./Routes/ListingsRoutes");
const AuthRoutes = require("./Routes/AuthRoutes");
const UserRoutes = require("./Routes/UserRoutes");
const BookingRoutes = require("./Routes/BookingRoutes");
const ErrorHandler = require("./ErrorHandler/ErrorHandler");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const path = require("path");

const app = express();

app.use(cors());
app.options("*", cors());

app.use(express.static(path.join(__dirname, "build")));

// Parse req.body
app.use(express.json());

app.use(cookieParser());

app.use((req, res, next) => {
  console.log("test");
  next();
});

app.use("/api/getaways", ListingsRoutes);

app.use("/api/authenticate", AuthRoutes);

app.use("/api/users", UserRoutes);

app.use("/api/bookings", BookingRoutes);

app.get("/*", (req, res) => {
  res.sendFile(path.join(__dirname, "build", "index.html"));
});

app.use(ErrorHandler);

module.exports = app;
