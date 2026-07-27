const Alumni = require("../models/Alumni");

// @route  GET /api/directory
// @query  ?industry=&department=&fromYear=&toYear=&location=&page=&limit=
// Returns paginated alumni profiles (joined with their base User info).
const getAlumniDirectory = async (req, res) => {
  try {
    const { fromYear, toYear, page = 1, limit = 6 } = req.query;

    const filter = {};
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
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// @route  GET /api/directory/:id
// Returns one alumni's full public profile — used by the "View Profile"
// button on the student-side Directory page.
// :id is the Alumni document's own _id (same id used in the directory list).
const getAlumniById = async (req, res) => {
  try {
    const alumni = await Alumni.findById(req.params.id).populate(
      "user",
      "fullName email"
    );

    if (!alumni) {
      return res.status(404).json({ message: "Alumni not found" });
    }

    res.json(alumni);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

module.exports = { getAlumniDirectory, getAlumniById };