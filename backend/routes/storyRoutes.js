const express = require("express");
const { getStories, getStoryCategories } = require("../controllers/successStoryController");

const router = express.Router();

// Both public — no login required, this powers the marketing
// /success-stories page.
router.get("/", getStories);
router.get("/categories", getStoryCategories);

module.exports = router;