require("dotenv").config({ path: "./config.env" });
const mongoose = require("mongoose");
const app = require("./app");

const db = process.env.DATABASE.replace(
  "<PASSWORD>",
  process.env.DATABASE_PASSWORD
);

mongoose
  .connect(db, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useFindAndModify: false,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log("Connected to MongoDB...");
  });

const server = app.listen(process.env.PORT || 8000, () => {
  console.log(`App listening on port ${process.env.PORT}`);
});
