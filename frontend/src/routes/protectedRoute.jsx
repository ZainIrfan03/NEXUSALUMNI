import React from "react";
import { useSelector } from "react-redux";
import { Navigate } from "react-router-dom";


/**
 * Wrap any dashboard route with this.
 * - Not logged in           -> redirect to /login
 * - Logged in, wrong role   -> redirect to their own dashboard
 * - Logged in, correct role -> render the page
 *
 * Usage:
 *   <ProtectedRoute allowedRoles={[ROLES.STUDENT]}>
 *     <StudentDashboard />
 *   </ProtectedRoute>
 */
export default function ProtectedRoute({ allowedRoles, children }) {
  const { user } = useSelector((state) => state.auth);

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (!allowedRoles.includes(user.role)) {
    return <Navigate to={`/dashboard/${user.role}`} replace />;
  }

  return children;
}