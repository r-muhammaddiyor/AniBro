import { lazy, Suspense } from "react";
import { Navigate, Route, Routes, useLocation } from "react-router-dom";
import MainLayout from "./layouts/MainLayout.jsx";
import ProtectedRoute from "./components/ProtectedRoute.jsx";
import PageLoader from "./components/PageLoader.jsx";

const Home = lazy(() => import("./pages/Home.jsx"));
const AnimeDetail = lazy(() => import("./pages/AnimeDetail.jsx"));
const Login = lazy(() => import("./pages/Login.jsx"));
const Register = lazy(() => import("./pages/Register.jsx"));
const AdminDashboard = lazy(() => import("./pages/AdminDashboard.jsx"));
const NotFound = lazy(() => import("./pages/NotFound.jsx"));
const ProfileModal = lazy(() => import("./components/ProfileModal.jsx"));

const App = () => {
  const location = useLocation();
  const backgroundLocation = location.state?.backgroundLocation;

  return (
    <Suspense fallback={<PageLoader />}>
      <Routes location={backgroundLocation || location}>
        <Route element={<MainLayout />}>
          <Route index element={<Home />} />
          <Route path="/anime/:id" element={<AnimeDetail />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route
            path="/admin"
            element={
              <ProtectedRoute requireAdmin>
                <AdminDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <Home />
              </ProtectedRoute>
            }
          />
          <Route path="/404" element={<NotFound />} />
          <Route path="*" element={<Navigate to="/404" replace />} />
        </Route>
      </Routes>

      {location.pathname === "/profile" ? (
        <Routes>
          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <ProfileModal />
              </ProtectedRoute>
            }
          />
        </Routes>
      ) : null}
    </Suspense>
  );
};

export default App;
