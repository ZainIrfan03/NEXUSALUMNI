import { useSelector } from "react-redux";
import { Navigate } from "react-router-dom";
import { ROLE_HOME_ROUTES, ROUTES } from "../consts/appConstants";













export default function ProtectedRoute({ allowedRoles, children }) {
  const { user } = useSelector((state) => state.auth);

  if (!user) {
    return <Navigate to={ROUTES.LOGIN} replace />;
  }

  if (!allowedRoles.includes(user.role)) {
    return <Navigate to={ROLE_HOME_ROUTES[user.role] || ROUTES.HOME} replace />;
  }

  return children;
}
