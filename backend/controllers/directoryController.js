const Alumni = require("../models/Alumni");
const { HTTP_STATUS } = require("../constants");
const getFeaturedAlumni = async (req, res) => {
  const limit = Math.min(Number(req.query.limit) || 4, 12);

  const alumni = await Alumni.find({
    isPublic: true,
    jobTitle: { $exists: true, $ne: "" },
    company: { $exists: true, $ne: "" },
  })
    .populate("user", "fullName")
    .sort({ createdAt: -1 })
    .limit(limit);

  res.json({ results: alumni });
};
const getAlumniDirectory = async (req, res) => {
  const { fromYear, toYear, page = 1, limit = 6 } = req.query;

  const filter = { isPublic: true };
  if (fromYear || toYear) {
    filter.graduationYear = {};
    if (fromYear) filter.graduationYear.$gte = fromYear;
    if (toYear) filter.graduationYear.$lte = toYear;
  }

  const skip = (Number(page) - 1) * Number(limit);

  const [alumni, total] = await Promise.all([
    Alumni.find(filter)
      .populate("user", "fullName email") // pulls fullName/email from User
      .skip(skip)
      .limit(Number(limit)),
    Alumni.countDocuments(filter),
  ]);

  res.json({
    results: alumni,
    total,
    page: Number(page),
    totalPages: Math.ceil(total / Number(limit)),
  });
};
const getAlumniById = async (req, res) => {
  const alumni = await Alumni.findOne({
    _id: req.params.id,
    isPublic: true,
  }).populate("user", "fullName email");

  if (!alumni) {
    return res.status(HTTP_STATUS.NOT_FOUND).json({ message: "Alumni not found" });
  }

  res.json(alumni);
};

module.exports = { getFeaturedAlumni, getAlumniDirectory, getAlumniById };
