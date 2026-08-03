import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
const SOCKET_URL = import.meta.env.VITE_SOCKET_URL
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL

import axios from "axios";
import {
  Pencil,
  MapPin,
  Briefcase,
  GraduationCap,
  Plus,
  MessageSquare,
  Link2,
  Loader2,
  X,
  FileText,
} from "lucide-react";

const API_BASE = "http://localhost:5000/api";

// Files come back from the backend as relative paths (e.g. "/uploads/avatars/xyz.png"),
// so build a full URL for <img src> when it doesn't already start with "http".
const fileUrl = (path) => {
  if (!path) return "";
  if (path.startsWith("blob:")) return "";
  if (path.startsWith("http")) return path;
  return `http://localhost:5000${path}`;
};

/**
 * My Profile — read-only View Mode. File: src/pages/dashboard/student/MyProfile.jsx
 * "Edit Profile" sends the user to /dashboard/student/profile/edit.
 */
export default function MyProfile() {
  const navigate = useNavigate();
  const { token } = useSelector((state) => state.auth);
 

  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [showRoleForm, setShowRoleForm] = useState(false);
  const [roleForm, setRoleForm] = useState({
    title: "",
    company: "",
    startDate: "",
    endDate: "",
    current: false,
    description: "",
  });

  const [showEduForm, setShowEduForm] = useState(false);
  const [eduForm, setEduForm] = useState({
    school: "",
    degree: "",
    year: "",
  });

  const fetchProfile = async () => {
    setLoading(true);
    setError("");
    try {
      const { data } = await axios.get(`${API_BASE}/student/profile`);
      setProfile(data);
    } catch (err) {
      setError(err.response?.data?.message || "Could not load profile.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleAddRole = async (e) => {
    e.preventDefault();
    if (!roleForm.title || !roleForm.company) return;
    try {
      const { data } = await axios.post(
        `${API_BASE}/student/profile/experience`,
        roleForm,
      
      );
      setProfile(data);
      setRoleForm({ title: "", company: "", startDate: "", endDate: "", current: false, description: "" });
      setShowRoleForm(false);
    } catch (err) {
      setError(err.response?.data?.message || "Could not add role.");
    }
  };

  const handleAddEducation = async (e) => {
    e.preventDefault();
    if (!eduForm.school || !eduForm.degree) return;
    try {
      const { data } = await axios.post(
        `${API_BASE}/student/profile/education`,
        eduForm,
     
      );
      setProfile(data);
      setEduForm({ school: "", degree: "", year: "" });
      setShowEduForm(false);
    } catch (err) {
      setError(err.response?.data?.message || "Could not add education.");
    }
  };

  const handleDeleteEducation = async (educationId) => {
    try {
      const { data } = await axios.delete(
        `${API_BASE}/student/profile/education/${educationId}`,
        
      );
      setProfile(data);
    } catch (err) {
      setError(err.response?.data?.message || "Could not remove education.");
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

  if (error && !profile) {
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
    openToNetworking,
  } = profile || {};

  return (
    <div>
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-600 text-sm rounded-xl px-4 py-2.5 mb-5">
          {error}
        </div>
      )}

      {/* Header banner */}
      <div className="bg-white rounded-2xl overflow-hidden mb-6">
        <div className="h-32 bg-gradient-to-r from-primary to-dark" />
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
              <h1 className="text-2xl font-bold text-dark">{user?.fullName || "—"}</h1>
              {headline && <p className="text-primary font-medium mt-0.5">{headline}</p>}
              {location && (
                <p className="text-gray-500 text-sm flex items-center gap-1 mt-1">
                  <MapPin size={14} /> {location}
                </p>
              )}
            </div>
            <button
              onClick={() => navigate("/dashboard/student/profile/edit")}
              className="flex items-center gap-2 text-sm font-medium text-white bg-dark rounded-xl px-5 py-2.5 hover:opacity-90 transition-opacity"
            >
              <Pencil size={14} /> Edit Profile
            </button>
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Left column */}
        <div className="lg:col-span-2 flex flex-col gap-6">
          {/* Bio */}
          <div className="bg-white rounded-2xl p-6">
            <h2 className="text-lg font-semibold text-dark mb-3">Bio</h2>
            <p className="text-sm text-gray-600 leading-relaxed">
              {bio || "No bio added yet."}
            </p>
          </div>

          {/* Resume / CV */}
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

          {/* Experience */}
          <div className="bg-white rounded-2xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-dark">Experience</h2>
              <button
                onClick={() => setShowRoleForm(!showRoleForm)}
                className="flex items-center gap-1 text-sm font-medium text-primary"
              >
                <Plus size={14} /> Add Role
              </button>
            </div>

            {showRoleForm && (
              <form
                onSubmit={handleAddRole}
                className="border border-gray-200 rounded-xl p-4 mb-5 flex flex-col gap-3"
              >
                <div className="flex justify-between items-center">
                  <p className="text-sm font-medium text-dark">New Role</p>
                  <button type="button" onClick={() => setShowRoleForm(false)}>
                    <X size={14} className="text-gray-400" />
                  </button>
                </div>
                <div className="grid sm:grid-cols-2 gap-3">
                  <input
                    type="text"
                    placeholder="Job title"
                    value={roleForm.title}
                    onChange={(e) => setRoleForm({ ...roleForm, title: e.target.value })}
                    className="border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-primary"
                    required
                  />
                  <input
                    type="text"
                    placeholder="Company"
                    value={roleForm.company}
                    onChange={(e) => setRoleForm({ ...roleForm, company: e.target.value })}
                    className="border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-primary"
                    required
                  />
                  <input
                    type="text"
                    placeholder="Start (e.g. 2021)"
                    value={roleForm.startDate}
                    onChange={(e) => setRoleForm({ ...roleForm, startDate: e.target.value })}
                    className="border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-primary"
                  />
                  <input
                    type="text"
                    placeholder="End (leave blank if current)"
                    value={roleForm.endDate}
                    onChange={(e) => setRoleForm({ ...roleForm, endDate: e.target.value })}
                    disabled={roleForm.current}
                    className="border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-primary disabled:bg-gray-50"
                  />
                </div>
                <label className="flex items-center gap-2 text-sm text-gray-600">
                  <input
                    type="checkbox"
                    checked={roleForm.current}
                    onChange={(e) => setRoleForm({ ...roleForm, current: e.target.checked, endDate: "" })}
                  />
                  I currently work here
                </label>
                <textarea
                  placeholder="Description"
                  rows={2}
                  value={roleForm.description}
                  onChange={(e) => setRoleForm({ ...roleForm, description: e.target.value })}
                  className="border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-primary resize-none"
                />
                <button
                  type="submit"
                  className="self-start text-sm font-medium text-white bg-dark rounded-lg px-4 py-2"
                >
                  Save Role
                </button>
              </form>
            )}

            {experience.length === 0 && !showRoleForm && (
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
          {/* Skills */}
          <div className="bg-white rounded-2xl p-6">
            <h2 className="text-lg font-semibold text-dark mb-3">Skills</h2>
            <div className="flex flex-wrap gap-2 mb-4">
              {skills.length ? (
                skills.map((s) => (
                  <span
                    key={s}
                    className="text-xs font-medium text-dark bg-gray-100 rounded-full px-3 py-1.5"
                  >
                    {s}
                  </span>
                ))
              ) : (
                <p className="text-sm text-gray-400">No skills added yet.</p>
              )}
            </div>

            <h3 className="text-sm font-semibold text-dark mb-2">Interests</h3>
            <div className="flex flex-wrap gap-2">
              {interests.length ? (
                interests.map((s) => (
                  <span
                    key={s}
                    className="text-xs font-medium text-dark bg-gray-100 rounded-full px-3 py-1.5"
                  >
                    {s}
                  </span>
                ))
              ) : (
                <p className="text-sm text-gray-400">No interests added yet.</p>
              )}
            </div>
          </div>

          {/* Education */}
          <div className="bg-white rounded-2xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-dark">Education</h2>
              <button
                onClick={() => setShowEduForm(!showEduForm)}
                className="flex items-center gap-1 text-sm font-medium text-primary"
              >
                <Plus size={14} /> Add
              </button>
            </div>

            {showEduForm && (
              <form
                onSubmit={handleAddEducation}
                className="border border-gray-200 rounded-xl p-4 mb-5 flex flex-col gap-3"
              >
                <div className="flex justify-between items-center">
                  <p className="text-sm font-medium text-dark">New Education</p>
                  <button type="button" onClick={() => setShowEduForm(false)}>
                    <X size={14} className="text-gray-400" />
                  </button>
                </div>
                <input
                  type="text"
                  placeholder="School / University"
                  value={eduForm.school}
                  onChange={(e) => setEduForm({ ...eduForm, school: e.target.value })}
                  className="border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-primary"
                  required
                />
                <input
                  type="text"
                  placeholder="Degree"
                  value={eduForm.degree}
                  onChange={(e) => setEduForm({ ...eduForm, degree: e.target.value })}
                  className="border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-primary"
                  required
                />
                <input
                  type="text"
                  placeholder="Year (e.g. 2025)"
                  value={eduForm.year}
                  onChange={(e) => setEduForm({ ...eduForm, year: e.target.value })}
                  className="border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-primary"
                />
                <button
                  type="submit"
                  className="self-start text-sm font-medium text-white bg-dark rounded-lg px-4 py-2"
                >
                  Save Education
                </button>
              </form>
            )}

            {education.length === 0 && !showEduForm && (
              <p className="text-sm text-gray-400">No education added yet.</p>
            )}
            <div className="flex flex-col gap-4">
              {education.map((edu) => (
                <div key={edu._id} className="flex gap-3 group">
                  <div className="h-9 w-9 rounded-lg bg-gray-100 flex items-center justify-center shrink-0">
                    <GraduationCap size={16} className="text-gray-500" />
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold text-dark text-sm">{edu.school}</p>
                    <p className="text-sm text-gray-500">{edu.degree}</p>
                    {edu.year && <p className="text-xs text-gray-400">{edu.year}</p>}
                  </div>
                  <button
                    onClick={() => handleDeleteEducation(edu._id)}
                    className="opacity-0 group-hover:opacity-100 text-gray-300 hover:text-red-500 transition-opacity shrink-0 self-start"
                    title="Remove"
                  >
                    <X size={14} />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Networking */}
          {openToNetworking && (
            <div className="bg-dark rounded-2xl p-5 text-white">
              <p className="text-xs uppercase tracking-wide text-gray-300 mb-2">Networking</p>
              <p className="font-semibold mb-4">
                Open to mentorship and new collaboration opportunities.
              </p>
              <div className="flex gap-3">
                <button className="h-9 w-9 rounded-lg bg-white/10 flex items-center justify-center hover:bg-white/20 transition-colors">
                  <MessageSquare size={16} />
                </button>
                <button className="h-9 w-9 rounded-lg bg-white/10 flex items-center justify-center hover:bg-white/20 transition-colors">
                  <Link2 size={16} />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}