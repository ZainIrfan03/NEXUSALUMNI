import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import axios from "axios";
import {
  Plus,
  Briefcase,
  Users,
  TrendingUp,
  Trash2,
  Loader2,
  Lightbulb,
  Sparkles,
  X,
  Mail,
} from "lucide-react";

const API_BASE = "http://localhost:5000/api";
const PAGE_SIZE = 4;

// Attachments/avatars come back from the backend as relative paths
// (e.g. "/uploads/avatars/xyz.png") — build a full URL for <img>.
const fileUrl = (path) => {
  if (!path) return "";
  if (path.startsWith("http")) return path;
  return `http://localhost:5000${path}`;
};

function StatCard({ icon: Icon, note, value, label }) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5 flex flex-col gap-2">
      <div className="flex items-center justify-between">
        <span className="w-9 h-9 rounded-lg bg-blue-50 text-primary flex items-center justify-center">
          <Icon size={18} />
        </span>
        {note && <span className="text-sm font-medium text-primary">{note}</span>}
      </div>
      <span className="text-3xl font-bold text-gray-900">{value}</span>
      <span className="text-sm text-gray-500">{label}</span>
    </div>
  );
}

function AvatarStack({ applicants = [], count }) {
  const shown = applicants.slice(0, 2);
  const extra = count - shown.length;
  return (
    <div className="flex items-center -space-x-2">
      {shown.map((a, i) => (
        <img
          key={i}
          src={fileUrl(a.avatarUrl) || `https://i.pravatar.cc/150?u=${a._id || i}`}
          alt=""
          className="h-8 w-8 rounded-full object-cover border-2 border-white"
        />
      ))}
      {extra > 0 && (
        <span className="h-8 w-8 rounded-full bg-dark text-white text-xs font-semibold flex items-center justify-center border-2 border-white">
          +{extra}
        </span>
      )}
    </div>
  );
}

const STATUS_STYLES = {
  Active: "bg-blue-50 text-primary",
  Closed: "bg-gray-100 text-gray-500",
  Draft: "bg-amber-50 text-amber-600",
};

// Applicant pipeline stages — same order the alumni moves someone through.
const APPLICANT_STATUS_STYLES = {
  applied: "bg-gray-100 text-gray-600",
  in_review: "bg-amber-50 text-amber-600",
  interview: "bg-blue-50 text-primary",
  accepted: "bg-green-50 text-green-600",
  rejected: "bg-red-50 text-red-500",
};
const APPLICANT_STATUS_LABELS = {
  applied: "Applied",
  in_review: "In Review",
  interview: "Interview",
  accepted: "Accepted",
  rejected: "Rejected",
};

