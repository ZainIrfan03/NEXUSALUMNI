import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import axios from "axios";
import { GraduationCap, Briefcase, Plus, FileEdit, Image, Link2, Loader2 } from "lucide-react";

const API_BASE = "http://localhost:5000/api";

function StatCard({ label, value, note, icon: Icon }) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6 flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold tracking-wide text-gray-500 uppercase">
          {label}
        </span>
        <span className="w-8 h-8 rounded-full bg-blue-50 text-primary flex items-center justify-center">
          <Icon size={16} />
        </span>
      </div>
      <div className="flex items-baseline gap-2">
        <span className="text-3xl font-bold text-gray-900">{value}</span>
        {note && <span className="text-sm text-gray-400">{note}</span>}
      </div>
    </div>
  );
}

function MentorshipRequestCard({ request, onAccept, onDecline }) {
  const studentName = request.student?.fullName || "Unknown student";
  const initials = studentName
    .split(" ")
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <div className="flex items-center justify-between border border-gray-100 rounded-lg p-4">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center text-sm font-semibold text-gray-600">
          {initials}
        </div>
        <div>
          <p className="font-semibold text-gray-900">{studentName}</p>
          {request.message && (
            <p className="text-sm text-gray-500 line-clamp-1">{request.message}</p>
          )}
        </div>
      </div>
      <div className="flex gap-2">
        <button
          onClick={() => onDecline(request._id)}
          className="border border-gray-200 text-gray-700 text-sm font-medium px-5 py-2 rounded-lg hover:bg-gray-50"
        >
          Decline
        </button>
        <button
          onClick={() => onAccept(request._id)}
          className="bg-primary text-white text-sm font-medium px-5 py-2 rounded-lg hover:opacity-90"
        >
          Accept
        </button>
      </div>
    </div>
  );
}

export default function AlumniDashboard() {
  const { user, token } = useSelector((state) => state.auth);
  const authHeader = { headers: { Authorization: `Bearer ${token}` } };

  const [data, setData] = useState({ studentsMentored: 0, jobsPosted: 0, incomingRequests: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchOverview = async () => {
    setLoading(true);
    setError("");
    try {
      const { data } = await axios.get(`${API_BASE}/alumni/dashboard`, authHeader);
      setData(data);
    } catch (err) {
      setError(err.response?.data?.message || "Could not load dashboard data.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOverview();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleAccept = async (id) => {
    try {
      await axios.post(`${API_BASE}/alumni/mentorship/requests/${id}/accept`, {}, authHeader);
      fetchOverview();
    } catch (err) {
      setError(err.response?.data?.message || "Could not accept request.");
    }
  };

  const handleDecline = async (id) => {
    try {
      await axios.post(`${API_BASE}/alumni/mentorship/requests/${id}/reject`, {}, authHeader);
      fetchOverview();
    } catch (err) {
      setError(err.response?.data?.message || "Could not decline request.");
    }
  };

  const handlePostOpportunity = (e) => {
    e.preventDefault();
    // TODO: gather form state and call POST /api/jobs
  };

  const { studentsMentored, jobsPosted, incomingRequests } = data;

  return (
    <div className="p-8 max-w-6xl mx-auto flex flex-col gap-8">
      {/* Welcome header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">
          Welcome back, {user?.fullName || "there"}
        </h1>
        <p className="text-gray-500 mt-1">
          Here's what's happening in your network today.
        </p>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-600 text-sm rounded-xl px-4 py-2.5">
          {error}
        </div>
      )}

      {/* Top row: stats + mentorship requests */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="flex flex-col gap-6">
          <StatCard label="Students Mentored" value={studentsMentored} icon={GraduationCap} />
          <StatCard label="Jobs Posted" value={jobsPosted} note="Total listings" icon={Briefcase} />
        </div>

        <div className="lg:col-span-2 bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-gray-900">
              Incoming Mentorship Requests
            </h2>
            <button className="text-sm font-medium text-primary hover:underline">
              View All
            </button>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-10 text-gray-400 gap-2">
              <Loader2 size={16} className="animate-spin" />
              Loading...
            </div>
          ) : incomingRequests.length === 0 ? (
            <p className="text-sm text-gray-400 py-6">No pending mentorship requests.</p>
          ) : (
            <div className="flex flex-col gap-3">
              {incomingRequests.map((req) => (
                <MentorshipRequestCard
                  key={req._id}
                  request={req}
                  onAccept={handleAccept}
                  onDecline={handleDecline}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Bottom row: post opportunity + share success story */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Post Opportunity */}
        <form
          onSubmit={handlePostOpportunity}
          className="bg-white rounded-xl border border-gray-200 p-6 flex flex-col gap-4"
        >
          <div className="flex items-center gap-2">
            <span className="w-8 h-8 rounded-full bg-blue-50 text-primary flex items-center justify-center">
              <Plus size={16} />
            </span>
            <h2 className="text-lg font-bold text-gray-900">Post Opportunity</h2>
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700">
              Opportunity Type
            </label>
            <select className="mt-1 w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm">
              <option>Full-time</option>
              <option>Internship</option>
              <option>Part-time</option>
              <option>Remote</option>
            </select>
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700">Job Title</label>
            <input
              type="text"
              placeholder="e.g. Senior Data Analyst"
              className="mt-1 w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-gray-700">Location</label>
              <input
                type="text"
                placeholder="City or Remote"
                className="mt-1 w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700">Deadline</label>
              <input
                type="date"
                className="mt-1 w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm"
              />
            </div>
          </div>

          <button
            type="submit"
            className="bg-primary text-white font-medium py-2.5 rounded-lg hover:opacity-90"
          >
            Post Opportunity
          </button>
        </form>

        {/* Share Success Story */}
        <div className="bg-white rounded-xl border border-gray-200 p-6 flex flex-col gap-4">
          <div className="flex items-center gap-2">
            <span className="w-8 h-8 rounded-full bg-blue-50 text-primary flex items-center justify-center">
              <FileEdit size={16} />
            </span>
            <h2 className="text-lg font-bold text-gray-900">Share Success Story</h2>
          </div>

          <input
            type="text"
            placeholder="Story Title..."
            className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm"
          />

          <textarea
            placeholder="Share an inspiring update, promotion, or company milestone..."
            rows={5}
            className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm resize-none"
          />

          <div className="flex items-center justify-between">
            <div className="flex gap-3 text-gray-400">
              <button type="button" aria-label="Add image">
                <Image size={18} />
              </button>
              <button type="button" aria-label="Add link">
                <Link2 size={18} />
              </button>
            </div>
            <div className="flex gap-2">
              <button className="bg-gray-100 text-gray-700 text-sm font-medium px-4 py-2 rounded-lg hover:bg-gray-200">
                Save Draft
              </button>
              <button className="bg-primary text-white text-sm font-medium px-4 py-2 rounded-lg hover:opacity-90">
                Publish
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}