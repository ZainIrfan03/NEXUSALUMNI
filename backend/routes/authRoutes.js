const express = require("express");
const { registerUser, loginUser, logoutUser } = require("../controllers/authController");
const { registerValidators, loginValidators } = require("../validators/authValidators");
const validate = require("../middleware/validate");

const router = express.Router();

router.post("/register", registerValidators, validate, registerUser);
router.post("/login", loginValidators, validate, loginUser);
router.post("/logout", logoutUser);

module.exports = router;