export default function AlumniJobs() {
  const navigate = useNavigate();
  const { token } = useSelector((state) => state.auth);
  const authHeader = { headers: { Authorization: `Bearer ${token}` } };

  const [jobs, setJobs] = useState([]);
  const [stats, setStats] = useState({
    totalPostings: 0,
    newThisWeek: 0,
    totalApplicants: 0,
    unreadApplicants: 0,
    fillRate: 0,
  });
  const [totalCount, setTotalCount] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Applicants modal state
  const [applicantsJob, setApplicantsJob] = useState(null); // { _id, title }
  const [applicants, setApplicants] = useState([]);
  const [loadingApplicants, setLoadingApplicants] = useState(false);
  const [updatingId, setUpdatingId] = useState(null);

  const fetchJobs = async () => {
    setLoading(true);
    setError("");
    try {
      const { data } = await axios.get(`${API_BASE}/alumni/jobs`, {
        ...authHeader,
        params: { page, pageSize: PAGE_SIZE },
      });
      setJobs(data.jobs || []);
      setTotalCount(data.totalCount || 0);
      setStats(data.stats || stats);
    } catch (err) {
      setError(err.response?.data?.message || "Could not load your job postings.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchJobs();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page]);

  const handleDelete = async (jobId) => {
    try {
      await axios.delete(`${API_BASE}/alumni/jobs/${jobId}`, authHeader);
      fetchJobs();
    } catch (err) {
      setError(err.response?.data?.message || "Could not delete this posting.");
    }
  };

  // Opens the applicants modal and loads everyone who has applied to this job.
  const openApplicants = async (job) => {
    setApplicantsJob({ _id: job._id, title: job.title });
    setApplicants([]);
    setLoadingApplicants(true);
    try {
      const { data } = await axios.get(`${API_BASE}/alumni/jobs/${job._id}/applicants`, authHeader);
      setApplicants(data.applicants || []);
    } catch (err) {
      setError(err.response?.data?.message || "Could not load applicants.");
      setApplicantsJob(null);
    } finally {
      setLoadingApplicants(false);
    }
  };

  // Moves an applicant to a new pipeline stage (Move to Review / Schedule
  // Interview / Accept / Reject) from the modal.
  const handleStatusChange = async (applicationId, status) => {
    setUpdatingId(applicationId);
    try {
      await axios.patch(
        `${API_BASE}/alumni/jobs/applications/${applicationId}/status`,
        { status },
        authHeader
      );
      setApplicants((prev) =>
        prev.map((a) => (a.applicationId === applicationId ? { ...a, status } : a))
      );
      fetchJobs(); // keep the postings table + unread count in sync
    } catch (err) {
      setError(err.response?.data?.message || "Could not update this application.");
    } finally {
      setUpdatingId(null);
    }
  };

  const totalPages = Math.max(1, Math.ceil(totalCount / PAGE_SIZE));
  const rangeStart = totalCount === 0 ? 0 : (page - 1) * PAGE_SIZE + 1;
  const rangeEnd = Math.min(page * PAGE_SIZE, totalCount);

  return (
    <div>
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-600 text-sm rounded-xl px-4 py-2.5 mb-5">
          {error}
        </div>
      )}

      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">My Job Postings</h1>
          <p className="text-gray-500 mt-1">
            Manage your active recruitment and review incoming alumni applications.
          </p>
        </div>
        <button
          onClick={() => navigate("/dashboard/alumni/jobs/new")}
          className="flex items-center gap-2 bg-primary text-white text-sm font-medium px-5 py-2.5 rounded-lg hover:opacity-90"
        >
          <Plus size={16} /> Post New Job
        </button>
      </div>

      {/* Stats */}
      <div className="grid sm:grid-cols-3 gap-5 mb-8">
        <StatCard
          icon={Briefcase}
          note={stats.newThisWeek ? `+${stats.newThisWeek} this week` : null}
          value={stats.totalPostings}
          label="Total Postings"
        />
        <StatCard
          icon={Users}
          note={stats.unreadApplicants ? `${stats.unreadApplicants} unread` : null}
          value={stats.totalApplicants}
          label="Total Applicants"
        />
        <StatCard icon={TrendingUp} value={`${stats.fillRate}%`} label="Fill Rate" />
      </div>

      {/* Postings table */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <table className="w-full text-left">
          <thead>
            <tr className="bg-gray-50 text-xs font-semibold text-gray-500 uppercase tracking-wide">
              <th className="px-5 py-3">Job Title</th>
              <th className="px-5 py-3">Date Posted</th>
              <th className="px-5 py-3">Applicants</th>
              <th className="px-5 py-3">Status</th>
              <th className="px-5 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={5} className="px-5 py-10 text-center text-gray-400">
                  <Loader2 size={18} className="animate-spin inline mr-2" />
                  Loading postings...
                </td>
              </tr>
            ) : jobs.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-5 py-10 text-center text-sm text-gray-400">
                  No job postings yet.
                </td>
              </tr>
            ) : (
              jobs.map((job) => {
                const isClosed = job.status === "Closed";
                return (
                  <tr key={job._id} className="border-t border-gray-100">
                    <td className="px-5 py-4">
                      <p
                        className={`font-semibold ${isClosed ? "text-gray-400" : "text-primary"}`}
                      >
                        {job.title}
                      </p>
                      <p className={`text-sm ${isClosed ? "text-gray-300" : "text-gray-500"}`}>
                        {job.department} • {job.location}
                      </p>
                    </td>
                    <td className="px-5 py-4 text-sm text-gray-500">{job.datePosted}</td>
                    <td className="px-5 py-4">
                      <button
                        onClick={() => openApplicants(job)}
                        disabled={job.applicantCount === 0}
                        className="flex items-center gap-3 disabled:cursor-default"
                      >
                        {job.applicantCount > 1 ? (
                          <>
                            <AvatarStack applicants={job.applicants} count={job.applicantCount} />
                            <span className="text-sm text-gray-700 hover:text-primary hover:underline">
                              {job.applicantCount} Applicants
                            </span>
                          </>
                        ) : (
                          <span
                            className={`text-sm ${
                              job.applicantCount === 1
                                ? "text-gray-700 hover:text-primary hover:underline"
                                : "text-gray-400"
                            }`}
                          >
                            {job.applicantCount} Applicant{job.applicantCount === 1 ? "" : "s"}
                          </span>
                        )}
                      </button>
                    </td>
                    <td className="px-5 py-4">
                      <span
                        className={`text-xs font-medium rounded-full px-3 py-1.5 ${
                          STATUS_STYLES[job.status] || "bg-gray-100 text-gray-500"
                        }`}
                      >
                        {job.status}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex justify-end gap-3 text-gray-400">
                        <button
                          onClick={() => openApplicants(job)}
                          aria-label="View applicants"
                          className="hover:text-primary"
                          title="View applicants"
                        >
                          <Users size={16} />
                        </button>
                        <button
                          onClick={() => handleDelete(job._id)}
                          aria-label="Delete posting"
                          className="hover:text-red-500"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>

        <div className="flex items-center justify-between px-5 py-3 bg-gray-50 border-t border-gray-100">
          <p className="text-sm text-gray-500">
            Showing {rangeStart}-{rangeEnd} of {totalCount} postings
          </p>
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="h-8 w-8 rounded-lg flex items-center justify-center text-gray-400 disabled:opacity-40"
            >
              ‹
            </button>
            {Array.from({ length: Math.min(totalPages, 3) }, (_, i) => i + 1).map((n) => (
              <button
                key={n}
                onClick={() => setPage(n)}
                className={`h-8 w-8 rounded-lg text-sm font-medium ${
                  page === n ? "bg-dark text-white" : "text-gray-600 hover:bg-gray-100"
                }`}
              >
                {n}
              </button>
            ))}
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="h-8 w-8 rounded-lg flex items-center justify-center text-gray-400 disabled:opacity-40"
            >
              ›
            </button>
          </div>
        </div>
      </div>

      {/* Bottom promo cards */}
      <div className="grid md:grid-cols-2 gap-5 mt-6">
        <div className="bg-blue-50 rounded-xl p-5 flex gap-3">
          <Lightbulb size={20} className="text-primary shrink-0 mt-0.5" />
          <div>
            <h3 className="font-semibold text-gray-900">Boost Your Visibility</h3>
            <p className="text-sm text-gray-600 mt-1">
              Job posts shared directly with your alumni network see 40% higher quality
              applications on average.
            </p>
            <button className="text-sm font-medium text-primary hover:underline mt-2">
              Learn how to boost →
            </button>
          </div>
        </div>

        <div className="bg-gray-100 rounded-xl p-5 flex gap-3">
          <Sparkles size={20} className="text-gray-700 shrink-0 mt-0.5" />
          <div>
            <h3 className="font-semibold text-gray-900">AI Job Description Tool</h3>
            <p className="text-sm text-gray-600 mt-1">
              Use our new AI assistant to draft a compelling job description based on your
              alumni requirements.
            </p>
            <button className="text-sm font-medium text-gray-700 hover:underline mt-2">
              Try AI Drafting →
            </button>
          </div>
        </div>
      </div>

      {/* Applicants modal — status dropdown moves someone through the pipeline */}
      {applicantsJob && (
        <div
          className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4"
          onClick={() => setApplicantsJob(null)}
        >
          <div
            className="bg-white rounded-2xl max-w-2xl w-full max-h-[85vh] flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <div>
                <h2 className="text-lg font-bold text-dark">Applicants</h2>
                <p className="text-sm text-gray-500">{applicantsJob.title}</p>
              </div>
              <button
                onClick={() => setApplicantsJob(null)}
                className="text-gray-400 hover:text-dark"
              >
                <X size={20} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto px-6 py-4">
              {loadingApplicants ? (
                <div className="flex items-center justify-center py-10 text-gray-400 gap-2">
                  <Loader2 size={18} className="animate-spin" /> Loading applicants...
                </div>
              ) : applicants.length === 0 ? (
                <p className="text-sm text-gray-400 text-center py-10">
                  No one has applied to this job yet.
                </p>
              ) : (
                <div className="flex flex-col gap-3">
                  {applicants.map((a) => (
                    <div
                      key={a.applicationId}
                      className="flex items-center gap-4 border border-gray-100 rounded-xl px-4 py-3"
                    >
                      <img
                        src={fileUrl(a.avatarUrl) || `https://i.pravatar.cc/150?u=${a.studentId}`}
                        alt={a.fullName}
                        className="h-11 w-11 rounded-full object-cover shrink-0"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-dark truncate">{a.fullName}</p>
                        <p className="text-xs text-gray-500 truncate flex items-center gap-1 mt-0.5">
                          <Mail size={11} /> {a.email}
                        </p>
                        <p className="text-xs text-gray-400 mt-0.5">
                          {[a.department, a.session].filter(Boolean).join(" • ")}
                          {a.department || a.session ? " • " : ""}
                          Applied {new Date(a.appliedAt).toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                          })}
                        </p>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <span
                          className={`text-xs font-medium rounded-full px-3 py-1.5 ${
                            APPLICANT_STATUS_STYLES[a.status] || "bg-gray-100 text-gray-500"
                          }`}
                        >
                          {APPLICANT_STATUS_LABELS[a.status] || a.status}
                        </span>
                        <select
                          value={a.status}
                          disabled={updatingId === a.applicationId}
                          onChange={(e) => handleStatusChange(a.applicationId, e.target.value)}
                          className="text-xs border border-gray-200 rounded-lg px-2 py-1.5 text-gray-600 disabled:opacity-50"
                        >
                          <option value="applied">Applied</option>
                          <option value="in_review">Move to Review</option>
                          <option value="interview">Schedule Interview</option>
                          <option value="accepted">Accept</option>
                          <option value="rejected">Reject</option>
                        </select>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}