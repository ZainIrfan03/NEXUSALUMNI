const SuccessStory = require("../models/SuccessStory");
const { PAGINATION, STORY_CATEGORY_FILTER } = require("../constants");
const getStories = async (req, res) => {
  const { category, search } = req.query;
  const page = Math.max(
    Number(req.query.page) || PAGINATION.DEFAULT_PAGE,
    PAGINATION.DEFAULT_PAGE,
  );
  const limit = Math.min(
    Number(req.query.limit) || PAGINATION.SUCCESS_STORIES_DEFAULT_PAGE_SIZE,
    PAGINATION.SUCCESS_STORIES_MAX_PAGE_SIZE,
  );

  const filter = {};
  if (category && category !== STORY_CATEGORY_FILTER.ALL) {
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
const getStoryCategories = async (req, res) => {
  const categories = await SuccessStory.distinct("category");
  res.json({ categories: categories.sort() });
};

module.exports = { getStories, getStoryCategories };
