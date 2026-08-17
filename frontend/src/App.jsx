import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import PublicLayout from "./layouts/PublicLayout";
import Home from "./pages/Home";
import About from "./pages/About"
import SuccessStoriesPage from "./pages/SuccessStories";
import Register from "./pages/Register";
import Login from "./pages/Login";
import DashboardLayout from "./layouts/DashboardLayout";
import studentRoutes from "./routes/StudentRoutes";
import alumniRoutes from "./routes/AlumniRoutes";


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
          {/* TODO: facultyRoutes and adminRoutes — see backlog */}
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
