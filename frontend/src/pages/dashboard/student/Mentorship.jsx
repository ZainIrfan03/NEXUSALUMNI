import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Compass, Clock3, GraduationCap, MessageCircle } from "lucide-react";
import LoadingSpinner from "../../../components/common/LoadingSpinner";
import EmptyState from "../../../components/common/EmptyState";
import StatusBadge from "../../../components/common/StatusBadge";
import {
  useGetRecommendedMentorsQuery,
  useGetMyRequestsQuery,
  useSendMentorshipRequestMutation,
} from "../../../store/api/studentMentorshipApi";
import { useStartConversationMutation } from "../../../store/api/messagesApi";
import {
  MENTORSHIP_STATUS,
  ROUTES,
  UI_LIMITS,
} from "../../../consts/appConstants";

function MentorAvatar({ name, img }) {
  return img ? (
    <img
      src={img}
      alt={name}
      className="h-12 w-12 rounded-full object-cover shrink-0"
    />
  ) : (
    <div className="h-12 w-12 rounded-full bg-gray-100 flex items-center justify-center text-gray-400 font-semibold shrink-0">
      {name ? name.charAt(0).toUpperCase() : "?"}
    </div>
  );
}

const statusTones = {
  [MENTORSHIP_STATUS.PENDING]: "warning",
  [MENTORSHIP_STATUS.ACCEPTED]: "success",
  [MENTORSHIP_STATUS.COMPLETED]: "info",
  [MENTORSHIP_STATUS.DECLINED]: "danger",
};

