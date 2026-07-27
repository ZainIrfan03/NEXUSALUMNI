const express = require("express");
const {
  getMyProfile,
  updateMyProfile,
  addExperience,
  deleteExperience,
  addEducation,
  deleteEducation,
  uploadAvatarImage,
  uploadResumeFile,
} = require("../controllers/alumniProfileController");
const { protect, authorize } = require("../middleware/authMiddleware");
const { uploadAvatar, uploadResume } = require("../middleware/uploadMiddleware");
const router = express.Router();

router.get("/", protect, authorize("alumni"), getMyProfile);
router.put("/", protect, authorize("alumni"), updateMyProfile);
router.post("/experience", protect, authorize("alumni"), addExperience);
router.delete(
  "/experience/:experienceId",
  protect,
  authorize("alumni"),
  deleteExperience,
);
router.post("/education", protect, authorize("alumni"), addEducation);
router.post(
  "/avatar",
  protect,
  authorize("alumni"),
  uploadAvatar.single("avatar"),
  uploadAvatarImage,
);
router.post(
  "/resume",
  protect,
  authorize("alumni"),
  uploadResume.single("resume"),
  uploadResumeFile,
);
router.delete(
  "/education/:educationId",
  protect,
  authorize("alumni"),
  deleteEducation,
);

module.exports = router;