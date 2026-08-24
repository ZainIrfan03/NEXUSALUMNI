import { useEffect, useRef, useState } from "react";
import { Bell, Menu, Search } from "lucide-react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { ROLES, ROUTES } from "../../consts/appConstants";
import useDashboardNotifications from "../../hooks/useDashboardNotifications";
import useDashboardProfile from "../../hooks/useDashboardProfile";
import useLogout from "../../hooks/useLogout";
import NotificationsMenu from "./NotificationsMenu";
import UserMenu from "./UserMenu";

export default function DashboardHeader({ onOpenSidebar }) {
  const { user } = useSelector((state) => state.auth);
  const navigate = useNavigate();
  const handleLogout = useLogout();
  const [menuOpen, setMenuOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const menuRef = useRef(null);
  const notificationsRef = useRef(null);
  const { displayName, avatarUrl } = useDashboardProfile(user);
  const notifications = useDashboardNotifications(user);

  const handleViewProfile = () => {
    setMenuOpen(false);
    navigate(
      user?.role === ROLES.STUDENT
        ? ROUTES.STUDENT.PROFILE
        : ROUTES.ALUMNI.PROFILE,
    );
  };

  const openInterviewNotifications = () => {
    setNotificationsOpen(false);
    notifications.clearInterviewNotice();
    navigate(ROUTES.STUDENT.JOBS, { state: { jobsView: "applications" } });
  };

  const openMessageNotifications = () => {
    setNotificationsOpen(false);
    navigate(
      user?.role === ROLES.STUDENT
        ? ROUTES.STUDENT.MESSAGES
        : ROUTES.ALUMNI.MESSAGES,
    );
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setMenuOpen(false);
      }
      if (
        notificationsRef.current &&
        !notificationsRef.current.contains(event.target)
      ) {
        setNotificationsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <header className="flex items-center gap-4 bg-white border-b border-gray-100 px-6 py-4">
      <button className="md:hidden" onClick={onOpenSidebar}>
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
            aria-label={
              notifications.notificationCount
                ? `${notifications.notificationCount} notification(s)`
                : "No notifications"
            }
            aria-expanded={notificationsOpen}
          >
            <Bell size={20} />
            {notifications.notificationCount > 0 && (
              <span className="absolute -top-2 -right-2 min-w-4 h-4 px-1 rounded-full bg-red-500 text-white text-[10px] font-bold flex items-center justify-center">
                {notifications.notificationCount > 99
                  ? "99+"
                  : notifications.notificationCount}
              </span>
            )}
          </button>

          {notificationsOpen && (
            <NotificationsMenu
              {...notifications}
              onOpenInterviews={openInterviewNotifications}
              onOpenMessages={openMessageNotifications}
            />
          )}
        </div>

        <div
          className="hidden sm:flex items-center gap-3 relative"
          ref={menuRef}
        >
          <UserMenu
            avatarUrl={avatarUrl}
            displayName={displayName}
            onLogout={handleLogout}
            onToggle={() => setMenuOpen((open) => !open)}
            onViewProfile={handleViewProfile}
            open={menuOpen}
            role={user?.role}
          />
        </div>
      </div>
    </header>
  );
}
