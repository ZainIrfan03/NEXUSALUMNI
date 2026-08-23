const Alumni = require("../models/Alumni");
const { HTTP_STATUS } = require("../utils/constants");

// @route  GET /api/directory/featured
// Public (no auth) — used on the marketing Home page's "Featured Alumni"
// section, so it can't reuse getAlumniDirectory (that route requires login).
// Picks a small set of alumni with a complete public profile so the
// homepage never shows blank names/roles.
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

// @route  GET /api/directory
// @query  ?industry=&department=&fromYear=&toYear=&location=&page=&limit=
// Returns paginated alumni profiles (joined with their base User info).
const getAlumniDirectory = async (req, res) => {
  const { fromYear, toYear, page = 1, limit = 6 } = req.query;

  // Directory results must respect the profile owner's privacy setting.
  // Keep this restriction server-side because frontend filtering can be
  // bypassed by calling the API directly.
  const filter = { isPublic: true };
  if (fromYear || toYear) {
    filter.graduationYear = {};
    if (fromYear) filter.graduationYear.$gte = fromYear;
    if (toYear) filter.graduationYear.$lte = toYear;
  }
  // NOTE: department/industry/location filters need those fields added
  // to the Alumni model first — add them there, then filter here the
  // same way as graduationYear above.

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

// @route  GET /api/directory/:id
// Returns one alumni's full public profile — used by the "View Profile"
// button on the student-side Directory page.
// :id is the Alumni document's own _id (same id used in the directory list).
const getAlumniById = async (req, res) => {
  // Use the same privacy rule as the list endpoint so a private profile
  // cannot be opened by guessing or reusing its document id.
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
