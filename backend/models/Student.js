const mongoose = require("mongoose");

const experienceSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    company: { type: String, required: true },
    startDate: { type: String }, // kept as String for flexibility (e.g. "2019", "Jan 2019")
    endDate: { type: String },
    current: { type: Boolean, default: false }, // true = shows "Present" badge
    description: { type: String },
  },
  { _id: true, timestamps: true }
);

const educationSchema = new mongoose.Schema(
  {
    school: { type: String, required: true },
    degree: { type: String, required: true },
    year: { type: String }, // e.g. "Class of 2019"
  },
  { _id: true, timestamps: true }
);

/**
 * Student profile — extra fields specific to the "student" role.
 * `user` links back to the base User document (auth + email + role).
 */
const studentSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true, // one Student profile per User
    },
    department: { type: String, required: true },
    session: { type: String, required: true },   // e.g. "2021-2025"
    rollNumber: { type: String, required: true },

    // Extended profile fields — set via PUT /api/student/profile
    location: { type: String },
    headline: { type: String },
    bio: { type: String },
    skills: [{ type: String }],
    interests: [{ type: String }],
    isPublic: { type: Boolean, default: true },
    resumeUrl: { type: String },
    avatarUrl: { type: String },

    // View-mode sections
    experience: [experienceSchema],
    education: [educationSchema],
    openToNetworking: { type: Boolean, default: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Student", studentSchema);