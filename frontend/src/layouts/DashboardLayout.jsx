import React, { useState, useEffect, useRef } from "react";
import { Outlet, NavLink, useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import axios from "axios";
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
import { disconnectSocket } from "../utils/socket";

const API_BASE = "http://localhost:5000/api";

// Files come back from the backend as relative paths (e.g. "/uploads/avatars/xyz.png"),
// so build a full URL for <img src> when it doesn't already start with "http".
const fileUrl = (path) => {
  if (!path) return "";
  // Stale blob: URLs from old preview-only code can end up saved in the DB.
  // They only work in the browser tab that created them, so treat as invalid.
  if (path.startsWith("blob:")) return "";
  if (path.startsWith("http")) return path;
  return `http://localhost:5000${path}`;
};

/**
 * DashboardLayout — dark sidebar + light topbar (search, notifications, avatar).
 * Wraps every logged-in page. Sidebar links differ per role.
 */

const linksByRole = {
  student: [
    { label: "Dashboard", icon: LayoutDashboard, path: "/dashboard/student" },
    { label: "Profile", icon: User, path: "/dashboard/student/profile" },
    { label: "Directory", icon: Users, path: "/dashboard/student/directory" },
    { label: "Mentorship", icon: Compass, path: "/dashboard/student/mentorship" },
    { label: "Jobs", icon: Briefcase, path: "/dashboard/student/jobs" },
    { label: "Messages", icon: Mail, path: "/dashboard/student/messages" },
  ],
  alumni: [
    { label: "Dashboard", icon: LayoutDashboard, path: "/dashboard/alumni" },
    { label: "Profile", icon: User, path: "/dashboard/alumni/profile" },
    { label: "Directory", icon: Users, path: "/dashboard/alumni/directory" },
    { label: "Mentorship", icon: Compass, path: "/dashboard/alumni/mentorship" },
    { label: "Post a Job", icon: Briefcase, path: "/dashboard/alumni/jobs" },
    { label: "Messages", icon: Mail, path: "/dashboard/alumni/messages" },
  ],
  faculty: [
    { label: "Dashboard", icon: LayoutDashboard, path: "/dashboard/faculty" },
    { label: "Engagement", icon: BarChart3, path: "/dashboard/faculty/engagement" },
    { label: "Events", icon: CalendarDays, path: "/dashboard/faculty/events" },
    { label: "Announcements", icon: Megaphone, path: "/dashboard/faculty/announcements" },
  ],
  admin: [
    { label: "Dashboard", icon: LayoutDashboard, path: "/dashboard/admin" },
    { label: "Users", icon: Users, path: "/dashboard/admin/users" },
    { label: "Jobs", icon: Briefcase, path: "/dashboard/admin/jobs" },
    { label: "Events", icon: CalendarDays, path: "/dashboard/admin/events" },
    { label: "Reports", icon: BarChart3, path: "/dashboard/admin/reports" },
  ],
};

// Roles that currently have a working Settings page.
// Add "alumni" here once /dashboard/alumni/settings actually exists.
const rolesWithSettings = ["admin"];

// Only student/alumni currently have an avatarUrl on their profile model.
// Faculty/admin fall back to the initials avatar.
const profileEndpointByRole = {
  student: "/student/profile",
  alumni: "/alumni/profile",
};

export default function DashboardLayout() {
  const { user } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState("");
  const menuRef = useRef(null);

  const links = linksByRole[user?.role] || [];
  const showSettings = rolesWithSettings.includes(user?.role);

  // Pull the real avatar from the role's profile endpoint (User model doesn't
  // store avatarUrl — it lives on Student/Alumni). Falls back to initials
  // if the role has no profile endpoint yet or the request fails.
  useEffect(() => {
    const endpoint = profileEndpointByRole[user?.role];
    if (!endpoint) return;

    let cancelled = false;
    axios
      .get(`${API_BASE}${endpoint}`)
      .then(({ data }) => {
        if (!cancelled) setAvatarUrl(data.avatarUrl || "");
      })
      .catch(() => {
        // Silent fail is fine here — initials avatar covers it
      });

    return () => {
      cancelled = true;
    };
  }, [user?.role]);

  const handleLogout = () => {
    // Best-effort: clears the httpOnly cookie server-side. Local logout still
    // proceeds even if this fails (e.g. network hiccup) — the user shouldn't
    // get stuck unable to log out.
    axios.post(`${API_BASE}/auth/logout`).catch(() => {});
    disconnectSocket();
    dispatch(logout());
    navigate("/login");
  };

  const handleViewProfile = () => {
    setMenuOpen(false);
    navigate(`/dashboard/${user?.role}/profile`);
  };

  // Close the account dropdown when clicking anywhere outside it
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
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
      <aside className="hidden md:flex md:flex-col w-64 bg-dark p-5">
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
            <button className="relative text-gray-500 hover:text-dark transition-colors">
              <Bell size={20} />
              <span className="absolute -top-0.5 -right-0.5 h-2 w-2 rounded-full bg-red-500" />
            </button>

            <div className="hidden sm:flex items-center gap-3 relative" ref={menuRef}>
              <button
                onClick={() => setMenuOpen((prev) => !prev)}
                className="flex items-center gap-3"
              >
                <div className="text-right">
                  <p className="text-sm font-semibold text-dark leading-tight">
                    {user?.fullName}
                  </p>
                  <p className="text-xs text-gray-400 capitalize">{user?.role}</p>
                </div>
                {fileUrl(avatarUrl) ? (
                  <img
                    src={fileUrl(avatarUrl)}
                    alt={user?.fullName}
                    className="h-10 w-10 rounded-full object-cover"
                  />
                ) : (
                  <div className="h-10 w-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-400 text-sm font-semibold">
                    {user?.fullName ? user.fullName.charAt(0).toUpperCase() : "?"}
                  </div>
                )}
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