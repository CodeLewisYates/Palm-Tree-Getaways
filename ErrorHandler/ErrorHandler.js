const sendErrorDev = (req, res, error) => {
  let errorMessage;
  if (error.message) {
    if (error.message.includes("passwordConfirm"))
      errorMessage = "Passwords do not match!";
  } else {
    errorMessage = error;
  }

  res.status(200).json({
    status: "failed",
    message: errorMessage,
  });
};

const sendErrorProd = (req, res, error) => {
  let errorMessage;
  if (error.message) {
    if (error.message.includes("passwordConfirm"))
      errorMessage = "Passwords do not match!";
  } else {
    errorMessage = error;
  }

  res.status(200).json({
    status: "failed",
    message: errorMessage,
  });
};

module.exports = (error, req, res, next) => {
  if (process.env.NODE_ENV === "development") {
    if (!error.message) {
      sendErrorDev(req, res, error);
      return;
    }
    if (
      error.message.startsWith("ValidationError") ||
      error.message.includes("User validation")
    ) {
      sendErrorDev(req, res, error);
    }
    return;
  }
  if (process.env.NODE_ENV === "production") {
    if (!error.message) {
      sendErrorProd(req, res, error);
      return;
    }
    if (
      error.message.startsWith("ValidationError") ||
      error.message.includes("User validation")
    ) {
      sendErrorProd(req, res, error);
    }
    return;
  }
  res.status(200).json({
    status: "failed",
    message: error,
  });
};
