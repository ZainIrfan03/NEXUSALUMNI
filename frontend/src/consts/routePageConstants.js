import { ROUTES } from "./appConstants";

export const ADMIN_PAGES = [
  [
    ROUTES.ADMIN.DASHBOARD,
    "Admin Dashboard",
    "Monitor and manage the alumni platform.",
  ],
  [ROUTES.ADMIN.USERS, "Users", "Manage platform users and access."],
  [ROUTES.ADMIN.JOBS, "Jobs", "Review and manage job postings."],
  [ROUTES.ADMIN.EVENTS, "Events", "Review and manage platform events."],
  [ROUTES.ADMIN.REPORTS, "Reports", "View platform activity and reports."],
];

export const FACULTY_PAGES = [
  [
    ROUTES.FACULTY.DASHBOARD,
    "Faculty Dashboard",
    "Monitor alumni activity and faculty initiatives.",
  ],
  [
    ROUTES.FACULTY.ENGAGEMENT,
    "Engagement",
    "Review student and alumni engagement.",
  ],
  [ROUTES.FACULTY.EVENTS, "Events", "Manage faculty events and participation."],
  [
    ROUTES.FACULTY.ANNOUNCEMENTS,
    "Announcements",
    "Create and manage faculty announcements.",
  ],
];
