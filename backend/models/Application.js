const mongoose = require("mongoose");

/**
 * Application — one document per student "Apply Now" click.
 * Powers the Application Tracking counts (Applied / In Review / Interviews).
 */
const applicationSchema = new mongoose.Schema(
  {
    job: { type: mongoose.Schema.Types.ObjectId, ref: "Job", required: true },
    student: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },

    status: {
      type: String,
      enum: ["applied", "in_review", "interview", "rejected", "accepted"],
      default: "applied",
    },
  },
  { timestamps: true }
);

// One student can't apply twice to the same job
applicationSchema.index({ job: 1, student: 1 }, { unique: true });

module.exports = mongoose.model("Application", applicationSchema);