import React, { useState, useEffect } from "react";
import api from "../../../api/axios";
const SOCKET_URL = import.meta.env.VITE_SOCKET_URL

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
  X,
  MapPin,
  CalendarDays,
  CheckCircle2,
} from "lucide-react";

/**
 * Jobs page — file: src/pages/dashboard/student/Jobs.jsx
 * Now connected to:
 *   GET  /api/jobs?type=          (each job now also carries hasApplied)
 *   GET  /api/jobs/my-applications
 *   POST /api/jobs/:id/apply
 *   POST /api/jobs/:id/save
 *
 * "Apply Now" opens a job-details modal first; applying from there marks
 * the job "✓ Applied" everywhere without a page refresh. The application
 * then shows up on the alumni's side, where they can move it through
 * In Review / Interview / etc.
 */

const tabs = ["All Jobs", "Full-time", "Internship", "Part-time", "Remote"];

const currentUserId = () => JSON.parse(localStorage.getItem("user"))?._id;

export default function Jobs() {
  const [activeTab, setActiveTab] = useState("All Jobs");
  const [jobs, setJobs] = useState([]);
  const [tracking, setTracking] = useState({ applied: 0, in_review: 0, interview: 0 });
  const [loadingJobs, setLoadingJobs] = useState(true);
  const [error, setError] = useState("");
  const [busyJobId, setBusyJobId] = useState(null);
  const [selectedJob, setSelectedJob] = useState(null);

  useEffect(() => {
    const fetchJobs = async () => {
      setLoadingJobs(true);
      setError("");
      try {
        const { data } = await api.get(`/jobs`, {
          params: { type: activeTab },
        });
        setJobs(data);
      } catch (err) {
        setError(err.response?.data?.message || "Failed to load jobs");
      } finally {
        setLoadingJobs(false);
      }
    };
    fetchJobs();
    fetchStats();
  }, [activeTab]);

  const fetchStats = async () => {
    try {
      const { data } = await api.get(`/jobs/my-applications`);
      setTracking(data);
    } catch (err) {
      // non-blocking — sidebar just shows 0s if this fails
    }
  };

  const handleApply = async (jobId) => {
    setBusyJobId(jobId);
    try {
      await api.post(`/jobs/${jobId}/apply`, {});
      setJobs((prev) => prev.map((job) => (job._id === jobId ? { ...job, hasApplied: true } : job)));
      setSelectedJob((prev) => (prev && prev._id === jobId ? { ...prev, hasApplied: true } : prev));
      setTracking((prev) => ({ ...prev, applied: prev.applied + 1 }));
    } catch (err) {
      if (err.response?.status === 400) {
        setJobs((prev) => prev.map((job) => (job._id === jobId ? { ...job, hasApplied: true } : job)));
        setSelectedJob((prev) => (prev && prev._id === jobId ? { ...prev, hasApplied: true } : prev));
      } else {
        setError(err.response?.data?.message || "Could not apply");
      }
    } finally {
      setBusyJobId(null);
    }
  };

  const handleToggleSave = async (jobId) => {
    setBusyJobId(jobId);
    try {
      const { data } = await api.post(
        `/jobs/${jobId}/save`,
        {},
      );
      setJobs((prev) =>
        prev.map((job) =>
          job._id === jobId
            ? {
                ...job,
                savedBy: data.saved
                  ? [...job.savedBy, currentUserId()]
                  : job.savedBy.filter((id) => id !== currentUserId()),
              }
            : job
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
        <div>
          <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
            <div className="flex flex-wrap gap-2">
              {tabs.map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`text-sm font-medium px-4 py-2 rounded-full transition-colors ${
                    activeTab === tab
                      ? "bg-dark text-white"
                      : "bg-gray-100 text-gray-500 hover:bg-gray-200"
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>
            <button className="flex items-center gap-1.5 text-sm font-medium text-primary">
              <SlidersHorizontal size={14} /> Advanced Filters
            </button>
          </div>

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
                        {job.hasApplied && (
                          <span className="flex items-center gap-1 text-[10px] font-semibold rounded-full px-2.5 py-1 bg-green-50 text-green-600">
                            <CheckCircle2 size={11} /> APPLIED
                          </span>
                        )}
                        {!job.hasApplied && isNew && (
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

                    <button onClick={() => setSelectedJob(job)} className="text-left">
                      <h3 className="font-bold text-dark text-lg leading-snug mb-1 hover:text-primary transition-colors">
                        {job.title}
                      </h3>
                    </button>
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
                      onClick={() => setSelectedJob(job)}
                      disabled={isBusy}
                      className={`w-full text-sm font-semibold py-2.5 rounded-xl transition-colors disabled:opacity-50 ${
                        job.hasApplied
                          ? "bg-green-50 text-green-600 cursor-default"
                          : "bg-dark text-white hover:opacity-90"
                      }`}
                    >
                      {job.hasApplied ? "✓ Applied" : isBusy ? "Please wait..." : "Apply Now"}
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

      {selectedJob && (
        <div
          className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4"
          onClick={() => setSelectedJob(null)}
        >
          <div
            className="bg-white rounded-2xl max-w-lg w-full max-h-[85vh] overflow-y-auto"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="flex items-start justify-between px-6 pt-6">
              <div className="h-12 w-12 rounded-xl bg-blue-50 flex items-center justify-center">
                <Briefcase size={20} className="text-primary" />
              </div>
              <button onClick={() => setSelectedJob(null)} className="text-gray-400 hover:text-dark">
                <X size={20} />
              </button>
            </div>

            <div className="px-6 pt-4 pb-2">
              <h2 className="text-xl font-bold text-dark">{selectedJob.title}</h2>
              <p className="text-sm text-gray-500 mt-1">
                {selectedJob.company}
                {selectedJob.postedBy?.fullName ? ` • Posted by ${selectedJob.postedBy.fullName}` : ""}
              </p>

              <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500 mt-4">
                <span className="flex items-center gap-1.5">
                  <MapPin size={14} /> {selectedJob.location}
                </span>
                <span className="flex items-center gap-1.5">
                  <Briefcase size={14} /> {selectedJob.type}
                </span>
                {selectedJob.payRange && (
                  <span className="flex items-center gap-1.5">
                    <DollarSign size={14} /> {selectedJob.payRange}
                  </span>
                )}
                <span className="flex items-center gap-1.5">
                  <CalendarDays size={14} />
                  Posted {new Date(selectedJob.createdAt).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  })}
                </span>
              </div>

              {selectedJob.department && (
                <span className="inline-block mt-4 text-xs font-medium bg-gray-100 text-gray-600 rounded-full px-3 py-1">
                  {selectedJob.department}
                </span>
              )}

              <div className="mt-5">
                <h3 className="text-sm font-semibold text-dark mb-1.5">Job Description</h3>
                <p className="text-sm text-gray-600 leading-relaxed whitespace-pre-line">
                  {selectedJob.description || "No description was provided for this role."}
                </p>
              </div>
            </div>

            <div className="px-6 py-5 border-t border-gray-100 mt-2">
              <button
                onClick={() => handleApply(selectedJob._id)}
                disabled={selectedJob.hasApplied || busyJobId === selectedJob._id}
                className={`w-full text-sm font-semibold py-3 rounded-xl transition-colors disabled:opacity-60 ${
                  selectedJob.hasApplied
                    ? "bg-green-50 text-green-600 cursor-default"
                    : "bg-primary text-white hover:opacity-90"
                }`}
              >
                {selectedJob.hasApplied
                  ? "✓ You've applied to this role"
                  : busyJobId === selectedJob._id
                  ? "Submitting application..."
                  : "Apply Now"}
              </button>
              {selectedJob.hasApplied && (
                <p className="text-xs text-gray-400 text-center mt-2">
                  The alumni who posted this job will review your application and can move it to
                  interview from their side.
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      <button className="fixed bottom-6 right-6 h-12 w-12 rounded-full bg-primary text-white flex items-center justify-center shadow-lg hover:opacity-90 transition-opacity">
        <HelpCircle size={20} />
      </button>
    </div>
  );
}