import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import axios from "axios";
const SOCKET_URL = import.meta.env.VITE_SOCKET_URL
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL

import {
  Users,
  Users2,
  ArrowRight,
  Clock,
  Bookmark,
  Briefcase,
  UserPlus,
  ChevronLeft,
  ChevronRight,
  Loader2,
} from "lucide-react";

const getToken = () => JSON.parse(localStorage.getItem("user"))?.token;


// Formats a date as "2h ago", "5d ago", etc. for the activity feed
const timeAgo = (dateString) => {
  const seconds = Math.floor((Date.now() - new Date(dateString)) / 1000);
  if (seconds < 60) return "just now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
};

// Icon shown per activity type, since the backend only sends type + text
const activityIcons = { connection: UserPlus, job: Briefcase };

export default function StudentDashboard() {
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);
  const firstName = user?.fullName?.split(" ")[0] || "there";

  // Time-based greeting: Good morning / afternoon / evening
  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening";

  const [statsData, setStatsData] = useState(null);
  const [loadingStats, setLoadingStats] = useState(true);
  const [mentors, setMentors] = useState([]);
  const [loadingMentors, setLoadingMentors] = useState(true);
  const [activity, setActivity] = useState([]);
  const [loadingActivity, setLoadingActivity] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const { data } = await axios.get(
          "API_BASE_URL/student/dashboard",
         
        );
        setStatsData(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoadingStats(false);
      }
    };

    const fetchMentors = async () => {
      try {
        const { data } = await axios.get(
          "API_BASE_URL/mentorship/recommended",
         
        );
        setMentors(
          data.slice(0, 2).map((a) => ({
            name: a.user?.fullName || "Unknown",
            role: [a.jobTitle, a.company].filter(Boolean).join(", "),
            tags: [], // Alumni model has no tags/skills field yet
            img: `https://i.pravatar.cc/150?u=${a._id}`,
          }))
        );
      } catch (err) {
        console.error(err);
      } finally {
        setLoadingMentors(false);
      }
    };

    const fetchActivity = async () => {
      try {
        const { data } = await axios.get(
          "API_BASE_URL/student/activity",
         
        );
        setActivity(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoadingActivity(false);
      }
    };

    fetchStats();
    fetchMentors();
    fetchActivity();
  }, []);

  const stats = [
    { label: "Total Alumni", value: statsData?.totalAlumni ?? "—", icon: Users },
    { label: "Pending Requests", value: statsData?.pendingRequests ?? "—", icon: Clock },
    { label: "Saved Jobs", value: statsData?.savedJobs ?? "—", icon: Bookmark },
  ];

  return (
    <div className="flex flex-col gap-6">
      {/* Welcome hero */}
      <div className="relative rounded-2xl overflow-hidden py-6">
        <div className="grid md:grid-cols-[1fr_auto] gap-8 items-center">
          <div>
            <span className="inline-flex items-center gap-2 text-xs font-semibold text-gray-600 bg-white border border-gray-200 rounded-full px-3 py-1.5 mb-5">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500" />
              </span>
              NETWORK LIVE
            </span>

            <h1 className="text-4xl font-extrabold text-dark mb-4">
              {greeting}, <span className="text-primary">{firstName}.</span>
            </h1>

            <p className="text-gray-500 max-w-lg mb-7 leading-relaxed">
              Your professional ecosystem is expanding. You have{" "}
              <span className="font-semibold text-dark">
                {loadingMentors ? "…" : mentors.length} new mentor matches
              </span>{" "}
              waiting for you this week.
            </p>

            <div className="flex gap-3">
              <button
                onClick={() => navigate("/dashboard/student/mentorship")}
                className="flex items-center gap-2 bg-dark text-white text-sm font-semibold px-5 py-2.5 rounded-xl hover:opacity-90 transition-opacity"
              >
                Get Started <ArrowRight size={16} />
              </button>
              <button
                onClick={() => navigate("/dashboard/student/jobs")}
                className="bg-white border border-gray-200 text-dark text-sm font-semibold px-5 py-2.5 rounded-xl hover:bg-gray-50 transition-colors"
              >
                View Jobs
              </button>
            </div>
          </div>

          {/* Decorative illustration */}
          <div className="hidden md:flex relative h-44 w-44 items-center justify-center shrink-0">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-100 to-white rounded-[2.5rem] blur-xl opacity-70" />
            <div className="relative h-32 w-32 bg-white rounded-[2rem] shadow-sm flex items-center justify-center">
              <Users2 size={40} className="text-gray-300" strokeWidth={1.5} />
            </div>
          </div>
        </div>
      </div>

      {/* Stat cards */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {stats.map(({ label, value, icon: Icon }) => (
          <div key={label} className="bg-white rounded-2xl p-5 flex items-center gap-4">
            <div className="h-11 w-11 rounded-xl bg-blue-50 flex items-center justify-center shrink-0">
              <Icon size={20} className="text-primary" />
            </div>
            <div>
              <p className="text-xs text-gray-500">{label}</p>
              <p className="text-2xl font-bold text-dark">
                {loadingStats ? <Loader2 size={18} className="animate-spin text-gray-300" /> : value}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Activity + Mentors */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Recent Activity */}
        <div className="lg:col-span-2 bg-white rounded-2xl p-6">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-lg font-semibold text-dark">Recent Activity</h2>
            <a href="#" className="text-sm font-medium text-primary">
              View All
            </a>
          </div>
          <div className="flex flex-col">
            {loadingActivity ? (
              <div className="flex items-center justify-center py-8 text-gray-400 gap-2">
                <Loader2 size={16} className="animate-spin" /> Loading...
              </div>
            ) : activity.length === 0 ? (
              <p className="text-sm text-gray-400 py-4">No recent activity yet.</p>
            ) : (
              activity.map((a, i) => {
                const Icon = activityIcons[a.type] || Briefcase;
                return (
                  <div
                    key={i}
                    className={`flex gap-4 py-4 ${
                      i !== activity.length - 1 ? "border-b border-gray-100" : ""
                    }`}
                  >
                    <div className="h-10 w-10 rounded-full bg-gray-100 flex items-center justify-center shrink-0">
                      <Icon size={17} className="text-gray-500" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-start justify-between gap-3">
                        <p className="text-sm font-medium text-dark leading-snug">{a.title}</p>
                        <span className="text-xs text-gray-400 whitespace-nowrap">
                          {timeAgo(a.date)}
                        </span>
                      </div>
                      <p className="text-sm text-gray-500 mt-1">{a.desc}</p>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Recommended Mentors */}
        <div className="bg-white rounded-2xl p-6">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-lg font-semibold text-dark leading-tight">
              Recommended Mentors
            </h2>
            <div className="flex gap-1">
              <button className="h-7 w-7 rounded-full border border-gray-200 flex items-center justify-center text-gray-400 hover:text-primary">
                <ChevronLeft size={14} />
              </button>
              <button className="h-7 w-7 rounded-full border border-gray-200 flex items-center justify-center text-gray-400 hover:text-primary">
                <ChevronRight size={14} />
              </button>
            </div>
          </div>

          <div className="flex flex-col gap-4">
            {loadingMentors ? (
              <div className="flex items-center justify-center py-8 text-gray-400 gap-2">
                <Loader2 size={16} className="animate-spin" /> Loading...
              </div>
            ) : mentors.length === 0 ? (
              <p className="text-sm text-gray-400 py-4">No recommendations yet.</p>
            ) : (
              mentors.map((m) => (
                <div key={m.name} className="border border-gray-100 rounded-xl p-4">
                  <div className="flex items-center gap-3 mb-3">
                    <img src={m.img} alt={m.name} className="h-11 w-11 rounded-full object-cover" />
                    <div>
                      <p className="text-sm font-semibold text-dark">{m.name}</p>
                      <p className="text-xs text-gray-500">{m.role}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => navigate("/dashboard/student/mentorship")}
                    className="w-full bg-primary text-white text-sm font-medium py-2 rounded-lg hover:opacity-90 transition-opacity"
                  >
                    Connect
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

    </div>
  );
}