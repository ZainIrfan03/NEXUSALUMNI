import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import {
  ArrowLeft,
  MapPin,
  Briefcase,
  GraduationCap,
  Loader2,
  FileText,
  Send,
} from "lucide-react";

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

/**
 * Student Profile View (read-only) — file: src/pages/dashboard/alumni/StudentProfileView.jsx
 * Opened from studentDirectory.jsx via "View Profile" -> /dashboard/alumni/directory/:id
 * :id is the Student document's own _id.
 */
export default function StudentProfileView() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [student, setStudent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [messaging, setMessaging] = useState(false);

  const authHeader = () => {
    const token = JSON.parse(localStorage.getItem("user"))?.token;
    return { headers: { Authorization: `Bearer ${token}` } };
  };

  useEffect(() => {
    const fetchStudent = async () => {
      setLoading(true);
      setError("");
      try {
        const { data } = await axios.get(`${API_BASE}/alumni/directory/${id}`, authHeader());
        setStudent(data);
      } catch (err) {
        setError(err.response?.data?.message || "Could not load this profile.");
      } finally {
        setLoading(false);
      }
    };
    fetchStudent();
  }, [id]);

  // Creates (or finds an existing) conversation with this student, then
  // navigates to the alumni Messages page with that conversation pre-selected.
  const handleMessage = async () => {
    const studentUserId = student?.user?._id;
    if (!studentUserId) return;
    setMessaging(true);
    try {
      const { data: conversation } = await axios.post(
        `${API_BASE}/messages/conversations`,
        { otherUserId: studentUserId },
        authHeader()
      );
      navigate("/dashboard/alumni/messages", {
        state: { conversationId: conversation._id },
      });
    } catch (err) {
      setError(err.response?.data?.message || "Could not start chat");
    } finally {
      setMessaging(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20 text-gray-400 gap-2">
        <Loader2 size={18} className="animate-spin" />
        Loading profile...
      </div>
    );
  }

  if (error && !student) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-600 text-sm rounded-xl px-4 py-2.5">
        {error}
      </div>
    );
  }

  const {
    user,
    location,
    headline,
    bio,
    skills = [],
    interests = [],
    avatarUrl,
    resumeUrl,
    experience = [],
    education = [],
    department,
    session,
    openToNetworking,
  } = student || {};

  const graduationYear = getGraduationYear(session);
  const degreeLabel = DEPARTMENT_LABELS[department] || department;

  return (
    <div>
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-1.5 text-sm font-medium text-gray-500 hover:text-dark mb-4"
      >
        <ArrowLeft size={15} /> Back to Directory
      </button>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-600 text-sm rounded-xl px-4 py-2.5 mb-5">
          {error}
        </div>
      )}

      {/* Header banner */}
      <div className="bg-white rounded-2xl overflow-hidden mb-6">
        <div className="h-28 bg-gradient-to-r from-primary to-dark" />
        <div className="px-6 pb-6">
          <div className="-mt-14 mb-4">
            {fileUrl(avatarUrl) ? (
              <img
                src={fileUrl(avatarUrl)}
                alt={user?.fullName}
                className="h-28 w-28 rounded-2xl object-cover border-4 border-white"
              />
            ) : (
              <div className="h-28 w-28 rounded-2xl bg-gray-100 border-4 border-white flex items-center justify-center text-gray-400 text-3xl font-semibold">
                {user?.fullName ? user.fullName.charAt(0).toUpperCase() : "?"}
              </div>
            )}
          </div>

          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-2xl font-bold text-dark">{user?.fullName || "—"}</h1>
                {graduationYear && (
                  <span className="text-xs font-medium text-primary bg-gray-100 rounded-full px-2.5 py-1">
                    Class of {graduationYear}
                  </span>
                )}
              </div>
              <p className="text-primary font-medium mt-0.5">
                {headline || degreeLabel}
              </p>
              {location && (
                <p className="text-gray-500 text-sm flex items-center gap-1 mt-1">
                  <MapPin size={14} /> {location}
                </p>
              )}
            </div>

            <button
              onClick={handleMessage}
              disabled={messaging}
              className="flex items-center gap-2 text-sm font-medium text-white bg-dark rounded-xl px-5 py-2.5 hover:opacity-90 transition-opacity disabled:opacity-50"
            >
              {messaging ? "Opening chat..." : (
                <>
                  <Send size={14} /> Message
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Left column */}
        <div className="lg:col-span-2 flex flex-col gap-6">
          <div className="bg-white rounded-2xl p-6">
            <h2 className="text-lg font-semibold text-dark mb-3">Bio</h2>
            <p className="text-sm text-gray-600 leading-relaxed">
              {bio || "No bio added yet."}
            </p>
          </div>

          <div className="bg-white rounded-2xl p-6">
            <h2 className="text-lg font-semibold text-dark mb-3">Resume / CV</h2>
            {fileUrl(resumeUrl) ? (
              <a
                href={fileUrl(resumeUrl)}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 text-sm font-medium text-primary bg-blue-50 rounded-xl px-4 py-2.5 hover:bg-blue-100 transition-colors"
              >
                <FileText size={16} />
                View Resume
              </a>
            ) : (
              <p className="text-sm text-gray-400">No resume uploaded yet.</p>
            )}
          </div>

          <div className="bg-white rounded-2xl p-6">
            <h2 className="text-lg font-semibold text-dark mb-4">Experience</h2>
            {experience.length === 0 && (
              <p className="text-sm text-gray-400">No experience added yet.</p>
            )}
            <div className="flex flex-col divide-y divide-gray-100">
              {experience.map((exp) => (
                <div key={exp._id} className="flex gap-3 py-4 first:pt-0 last:pb-0">
                  <div className="h-10 w-10 rounded-lg bg-gray-100 flex items-center justify-center shrink-0">
                    <Briefcase size={16} className="text-gray-500" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <p className="font-semibold text-dark text-sm">{exp.title}</p>
                        <p className="text-primary text-sm">{exp.company}</p>
                      </div>
                      {exp.current ? (
                        <span className="text-xs bg-gray-100 text-gray-600 rounded-full px-2.5 py-1 shrink-0">
                          Present
                        </span>
                      ) : (
                        (exp.startDate || exp.endDate) && (
                          <span className="text-xs text-gray-400 shrink-0">
                            {exp.startDate} — {exp.endDate}
                          </span>
                        )
                      )}
                    </div>
                    {exp.description && (
                      <p className="text-sm text-gray-500 mt-1">{exp.description}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right column */}
        <div className="flex flex-col gap-6">
          <div className="bg-white rounded-2xl p-6">
            <h2 className="text-lg font-semibold text-dark mb-3">Skills</h2>
            <div className="flex flex-wrap gap-2 mb-4">
              {skills.length ? (
                skills.map((s) => (
                  <span key={s} className="text-xs font-medium text-dark bg-gray-100 rounded-full px-3 py-1.5">
                    {s}
                  </span>
                ))
              ) : (
                <p className="text-sm text-gray-400">No skills added yet.</p>
              )}
            </div>

            <h3 className="text-sm font-semibold text-dark mb-2">Areas of Interest</h3>
            <div className="flex flex-wrap gap-2">
              {interests.length ? (
                interests.map((s) => (
                  <span key={s} className="text-xs font-medium text-dark bg-gray-100 rounded-full px-3 py-1.5">
                    {s}
                  </span>
                ))
              ) : (
                <p className="text-sm text-gray-400">No interests added yet.</p>
              )}
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6">
            <h2 className="text-lg font-semibold text-dark mb-4">Education</h2>
            {education.length === 0 && (
              <p className="text-sm text-gray-400">No education added yet.</p>
            )}
            <div className="flex flex-col gap-4">
              {education.map((edu) => (
                <div key={edu._id} className="flex gap-3">
                  <div className="h-9 w-9 rounded-lg bg-gray-100 flex items-center justify-center shrink-0">
                    <GraduationCap size={16} className="text-gray-500" />
                  </div>
                  <div>
                    <p className="font-semibold text-dark text-sm">{edu.school}</p>
                    <p className="text-sm text-gray-500">{edu.degree}</p>
                    {edu.year && <p className="text-xs text-gray-400">{edu.year}</p>}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {openToNetworking && (
            <div className="bg-dark rounded-2xl p-5 text-white">
              <p className="text-xs uppercase tracking-wide text-gray-300 mb-2">Networking</p>
              <p className="font-semibold">
                Open to mentorship and new collaboration opportunities.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}