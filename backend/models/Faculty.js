const mongoose = require("mongoose");
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