import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  SlidersHorizontal,
  Bookmark,
  DollarSign,
  Briefcase,
  Send,
  Eye,
  MessageSquare,
  UploadCloud,
  HelpCircle,
  ChevronDown,
  Loader2,
} from "lucide-react";

/**
 * Jobs page — file: src/pages/dashboard/student/Jobs.jsx
 * Now connected to:
 *   GET  /api/jobs?type=
 *   GET  /api/jobs/my-applications
 *   POST /api/jobs/:id/apply
 *   POST /api/jobs/:id/save
 */

const tabs = ["All Jobs", "Full-time", "Internship", "Part-time", "Remote"];

const getToken = () => JSON.parse(localStorage.getItem("user"))?.token;
const authHeader = () => ({ headers: { Authorization: `Bearer ${getToken()}` } });
const currentUserId = () => JSON.parse(localStorage.getItem("user"))?._id;

export default function Jobs() {
  const [activeTab, setActiveTab] = useState("All Jobs");
  const [jobs, setJobs] = useState([]);
  const [tracking, setTracking] = useState({ applied: 0, in_review: 0, interview: 0 });
  const [loadingJobs, setLoadingJobs] = useState(true);
  const [error, setError] = useState("");
  const [busyJobId, setBusyJobId] = useState(null); // job currently applying/saving

  // Re-fetch jobs whenever the active tab changes
  useEffect(() => {
    const fetchJobs = async () => {
      setLoadingJobs(true);
      setError("");
      try {
        const { data } = await axios.get("http://localhost:5000/api/jobs", {
          params: { type: activeTab },
          ...authHeader(),
        });
        setJobs(data);
      } catch (err) {
        setError(err.response?.data?.message || "Failed to load jobs");
      } finally {
        setLoadingJobs(false);
      }
    };
    fetchJobs();
  }, [activeTab]);

  // Application Tracking counts — fetched once
  useEffect(() => {
    const fetchStats = async () => {
      try {
        const { data } = await axios.get(
          "http://localhost:5000/api/jobs/my-applications",
          authHeader()
        );
        setTracking(data);
      } catch (err) {
        // non-blocking — sidebar just shows 0s if this fails
      }
    };
    fetchStats();
  }, []);

  const handleApply = async (jobId) => {
    setBusyJobId(jobId);
    try {
      await axios.post(`http://localhost:5000/api/jobs/${jobId}/apply`, {}, authHeader());
      setTracking((prev) => ({ ...prev, applied: prev.applied + 1 }));
    } catch (err) {
      setError(err.response?.data?.message || "Could not apply");
    } finally {
      setBusyJobId(null);
    }
  };

  const handleToggleSave = async (jobId) => {
    setBusyJobId(jobId);
    try {
      const { data } = await axios.post(
        `http://localhost:5000/api/jobs/${jobId}/save`,
        {},
        authHeader()
      );
      // Update just that job's savedBy list locally so the bookmark icon flips instantly
      setJobs((prev) =>
        prev.map((j) =>
          j._id === jobId
            ? {
                ...j,
                savedBy: data.saved
                  ? [...j.savedBy, currentUserId()]
                  : j.savedBy.filter((id) => id !== currentUserId()),
              }
            : j
        )
      );
    } catch (err) {
      setError(err.response?.data?.message || "Could not save job");
    } finally {
      setBusyJobId(null);
    }
  };

  const trackingDisplay = [
    { label: "Applied", value: tracking.applied, icon: Send, accent: "border-l-white/40" },
    { label: "In Review", value: tracking.in_review, icon: Eye, accent: "border-l-amber-400" },
    { label: "Interviews", value: tracking.interview, icon: MessageSquare, accent: "border-l-green-400" },
  ];

  return (
    <div className="relative">
      <h1 className="text-2xl font-bold text-primary mb-1">Job Opportunities</h1>
      <p className="text-gray-500 mb-6">Find and apply for roles tailored for your career growth</p>

      {error && (
        <p className="text-sm text-red-500 bg-red-50 rounded-xl px-4 py-3 mb-5">{error}</p>
      )}

      <div className="grid lg:grid-cols-[1fr_320px] gap-6">
        {/* Main column */}
        <div>
          {/* Tabs */}
          <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
            <div className="flex flex-wrap gap-2">
              {tabs.map((t) => (
                <button
                  key={t}
                  onClick={() => setActiveTab(t)}
                  className={`text-sm font-medium px-4 py-2 rounded-full transition-colors ${
                    activeTab === t
                      ? "bg-dark text-white"
                      : "bg-gray-100 text-gray-500 hover:bg-gray-200"
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
            <button className="flex items-center gap-1.5 text-sm font-medium text-primary">
              <SlidersHorizontal size={14} /> Advanced Filters
            </button>
          </div>

          {/* Job cards */}
          {loadingJobs ? (
            <div className="flex items-center justify-center py-16 text-gray-400 gap-2">
              <Loader2 size={18} className="animate-spin" /> Loading jobs...
            </div>
          ) : jobs.length === 0 ? (
            <p className="text-sm text-gray-400 py-10 text-center">
              No jobs posted yet in this category.
            </p>
          ) : (
            <div className="grid sm:grid-cols-2 gap-5">
              {jobs.map((job) => {
                const isNew =
                  (Date.now() - new Date(job.createdAt).getTime()) / (1000 * 60 * 60 * 24) < 3;
                const isSaved = job.savedBy?.includes(currentUserId());
                const isBusy = busyJobId === job._id;

                return (
                  <div key={job._id} className="bg-white rounded-2xl p-6 flex flex-col">
                    <div className="flex items-start justify-between mb-4">
                      <div className="h-11 w-11 rounded-xl bg-blue-50 flex items-center justify-center">
                        <Briefcase size={18} className="text-primary" />
                      </div>
                      <div className="flex items-center gap-2">
                        {isNew && (
                          <span className="text-[10px] font-semibold rounded-full px-2.5 py-1 bg-gray-100 text-gray-500">
                            NEW
                          </span>
                        )}
                        <button onClick={() => handleToggleSave(job._id)} disabled={isBusy}>
                          <Bookmark
                            size={17}
                            className={isSaved ? "text-primary fill-primary" : "text-gray-300"}
                          />
                        </button>
                      </div>
                    </div>

                    <h3 className="font-bold text-dark text-lg leading-snug mb-1">{job.title}</h3>
                    <p className="text-sm text-gray-500 mb-5">
                      {job.company} <span className="mx-1">•</span> {job.location}
                    </p>

                    <div className="flex items-center gap-5 text-sm text-gray-500 mb-5 mt-auto">
                      {job.payRange && (
                        <span className="flex items-center gap-1.5">
                          <DollarSign size={14} /> {job.payRange}
                        </span>
                      )}
                      <span className="flex items-center gap-1.5">
                        <Briefcase size={14} /> {job.type}
                      </span>
                    </div>

                    <button
                      onClick={() => handleApply(job._id)}
                      disabled={isBusy}
                      className="w-full text-sm font-semibold py-2.5 rounded-xl transition-colors bg-dark text-white hover:opacity-90 disabled:opacity-50"
                    >
                      {isBusy ? "Please wait..." : "Apply Now"}
                    </button>
                  </div>
                );
              })}
            </div>
          )}

          <div className="flex justify-center mt-8">
            <button className="flex items-center gap-2 text-sm font-medium text-dark bg-white border border-gray-200 rounded-full px-5 py-2.5">
              Load More Listings <ChevronDown size={15} />
            </button>
          </div>
        </div>

        {/* Sidebar */}
        <div className="flex flex-col gap-6">
          <div className="bg-primary rounded-2xl p-5">
            <h2 className="text-white font-semibold text-lg mb-4">Application Tracking</h2>
            <div className="flex flex-col gap-2">
              {trackingDisplay.map(({ label, value, icon: Icon, accent }) => (
                <div
                  key={label}
                  className={`flex items-center justify-between bg-white/10 rounded-xl px-4 py-3 border-l-[3px] ${accent}`}
                >
                  <span className="flex items-center gap-2 text-sm text-white/90">
                    <Icon size={15} /> {label}
                  </span>
                  <span className="text-lg font-bold text-white">{value}</span>
                </div>
              ))}
            </div>
          </div>

          <button className="border-2 border-dashed border-gray-300 rounded-2xl p-6 flex flex-col items-center text-center hover:border-primary transition-colors">
            <UploadCloud size={22} className="text-gray-400 mb-2" />
            <p className="font-semibold text-dark text-sm">Update Your Resume</p>
            <p className="text-xs text-gray-500 mt-1">Enhance your matching accuracy</p>
          </button>
        </div>
      </div>

      {/* Floating help button */}
      <button className="fixed bottom-6 right-6 h-12 w-12 rounded-full bg-primary text-white flex items-center justify-center shadow-lg hover:opacity-90 transition-opacity">
        <HelpCircle size={20} />
      </button>
    </div>
  );
}