import { useState } from "react";
import { NavLink, useLocation } from "react-router-dom";
import { Menu, X } from "lucide-react";

const links = [
  { label: "Home", path: "/" },
  { label: "About", path: "/about" },
  { label: "Success Stories", path: "/success-stories" },
];

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();
  const onLoginPage = location.pathname === "/login";
  const onRegisterPage = location.pathname === "/register";

  const linkClass = ({ isActive }) =>
    `pb-1 border-b-2 transition-colors ${
      isActive
        ? "text-primary border-primary"
        : "text-gray-600 border-transparent hover:text-primary"
    }`;

  const mobileLinkClass = ({ isActive }) =>
    isActive ? "text-primary" : "text-gray-600";

  return (
    <header className="w-full bg-white border-b border-gray-100">
      <div className="mx-auto max-w-7xl px-6 py-4 flex items-center">
        <span className="text-xl font-semibold text-dark">Alumni Nexus</span>

        <div className="hidden md:flex items-center gap-10 ml-auto">
          <nav className="flex items-center gap-8 text-sm font-medium">
            {links.map(({ label, path }) => (
              <NavLink
                key={path}
                to={path}
                end={path === "/"}
                className={linkClass}
              >
                {label}
              </NavLink>
            ))}
          </nav>

          <div className="flex items-center gap-3">
            {!onLoginPage && (
              <NavLink
                to="/login"
                className="text-sm font-medium px-5 py-2 rounded-full border border-primary text-primary hover:bg-primary/5 transition-colors"
              >
                Login
              </NavLink>
            )}

            {!onRegisterPage && (
              <NavLink
                to="/register"
                className="text-sm font-medium px-5 py-2 rounded-full bg-dark text-white hover:opacity-90 transition-opacity"
              >
                Register
              </NavLink>
            )}
          </div>
        </div>

        <button
          className="md:hidden ml-auto"
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-label="Toggle menu"
        >
          {mobileOpen ? (
            <X className="text-dark" />
          ) : (
            <Menu className="text-dark" />
          )}
        </button>
      </div>

      {mobileOpen && (
        <div className="md:hidden px-6 pb-5 flex flex-col gap-4 text-sm font-medium">
          {links.map(({ label, path }) => (
            <NavLink
              key={path}
              to={path}
              end={path === "/"}
              className={mobileLinkClass}
              onClick={() => setMobileOpen(false)}
            >
              {label}
            </NavLink>
          ))}
          <div className="flex gap-3 mt-2">
            {!onLoginPage && (
              <NavLink
                to="/login"
                onClick={() => setMobileOpen(false)}
                className="flex-1 text-center text-sm font-medium px-4 py-2 rounded-full border border-primary text-primary"
              >
                Login
              </NavLink>
            )}
            {!onRegisterPage && (
              <NavLink
                to="/register"
                onClick={() => setMobileOpen(false)}
                className="flex-1 text-center text-sm font-medium px-4 py-2 rounded-full bg-dark text-white"
              >
                Register
              </NavLink>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
