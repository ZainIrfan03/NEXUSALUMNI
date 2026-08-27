import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useGetStudentDirectoryQuery } from "../../../store/api/alumniDirectoryApi";
import { ROUTES } from "../../../consts/appConstants";
import {
  ACADEMIC_DEPARTMENT_OPTIONS,
  GRADUATION_YEAR_OPTIONS,
  STUDENT_DIRECTORY_SORT_OPTIONS,
  STUDENT_SKILL_OPTIONS,
} from "../../../consts/directoryConstants";
import { useStartConversationMutation } from "../../../store/api/messagesApi";
import {
  Filter,
  UserPlus,
  Loader2,
  ChevronLeft,
  ChevronRight,
  Send,
} from "lucide-react";
import { getImageUrl } from "../../../utils/getImageUrl";

function StudentCard({ student, onViewProfile, onMessage, messagingId }) {
  const avatar = getImageUrl(student.avatarUrl);
  const isMessaging = messagingId === student._id;

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5 flex flex-col">
      <div className="flex items-start justify-between mb-3">
        {avatar ? (
          <img
            src={avatar}
            alt={student.fullName}
            className="h-14 w-14 rounded-full object-cover"
          />
        ) : (
          <div className="h-14 w-14 rounded-full bg-gray-100 flex items-center justify-center text-gray-400 font-semibold">
            {student.fullName ? student.fullName.charAt(0).toUpperCase() : "?"}
          </div>
        )}
        <span className="text-xs font-medium text-primary bg-blue-50 rounded-full px-2.5 py-1">
          Class of {student.graduationYear}
        </span>
      </div>

      <h3 className="font-bold text-gray-900">{student.fullName}</h3>
      <p className="text-sm text-primary mb-3">{student.degree}</p>

      <div className="flex flex-wrap gap-1.5 mb-4">
        {(student.skills || []).map((skill) => (
          <span
            key={skill}
            className="text-[11px] font-medium text-gray-600 bg-gray-100 rounded px-2 py-1 uppercase tracking-wide"
          >
            {skill}
          </span>
        ))}
      </div>

      <div className="mt-auto flex gap-2">
        <button
          onClick={() => onViewProfile(student._id)}
          className="flex-1 border border-gray-200 rounded-lg text-sm font-medium text-gray-800 py-2 hover:bg-gray-50"
        >
          View Profile →
        </button>

        {student.isMentee && (
          <button
            onClick={() => onMessage(student)}
            disabled={isMessaging}
            title="Message this mentee"
            className="h-9 w-9 shrink-0 rounded-lg border border-gray-200 flex items-center justify-center text-gray-500 hover:border-primary hover:text-primary transition-colors disabled:opacity-50"
          >
            <Send size={15} />
          </button>
        )}
      </div>
    </div>
  );
}

function InviteMoreCard() {
  return (
    <div className="border-2 border-dashed border-gray-200 rounded-xl p-5 flex flex-col items-center justify-center text-center gap-2">
      <span className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-400">
        <UserPlus size={18} />
      </span>
      <p className="font-semibold text-gray-900">Invite More Students</p>
      <p className="text-sm text-gray-500">
        Help grow the network by inviting peers from your department.
      </p>
      <button className="mt-2 text-sm font-medium text-primary hover:underline">
        Send Invites
      </button>
    </div>
  );
}

