import React, { useState, useEffect, useRef } from "react";
import { Outlet, NavLink, useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import api from "../api/axios";
import { getImageUrl as fileUrl } from "../utils/getImageUrl";
import { ROLES, ROUTES, SOCKET_EVENTS } from "../consts/appConstants";
import { useGetUnreadMessageCountQuery } from "../store/api/messagesApi";
import { useGetMyProfileQuery } from "../store/api/studentProfileApi";
import { useGetMyAlumniProfileQuery } from "../store/api/alumniProfileApi";
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
  const menuRef = useRef(null);

  const links = linksByRole[user?.role] || [];
  const showSettings = rolesWithSettings.includes(user?.role);
  const supportsMessages = [ROLES.STUDENT, ROLES.ALUMNI].includes(user?.role);
  const { data: unreadData, refetch: refetchUnreadMessages } = useGetUnreadMessageCountQuery(
    undefined,
    { skip: !supportsMessages }
  );
  const unreadMessageCount = unreadData?.count || 0;
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
    socket.on(SOCKET_EVENTS.RECEIVE_MESSAGE, handleIncomingMessage);

    return () => {
      socket.off(SOCKET_EVENTS.RECEIVE_MESSAGE, handleIncomingMessage);
    };
  }, [supportsMessages, refetchUnreadMessages]);

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

  // Close the account dropdown when clicking anywhere outside it
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const linkClass = ({ isActive }) =>
    `flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-colors ${
      isActive ? "bg-white/10 text-white" : "text-gray-400 hover:bg-white/5 hover:text-white"
    }`;

  const SidebarContent = () => (
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
        <SidebarContent />
      </aside>

      {/* Mobile sidebar (slide-over) */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div className="absolute inset-0 bg-black/40" onClick={() => setSidebarOpen(false)} />
          <aside className="absolute left-0 top-0 h-full w-64 bg-dark p-5 flex flex-col">
            <button className="self-end mb-4 text-white" onClick={() => setSidebarOpen(false)}>
              <X size={20} />
            </button>
            <SidebarContent />
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
            <button
              type="button"
              onClick={() =>
                supportsMessages &&
                navigate(user.role === ROLES.STUDENT ? ROUTES.STUDENT.MESSAGES : ROUTES.ALUMNI.MESSAGES)
              }
              className="relative text-gray-500 hover:text-dark transition-colors"
              aria-label={
                unreadMessageCount
                  ? `${unreadMessageCount} unread message${unreadMessageCount === 1 ? "" : "s"}`
                  : "No unread messages"
              }
            >
              <Bell size={20} />
              {unreadMessageCount > 0 && (
                <span className="absolute -top-2 -right-2 min-w-4 h-4 px-1 rounded-full bg-red-500 text-white text-[10px] font-bold flex items-center justify-center">
                  {unreadMessageCount > 99 ? "99+" : unreadMessageCount}
                </span>
              )}
            </button>

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
