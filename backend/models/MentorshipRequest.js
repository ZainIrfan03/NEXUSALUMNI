const mongoose = require("mongoose");

/**
 * MentorshipRequest — one document per "Send Request" click.
 * `student` and `alumni` reference the base User collection
 * (works whether request comes from student dashboard or is
 * viewed from the alumni side later).
 */
const mentorshipRequestSchema = new mongoose.Schema(
  {
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    alumni: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    message: { type: String }, // optional note the student adds when sending
    status: {
      type: String,
      enum: ["pending", "accepted", "declined", "completed"],
      default: "pending",
    },
  },
  { timestamps: true } // createdAt = "Sent: ..." date shown in the UI
);

// Prevent the same student from sending duplicate pending requests
// to the same alumni.
mentorshipRequestSchema.index({ student: 1, alumni: 1 }, { unique: false });

module.exports = mongoose.model("MentorshipRequest", mentorshipRequestSchema);