export default function StudentDirectory() {
  const navigate = useNavigate();

  const [department, setDepartment] = useState("all");
  const [skills, setSkills] = useState([]);
  const [years, setYears] = useState([]);
  const [sortBy, setSortBy] = useState("recent");
  const [page, setPage] = useState(1);

  const {
    data,
    isLoading: loading,
    error: queryError,
  } = useGetStudentDirectoryQuery({
    department,
    skills: skills.join(","),
    years: years.join(","),
    sortBy,
    page,
  });

  const students = data?.students || [];
  const totalCount = data?.totalCount || 0;

  const [startConversation] = useStartConversationMutation();
  const [messagingId, setMessagingId] = useState(null);
  const [actionError, setActionError] = useState("");

  const error = actionError || (queryError && "Could not load the directory.");

  const toggleSkill = (skill) => {
    setPage(1);
    setSkills((prev) =>
      prev.includes(skill)
        ? prev.filter((existingSkill) => existingSkill !== skill)
        : [...prev, skill],
    );
  };

  const toggleYear = (year) => {
    setPage(1);
    setYears((prev) =>
      prev.includes(year)
        ? prev.filter((existingYear) => existingYear !== year)
        : [...prev, year],
    );
  };

  const clearFilters = () => {
    setDepartment("all");
    setSkills([]);
    setYears([]);
    setPage(1);
  };

  const handleMessage = async (student) => {
    if (!student.userId) return;
    setActionError("");
    setMessagingId(student._id);
    try {
      const conversation = await startConversation(student.userId).unwrap();
      navigate(ROUTES.ALUMNI.MESSAGES, {
        state: { conversationId: conversation._id },
      });
    } catch (err) {
      setActionError(err.data?.message || "Could not start chat.");
    } finally {
      setMessagingId(null);
    }
  };

  const totalPages = Math.max(1, Math.ceil(totalCount / 6));

  return (
    <div>
      <div className="flex flex-wrap items-start justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Student Directory
          </h1>
          <p className="text-gray-500 mt-1">
            Connect with the next generation of industry leaders.
          </p>
        </div>
      </div>

      <div className="grid lg:grid-cols-4 gap-6">
        <div className="flex flex-col gap-4">
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <div className="flex items-center gap-2 mb-4">
              <Filter size={16} className="text-gray-700" />
              <h2 className="font-semibold text-gray-900">Filter Results</h2>
            </div>

            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
              Department
            </label>
            <select
              value={department}
              onChange={(event) => {
                setPage(1);
                setDepartment(event.target.value);
              }}
              className="mt-1 mb-4 w-full border border-gray-200 rounded-lg px-3 py-2 text-sm"
            >
              <option value="all">All Departments</option>
              {ACADEMIC_DEPARTMENT_OPTIONS.map(
                ({ value, directoryLabel }) => (
                  <option key={value} value={value}>
                    {directoryLabel}
                  </option>
                ),
              )}
            </select>

            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
              Skills
            </label>
            <div className="flex flex-col gap-2 mt-2 mb-4">
              {STUDENT_SKILL_OPTIONS.map((skill) => (
                <label
                  key={skill}
                  className="flex items-center gap-2 text-sm text-gray-700"
                >
                  <input
                    type="checkbox"
                    checked={skills.includes(skill)}
                    onChange={() => toggleSkill(skill)}
                  />
                  {skill}
                </label>
              ))}
            </div>

            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
              Year
            </label>
            <div className="grid grid-cols-2 gap-2 mt-2 mb-4">
              {GRADUATION_YEAR_OPTIONS.map((year) => (
                <button
                  key={year}
                  onClick={() => toggleYear(year)}
                  className={`text-sm rounded-lg py-2 border ${
                    years.includes(year)
                      ? "border-primary text-primary font-medium"
                      : "border-gray-200 text-gray-700"
                  }`}
                >
                  {year}
                </button>
              ))}
            </div>

            <button
              onClick={clearFilters}
              className="text-sm font-medium text-primary hover:underline"
            >
              Clear All Filters
            </button>
          </div>

          <div className="bg-dark rounded-xl p-5 text-white relative overflow-hidden">
            <p className="text-sm text-gray-300">Active Students</p>
            <p className="text-3xl font-bold mt-2">
              {totalCount.toLocaleString()}
            </p>
            <p className="text-sm text-green-400 mt-1">
              +12% from last semester
            </p>
          </div>
        </div>

        <div className="lg:col-span-3">
          <div className="flex items-center justify-between mb-4">
            <p className="text-sm text-gray-500">
              {loading
                ? "Loading..."
                : `Showing ${students.length} of ${totalCount} profiles matching your criteria`}
            </p>
            <div className="flex items-center gap-2 text-sm">
              <span className="text-gray-500">Sort by:</span>
              <select
                value={sortBy}
                onChange={(event) => setSortBy(event.target.value)}
                className="font-semibold text-gray-900 border-none outline-none bg-transparent"
              >
                {STUDENT_DIRECTORY_SORT_OPTIONS.map(({ value, label }) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 text-sm rounded-xl px-4 py-2.5 mb-4">
              {error}
            </div>
          )}

          {loading ? (
            <div className="flex items-center justify-center py-20 text-gray-400 gap-2">
              <Loader2 size={18} className="animate-spin" />
              Loading students...
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-5">
              {students.map((student) => (
                <StudentCard
                  key={student._id}
                  student={student}
                  onViewProfile={(id) =>
                    navigate(ROUTES.ALUMNI.directoryProfile(id))
                  }
                  onMessage={handleMessage}
                  messagingId={messagingId}
                />
              ))}
              <InviteMoreCard />
            </div>
          )}

          <div className="flex items-center justify-center gap-2 mt-8">
            <button
              onClick={() =>
                setPage((currentPage) => Math.max(1, currentPage - 1))
              }
              disabled={page === 1}
              className="h-9 w-9 rounded-lg border border-gray-200 flex items-center justify-center disabled:opacity-40"
            >
              <ChevronLeft size={16} />
            </button>
            {Array.from(
              { length: Math.min(totalPages, 3) },
              (_, index) => index + 1,
            ).map((pageNumber) => (
              <button
                key={pageNumber}
                onClick={() => setPage(pageNumber)}
                className={`h-9 w-9 rounded-lg text-sm font-medium ${
                  page === pageNumber
                    ? "bg-dark text-white"
                    : "border border-gray-200 text-gray-700"
                }`}
              >
                {pageNumber}
              </button>
            ))}
            {totalPages > 3 && <span className="text-gray-400">...</span>}
            {totalPages > 3 && (
              <button
                onClick={() => setPage(totalPages)}
                className="h-9 w-9 rounded-lg border border-gray-200 text-sm font-medium text-gray-700"
              >
                {totalPages}
              </button>
            )}
            <button
              onClick={() =>
                setPage((currentPage) => Math.min(totalPages, currentPage + 1))
              }
              disabled={page === totalPages}
              className="h-9 w-9 rounded-lg border border-gray-200 flex items-center justify-center disabled:opacity-40"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
