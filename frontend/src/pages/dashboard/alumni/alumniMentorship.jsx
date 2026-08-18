import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  useGetMentorshipOverviewQuery,
  useAcceptMentorshipRequestMutation,
  useRejectMentorshipRequestMutation,
} from "../../../store/api/alumniMentorshipApi";
import { useStartConversationMutation } from "../../../store/api/messagesApi";
import { getImageUrl as fileUrl } from "../../../utils/getImageUrl";
import LoadingSpinner from "../../../components/common/LoadingSpinner";
import { ROUTES } from "../../../consts/appConstants";
import { ClipboardList, Users, Send } from "lucide-react";

// Files come back from the backend as relative paths (e.g. "/uploads/avatars/xyz.png"),
// so build a full URL for <img src>. Stale blob: URLs (from old preview-only
// code) can never load after a refresh, so they're treated as invalid.

function PersonAvatar({ name, img, className }) {
  return img ? (
    <img src={img} alt={name} className={className} />
  ) : (
    <div
      className={`${className} bg-gray-100 flex items-center justify-center text-gray-400 font-semibold`}
    >
      {name ? name.charAt(0).toUpperCase() : "?"}
    </div>
  );
}

const STATUS_STYLES = {
  "On Track": "bg-green-500",
  Idle: "bg-gray-400",
  "At Risk": "bg-red-500",
};

function RequestCard({ request, onAccept, onReject }) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5">
      <div className="flex items-start gap-4">
        <PersonAvatar
          name={request.name}
          img={fileUrl(request.avatarUrl)}
          className="h-16 w-16 rounded-lg object-cover shrink-0"
        />
        <div className="flex-1">
          <div className="flex items-start justify-between gap-2">
            <div>
              <h3 className="font-bold text-gray-900">{request.name}</h3>
              <p className="text-sm text-primary">
                {request.major} | Class of {request.classYear}
              </p>
            </div>
            {request.tag && (
              <span className="text-[11px] font-semibold text-gray-600 bg-gray-100 rounded-full px-3 py-1.5 uppercase tracking-wide shrink-0">
                {request.tag}
              </span>
            )}
          </div>
          <p className="text-sm text-gray-500 mt-2 line-clamp-2">{request.message}</p>
        </div>
      </div>

      <div className="flex gap-2 mt-4">
        <button
          onClick={() => onAccept(request._id)}
          className="bg-dark text-white text-sm font-medium px-5 py-2.5 rounded-lg hover:opacity-90"
        >
          Accept Request
        </button>
        <button
          onClick={() => onReject(request._id)}
          className="border border-gray-200 text-gray-700 text-sm font-medium px-5 py-2.5 rounded-lg hover:bg-gray-50"
        >
          Reject
        </button>
      </div>
    </div>
  );
}

