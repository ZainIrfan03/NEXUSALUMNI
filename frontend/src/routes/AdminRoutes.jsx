import { Route } from "react-router-dom";
import DashboardPlaceholder from "../components/dashboard/DashboardPlaceholder";
import { ROLES } from "../consts/appConstants";
import { ADMIN_PAGES } from "../consts/routePageConstants";
import ProtectedRoute from "./ProtectedRoute";

const adminRoutes = ADMIN_PAGES.map(([path, title, description]) => (
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
