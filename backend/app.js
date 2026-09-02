const path = require("path");
const cookieParser = require("cookie-parser");
const cors = require("cors");
const express = require("express");
const { FRONTEND_URL } = require("./config/env");
const { errorHandler, notFound } = require("./middleware/errorHandler");
const registerRoutes = require("./routes");

const app = express();

app.use(cors({ origin: FRONTEND_URL, credentials: true }));
app.use(express.json());
app.use(cookieParser());

// Avatars are public. Resume and chat files stay behind protected routes.
app.use(
  "/uploads/avatars",
  express.static(path.join(__dirname, "uploads", "avatars")),
);

registerRoutes(app);

app.get("/", (req, res) => {
  res.send("Alumni Nexus API is running");
});

app.use(notFound);
app.use(errorHandler);

module.exports = app;
