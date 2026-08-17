import { useState, useEffect, useRef } from "react";
import { Outlet, NavLink, useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import api from "../api/axios";
import { getImageUrl as fileUrl } from "../utils/getImageUrl";
import { APPLICATION_STATUS, ROLES, ROUTES, SOCKET_EVENTS, TAGS } from "../consts/appConstants";
import { baseApi } from "../store/api/baseApi";
import { useGetUnreadMessageCountQuery } from "../store/api/messagesApi";
import { useGetMyProfileQuery } from "../store/api/studentProfileApi";
import { useGetMyAlumniProfileQuery } from "../store/api/alumniProfileApi";
import { useGetMyApplicationsQuery } from "../store/api/studentJobsApi";
import UserAvatar from "../components/common/UserAvatar";


import {
  LayoutDashboard,
  User,
  Users,
  Compass,
  Briefcase,
  CalendarDays,
  Mail,
  Bell,
  Megaphone,
  BarChart3,
  Settings,
  LogOut,
  Search,
  Menu,
  X,
} from "lucide-react";
import { logout } from "../store/slice/authSlice";
import { connectSocket, disconnectSocket } from "../utils/socket";

/**
 * DashboardLayout — dark sidebar + light topbar (search, notifications, avatar).
 * Wraps every logged-in page. Sidebar links differ per role.
 */

const linksByRole = {
  [ROLES.STUDENT]: [
    { label: "Dashboard", icon: LayoutDashboard, path: ROUTES.STUDENT.DASHBOARD },
    { label: "Profile", icon: User, path: ROUTES.STUDENT.PROFILE },
    { label: "Directory", icon: Users, path: ROUTES.STUDENT.DIRECTORY },
    { label: "Mentorship", icon: Compass, path: ROUTES.STUDENT.MENTORSHIP },
    { label: "Jobs", icon: Briefcase, path: ROUTES.STUDENT.JOBS },
    { label: "Messages", icon: Mail, path: ROUTES.STUDENT.MESSAGES },
  ],
  [ROLES.ALUMNI]: [
    { label: "Dashboard", icon: LayoutDashboard, path: ROUTES.ALUMNI.DASHBOARD },
    { label: "Profile", icon: User, path: ROUTES.ALUMNI.PROFILE },
    { label: "Directory", icon: Users, path: ROUTES.ALUMNI.DIRECTORY },
    { label: "Mentorship", icon: Compass, path: ROUTES.ALUMNI.MENTORSHIP },
    { label: "Post a Job", icon: Briefcase, path: ROUTES.ALUMNI.JOBS },
    { label: "Messages", icon: Mail, path: ROUTES.ALUMNI.MESSAGES },
  ],
  [ROLES.FACULTY]: [
    { label: "Dashboard", icon: LayoutDashboard, path: ROUTES.FACULTY.DASHBOARD },
    { label: "Engagement", icon: BarChart3, path: ROUTES.FACULTY.ENGAGEMENT },
    { label: "Events", icon: CalendarDays, path: ROUTES.FACULTY.EVENTS },
    { label: "Announcements", icon: Megaphone, path: ROUTES.FACULTY.ANNOUNCEMENTS },
  ],
  [ROLES.ADMIN]: [
    { label: "Dashboard", icon: LayoutDashboard, path: ROUTES.ADMIN.DASHBOARD },
    { label: "Users", icon: Users, path: ROUTES.ADMIN.USERS },
    { label: "Jobs", icon: Briefcase, path: ROUTES.ADMIN.JOBS },
    { label: "Events", icon: CalendarDays, path: ROUTES.ADMIN.EVENTS },
    { label: "Reports", icon: BarChart3, path: ROUTES.ADMIN.REPORTS },
  ],
};

// Roles that currently have a working Settings page.
// Add ROLES.ALUMNI here once /dashboard/alumni/settings actually exists.
const rolesWithSettings = [ROLES.ADMIN];

export default function DashboardLayout() {
  const { user } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [interviewNotice, setInterviewNotice] = useState(null);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const menuRef = useRef(null);
  const notificationsRef = useRef(null);

  const links = linksByRole[user?.role] || [];
  const showSettings = rolesWithSettings.includes(user?.role);
  const supportsMessages = [ROLES.STUDENT, ROLES.ALUMNI].includes(user?.role);
  const { data: unreadData, refetch: refetchUnreadMessages } = useGetUnreadMessageCountQuery(
    undefined,
    { skip: !supportsMessages }
  );
  const unreadMessageCount = unreadData?.count || 0;
  const { data: applicationsData } = useGetMyApplicationsQuery(undefined, {
    skip: user?.role !== ROLES.STUDENT,
  });
  const interviewNotifications = (applicationsData?.applications || [])
    .filter(
      (application) =>
        application.interview && application.status === APPLICATION_STATUS.INTERVIEW
    )
    .slice(0, 3);
  const pendingInterviewCount = interviewNotifications.filter(
    (application) => application.interview.response === "pending"
  ).length;
  const liveNoticeAlreadyLoaded = interviewNotifications.some(
    (application) => String(application._id) === String(interviewNotice?.applicationId)
  );
  const notificationCount =
    unreadMessageCount + pendingInterviewCount + (interviewNotice && !liveNoticeAlreadyLoaded ? 1 : 0);
  const { data: studentProfile } = useGetMyProfileQuery(undefined, {
    skip: user?.role !== ROLES.STUDENT,
  });
  const { data: alumniProfile } = useGetMyAlumniProfileQuery(undefined, {
    skip: user?.role !== ROLES.ALUMNI,
  });
  const activeProfile = user?.role === ROLES.STUDENT ? studentProfile : alumniProfile;
  const displayName = activeProfile?.user?.fullName || user?.fullName;
  const avatarUrl = activeProfile?.avatarUrl || "";

  useEffect(() => {
    if (!supportsMessages) return undefined;

    const socket = connectSocket();
    const handleIncomingMessage = () => refetchUnreadMessages();
    const handleInterviewScheduled = (payload) => {
      if (user?.role !== ROLES.STUDENT) return;
      setInterviewNotice(payload);
      dispatch(baseApi.util.invalidateTags([TAGS.MY_APPLICATIONS]));
    };
    socket.on(SOCKET_EVENTS.RECEIVE_MESSAGE, handleIncomingMessage);
    socket.on(SOCKET_EVENTS.INTERVIEW_SCHEDULED, handleInterviewScheduled);

    return () => {
      socket.off(SOCKET_EVENTS.RECEIVE_MESSAGE, handleIncomingMessage);
      socket.off(SOCKET_EVENTS.INTERVIEW_SCHEDULED, handleInterviewScheduled);
    };
  }, [supportsMessages, refetchUnreadMessages, dispatch, user?.role]);

  // Pull the real avatar from the role's profile endpoint (User model doesn't
  // store avatarUrl — it lives on Student/Alumni). Falls back to initials
  // if the role has no profile endpoint yet or the request fails.
        // Silent fail is fine here — initials avatar covers it
  const handleLogout = () => {
    // Best-effort: clears the httpOnly cookie server-side. Local logout still
    // proceeds even if this fails (e.g. network hiccup) — the user shouldn't
    // get stuck unable to log out.
    api.post(`/auth/logout`).catch(() => {});
    disconnectSocket();
    dispatch(logout());
    navigate(ROUTES.LOGIN);
  };

  const handleViewProfile = () => {
    setMenuOpen(false);
    navigate(user?.role === ROLES.STUDENT ? ROUTES.STUDENT.PROFILE : ROUTES.ALUMNI.PROFILE);
  };

  const openInterviewNotifications = () => {
    setNotificationsOpen(false);
    setInterviewNotice(null);
    navigate(ROUTES.STUDENT.JOBS, { state: { jobsView: "applications" } });
  };

  const openMessageNotifications = () => {
    setNotificationsOpen(false);
    navigate(user.role === ROLES.STUDENT ? ROUTES.STUDENT.MESSAGES : ROUTES.ALUMNI.MESSAGES);
  };

  // Close the account dropdown when clicking anywhere outside it
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setMenuOpen(false);
      }
      if (notificationsRef.current && !notificationsRef.current.contains(event.target)) {
        setNotificationsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const linkClass = ({ isActive }) =>
    `flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-colors ${
      isActive ? "bg-white/10 text-white" : "text-gray-400 hover:bg-white/5 hover:text-white"
    }`;

  const renderSidebarContent = () => (
    <>
      <div className="px-4 mb-8">
        <span className="text-lg font-bold text-white">Alumni Nexus</span>
        <p className="text-[13px] text-gray-500 mt-1">Professional Portal</p>
      </div>

      <nav className="flex flex-col gap-1 flex-1">
        {links.map(({ label, icon: Icon, path }) => (
          <NavLink
            key={path}
            to={path}
            end
            className={linkClass}
            onClick={() => setSidebarOpen(false)}
          >
            <Icon size={18} />
            {label}
          </NavLink>
        ))}
      </nav>

      <div className="flex flex-col gap-1 pt-4 border-t border-white/10">
        {showSettings && (
          <button className="flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium text-gray-400 hover:bg-white/5 hover:text-white transition-colors">
            <Settings size={18} />
            Settings
          </button>
        )}
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium text-red-400 hover:bg-red-500/10 transition-colors"
        >
          <LogOut size={18} />
          Logout
        </button>
      </div>
    </>
  );

  return (
    <div className="flex min-h-screen bg-background">
      {/* Desktop sidebar */}
      <aside className="hidden md:flex md:flex-col md:sticky md:top-0 md:h-screen md:overflow-y-auto w-64 bg-dark p-5">
        {renderSidebarContent()}
      </aside>

      {/* Mobile sidebar (slide-over) */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div className="absolute inset-0 bg-black/40" onClick={() => setSidebarOpen(false)} />
          <aside className="absolute left-0 top-0 h-full w-64 bg-dark p-5 flex flex-col">
            <button className="self-end mb-4 text-white" onClick={() => setSidebarOpen(false)}>
              <X size={20} />
            </button>
            {renderSidebarContent()}
          </aside>
        </div>
      )}



      {/* Main content */}
      <div className="flex-1 flex flex-col">
        {/* Topbar */}
        <header className="flex items-center gap-4 bg-white border-b border-gray-100 px-6 py-4">
          <button className="md:hidden" onClick={() => setSidebarOpen(true)}>
            <Menu className="text-dark" />
          </button>

          <div className="flex-1 hidden sm:flex items-center gap-2 bg-gray-100 rounded-xl px-4 py-2.5 max-w-md">
            <Search size={16} className="text-gray-400 shrink-0" />
            <input
              type="text"
              placeholder="Search for alumni, mentors, or jobs..."
              className="w-full bg-transparent text-sm outline-none placeholder:text-gray-400"
            />
          </div>

          <div className="flex items-center gap-5 ml-auto">
            <div className="relative" ref={notificationsRef}>
              <button
                type="button"
                onClick={() => setNotificationsOpen((open) => !open)}
                className="relative text-gray-500 hover:text-dark transition-colors"
                aria-label={notificationCount ? `${notificationCount} notification(s)` : "No notifications"}
                aria-expanded={notificationsOpen}
              >
                <Bell size={20} />
                {notificationCount > 0 && (
                  <span className="absolute -top-2 -right-2 min-w-4 h-4 px-1 rounded-full bg-red-500 text-white text-[10px] font-bold flex items-center justify-center">
                    {notificationCount > 99 ? "99+" : notificationCount}
                  </span>
                )}
              </button>

              {notificationsOpen && (
                <div className="absolute right-0 top-full mt-3 w-80 max-w-[calc(100vw-2rem)] overflow-hidden rounded-xl border border-gray-100 bg-white shadow-xl z-50">
                  <div className="flex items-center justify-between border-b border-gray-100 px-4 py-3">
                    <h2 className="text-sm font-semibold text-dark">Notifications</h2>
                    {notificationCount > 0 && (
                      <span className="rounded-full bg-red-50 px-2 py-0.5 text-xs font-semibold text-red-500">
                        {notificationCount} new
                      </span>
                    )}
                  </div>

                  <div className="max-h-80 overflow-y-auto py-1">
                    {interviewNotice && !liveNoticeAlreadyLoaded && (
                      <button onClick={openInterviewNotifications} className="w-full flex gap-3 px-4 py-3 text-left hover:bg-blue-50">
                        <span className="mt-0.5 rounded-lg bg-blue-50 p-2 text-primary"><CalendarDays size={16} /></span>
                        <span>
                          <strong className="block text-sm text-dark">Interview scheduled</strong>
                          <span className="block text-xs text-gray-500 mt-0.5">{interviewNotice.jobTitle}</span>
                        </span>
                      </button>
                    )}

                    {interviewNotifications.map((application) => (
                      <button key={application._id} onClick={openInterviewNotifications} className="w-full flex gap-3 px-4 py-3 text-left hover:bg-blue-50 border-b border-gray-50 last:border-0">
                        <span className="mt-0.5 rounded-lg bg-blue-50 p-2 text-primary"><CalendarDays size={16} /></span>
                        <span className="min-w-0">
                          <strong className="block text-sm text-dark truncate">Interview: {application.job.title}</strong>
                          <span className="block text-xs text-gray-500 mt-0.5">
                            {new Date(application.interview.scheduledAt).toLocaleString([], {
                              dateStyle: "medium",
                              timeStyle: "short",
                            })}
                          </span>
                          <span className="block text-[11px] capitalize text-primary mt-1">
                            {application.interview.response.replaceAll("_", " ")}
                          </span>
                        </span>
                      </button>
                    ))}

                    {unreadMessageCount > 0 && (
                      <button onClick={openMessageNotifications} className="w-full flex gap-3 px-4 py-3 text-left hover:bg-gray-50">
                        <span className="mt-0.5 rounded-lg bg-gray-100 p-2 text-gray-600"><Mail size={16} /></span>
                        <span>
                          <strong className="block text-sm text-dark">Unread messages</strong>
                          <span className="block text-xs text-gray-500 mt-0.5">You have {unreadMessageCount} unread message{unreadMessageCount === 1 ? "" : "s"}.</span>
                        </span>
                      </button>
                    )}

                    {!interviewNotice && interviewNotifications.length === 0 && unreadMessageCount === 0 && (
                      <p className="px-4 py-8 text-center text-sm text-gray-400">No notifications yet.</p>
                    )}
                  </div>
                </div>
              )}
            </div>

            <div className="hidden sm:flex items-center gap-3 relative" ref={menuRef}>
              <button
                onClick={() => setMenuOpen((prev) => !prev)}
                className="flex items-center gap-3"
              >
                <div className="text-right">
                  <p className="text-sm font-semibold text-dark leading-tight">
                    {displayName}
                  </p>
                  <p className="text-xs text-gray-400 capitalize">{user?.role}</p>
                </div>
                <UserAvatar
                  name={displayName}
                  src={fileUrl(avatarUrl)}
                  className="h-10 w-10"
                  imageClassName="text-sm"
                />
              </button>

              {menuOpen && (
                <div className="absolute right-0 top-full mt-2 w-44 bg-white border border-gray-100 rounded-xl shadow-lg py-1.5 z-50">
                  <button
                    onClick={handleViewProfile}
                    className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-dark hover:bg-gray-50 transition-colors"
                  >
                    <User size={15} /> View Profile
                  </button>
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-red-500 hover:bg-red-50 transition-colors"
                  >
                    <LogOut size={15} /> Logout
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
