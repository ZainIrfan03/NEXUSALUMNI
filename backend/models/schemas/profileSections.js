const mongoose = require("mongoose");

const experienceSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    company: { type: String, required: true },
    startDate: { type: String },
    endDate: { type: String },
    current: { type: Boolean, default: false },
    description: { type: String },
  },
  { _id: true, timestamps: true },
);

const educationSchema = new mongoose.Schema(
  {
    school: { type: String, required: true },
    degree: { type: String, required: true },
    year: { type: String },
  },
  { _id: true, timestamps: true },
);

module.exports = { educationSchema, experienceSchema };
