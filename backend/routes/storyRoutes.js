const express = require("express");
const { getStories, getStoryCategories } = require("../controllers/successStoryController");

const router = express.Router();
router.get("/", getStories);
router.get("/categories", getStoryCategories);

module.exports = router;