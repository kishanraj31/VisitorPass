import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";
import Navbar from "./components/Navbar";

import LoginPage from "./pages/LoginPage";
import LandingPage from "./pages/LandingPage";
import VisitorPreRegisterPage from "./pages/VisitorPreRegisterPage";
import CheckPassStatusPage from "./pages/CheckPassStatusPage";
import HostDashboardPage from "./pages/HostDashboardPage";
import FrontdeskPage from "./pages/FrontdeskPage";
import AdminDashboardPage from "./pages/AdminDashboardPage";
import { NotAuthorizedPage, NotFoundPage } from "./pages/ErrorPages";

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Navbar />
        <main>
          <Routes>
            {/* Public routes */}
            <Route path="/" element={<LandingPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/pre-register" element={<VisitorPreRegisterPage />} />
            <Route path="/check-status" element={<CheckPassStatusPage />} />

            {/* Host routes */}
            <Route
              path="/host"
              element={
                <ProtectedRoute roles={["host"]}>
                  <HostDashboardPage />
                </ProtectedRoute>
              }
            />

            {/* Frontdesk routes */}
            <Route
              path="/frontdesk"
              element={
                <ProtectedRoute roles={["frontdesk", "admin"]}>
                  <FrontdeskPage />
                </ProtectedRoute>
              }
            />

            {/* Admin routes */}
            <Route
              path="/admin"
              element={
                <ProtectedRoute roles={["admin"]}>
                  <AdminDashboardPage />
                </ProtectedRoute>
              }
            />


            {/* Error pages */}
            <Route path="/not-authorized" element={<NotAuthorizedPage />} />
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </main>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
