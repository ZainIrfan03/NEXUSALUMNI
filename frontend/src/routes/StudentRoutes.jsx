import React from "react";
import { Route } from "react-router-dom";
import ProtectedRoute from "./ProtectedRoute";
import StudentDashboard from "../pages/dashboard/student/StudentDashboard";
import MyProfile from "../pages/dashboard/student/MyProfile";
import EditProfile from "../pages/dashboard/student/EditProfile";
import Messages from "../pages/dashboard/student/Messages";
import Directory from "../pages/dashboard/student/Directory";
import Jobs from "../pages/dashboard/student/Jobs";
import Mentorship from "../pages/dashboard/student/Mentorship";
import AlumniProfileView from "../pages/dashboard/student/AlumniProfileView";
import { ROLES } from "../consts/const";


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
                <ProtectedRoute allowedRoles={[ROLES.STUDENT]}>
                <StudentDashboard />
                 </ProtectedRoute>
            }
        />
        <Route
            path="/dashboard/student/profile"
            element={
                <ProtectedRoute allowedRoles={[ROLES.STUDENT]}>
                <MyProfile />
                 </ProtectedRoute>
            }
        />
        <Route
            path="/dashboard/student/profile/edit"
            element={
                 <ProtectedRoute allowedRoles={[ROLES.STUDENT]}>
                <EditProfile />
                 </ProtectedRoute>
            }
        />
        <Route path="/dashboard/student/messages" element={
               <ProtectedRoute allowedRoles={[ROLES.STUDENT]}>
            <Messages />
             </ProtectedRoute>
        } />
        <Route path="/dashboard/student/directory" element={
               <ProtectedRoute allowedRoles={[ROLES.STUDENT]}>
            <Directory />
             </ProtectedRoute>
        } />

        <Route path="/dashboard/student/directory/:id" element={
               <ProtectedRoute allowedRoles={[ROLES.STUDENT]}>
            <AlumniProfileView />
             </ProtectedRoute>
        } />
        <Route path="/dashboard/student/jobs" element={
               <ProtectedRoute allowedRoles={[ROLES.STUDENT]}>
            <Jobs />
             </ProtectedRoute>
        } />
        <Route path="/dashboard/student/mentorship" element={
              <ProtectedRoute allowedRoles={[ROLES.STUDENT]}>
            <Mentorship />
             </ProtectedRoute>
        } />
        {/* Add as pages get built:
    <Route path="/dashboard/student/events" element={...} />
    */}
    </>
);

export default studentRoutes;
