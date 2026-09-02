const mongoose = require("mongoose");
const { educationSchema, experienceSchema } = require("./schemas/profileSections");
const alumniSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },

    // Set at registration
    graduationYear: { type: String, required: true },
    company: { type: String },
    jobTitle: { type: String },

    // Extended profile fields — set via PUT /api/alumni/profile
    location: { type: String },
    headline: { type: String },
    bio: { type: String },
    skills: [{ type: String }],
    interests: [{ type: String }], // "Willing to mentor in" tags on the frontend
    isPublic: { type: Boolean, default: true }, // shown in the Student Directory or not
    avatarUrl: { type: String },
    resumeUrl: { type: String }, // uploaded CV/resume (PDF) — set via POST /api/alumni/profile/resume

    // View-mode sections (same shape as Student, so frontend components can be shared)
    experience: [experienceSchema],
    education: [educationSchema],

    openToMentorship: { type: Boolean, default: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Alumni", alumniSchema);
