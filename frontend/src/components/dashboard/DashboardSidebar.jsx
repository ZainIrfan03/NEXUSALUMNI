import { LogOut, Settings, X } from "lucide-react";
import { NavLink } from "react-router-dom";
import { useSelector } from "react-redux";
import {
  DASHBOARD_LINKS_BY_ROLE,
  ROLES_WITH_DASHBOARD_SETTINGS,
} from "../../consts/dashboardNavigation";
import useLogout from "../../hooks/useLogout";

const linkClass = ({ isActive }) =>
  `flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-colors ${
    isActive
      ? "bg-white/10 text-white"
      : "text-gray-400 hover:bg-white/5 hover:text-white"
  }`;

function SidebarContent({ onNavigate }) {
  const { user } = useSelector((state) => state.auth);
  const handleLogout = useLogout();
  const links = DASHBOARD_LINKS_BY_ROLE[user?.role] || [];
  const showSettings = ROLES_WITH_DASHBOARD_SETTINGS.includes(user?.role);

  return (
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
            onClick={onNavigate}
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
}

export default function DashboardSidebar({ open, onClose }) {
  return (
    <>
      <aside className="hidden md:flex md:flex-col md:sticky md:top-0 md:h-screen md:overflow-y-auto w-64 bg-dark p-5">
        <SidebarContent />
      </aside>

      {open && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div className="absolute inset-0 bg-black/40" onClick={onClose} />
          <aside className="absolute left-0 top-0 h-full w-64 bg-dark p-5 flex flex-col">
            <button className="self-end mb-4 text-white" onClick={onClose}>
              <X size={20} />
            </button>
            <SidebarContent onNavigate={onClose} />
          </aside>
        </div>
      )}
    </>
  );
}
