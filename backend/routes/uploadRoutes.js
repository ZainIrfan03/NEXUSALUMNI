const express = require("express");
const {
  getChatUpload,
  getResumeUpload,
} = require("../controllers/uploadController");
const { protect } = require("../middleware/authMiddleware");

const router = express.Router();

router.get("/chat/:filename", protect, getChatUpload);
router.get("/resumes/:filename", protect, getResumeUpload);

module.exports = router;
