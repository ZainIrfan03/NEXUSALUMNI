import { useState } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import { useGetStudentByIdQuery } from "../../../store/api/alumniDirectoryApi";
import { ROUTES } from "../../../consts/appConstants";
import { ACADEMIC_DEPARTMENT_LABELS } from "../../../consts/directoryConstants";
import { useStartConversationMutation } from "../../../store/api/messagesApi";
import { getImageUrl as fileUrl } from "../../../utils/getImageUrl";
import LoadingSpinner from "../../../components/common/LoadingSpinner";
import {
  ArrowLeft,
  MapPin,
  Briefcase,
  GraduationCap,
  FileText,
  Send,
} from "lucide-react";

const getGraduationYear = (session) => {
  if (!session) return null;
  const parts = session.split("-");
  return parts[parts.length - 1].trim();
};

export default function StudentProfileView() {
  const { id } = useParams();
  const navigate = useNavigate();

  const {
    data: student,
    isLoading: loading,
    error: queryError,
  } = useGetStudentByIdQuery(id);
  const [startConversation, { isLoading: messaging }] =
    useStartConversationMutation();
  const [actionError, setActionError] = useState("");

  const error = actionError || (queryError && "Could not load this profile.");

  const handleMessage = async () => {
    const studentUserId = student?.user?._id;
    if (!studentUserId) return;
    setActionError("");
    try {
      const conversation = await startConversation(studentUserId).unwrap();
      navigate(ROUTES.ALUMNI.MESSAGES, {
        state: { conversationId: conversation._id },
      });
    } catch (err) {
      setActionError(err.data?.message || "Could not start chat");
    }
  };

  if (loading) {
    return <LoadingSpinner label="Loading profile..." className="py-20" />;
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
    isMentee,
  } = student || {};

  const graduationYear = getGraduationYear(session);
  const degreeLabel = ACADEMIC_DEPARTMENT_LABELS[department] || department;

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
                <h1 className="text-2xl font-bold text-dark">
                  {user?.fullName || "—"}
                </h1>
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

            {isMentee && (
              <button
                onClick={handleMessage}
                disabled={messaging}
                className="flex items-center gap-2 text-sm font-medium text-white bg-dark rounded-xl px-5 py-2.5 hover:opacity-90 transition-opacity disabled:opacity-50"
              >
                {messaging ? (
                  "Opening chat..."
                ) : (
                  <>
                    <Send size={14} /> Message
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 flex flex-col gap-6">
          <div className="bg-white rounded-2xl p-6">
            <h2 className="text-lg font-semibold text-dark mb-3">Bio</h2>
            <p className="text-sm text-gray-600 leading-relaxed">
              {bio || "No bio added yet."}
            </p>
          </div>

          <div className="bg-white rounded-2xl p-6">
            <h2 className="text-lg font-semibold text-dark mb-3">
              Resume / CV
            </h2>
            {fileUrl(resumeUrl) ? (
              <Link
                to={fileUrl(resumeUrl)}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 text-sm font-medium text-primary bg-blue-50 rounded-xl px-4 py-2.5 hover:bg-blue-100 transition-colors"
              >
                <FileText size={16} />
                View Resume
              </Link>
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
                <div
                  key={exp._id}
                  className="flex gap-3 py-4 first:pt-0 last:pb-0"
                >
                  <div className="h-10 w-10 rounded-lg bg-gray-100 flex items-center justify-center shrink-0">
                    <Briefcase size={16} className="text-gray-500" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <p className="font-semibold text-dark text-sm">
                          {exp.title}
                        </p>
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
                      <p className="text-sm text-gray-500 mt-1">
                        {exp.description}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-6">
          <div className="bg-white rounded-2xl p-6">
            <h2 className="text-lg font-semibold text-dark mb-3">Skills</h2>
            <div className="flex flex-wrap gap-2 mb-4">
              {skills.length ? (
                skills.map((skill) => (
                  <span
                    key={skill}
                    className="text-xs font-medium text-dark bg-gray-100 rounded-full px-3 py-1.5"
                  >
                    {skill}
                  </span>
                ))
              ) : (
                <p className="text-sm text-gray-400">No skills added yet.</p>
              )}
            </div>

            <h3 className="text-sm font-semibold text-dark mb-2">
              Areas of Interest
            </h3>
            <div className="flex flex-wrap gap-2">
              {interests.length ? (
                interests.map((interest) => (
                  <span
                    key={interest}
                    className="text-xs font-medium text-dark bg-gray-100 rounded-full px-3 py-1.5"
                  >
                    {interest}
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
                    <p className="font-semibold text-dark text-sm">
                      {edu.school}
                    </p>
                    <p className="text-sm text-gray-500">{edu.degree}</p>
                    {edu.year && (
                      <p className="text-xs text-gray-400">{edu.year}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {openToNetworking && (
            <div className="bg-dark rounded-2xl p-5 text-white">
              <p className="text-xs uppercase tracking-wide text-gray-300 mb-2">
                Networking
              </p>
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
