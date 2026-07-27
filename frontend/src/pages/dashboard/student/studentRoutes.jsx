import React from "react";
import { Route } from "react-router-dom";
import ProtectedRoute from "../../../routes/ProtectedRoute";
import StudentDashboard from "./StudentDashboard";
import MyProfile from "./MyProfile";
import EditProfile from "./EditProfile";
import Messages from "./Messages";
import Directory from "./Directory";
import Jobs from "./Jobs";
import Mentorship from "./Mentorship";
import AlumniProfileView from "./AlumniProfileView";

/**
 * studentRoutes — every route that belongs to the Student role, in one place.
 * App.jsx just imports this and drops it inside <Routes>.
 * Adding a new student page = add one <Route> line here, nowhere else.
 */
const studentRoutes = (
    <>
        <Route
            path="/dashboard/student"
            element={
                // <ProtectedRoute allowedRoles={["student"]}>
                <StudentDashboard />
                // </ProtectedRoute>
            }
        />
        <Route
            path="/dashboard/student/profile"
            element={
                // <ProtectedRoute allowedRoles={["student"]}>
                <MyProfile />
                // </ProtectedRoute>
            }
        />
        <Route
            path="/dashboard/student/profile/edit"
            element={
                // <ProtectedRoute allowedRoles={["student"]}>
                <EditProfile />
                // </ProtectedRoute>
            }
        />
        <Route path="/dashboard/student/messages" element={
            //   <ProtectedRoute allowedRoles={["student"]}>
            <Messages />
            // </ProtectedRoute>
        } />
        <Route path="/dashboard/student/directory" element={
            //   <ProtectedRoute allowedRoles={["student"]}>
            <Directory />
            // </ProtectedRoute>
        } />

        <Route path="/dashboard/student/directory/:id" element={
            //   <ProtectedRoute allowedRoles={["student"]}>
            <AlumniProfileView />
            // </ProtectedRoute>
        } />
        <Route path="/dashboard/student/jobs" element={
            //   <ProtectedRoute allowedRoles={["student"]}>
            <Jobs />
            //     </ProtectedRoute>
        } />
        <Route path="/dashboard/student/mentorship" element={
            //   <ProtectedRoute allowedRoles={["student"]}>
            <Mentorship />
            // </ProtectedRoute>
        } />
        {/* Add as pages get built:
    <Route path="/dashboard/student/events" element={...} />
    */}
    </>
);

export default studentRoutes;