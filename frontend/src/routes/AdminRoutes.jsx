import { Route } from "react-router-dom";
import DashboardPlaceholder from "../components/dashboard/DashboardPlaceholder";
import { ROLES, ROUTES } from "../consts/appConstants";
import ProtectedRoute from "./ProtectedRoute";

const adminPages = [
  [ROUTES.ADMIN.DASHBOARD, "Admin Dashboard", "Monitor and manage the alumni platform."],
  [ROUTES.ADMIN.USERS, "Users", "Manage platform users and access."],
  [ROUTES.ADMIN.JOBS, "Jobs", "Review and manage job postings."],
  [ROUTES.ADMIN.EVENTS, "Events", "Review and manage platform events."],
  [ROUTES.ADMIN.REPORTS, "Reports", "View platform activity and reports."],
];

const adminRoutes = adminPages.map(([path, title, description]) => (
  <Route
    key={path}
    path={path}
    element={
      <ProtectedRoute allowedRoles={[ROLES.ADMIN]}>
        <DashboardPlaceholder title={title} description={description} />
      </ProtectedRoute>
    }
  />
));

export default adminRoutes;
