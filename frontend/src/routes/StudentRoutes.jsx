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
import { ROLES, ROUTES } from "../consts/appConstants";







const studentRoutes = (
    <>
        <Route
            path={ROUTES.STUDENT.DASHBOARD}
            element={
                <ProtectedRoute allowedRoles={[ROLES.STUDENT]}>
                <StudentDashboard />
                 </ProtectedRoute>
            }
        />
        <Route
            path={ROUTES.STUDENT.PROFILE}
            element={
                <ProtectedRoute allowedRoles={[ROLES.STUDENT]}>
                <MyProfile />
                 </ProtectedRoute>
            }
        />
        <Route
            path={ROUTES.STUDENT.EDIT_PROFILE}
            element={
                 <ProtectedRoute allowedRoles={[ROLES.STUDENT]}>
                <EditProfile />
                 </ProtectedRoute>
            }
        />
        <Route path={ROUTES.STUDENT.MESSAGES} element={
               <ProtectedRoute allowedRoles={[ROLES.STUDENT]}>
            <Messages />
             </ProtectedRoute>
        } />
        <Route path={ROUTES.STUDENT.DIRECTORY} element={
               <ProtectedRoute allowedRoles={[ROLES.STUDENT]}>
            <Directory />
             </ProtectedRoute>
        } />

        <Route path={ROUTES.STUDENT.DIRECTORY_PROFILE} element={
               <ProtectedRoute allowedRoles={[ROLES.STUDENT]}>
            <AlumniProfileView />
             </ProtectedRoute>
        } />
        <Route path={ROUTES.STUDENT.JOBS} element={
               <ProtectedRoute allowedRoles={[ROLES.STUDENT]}>
            <Jobs />
             </ProtectedRoute>
        } />
        <Route path={ROUTES.STUDENT.MENTORSHIP} element={
              <ProtectedRoute allowedRoles={[ROLES.STUDENT]}>
            <Mentorship />
             </ProtectedRoute>
        } />
        


    </>
);

export default studentRoutes;
