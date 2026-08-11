const mongoose = require("mongoose");

/**
 * SuccessStory — shown on the public /success-stories page.
 *
 * There is no submission UI yet (out of scope for now) — stories are
 * added directly in the database. `isFeatured` marks the story that
 * should render as the large "hero" card at the top of the page; the
 * controller always sorts featured stories first so the newest featured
 * story naturally lands in that slot without extra frontend logic.
 */
const successStorySchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, required: true, trim: true },
    category: { type: String, required: true, trim: true }, // e.g. "Technology", "Finance" — drives the filter pills
    image: { type: String, required: true }, // full URL or "/uploads/..." relative path

    authorName: { type: String, required: true, trim: true },
    authorRole: { type: String, required: true, trim: true }, // e.g. "Founder & CEO, MediTech AI"
    graduationYear: { type: Number, required: true },

    isFeatured: { type: Boolean, default: false },
  },
  { timestamps: true }
);

module.exports = mongoose.model("SuccessStory", successStorySchema);