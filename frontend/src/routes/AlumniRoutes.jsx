import React from "react";
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
import { ROLES } from "../consts/const";


/**
 * alumniRoutes — every route that belongs to the Alumni role, in one place.
 * App.jsx just imports this and drops it inside <Routes>.
 * Adding a new alumni page = add one <Route> line here, nowhere else.
 * (same pattern as studentRoutes.jsx)
 */
const alumniRoutes = (
    <>
        <Route
            path="/dashboard/alumni"
            element={
              <ProtectedRoute allowedRoles={[ROLES.ALUMNI]}>
                <AlumniDashboard />
                 </ProtectedRoute>
            }
        />
        <Route
            path="/dashboard/alumni/profile"
            element={
                <ProtectedRoute allowedRoles={[ROLES.ALUMNI]}>
                <AlumniProfile />
                 </ProtectedRoute>
            }
        />
        <Route
            path="/dashboard/alumni/profile/edit"
            element={
                <ProtectedRoute allowedRoles={[ROLES.ALUMNI]}>
                <EditProfile />
                 </ProtectedRoute>
            }
        />
        <Route
            path="/dashboard/alumni/directory"
            element={
                <ProtectedRoute allowedRoles={[ROLES.ALUMNI]}>
                <StudentDirectory />
                 </ProtectedRoute>
            }
        />

        <Route path="/dashboard/alumni/directory/:id" element={
              <ProtectedRoute allowedRoles={[ROLES.ALUMNI]}>
            <StudentProfileView />
             </ProtectedRoute>
        } />

        <Route path="/dashboard/alumni/mentorship" element={
              <ProtectedRoute allowedRoles={[ROLES.ALUMNI]}>
            <AlumniMentorship/>
            </ProtectedRoute>
        } />
        { <Route path="/dashboard/alumni/jobs" element={
               <ProtectedRoute allowedRoles={[ROLES.ALUMNI]}>
            <AlumniJobs />
                </ProtectedRoute>
        } />
    }
        <Route path="/dashboard/alumni/jobs/new" element={
               <ProtectedRoute allowedRoles={[ROLES.ALUMNI]}>
            <AlumniJobNew />
           </ProtectedRoute>
        } />
        <Route path="/dashboard/alumni/messages" element={
              <ProtectedRoute allowedRoles={[ROLES.ALUMNI]}>
            <AlumniMessages />
             </ProtectedRoute>
        } />
    </>
);

export default alumniRoutes;
