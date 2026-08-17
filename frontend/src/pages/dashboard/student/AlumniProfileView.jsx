import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useGetAlumniByIdQuery } from "../../../store/api/studentDirectoryApi";
import {
  useGetMyRequestsQuery,
  useSendMentorshipRequestMutation,
} from "../../../store/api/studentMentorshipApi";
import { getImageUrl as fileUrl } from "../../../utils/getImageUrl";
import { MENTORSHIP_STATUS } from "../../../consts/appConstants";
import LoadingSpinner from "../../../components/common/LoadingSpinner";
import { ArrowLeft, MapPin, Briefcase, GraduationCap, Send } from "lucide-react";

// Files come back from the backend as relative paths (e.g. "/uploads/avatars/xyz.png"),
// so build a full URL for <img src>. Stale blob: URLs (from old preview-only

/**
 * Alumni Profile View (read-only) — file: src/pages/dashboard/student/AlumniProfileView.jsx
 * Opened from Directory.jsx via "View Profile" -> /dashboard/student/directory/:id
 * :id is the Alumni document's own _id.
 */
export default function AlumniProfileView() {
  const { id } = useParams();
  const navigate = useNavigate();

  const { data: alumni, isLoading: loading, error: profileQueryError } = useGetAlumniByIdQuery(id);

  // Once the alumni's User id is known, check whether a mentorship request
  // already exists (any status) so the button can be hidden entirely.
  // Reuses the same cached query the student Mentorship page uses.
  const alumniUserId = alumni?.user?._id;
  const {
    data: myRequests,
    isLoading: checkingRequest,
  } = useGetMyRequestsQuery(undefined, { skip: !alumniUserId });

  const existingRequest = myRequests?.find(
    (request) => request.alumni?._id?.toString() === alumniUserId?.toString()
  );
  const requestStatus = existingRequest?.status || null; // null | "pending" | "accepted" | "completed" | "declined"

  const [sendMentorshipRequest, { isLoading: requesting }] = useSendMentorshipRequestMutation();
  const [actionError, setActionError] = useState("");

  const error = actionError || (profileQueryError && "Could not load this profile.");

  const handleRequestMentorship = async () => {
    setActionError("");
    try {
      await sendMentorshipRequest({ alumniDocId: alumni._id }).unwrap();
    } catch (err) {
      setActionError(err.data?.message || "Could not send mentorship request.");
    }
  };

  if (loading) {
    return (
      <LoadingSpinner label="Loading profile..." className="py-20" />
    );
  }

  if (error && !alumni) {
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
    experience = [],
    education = [],
    graduationYear,
    company,
    jobTitle,
    openToMentorship,
  } = alumni || {};

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
                {headline || [jobTitle, company].filter(Boolean).join(" at ")}
              </p>
              {location && (
                <p className="text-gray-500 text-sm flex items-center gap-1 mt-1">
                  <MapPin size={14} /> {location}
                </p>
              )}
            </div>

            {openToMentorship && !checkingRequest && requestStatus !== MENTORSHIP_STATUS.ACCEPTED && (
              <button
                onClick={handleRequestMentorship}
                disabled={requesting || requestStatus === MENTORSHIP_STATUS.PENDING || requestStatus === MENTORSHIP_STATUS.COMPLETED}
                className="flex items-center gap-2 text-sm font-medium text-white bg-dark rounded-xl px-5 py-2.5 hover:opacity-90 transition-opacity disabled:opacity-50"
              >
                {requesting ? (
                  "Sending..."
                ) : requestStatus === MENTORSHIP_STATUS.PENDING ? (
                  "Request Sent"
                ) : requestStatus === MENTORSHIP_STATUS.COMPLETED ? (
                  "Completed"
                ) : requestStatus === MENTORSHIP_STATUS.DECLINED ? (
                  <>
                    <Send size={14} /> Send Request Again
                  </>
                ) : (
                  <>
                    <Send size={14} /> Request Mentorship
                  </>
                )}
              </button>
            )}
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
                skills.map((skill) => (
                  <span key={skill} className="text-xs font-medium text-dark bg-gray-100 rounded-full px-3 py-1.5">
                    {skill}
                  </span>
                ))
              ) : (
                <p className="text-sm text-gray-400">No skills added yet.</p>
              )}
            </div>

            <h3 className="text-sm font-semibold text-dark mb-2">Willing to mentor in</h3>
            <div className="flex flex-wrap gap-2">
              {interests.length ? (
                interests.map((interest) => (
                  <span key={interest} className="text-xs font-medium text-dark bg-gray-100 rounded-full px-3 py-1.5">
                    {interest}
                  </span>
                ))
              ) : (
                <p className="text-sm text-gray-400">No mentorship areas added yet.</p>
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
        </div>
      </div>
    </div>
  );
}
