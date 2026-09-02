const mongoose = require("mongoose");
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