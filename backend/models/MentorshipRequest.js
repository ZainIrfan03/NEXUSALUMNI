const mongoose = require("mongoose");
const { MENTORSHIP_STATUS } = require("../constants");
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
      enum: Object.values(MENTORSHIP_STATUS),
      default: MENTORSHIP_STATUS.PENDING,
    },
  },
  { timestamps: true } // createdAt = "Sent: ..." date shown in the UI
);

// Prevent the same student from sending duplicate pending requests
// to the same alumni.
mentorshipRequestSchema.index({ student: 1, alumni: 1 }, { unique: false });

module.exports = mongoose.model("MentorshipRequest", mentorshipRequestSchema);
