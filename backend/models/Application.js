const mongoose = require("mongoose");
const { APPLICATION_STATUS, INTERVIEW_RESPONSE } = require("../utils/constants");

const interviewSchema = new mongoose.Schema(
  {
    scheduledAt: { type: Date, required: true },
    timezone: { type: String, required: true },
    durationMinutes: { type: Number, min: 15, max: 240, default: 30 },
    meetingUrl: { type: String, required: true },
    instructions: { type: String },
    response: {
      type: String,
      enum: Object.values(INTERVIEW_RESPONSE),
      default: INTERVIEW_RESPONSE.PENDING,
    },
  },
  { _id: false }
);

/**
 * Application — one document per student "Apply Now" click.
 * Powers the Application Tracking counts (Applied / In Review / Interviews).
 */
const applicationSchema = new mongoose.Schema(
  {
    job: { type: mongoose.Schema.Types.ObjectId, ref: "Job", required: true },
    student: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    // Snapshot of the resume used when applying. Later profile uploads do not
    // silently replace the document an alumni originally received.
    resumeUrl: { type: String },

    status: {
      type: String,
      enum: Object.values(APPLICATION_STATUS),
      default: APPLICATION_STATUS.APPLIED,
    },
    interview: { type: interviewSchema },
  },
  { timestamps: true }
);

// One student can't apply twice to the same job
applicationSchema.index({ job: 1, student: 1 }, { unique: true });

module.exports = mongoose.model("Application", applicationSchema);
