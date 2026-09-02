const mongoose = require("mongoose");
const { educationSchema, experienceSchema } = require("./schemas/profileSections");

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
