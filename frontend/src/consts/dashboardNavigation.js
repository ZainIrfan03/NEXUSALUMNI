import {
  BarChart3,
  Briefcase,
  CalendarDays,
  Compass,
  LayoutDashboard,
  Mail,
  Megaphone,
  User,
  Users,
} from "lucide-react";
import { ROLES, ROUTES } from "./appConstants";

export const DASHBOARD_LINKS_BY_ROLE = {
  [ROLES.STUDENT]: [
    {
      label: "Dashboard",
      icon: LayoutDashboard,
      path: ROUTES.STUDENT.DASHBOARD,
    },
    { label: "Profile", icon: User, path: ROUTES.STUDENT.PROFILE },
    { label: "Directory", icon: Users, path: ROUTES.STUDENT.DIRECTORY },
    { label: "Mentorship", icon: Compass, path: ROUTES.STUDENT.MENTORSHIP },
    { label: "Jobs", icon: Briefcase, path: ROUTES.STUDENT.JOBS },
    { label: "Messages", icon: Mail, path: ROUTES.STUDENT.MESSAGES },
  ],
  [ROLES.ALUMNI]: [
    {
      label: "Dashboard",
      icon: LayoutDashboard,
      path: ROUTES.ALUMNI.DASHBOARD,
    },
    { label: "Profile", icon: User, path: ROUTES.ALUMNI.PROFILE },
    { label: "Directory", icon: Users, path: ROUTES.ALUMNI.DIRECTORY },
    { label: "Mentorship", icon: Compass, path: ROUTES.ALUMNI.MENTORSHIP },
    { label: "Post a Job", icon: Briefcase, path: ROUTES.ALUMNI.JOBS },
    { label: "Messages", icon: Mail, path: ROUTES.ALUMNI.MESSAGES },
  ],
  [ROLES.FACULTY]: [
    {
      label: "Dashboard",
      icon: LayoutDashboard,
      path: ROUTES.FACULTY.DASHBOARD,
    },
    { label: "Engagement", icon: BarChart3, path: ROUTES.FACULTY.ENGAGEMENT },
    { label: "Events", icon: CalendarDays, path: ROUTES.FACULTY.EVENTS },
    {
      label: "Announcements",
      icon: Megaphone,
      path: ROUTES.FACULTY.ANNOUNCEMENTS,
    },
  ],
  [ROLES.ADMIN]: [
    { label: "Dashboard", icon: LayoutDashboard, path: ROUTES.ADMIN.DASHBOARD },
    { label: "Users", icon: Users, path: ROUTES.ADMIN.USERS },
    { label: "Jobs", icon: Briefcase, path: ROUTES.ADMIN.JOBS },
    { label: "Events", icon: CalendarDays, path: ROUTES.ADMIN.EVENTS },
    { label: "Reports", icon: BarChart3, path: ROUTES.ADMIN.REPORTS },
  ],
};

export const ROLES_WITH_DASHBOARD_SETTINGS = [ROLES.ADMIN];
