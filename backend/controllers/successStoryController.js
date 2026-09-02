const SuccessStory = require("../models/SuccessStory");
// @query  ?category=&search=&page=&limit=
// Public — powers the /success-stories page. Sorts featured stories
// first (then newest first) so page 1's first result is always the
// "hero" story the frontend renders in the large card slot.
const getStories = async (req, res) => {
  const { category, search } = req.query;
  const page = Math.max(Number(req.query.page) || 1, 1);
  const limit = Math.min(Number(req.query.limit) || 6, 24);

  const filter = {};
  if (category && category !== "All Categories") {
    filter.category = category;
  }
  if (search) {
    const regex = new RegExp(search, "i");
    filter.$or = [{ title: regex }, { description: regex }, { authorName: regex }];
  }

  const total = await SuccessStory.countDocuments(filter);
  const results = await SuccessStory.find(filter)
    .sort({ isFeatured: -1, createdAt: -1 })
    .skip((page - 1) * limit)
    .limit(limit);

  res.json({
    results,
    page,
    totalPages: Math.max(Math.ceil(total / limit), 1),
    total,
  });
};
// Public — distinct category list for the filter pills, so new
// categories added in the DB show up without a frontend deploy.
const getStoryCategories = async (req, res) => {
  const categories = await SuccessStory.distinct("category");
  res.json({ categories: categories.sort() });
};

module.exports = { getStories, getStoryCategories };
