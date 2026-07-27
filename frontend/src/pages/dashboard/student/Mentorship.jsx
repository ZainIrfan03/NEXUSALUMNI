import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { Compass, Clock3, GraduationCap, Loader2, MessageCircle } from "lucide-react";

/**
 * Mentorship Hub — file: src/pages/dashboard/student/Mentorship.jsx
 * Now connected to:
 *   GET  /api/mentorship/recommended
 *   GET  /api/mentorship/my-requests
 *   POST /api/mentorship/request
 */

// Files come back from the backend as relative paths (e.g. "/uploads/avatars/xyz.png"),
// so build a full URL for <img src>. Stale blob: URLs (from old preview-only
// code) can never load after a refresh, so they're treated as invalid.
const fileUrl = (path) => {
  if (!path) return "";
  if (path.startsWith("blob:")) return "";
  if (path.startsWith("http")) return path;
  return `http://localhost:5000${path}`;
};

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

const statusStyles = {
  pending: "bg-amber-100 text-amber-700",
  accepted: "bg-green-100 text-green-700",
  completed: "bg-blue-100 text-blue-700",
  declined: "bg-red-100 text-red-700",
};

const REQUEST_PAGE_SIZE = 4; // how many "Request Status" rows to reveal per "Load More" click

const getToken = () => JSON.parse(localStorage.getItem("user"))?.token;
const authHeader = () => ({ headers: { Authorization: `Bearer ${getToken()}` } });