export default function AlumniMentorship() {
  const navigate = useNavigate();

  const { data, isLoading: loading, error: queryError } = useGetMentorshipOverviewQuery();
  const [acceptMentorshipRequest] = useAcceptMentorshipRequestMutation();
  const [rejectMentorshipRequest] = useRejectMentorshipRequestMutation();
  const [startConversation] = useStartConversationMutation();

  const [actionError, setActionError] = useState("");
  const error = actionError || (queryError && "Could not load mentorship data.");

  const handleAccept = async (id) => {
    setActionError("");
    try {
      await acceptMentorshipRequest(id).unwrap();
    } catch (err) {
      setActionError(err.data?.message || "Could not accept request.");
    }
  };

  const handleReject = async (id) => {
    setActionError("");
    try {
      await rejectMentorshipRequest(id).unwrap();
    } catch (err) {
      setActionError(err.data?.message || "Could not reject request.");
    }
  };

  // Creates (or finds an existing) conversation with this mentee, then
  // navigates to the alumni Messages page with that conversation pre-selected
  // — same pattern used on the student side's Mentorship page.
  const handleMessage = async (menteeUserId) => {
    setActionError("");
    try {
      const conversation = await startConversation(menteeUserId).unwrap();
      navigate(ROUTES.ALUMNI.MESSAGES, {
        state: { conversationId: conversation._id },
      });
    } catch (err) {
      setActionError(err.data?.message || "Could not start chat");
    }
  };

  if (loading) {
    return (
      <LoadingSpinner label="Loading mentorship data..." className="py-20" />
    );
  }

  const { activeMenteesCount = 0, requests = [], mentees = [] } = data || {};

  return (
    <div>
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-600 text-sm rounded-xl px-4 py-2.5 mb-5">
          {error}
        </div>
      )}

      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Mentorship Management</h1>
          <p className="text-gray-500 mt-1 max-w-xl">
            Guide the next generation of industry leaders and manage your active student connections.
          </p>
        </div>
        <div className="bg-gray-100 rounded-xl px-5 py-3 flex items-center gap-3">
          <span className="h-9 w-9 rounded-lg bg-white flex items-center justify-center text-gray-700">
            <Users size={18} />
          </span>
          <div>
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
              Active Mentees
            </p>
            <p className="text-xl font-bold text-gray-900">{activeMenteesCount}</p>
          </div>
        </div>
      </div>

      {/* New Requests */}
      <div className="flex items-center gap-2 mb-4">
        <ClipboardList size={18} className="text-gray-700" />
        <h2 className="text-lg font-bold text-gray-900">New Requests</h2>
        {requests.length > 0 && (
          <span className="text-xs font-semibold text-white bg-red-500 rounded-full px-2.5 py-1">
            {requests.length} NEW
          </span>
        )}
      </div>

      {requests.length === 0 ? (
        <p className="text-sm text-gray-400 mb-8">No new mentorship requests right now.</p>
      ) : (
        <div className="grid md:grid-cols-2 gap-5 mb-10">
          {requests.map((req) => (
            <RequestCard key={req._id} request={req} onAccept={handleAccept} onReject={handleReject} />
          ))}
        </div>
      )}

      {/* Current Mentees */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Users size={18} className="text-gray-700" />
          <h2 className="text-lg font-bold text-gray-900">Current Mentees</h2>
        </div>
        <button className="text-sm font-medium text-primary hover:underline">
          View All History →
        </button>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <table className="w-full text-left">
          <thead>
            <tr className="bg-gray-50 text-xs font-semibold text-gray-500 uppercase tracking-wide">
              <th className="px-5 py-3">Student</th>
              <th className="px-5 py-3">Department</th>
              <th className="px-5 py-3">Status</th>
              <th className="px-5 py-3">Last Interaction</th>
              <th className="px-5 py-3 text-right">Action</th>
            </tr>
          </thead>
          <tbody>
            {mentees.length === 0 && (
              <tr>
                <td colSpan={5} className="px-5 py-8 text-center text-sm text-gray-400">
                  No mentees yet.
                </td>
              </tr>
            )}
            {mentees.map((mentee) => (
              <tr key={mentee._id} className="border-t border-gray-100">
                <td className="px-5 py-4">
                  <div className="flex items-center gap-3">
                    <PersonAvatar
                      name={mentee.name}
                      img={fileUrl(mentee.avatarUrl)}
                      className="h-10 w-10 rounded-full object-cover shrink-0"
                    />
                    <div>
                      <p className="font-semibold text-gray-900 text-sm">{mentee.name}</p>
                      <p className="text-xs text-gray-500">{mentee.yearLabel}</p>
                    </div>
                  </div>
                </td>
                <td className="px-5 py-4 text-sm text-gray-700">{mentee.department}</td>
                <td className="px-5 py-4">
                  <span className="flex items-center gap-2 text-sm text-gray-700">
                    <span
                      className={`h-2 w-2 rounded-full ${STATUS_STYLES[mentee.status] || "bg-gray-400"}`}
                    />
                    {mentee.status}
                  </span>
                </td>
                <td className="px-5 py-4 text-sm text-gray-500">{mentee.lastInteraction}</td>
                <td className="px-5 py-4 text-right">
                  <button
                    onClick={() => handleMessage(mentee.studentUserId)}
                    className="inline-flex items-center gap-1.5 bg-dark text-white text-sm font-medium px-4 py-2 rounded-lg hover:opacity-90"
                  >
                    <Send size={14} /> Message
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