export default function Mentorship() {
  const navigate = useNavigate();
  const [actionError, setActionError] = useState("");
  const [sendingId, setSendingId] = useState(null);
  const [visibleRequestCount, setVisibleRequestCount] = useState(
    UI_LIMITS.MENTORSHIP_REQUEST_PAGE_SIZE,
  );

  const {
    data: mentors = [],
    isLoading: loadingMentors,
    error: mentorsError,
  } = useGetRecommendedMentorsQuery();

  const {
    data: requests = [],
    isLoading: loadingRequests,
    error: requestsError,
  } = useGetMyRequestsQuery();

  const [sendMentorshipRequest] = useSendMentorshipRequestMutation();
  const [startConversation] = useStartConversationMutation();

  const error =
    actionError ||
    mentorsError?.data?.message ||
    requestsError?.data?.message ||
    (mentorsError ? "Failed to load mentors" : "") ||
    (requestsError ? "Failed to load requests" : "");

  const handleSendRequest = async (mentor) => {
    setSendingId(mentor.alumniUserId);
    setActionError("");
    try {
      await sendMentorshipRequest({ alumniDocId: mentor.alumniDocId }).unwrap();
    } catch (err) {
      setActionError(err?.data?.message || "Could not send request");
    } finally {
      setSendingId(null);
    }
  };

  const getRequestStatus = (alumniUserId) =>
    requests.find(
      (request) => request.alumni?._id?.toString() === alumniUserId?.toString(),
    )?.status;

  const handleStartChat = async (mentor) => {
    setActionError("");
    try {
      const conversation = await startConversation(
        mentor.alumniUserId,
      ).unwrap();
      navigate(ROUTES.STUDENT.MESSAGES, {
        state: { conversationId: conversation._id },
      });
    } catch (err) {
      setActionError(err?.data?.message || "Could not start chat");
    }
  };

  const visibleRequests = requests.slice(0, visibleRequestCount);
  const hasMoreRequests = visibleRequestCount < requests.length;

  return (
    <div>
      <p className="text-sm font-medium text-primary mb-1">Mentorship Hub</p>
      <h1 className="text-xl text-dark mb-8">
        Connect with world-class alumni and track your professional growth
        journey.
      </h1>

      {error && (
        <p className="text-sm text-red-500 bg-red-50 rounded-xl px-4 py-3 mb-5">
          {error}
        </p>
      )}

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-2">
              <Compass size={18} className="text-primary" />
              <h2 className="font-semibold text-dark">Recommended Mentors</h2>
            </div>
            <Link to="#" className="text-sm font-medium text-primary">
              View All Leaders
            </Link>
          </div>

          {loadingMentors ? (
            <LoadingSpinner label="Loading mentors..." />
          ) : (
            <div className="grid sm:grid-cols-2 gap-5">
              {mentors.map((mentor) => {
                const isSending = sendingId === mentor.alumniUserId;
                const status = getRequestStatus(mentor.alumniUserId);
                const canChat =
                  status === MENTORSHIP_STATUS.ACCEPTED ||
                  status === MENTORSHIP_STATUS.COMPLETED;

                const isLocked =
                  isSending || status === MENTORSHIP_STATUS.PENDING || canChat;

                const buttonLabel = isSending
                  ? "Sending..."
                  : status === MENTORSHIP_STATUS.ACCEPTED
                    ? "Accepted"
                    : status === MENTORSHIP_STATUS.COMPLETED
                      ? "Completed"
                      : status === MENTORSHIP_STATUS.PENDING
                        ? "Request Sent"
                        : status === MENTORSHIP_STATUS.DECLINED
                          ? "Send Request Again"
                          : "Send Request";

                return (
                  <div
                    key={mentor.alumniDocId}
                    className="bg-white rounded-2xl p-5 flex flex-col"
                  >
                    <div className="flex items-start gap-3 mb-3">
                      <MentorAvatar name={mentor.name} img={mentor.img} />
                      <div>
                        <p className="font-semibold text-dark">{mentor.name}</p>
                        <p className="text-sm text-primary font-medium">
                          {mentor.role}{" "}
                          {mentor.company && (
                            <span className="text-gray-400">•</span>
                          )}{" "}
                          {mentor.company}
                        </p>
                      </div>
                    </div>

                    {mentor.badges.length > 0 && (
                      <div className="flex gap-2 mb-3">
                        {mentor.badges.map((badge) => (
                          <span
                            key={badge}
                            className="text-[11px] font-semibold text-primary bg-blue-50 rounded-md px-2 py-1"
                          >
                            {badge.toUpperCase()}
                          </span>
                        ))}
                      </div>
                    )}

                    <div className="flex-1" />

                    <div className="flex items-center justify-end gap-2 border-t border-gray-100 pt-4">
                      {canChat && (
                        <button
                          onClick={() => handleStartChat(mentor)}
                          className="h-9 w-9 rounded-xl border border-gray-200 flex items-center justify-center text-gray-500 hover:border-primary hover:text-primary transition-colors shrink-0"
                          title="Message this mentor"
                        >
                          <MessageCircle size={16} />
                        </button>
                      )}
                      <button
                        onClick={() => handleSendRequest(mentor)}
                        disabled={isLocked}
                        className={`text-sm font-medium px-4 py-2 rounded-xl transition-colors ${
                          isLocked
                            ? "bg-gray-100 text-gray-400"
                            : "bg-dark text-white hover:opacity-90"
                        }`}
                      >
                        {buttonLabel}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <div className="flex flex-col gap-6">
          <div className="bg-white rounded-2xl p-5">
            <div className="flex items-center gap-2 mb-4">
              <Clock3 size={16} className="text-gray-500" />
              <h2 className="font-semibold text-dark">Request Status</h2>
            </div>

            {loadingRequests ? (
              <LoadingSpinner
                label="Loading..."
                size={15}
                className="py-8 text-sm"
              />
            ) : requests.length === 0 ? (
              <EmptyState message="No requests sent yet." className="py-4" />
            ) : (
              <>
                <div className="flex flex-col max-h-[280px] overflow-y-auto pr-1">
                  {visibleRequests.map((request, index) => (
                    <div
                      key={request._id}
                      className={`flex items-start gap-3 py-3 ${
                        index !== visibleRequests.length - 1
                          ? "border-b border-gray-100"
                          : ""
                      }`}
                    >
                      <div className="h-9 w-9 rounded-lg bg-gray-100 text-dark text-xs font-semibold flex items-center justify-center shrink-0">
                        {request.alumni?.fullName
                          ?.split(" ")
                          .map((word) => word[0])
                          .join("") || "?"}
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-dark">
                          {request.alumni?.fullName}
                        </p>
                        <p className="text-xs text-gray-400">
                          Sent:{" "}
                          {new Date(request.createdAt).toLocaleDateString(
                            "en-US",
                            {
                              month: "short",
                              day: "numeric",
                              year: "numeric",
                            },
                          )}
                        </p>
                      </div>
                      <StatusBadge
                        label={request.status.toUpperCase()}
                        tone={statusTones[request.status] || "neutral"}
                        className="text-[10px] px-2 py-1 whitespace-nowrap"
                      />
                    </div>
                  ))}
                </div>

                {hasMoreRequests && (
                  <button
                    onClick={() =>
                      setVisibleRequestCount(
                        (currentCount) =>
                          currentCount + UI_LIMITS.MENTORSHIP_REQUEST_PAGE_SIZE,
                      )
                    }
                    className="w-full text-sm font-medium text-primary hover:underline pt-3 mt-1 border-t border-gray-100"
                  >
                    Load More
                  </button>
                )}
              </>
            )}
          </div>

          <div className="bg-primary rounded-2xl p-5 text-white">
            <p className="font-semibold mb-2">Weekly Tip</p>
            <p className="text-sm text-white/85 leading-relaxed">
              Personalize your requests with a specific question to increase
              acceptance rates by 40%.
            </p>
          </div>
        </div>
      </div>

      <div className="mt-8 bg-primary rounded-2xl p-10 flex flex-wrap items-center justify-between gap-8">
        <div className="max-w-md">
          <h2 className="text-2xl font-semibold text-white mb-3">
            Ready to become a mentor yourself?
          </h2>
          <p className="text-white/80 leading-relaxed mb-6">
            Share your knowledge with the next generation of students and grow
            your leadership skills within the Alumni Nexus community.
          </p>
          <div className="flex gap-3">
            <button className="bg-white text-primary text-sm font-semibold px-5 py-2.5 rounded-xl">
              Apply as Mentor
            </button>
            <button className="bg-white/10 border border-white/30 text-white text-sm font-semibold px-5 py-2.5 rounded-xl">
              Learn More
            </button>
          </div>
        </div>
        <div className="h-32 w-32 rounded-full bg-white/10 flex items-center justify-center shrink-0">
          <GraduationCap size={48} className="text-white" />
        </div>
      </div>
    </div>
  );
}
