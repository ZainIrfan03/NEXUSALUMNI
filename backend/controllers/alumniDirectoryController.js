const Student = require("../models/Student");
const MentorshipRequest = require("../models/MentorshipRequest");
const {
  DEPARTMENT_LABELS,
  DIRECTORY_FILTER,
  DIRECTORY_SORT,
  HTTP_STATUS,
  MENTORSHIP_STATUS,
  PAGINATION,
} = require("../constants");

const getGraduationYear = (session) => {
  if (!session) return null;
  const parts = session.split("-");
  return parts[parts.length - 1].trim();
};
const getStudentDirectory = async (req, res) => {
  const {
    department = DIRECTORY_FILTER.ALL_DEPARTMENTS,
    skills = "",
    years = "",
    sortBy = DIRECTORY_SORT.RECENT,
    page = PAGINATION.DEFAULT_PAGE,
  } = req.query;

  const pageSize = PAGINATION.STUDENT_DIRECTORY_PAGE_SIZE;
  const skillList = skills ? skills.split(",").filter(Boolean) : [];
  const yearList = years ? years.split(",").filter(Boolean) : [];

  const filter = { isPublic: true };
  if (department && department !== DIRECTORY_FILTER.ALL_DEPARTMENTS) {
    filter.department = department;
  }
  if (skillList.length) {
    filter.skills = { $in: skillList };
  }
  if (yearList.length) {
    filter.session = { $regex: yearList.join("|"), $options: "i" };
  }

  let students = await Student.find(filter).populate("user", "fullName email");

  if (sortBy === DIRECTORY_SORT.NAME) {
    students.sort((a, b) =>
      (a.user?.fullName || "").localeCompare(b.user?.fullName || "")
    );
  } else if (sortBy === DIRECTORY_SORT.YEAR) {
    students.sort((a, b) =>
      (getGraduationYear(b.session) || "").localeCompare(getGraduationYear(a.session) || "")
    );
  } else {
    students.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  }

  const totalCount = students.length;
  const start = (Number(page) - 1) * pageSize;
  const pageStudents = students.slice(start, start + pageSize);

  const acceptedRequests = await MentorshipRequest.find({
    alumni: req.user.id,
    status: MENTORSHIP_STATUS.ACCEPTED,
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
const getStudentById = async (req, res) => {
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
    status: MENTORSHIP_STATUS.ACCEPTED,
  });

  res.json({
    ...student.toObject(),
    isMentee: !!acceptedRequest,
  });
};

module.exports = { getStudentDirectory, getStudentById };
