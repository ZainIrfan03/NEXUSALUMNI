const express = require("express");
const {
  registerUser,
  loginUser,
  logoutUser,
  getCurrentUser,
} = require("../controllers/authController");
const { registerValidators, loginValidators } = require("../validators/authValidators");
const validate = require("../middleware/validate");
const { protect } = require("../middleware/authMiddleware");

const router = express.Router();

router.post("/register", registerValidators, validate, registerUser);
router.post("/login", loginValidators, validate, loginUser);
router.post("/logout", logoutUser);
router.get("/me", protect, getCurrentUser);

module.exports = router;
