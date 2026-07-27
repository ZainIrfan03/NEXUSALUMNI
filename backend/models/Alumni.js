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
    year: { type: String }, // e.g. "2019"
  },
  { _id: true, timestamps: true }
);

/**
 * Alumni profile — extra fields specific to the "alumni" role.
 * `user` links back to the base User document.
 *
 * `graduationYear`, `company`, `jobTitle` are set at registration time.
 * Everything else is filled in later via PUT /api/alumni/profile,
 * mirroring the Student profile shape so the frontend can reuse the
 * same UI patterns (MyProfile / EditProfile) across both roles.
 */
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