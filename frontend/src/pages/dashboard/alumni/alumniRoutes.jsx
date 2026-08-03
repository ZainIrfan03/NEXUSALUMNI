import React from "react";
import { Route } from "react-router-dom";
import ProtectedRoute from "../../../routes/protectedRoute";
import AlumniDashboard from "./AlumniDashboard";
import StudentDirectory from "./StudentDirectory";
// import Jobs from "./Jobs";
import AlumniMentorship from "./AlumniMentorship";
import AlumniMessages from "./AlumniMessages";
import AlumniProfile from "./AlumniProfile";
import EditProfile from "./AlumniEditProfile";
import AlumniJobs from "./AlumniJobs";
import AlumniJobNew from "./AlumniJobNew";
import StudentProfileView from "./StudentProfileView";

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
                // <ProtectedRoute allowedRoles={["alumni"]}>
                <AlumniDashboard />
                // </ProtectedRoute>
            }
        />
        <Route
            path="/dashboard/alumni/profile"
            element={
                // <ProtectedRoute allowedRoles={["alumni"]}>
                <AlumniProfile />
                // </ProtectedRoute>
            }
        />
        <Route
            path="/dashboard/alumni/profile/edit"
            element={
                // <ProtectedRoute allowedRoles={["alumni"]}>
                <EditProfile />
                // </ProtectedRoute>
            }
        />
        <Route
            path="/dashboard/alumni/directory"
            element={
                //   <ProtectedRoute allowedRoles={["alumni"]}>
                <StudentDirectory />
                // </ProtectedRoute>
            }
        />

        <Route path="/dashboard/alumni/directory/:id" element={
            //   <ProtectedRoute allowedRoles={["alumni"]}>
            <StudentProfileView />
            // </ProtectedRoute>
        } />

        <Route path="/dashboard/alumni/mentorship" element={
            //   <ProtectedRoute allowedRoles={["alumni"]}>
            <AlumniMentorship/>
            // </ProtectedRoute>
        } />
        { <Route path="/dashboard/alumni/jobs" element={
            //   <ProtectedRoute allowedRoles={["alumni"]}>
            <AlumniJobs />
            //     </ProtectedRoute>
        } />
    }
        <Route path="/dashboard/alumni/jobs/new" element={
            //   <ProtectedRoute allowedRoles={["alumni"]}>
            <AlumniJobNew />
            // </ProtectedRoute>
        } />
        <Route path="/dashboard/alumni/messages" element={
            //   <ProtectedRoute allowedRoles={["alumni"]}>
            <AlumniMessages />
            // </ProtectedRoute>
        } />
    </>
);

export default alumniRoutes;