import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { Filter, UserPlus, Loader2, ChevronLeft, ChevronRight } from "lucide-react";

const API_BASE = "http://localhost:5000/api";

// Files come back from the backend as relative paths (e.g. "/uploads/avatars/xyz.png"),
// so build a full URL for <img src>. Stale blob: URLs (from old preview-only
// code) can never load after a refresh, so they're treated as invalid.
const fileUrl = (path) => {
  if (!path) return "";
  if (path.startsWith("blob:")) return "";
  if (path.startsWith("http")) return path;
  return `http://localhost:5000${path}`;
};

const SKILL_OPTIONS = ["Python", "Data Analysis", "UI/UX Design", "Public Speaking"];
const YEAR_OPTIONS = ["2024", "2025", "2026", "2027"];

function StudentCard({ student, onViewProfile }) {
  const avatar = fileUrl(student.avatarUrl);

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

      <button
        onClick={() => onViewProfile(student._id)}
        className="mt-auto w-full border border-gray-200 rounded-lg text-sm font-medium text-gray-800 py-2 hover:bg-gray-50"
      >
        View Profile →
      </button>
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

export default function studentDirectory() {
  const { token } = useSelector((state) => state.auth);
  const navigate = useNavigate();
  const authHeader = { headers: { Authorization: `Bearer ${token}` } };

  const [students, setStudents] = useState([]);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [department, setDepartment] = useState("all");
  const [skills, setSkills] = useState([]);
  const [years, setYears] = useState([]);
  const [sortBy, setSortBy] = useState("recent");
  const [page, setPage] = useState(1);

  const fetchStudents = async () => {
    setLoading(true);
    setError("");
    try {
      const { data } = await axios.get(`${API_BASE}/alumni/directory`, {
        ...authHeader,
        params: { department, skills: skills.join(","), years: years.join(","), sortBy, page },
      });
      setStudents(data.students || []);
      setTotalCount(data.totalCount || 0);
    } catch (err) {
      setError(err.response?.data?.message || "Could not load the directory.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStudents();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [department, skills, years, sortBy, page]);

  const toggleSkill = (skill) => {
    setPage(1);
    setSkills((prev) =>
      prev.includes(skill) ? prev.filter((s) => s !== skill) : [...prev, skill]
    );
  };

  const toggleYear = (year) => {
    setPage(1);
    setYears((prev) => (prev.includes(year) ? prev.filter((y) => y !== year) : [...prev, year]));
  };

  const clearFilters = () => {
    setDepartment("all");
    setSkills([]);
    setYears([]);
    setPage(1);
  };

  const totalPages = Math.max(1, Math.ceil(totalCount / 6));

  return (
    <div>
      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Student Directory</h1>
          <p className="text-gray-500 mt-1">Connect with the next generation of industry leaders.</p>
        </div>
      </div>

      <div className="grid lg:grid-cols-4 gap-6">
        {/* Filters sidebar */}
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
              onChange={(e) => {
                setPage(1);
                setDepartment(e.target.value);
              }}
              className="mt-1 mb-4 w-full border border-gray-200 rounded-lg px-3 py-2 text-sm"
            >
              <option value="all">All Departments</option>
              <option value="cs">Computer Science</option>
              <option value="business">Business Admin</option>
              <option value="design">Visual Design</option>
              <option value="engineering">Mechanical Engineering</option>
            </select>

            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
              Skills
            </label>
            <div className="flex flex-col gap-2 mt-2 mb-4">
              {SKILL_OPTIONS.map((skill) => (
                <label key={skill} className="flex items-center gap-2 text-sm text-gray-700">
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
              {YEAR_OPTIONS.map((year) => (
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

            <button onClick={clearFilters} className="text-sm font-medium text-primary hover:underline">
              Clear All Filters
            </button>
          </div>

          <div className="bg-dark rounded-xl p-5 text-white relative overflow-hidden">
            <p className="text-sm text-gray-300">Active Students</p>
            <p className="text-3xl font-bold mt-2">{totalCount.toLocaleString()}</p>
            <p className="text-sm text-green-400 mt-1">+12% from last semester</p>
          </div>
        </div>

        {/* Results */}
        <div className="lg:col-span-3">
          <div className="flex items-center justify-between mb-4">
            <p className="text-sm text-gray-500">
              {loading ? "Loading..." : `Showing ${students.length} of ${totalCount} profiles matching your criteria`}
            </p>
            <div className="flex items-center gap-2 text-sm">
              <span className="text-gray-500">Sort by:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="font-semibold text-gray-900 border-none outline-none bg-transparent"
              >
                <option value="recent">Recent Activity</option>
                <option value="name">Name</option>
                <option value="year">Graduation Year</option>
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
                  onViewProfile={(id) => navigate(`/dashboard/alumni/directory/${id}`)}
                />
              ))}
              <InviteMoreCard />
            </div>
          )}

          {/* Pagination */}
          <div className="flex items-center justify-center gap-2 mt-8">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="h-9 w-9 rounded-lg border border-gray-200 flex items-center justify-center disabled:opacity-40"
            >
              <ChevronLeft size={16} />
            </button>
            {Array.from({ length: Math.min(totalPages, 3) }, (_, i) => i + 1).map((n) => (
              <button
                key={n}
                onClick={() => setPage(n)}
                className={`h-9 w-9 rounded-lg text-sm font-medium ${
                  page === n ? "bg-dark text-white" : "border border-gray-200 text-gray-700"
                }`}
              >
                {n}
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
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
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