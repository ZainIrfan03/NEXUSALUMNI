const mongoose = require("mongoose");
const { JOB_TYPE, JOB_STATUS, EXPERIENCE_LEVEL } = require("../constants");

/**
 * Job — posted by an Alumni, browsed/applied to by Students.
 * `savedBy` is a simple bookmark list (student user IDs) — powers
 * the bookmark icon on each job card without needing a separate model.
 */
const jobSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    company: { type: String, required: true },
    location: { type: String, required: true },
    department: { type: String }, // e.g. "Design", "Marketing" — shown next to location on the card

    type: {
      type: String,
      enum: Object.values(JOB_TYPE),
      required: true,
    },

    status: {
      type: String,
      enum: Object.values(JOB_STATUS),
      default: JOB_STATUS.ACTIVE,
    },

    payRange: { type: String },        // e.g. "$35 - $45 / hr"
    description: { type: String },
    requirements: [{ type: String, trim: true }],
    experienceLevel: {
      type: String,
      enum: Object.values(EXPERIENCE_LEVEL),
      default: EXPERIENCE_LEVEL.ENTRY,
    },
    deadline: { type: Date },

    postedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User", // must be an alumni
      required: true,
    },

    savedBy: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  },
  { timestamps: true } // createdAt used to show the "NEW" badge (e.g. < 3 days old)
);

jobSchema.index({ status: 1, type: 1, createdAt: -1 });
jobSchema.index({ title: "text", company: "text", description: "text" });

module.exports = mongoose.model("Job", jobSchema);
