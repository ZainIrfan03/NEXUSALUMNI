import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import PublicLayout from "./layouts/PublicLayout";
import Home from "./pages/Home";
import About from "./pages/About"
import SuccessStoriesPage from "./pages/SuccessStories";
import Register from "./pages/Register";
import Login from "./pages/Login";
import DashboardLayout from "./layouts/DashboardLayout";
import StudentDashboard from "./pages/dashboard/student/StudentDashboard";
import ProtectedRoute from "./routes/protectedRoute";
import studentRoutes from "./pages/dashboard/student/studentRoutes";
import alumniRoutes from "./pages/dashboard/alumni/alumniRoutes";


function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public pages: Navbar + Footer wrap everything inside */}
        <Route element={<PublicLayout />}>
          <Route path="/" element={<Home />} />
          <Route path="/about" element={<About />} />
          <Route path="/success-stories" element={<SuccessStoriesPage />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
        </Route>
         <Route element={<DashboardLayout />}>
          {studentRoutes}
          {alumniRoutes}
          {/* {facultyRoutes} */}
          {/* {adminRoutes} */}
        </Route>

        {/* Logged-in pages: separate layout, no Navbar/Footer here */}
        {/* <Route element={<DashboardLayout />}>
          <Route path="/dashboard/student" element={<StudentDashboard />} />
        </Route> */}
      </Routes>
    </BrowserRouter>
  );
}

export default App;