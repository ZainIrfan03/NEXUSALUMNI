import { useEffect } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import PublicLayout from "./layouts/PublicLayout";
import Home from "./pages/Home";
import About from "./pages/About"
import SuccessStoriesPage from "./pages/SuccessStories";
import Register from "./pages/Register";
import Login from "./pages/Login";
import DashboardLayout from "./layouts/DashboardLayout";
import studentRoutes from "./routes/StudentRoutes";
import alumniRoutes from "./routes/AlumniRoutes";
import facultyRoutes from "./routes/FacultyRoutes";
import adminRoutes from "./routes/AdminRoutes";
import { ROUTES } from "./consts/appConstants";
import api from "./api/axios";
import { logout, setCredentials } from "./store/slice/authSlice";
import LoadingSpinner from "./components/common/LoadingSpinner";


function App() {
  const dispatch = useDispatch();
  const { authChecked } = useSelector((state) => state.auth);

  useEffect(() => {
    if (authChecked) return undefined;

    let active = true;
    api
      .get("/auth/me")
      .then(({ data }) => {
        if (active) dispatch(setCredentials(data));
      })
      .catch(() => {
        if (active) dispatch(logout());
      });

    return () => {
      active = false;
    };
  }, [authChecked, dispatch]);

  if (!authChecked) {
    return <LoadingSpinner label="Verifying session..." className="min-h-screen" />;
  }

  return (
    <BrowserRouter>
      <Routes>
        {/* Public pages: Navbar + Footer wrap everything inside */}
        <Route element={<PublicLayout />}>
          <Route path={ROUTES.HOME} element={<Home />} />
          <Route path={ROUTES.ABOUT} element={<About />} />
          <Route path={ROUTES.SUCCESS_STORIES} element={<SuccessStoriesPage />} />
          <Route path={ROUTES.LOGIN} element={<Login />} />
          <Route path={ROUTES.REGISTER} element={<Register />} />
        </Route>
         <Route element={<DashboardLayout />}>
          {studentRoutes}
          {alumniRoutes}
          {facultyRoutes}
          {adminRoutes}
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