export default function Mentorship() {
  const navigate = useNavigate();
  const [mentors, setMentors] = useState([]);
  const [requests, setRequests] = useState([]);
  const [loadingMentors, setLoadingMentors] = useState(true);
  const [loadingRequests, setLoadingRequests] = useState(true);
  const [error, setError] = useState("");
  const [sendingId, setSendingId] = useState(null); // tracks which card's button is mid-request
  const [visibleRequestCount, setVisibleRequestCount] = useState(REQUEST_PAGE_SIZE);

  // Load recommended mentors + my sent requests once on mount
  useEffect(() => {
    const fetchMentors = async () => {
      try {
        const { data } = await axios.get(
          "http://localhost:5000/api/mentorship/recommended",
          authHeader()
        );
        // Map backend Alumni shape -> what the cards below render
        // `img` resolves through fileUrl() so relative upload paths get the
        // correct host prefix; empty string means "no avatar" -> initials fallback.
        const mapped = data.map((a) => ({
          alumniUserId: a.user?._id,     // needed when sending a request (must be the User id)
          alumniDocId: a._id,
          name: a.user?.fullName || "Unknown",
          role: a.jobTitle || "Alumni",
          company: a.company || "",
          badges: a.graduationYear ? [`Alumni '${String(a.graduationYear).slice(-2)}`] : [],
          desc: "", // no bio field on Alumni yet — add one later if needed
          img: fileUrl(a.avatarUrl),
        }));
        setMentors(mapped);
      } catch (err) {
        setError(err.response?.data?.message || "Failed to load mentors");
      } finally {
        setLoadingMentors(false);
      }
    };

    const fetchRequests = async () => {
      try {
        const { data } = await axios.get(
          "http://localhost:5000/api/mentorship/my-requests",
          authHeader()
        );
        setRequests(data);
      } catch (err) {
        setError(err.response?.data?.message || "Failed to load requests");
      } finally {
        setLoadingRequests(false);
      }
    };

    fetchMentors();
    fetchRequests();
  }, []);

  const handleSendRequest = async (mentor) => {
    setSendingId(mentor.alumniUserId);
    try {
      const { data: newRequest } = await axios.post(
        "http://localhost:5000/api/mentorship/request",
        { alumniId: mentor.alumniDocId }, // backend does Alumni.findById(alumniId)
        authHeader()
      );
      // Prepend the new request so "Request Status" updates immediately
      setRequests((prev) => [
        { ...newRequest, alumni: { _id: mentor.alumniUserId, fullName: mentor.name } },
        ...prev,
      ]);
    } catch (err) {
      setError(err.response?.data?.message || "Could not send request");
    } finally {
      setSendingId(null);
    }
  };

  // Returns the status of this mentor's request ("pending" | "accepted" |
  // "completed" | "declined"), or undefined if no request has been sent yet.
  // r.alumni._id is included automatically by populate (even with a select
  // string), so this comparison works as long as ids are stringified on both sides.
  const getRequestStatus = (alumniUserId) =>
    requests.find((r) => r.alumni?._id?.toString() === alumniUserId?.toString())?.status;

  // Creates (or finds an existing) conversation with this mentor, then
  // jumps to the Messages page with that conversation pre-selected.
  const handleStartChat = async (mentor) => {
    try {
      const { data: conversation } = await axios.post(
        "http://localhost:5000/api/messages/conversations",
        { otherUserId: mentor.alumniUserId },
        authHeader()
      );
      navigate("/dashboard/student/messages", {
        state: { conversationId: conversation._id },
      });
    } catch (err) {
      setError(err.response?.data?.message || "Could not start chat");
    }
  };

  const visibleRequests = requests.slice(0, visibleRequestCount);
  const hasMoreRequests = visibleRequestCount < requests.length;

  return (
    <div>
      <p className="text-sm font-medium text-primary mb-1">Mentorship Hub</p>
      <h1 className="text-xl text-dark mb-8">
        Connect with world-class alumni and track your professional growth journey.
      </h1>

      {error && (
        <p className="text-sm text-red-500 bg-red-50 rounded-xl px-4 py-3 mb-5">{error}</p>
      )}

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Left: Recommended Mentors */}
        <div className="lg:col-span-2">
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-2">
              <Compass size={18} className="text-primary" />
              <h2 className="font-semibold text-dark">Recommended Mentors</h2>
            </div>
            <a href="#" className="text-sm font-medium text-primary">
              View All Leaders
            </a>
          </div>

          {loadingMentors ? (
            <div className="flex items-center justify-center py-16 text-gray-400 gap-2">
              <Loader2 size={18} className="animate-spin" /> Loading mentors...
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 gap-5">
              {mentors.map((m) => {
                const isSending = sendingId === m.alumniUserId;
                const status = getRequestStatus(m.alumniUserId);
                const canChat = status === "accepted" || status === "completed";
                // Only "pending" locks the button — a decline lets the student try again.
                const isLocked = isSending || status === "pending" || canChat;

                const buttonLabel = isSending
                  ? "Sending..."
                  : status === "accepted"
                  ? "Accepted"
                  : status === "completed"
                  ? "Completed"
                  : status === "pending"
                  ? "Request Sent"
                  : status === "declined"
                  ? "Send Request Again"
                  : "Send Request";

                return (
                  <div key={m.alumniDocId} className="bg-white rounded-2xl p-5 flex flex-col">
                    <div className="flex items-start gap-3 mb-3">
                      <MentorAvatar name={m.name} img={m.img} />
                      <div>
                        <p className="font-semibold text-dark">{m.name}</p>
                        <p className="text-sm text-primary font-medium">
                          {m.role} {m.company && <span className="text-gray-400">•</span>}{" "}
                          {m.company}
                        </p>
                      </div>
                    </div>

                    {m.badges.length > 0 && (
                      <div className="flex gap-2 mb-3">
                        {m.badges.map((b) => (
                          <span
                            key={b}
                            className="text-[11px] font-semibold text-primary bg-blue-50 rounded-md px-2 py-1"
                          >
                            {b.toUpperCase()}
                          </span>
                        ))}
                      </div>
                    )}

                    <div className="flex-1" />

                    <div className="flex items-center justify-end gap-2 border-t border-gray-100 pt-4">
                      {/* Chat is only possible once the alumni has accepted the request */}
                      {canChat && (
                        <button
                          onClick={() => handleStartChat(m)}
                          className="h-9 w-9 rounded-xl border border-gray-200 flex items-center justify-center text-gray-500 hover:border-primary hover:text-primary transition-colors shrink-0"
                          title="Message this mentor"
                        >
                          <MessageCircle size={16} />
                        </button>
                      )}
                      <button
                        onClick={() => handleSendRequest(m)}
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

        {/* Right: Request Status + Weekly Tip */}
        <div className="flex flex-col gap-6">
          <div className="bg-white rounded-2xl p-5">
            <div className="flex items-center gap-2 mb-4">
              <Clock3 size={16} className="text-gray-500" />
              <h2 className="font-semibold text-dark">Request Status</h2>
            </div>

            {loadingRequests ? (
              <div className="flex items-center justify-center py-8 text-gray-400 gap-2 text-sm">
                <Loader2 size={15} className="animate-spin" /> Loading...
              </div>
            ) : requests.length === 0 ? (
              <p className="text-sm text-gray-400 py-4">No requests sent yet.</p>
            ) : (
              <>
                {/* Scrollable list — caps at ~4 rows tall (each row ~68px),
                    so anything within the current "page" scrolls instead of
                    stretching the card. */}
                <div className="flex flex-col max-h-[280px] overflow-y-auto pr-1">
                  {visibleRequests.map((r, i) => (
                    <div
                      key={r._id}
                      className={`flex items-start gap-3 py-3 ${
                        i !== visibleRequests.length - 1 ? "border-b border-gray-100" : ""
                      }`}
                    >
                      <div className="h-9 w-9 rounded-lg bg-gray-100 text-dark text-xs font-semibold flex items-center justify-center shrink-0">
                        {r.alumni?.fullName?.split(" ").map((w) => w[0]).join("") || "?"}
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-dark">{r.alumni?.fullName}</p>
                        <p className="text-xs text-gray-400">
                          Sent: {new Date(r.createdAt).toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                          })}
                        </p>
                      </div>
                      <span
                        className={`text-[10px] font-semibold rounded-full px-2 py-1 whitespace-nowrap ${statusStyles[r.status]}`}
                      >
                        {r.status.toUpperCase()}
                      </span>
                    </div>
                  ))}
                </div>

                {hasMoreRequests && (
                  <button
                    onClick={() => setVisibleRequestCount((c) => c + REQUEST_PAGE_SIZE)}
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

      {/* Become a mentor CTA */}
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