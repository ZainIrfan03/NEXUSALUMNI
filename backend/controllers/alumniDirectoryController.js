const Student = require("../models/Student");

const DEPARTMENT_LABELS = {
  cs: "Computer Science",
  business: "Business",
  engineering: "Engineering",
  design: "Design",
};

// Session is stored as a string like "2021-2025" — the graduation year
// is the second half of that range.
const getGraduationYear = (session) => {
  if (!session) return null;
  const parts = session.split("-");
  return parts[parts.length - 1].trim();
};

// @route  GET /api/alumni/directory
// @query  ?department=&skills=&years=&sortBy=&page=
// Returns a paginated, filterable list of students for alumni to browse.
// `skills` and `years` arrive as comma-separated strings from the frontend.
const getStudentDirectory = async (req, res) => {
  try {
    const {
      department = "all",
      skills = "",
      years = "",
      sortBy = "recent",
      page = 1,
    } = req.query;

    const pageSize = 6;
    const skillList = skills ? skills.split(",").filter(Boolean) : [];
    const yearList = years ? years.split(",").filter(Boolean) : [];

    const filter = {};
    if (department && department !== "all") {
      filter.department = department;
    }
    if (skillList.length) {
      filter.skills = { $in: skillList };
    }
    if (yearList.length) {
      // session is a "2021-2025" style string — match any of the
      // selected years appearing anywhere in that range.
      filter.session = { $regex: yearList.join("|"), $options: "i" };
    }

    let students = await Student.find(filter).populate("user", "fullName email");

    if (sortBy === "name") {
      students.sort((a, b) =>
        (a.user?.fullName || "").localeCompare(b.user?.fullName || "")
      );
    } else if (sortBy === "year") {
      students.sort((a, b) =>
        (getGraduationYear(b.session) || "").localeCompare(getGraduationYear(a.session) || "")
      );
    } else {
      // "recent" — newest profiles first
      students.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    }

    const totalCount = students.length;
    const start = (Number(page) - 1) * pageSize;
    const pageStudents = students.slice(start, start + pageSize);

    const formatted = pageStudents.map((s) => ({
      _id: s._id,
      fullName: s.user?.fullName,
      avatarUrl: s.avatarUrl,
      department: s.department,
      degree: DEPARTMENT_LABELS[s.department] || s.department,
      graduationYear: getGraduationYear(s.session),
      skills: s.skills || [],
    }));

    res.json({ students: formatted, totalCount });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

module.exports = { getStudentDirectory };