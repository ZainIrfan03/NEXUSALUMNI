import { Route } from "react-router-dom";
import DashboardPlaceholder from "../components/dashboard/DashboardPlaceholder";
import { ROLES, ROUTES } from "../consts/appConstants";
import ProtectedRoute from "./ProtectedRoute";

const facultyPages = [
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

const facultyRoutes = facultyPages.map(([path, title, description]) => (
  <Route
    key={path}
    path={path}
    element={
      <ProtectedRoute allowedRoles={[ROLES.FACULTY]}>
        <DashboardPlaceholder title={title} description={description} />
      </ProtectedRoute>
    }
  />
));

export default facultyRoutes;
