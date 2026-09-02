// One-off script to insert sample Success Stories for local testing.
// Run from the BACKEND folder:   node scripts/seedSuccessStories.js
// Safe to re-run — it clears existing stories first so you don't get duplicates.

require("dotenv").config();
const mongoose = require("mongoose");
const { MONGO_URI } = require("../config/env");
const SuccessStory = require("../models/SuccessStory");

const sampleStories = [
  {
    title: "Pioneering AI for Global Healthcare Solutions",
    description:
      "Discover how Dr. Jenkins leveraged her alumni network to secure early-stage funding and build an AI platform that is currently used by hospitals across three continents.",
    category: "Technology",
    image: "https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?w=1200&q=80",
    authorName: "Dr. Sarah Jenkins",
    authorRole: "Founder & CEO, MediTech AI",
    graduationYear: 2014,
    isFeatured: true,
  },
  {
    title: "Designing Sustainable Urban Spaces",
    description:
      "Marcus discusses his award-winning project that transformed a derelict industrial zone into a thriving mixed-use neighborhood.",
    category: "Arts & Design",
    image: "https://images.unsplash.com/photo-1494522358652-f30e61a60313?w=800&q=80",
    authorName: "Marcus Chen",
    authorRole: "Principal Architect",
    graduationYear: 2009,
  },
  {
    title: "Navigating Emerging Markets",
    description:
      "How Elena's thesis research evolved into a leading strategy for sustainable investing in Southeast Asia.",
    category: "Finance",
    image: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&q=80",
    authorName: "Elena Rodriguez",
    authorRole: "VP, Global Equities",
    graduationYear: 2018,
  },
  {
    title: "Breakthroughs in Genetic Sequencing",
    description:
      "David's lab recently published findings that could significantly reduce the cost of personalized medicine for rare genetic disorders.",
    category: "Healthcare",
    image: "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=800&q=80",
    authorName: "David Kim",
    authorRole: "Lead Research Scientist",
    graduationYear: 2011,
  },
];

async function run() {
  await mongoose.connect(MONGO_URI);
  console.log("Connected to MongoDB");

  await SuccessStory.deleteMany({});
  await SuccessStory.insertMany(sampleStories);

  console.log(`Inserted ${sampleStories.length} sample success stories.`);
  await mongoose.disconnect();
  process.exit(0);
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
