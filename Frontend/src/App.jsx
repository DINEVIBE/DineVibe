import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";

import Login from "./pages/Login";
import MFA from "./pages/MFA";
import InfluencerLogin from "./pages/InfluencerLogin";
import SetPassword from "./pages/SetPassword";
import Layout from "./Layout/Layout";
import MenuManagement from "./pages/MenuManagement";
import DashboardHome from "./pages/DashboardHome";
import Reservations from "./pages/Reservations";
import Staff from "./pages/Staff";
import Analytics from "./pages/Analytics";
import CRM from "./pages/CRM"; 
import Settings from "./pages/Settings";
import Audit from "./pages/Audit";

import "./styles/main.css";

function App() {

  const getToken = () => localStorage.getItem("access_token");

  const getRole = () => {
    const role = localStorage.getItem("role");
    return role ? role.toUpperCase().trim() : null;
  };

  const ProtectedRoute = ({ children }) => {
    if (!getToken()) {
      return <Navigate to="/login" replace />;
    }
    return children;
  };

  const RoleProtectedRoute = ({ children, allowedRoles }) => {
    const token = getToken();
    const role = getRole();

    if (!token) {
      return <Navigate to="/login" replace />;
    }

    if (!role) {
      // role missing means broken login — force re-login
      return <Navigate to="/login" replace />;
    }

    const normalizedAllowed = allowedRoles.map(r => r.toUpperCase());

    if (!normalizedAllowed.includes(role)) {
      // user authenticated but not authorized
      return <Navigate to="/home/dashboard" replace />;
    }

    return children;
  };

  return (
    <Router>
      <Routes>

        <Route
          path="/"
          element={
            getToken()
              ? <Navigate to="/home/dashboard" replace />
              : <Navigate to="/login" replace />
          }
        />

        {/* Public Routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/mfa" element={<MFA />} />
        <Route path="/set-password" element={<SetPassword />} />
        <Route path="/influencer-login" element={<InfluencerLogin />} />

        {/* Protected Layout */}
        <Route
          path="/home"
          element={
            <ProtectedRoute>
              <Layout />
            </ProtectedRoute>
          }
        >
          <Route index element={<Navigate to="dashboard" replace />} />

          <Route path="dashboard" element={<DashboardHome />} />

          <Route
            path="menu-management"
            element={
                <MenuManagement />
            }
          />

          <Route path="reservations" element={<Reservations />} />
          <Route path="staff" element={<Staff />} />
          <Route path="analytics" element={<Analytics />} />
          <Route path="crm" element={<CRM />} />
          <Route path="settings" element={<Settings />} />
          <Route path="audit-logs" element={<Audit />} />
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />

      </Routes>
    </Router>
  );
}

export default App;
