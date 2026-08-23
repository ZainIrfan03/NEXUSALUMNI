const Student = require("../models/Student");
const MentorshipRequest = require("../models/MentorshipRequest");
const { HTTP_STATUS, DEPARTMENT_LABELS } = require("../utils/constants");

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
// Each student includes `isMentee: boolean` — true only if THIS alumni has
// an accepted MentorshipRequest with them, so the frontend can show a
// "Message" icon on the card only for accepted mentees.
const getStudentDirectory = async (req, res) => {
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

  // Only profiles that opted into directory visibility may be listed.
  // This must be enforced by the API, not just hidden by the frontend.
  const filter = { isPublic: true };
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

  // One query for all accepted requests this alumni has with the students
  // on this page, instead of N queries in the map below.
  const acceptedRequests = await MentorshipRequest.find({
    alumni: req.user.id,
    status: "accepted",
    student: { $in: pageStudents.map((s) => s.user?._id).filter(Boolean) },
  });
  const menteeUserIds = new Set(acceptedRequests.map((r) => r.student.toString()));

  const formatted = pageStudents.map((s) => ({
    _id: s._id,
    fullName: s.user?.fullName,
    avatarUrl: s.avatarUrl,
    department: s.department,
    degree: DEPARTMENT_LABELS[s.department] || s.department,
    graduationYear: getGraduationYear(s.session),
    skills: s.skills || [],
    userId: s.user?._id, // needed by the frontend to start a conversation
    isMentee: menteeUserIds.has(s.user?._id?.toString()),
  }));

  res.json({ students: formatted, totalCount });
};

// @route  GET /api/alumni/directory/:id
// Returns one student's full public profile — used by the "View Profile"
// button on the alumni-side Student Directory page.
// :id is the Student document's own _id (same id used in the directory list).
//
// Also includes `isMentee: boolean` — true only if THIS alumni has an
// accepted MentorshipRequest with this student. The frontend uses this to
// decide whether to show the "Message" button (alumni can only chat with
// their accepted mentees, not any student in the directory).
const getStudentById = async (req, res) => {
  // Match the directory list's privacy rule so direct profile URLs do not
  // expose a student who has made their profile private.
  const student = await Student.findOne({
    _id: req.params.id,
    isPublic: true,
  }).populate("user", "fullName email");

  if (!student) {
    return res.status(HTTP_STATUS.NOT_FOUND).json({ message: "Student not found" });
  }

  const acceptedRequest = await MentorshipRequest.findOne({
    student: student.user._id,
    alumni: req.user.id,
    status: "accepted",
  });

  res.json({
    ...student.toObject(),
    isMentee: !!acceptedRequest,
  });
};

module.exports = { getStudentDirectory, getStudentById };
