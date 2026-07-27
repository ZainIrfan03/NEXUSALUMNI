const mongoose = require("mongoose");

/**
 * Faculty profile — extra fields specific to the "faculty" role.
 * Faculty accounts are created manually by an Admin, not through
 * public registration (same rule as Admin).
 */
const facultySchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },
    department: { type: String, required: true },
    designation: { type: String }, // e.g. "Professor", "HOD"
  },
  { timestamps: true }
);

module.exports = mongoose.model("Faculty", facultySchema);