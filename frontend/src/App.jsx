import { BrowserRouter, Routes, Route } from "react-router-dom";
import PublicLayout from "./layouts/PublicLayout";
import Home from "./pages/Home";
import About from "./pages/About";
import SuccessStoriesPage from "./pages/SuccessStories";
import Register from "./pages/Register";
import Login from "./pages/Login";
import DashboardLayout from "./layouts/DashboardLayout";
import studentRoutes from "./routes/StudentRoutes";
import alumniRoutes from "./routes/AlumniRoutes";
import { ROUTES } from "./consts/appConstants";
import LoadingSpinner from "./components/common/LoadingSpinner";
import useAuthSession from "./hooks/useAuthSession";

function App() {
  const authChecked = useAuthSession();

  if (!authChecked) {
    return (
      <LoadingSpinner label="Verifying session..." className="min-h-screen" />
    );
  }

  return (
    <BrowserRouter>
      <Routes>
        <Route element={<PublicLayout />}>
          <Route path={ROUTES.HOME} element={<Home />} />
          <Route path={ROUTES.ABOUT} element={<About />} />
          <Route
            path={ROUTES.SUCCESS_STORIES}
            element={<SuccessStoriesPage />}
          />
          <Route path={ROUTES.LOGIN} element={<Login />} />
          <Route path={ROUTES.REGISTER} element={<Register />} />
        </Route>
        <Route element={<DashboardLayout />}>
          {studentRoutes}
          {alumniRoutes}
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
