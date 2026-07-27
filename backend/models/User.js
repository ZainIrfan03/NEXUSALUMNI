const mongoose = require("mongoose");

/**
 * Base User model — common to every account regardless of role.
 * Role-specific details (department, company, etc.) live in their
 * own collections (Student / Alumni / Faculty), each referencing
 * this User's _id.
 */
const userSchema = new mongoose.Schema(
  {
    fullName: { type: String, required: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true }, // stored hashed, never plain text

    role: {
      type: String,
      enum: ["student", "alumni", "faculty", "admin"],
      required: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("User", userSchema);