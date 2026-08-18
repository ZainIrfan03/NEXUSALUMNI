import { Route } from "react-router-dom";
import ProtectedRoute from "./ProtectedRoute";
import AlumniDashboard from "../pages/dashboard/alumni/AlumniDashboard";
import StudentDirectory from "../pages/dashboard/alumni/StudentDirectory";
import AlumniMentorship from "../pages/dashboard/alumni/AlumniMentorship";
import AlumniMessages from "../pages/dashboard/alumni/AlumniMessages";
import AlumniProfile from "../pages/dashboard/alumni/AlumniProfile";
import EditProfile from "../pages/dashboard/alumni/AlumniEditProfile";
import AlumniJobs from "../pages/dashboard/alumni/AlumniJobs";
import AlumniJobNew from "../pages/dashboard/alumni/AlumniJobNew";
import StudentProfileView from "../pages/dashboard/alumni/StudentProfileView";
import { ROLES, ROUTES } from "../consts/appConstants";


/**
 * alumniRoutes — every route that belongs to the Alumni role, in one place.
 * App.jsx just imports this and drops it inside <Routes>.
 * Adding a new alumni page = add one <Route> line here, nowhere else.
 * (same pattern as studentRoutes.jsx)
 */
const alumniRoutes = (
    <>
        <Route
            path={ROUTES.ALUMNI.DASHBOARD}
            element={
              <ProtectedRoute allowedRoles={[ROLES.ALUMNI]}>
                <AlumniDashboard />
                 </ProtectedRoute>
            }
        />
        <Route
            path={ROUTES.ALUMNI.PROFILE}
            element={
                <ProtectedRoute allowedRoles={[ROLES.ALUMNI]}>
                <AlumniProfile />
                 </ProtectedRoute>
            }
        />
        <Route
            path={ROUTES.ALUMNI.EDIT_PROFILE}
            element={
                <ProtectedRoute allowedRoles={[ROLES.ALUMNI]}>
                <EditProfile />
                 </ProtectedRoute>
            }
        />
        <Route
            path={ROUTES.ALUMNI.DIRECTORY}
            element={
                <ProtectedRoute allowedRoles={[ROLES.ALUMNI]}>
                <StudentDirectory />
                 </ProtectedRoute>
            }
        />

        <Route path={ROUTES.ALUMNI.DIRECTORY_PROFILE} element={
              <ProtectedRoute allowedRoles={[ROLES.ALUMNI]}>
            <StudentProfileView />
             </ProtectedRoute>
        } />

        <Route path={ROUTES.ALUMNI.MENTORSHIP} element={
              <ProtectedRoute allowedRoles={[ROLES.ALUMNI]}>
            <AlumniMentorship/>
            </ProtectedRoute>
        } />
        { <Route path={ROUTES.ALUMNI.JOBS} element={
               <ProtectedRoute allowedRoles={[ROLES.ALUMNI]}>
            <AlumniJobs />
                </ProtectedRoute>
        } />
    }
        <Route path={ROUTES.ALUMNI.NEW_JOB} element={
               <ProtectedRoute allowedRoles={[ROLES.ALUMNI]}>
            <AlumniJobNew />
           </ProtectedRoute>
        } />
        <Route path={ROUTES.ALUMNI.MESSAGES} element={
              <ProtectedRoute allowedRoles={[ROLES.ALUMNI]}>
            <AlumniMessages />
             </ProtectedRoute>
        } />
    </>
);

export default alumniRoutes;
