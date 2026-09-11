import { Routes, Route, Navigate } from "react-router-dom";
import { useSelector } from "react-redux";

import Login from "../pages/Login";
import Signup from "../pages/Signup";
import Dashboard from "../pages/Dashboard";
import BookAppointment from "../pages/BookAppointment";
import MyAppointments from "../pages/MyAppointments";
import DoctorDashboard from "../pages/DoctorDashboard";
import AdminDashboard from "../pages/AdminDashboard";
import Profile from "../pages/profile";

// ================= PROTECTED ROUTE =================
function ProtectedRoute({ children }) {
  const { isAuthenticated } = useSelector(
    (state) => state.auth
  );

  if (!isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  return children;
}

// ================= PATIENT ROUTE =================
function PatientRoute({ children }) {
  const { isAuthenticated, user } = useSelector(
    (state) => state.auth
  );

  if (!isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  if (user?.role !== "patient") {
    return <Navigate to="/doctor-dashboard" replace />;
  }

  return children;
}

// ================= DOCTOR ROUTE =================
function DoctorRoute({ children }) {
  const { isAuthenticated, user } = useSelector(
    (state) => state.auth
  );

  if (!isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  if (user?.role !== "doctor") {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
}

// ================= ADMIN ROUTE =================
function AdminRoute({ children }) {
  const { isAuthenticated, user } = useSelector(
    (state) => state.auth
  );

  if (!isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  if (user?.role !== "admin") {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
}

// ================= APP ROUTES =================
function AppRoutes() {
  return (
    <Routes>

      {/* ================= AUTHENTICATION ================= */}

      <Route
        path="/"
        element={<Login />}
      />

      <Route
        path="/signup"
        element={<Signup />}
      />


      {/* ================= PATIENT ROUTES ================= */}

      <Route
        path="/dashboard"
        element={
          <PatientRoute>
            <Dashboard />
          </PatientRoute>
        }
      />

      <Route
        path="/book-appointment"
        element={
          <PatientRoute>
            <BookAppointment />
          </PatientRoute>
        }
      />

      <Route
        path="/my-appointments"
        element={
          <PatientRoute>
            <MyAppointments />
          </PatientRoute>
        }
      />


      {/* ================= DOCTOR ROUTE ================= */}

      <Route
        path="/doctor-dashboard"
        element={
          <DoctorRoute>
            <DoctorDashboard />
          </DoctorRoute>
        }
      />


      {/* ================= ADMIN ROUTE ================= */}

      <Route
        path="/admin-dashboard"
        element={
          <AdminRoute>
            <AdminDashboard />
          </AdminRoute>
        }
      />


      {/* ================= PROFILE ================= */}

      <Route
        path="/profile"
        element={
          <ProtectedRoute>
            <Profile />
          </ProtectedRoute>
        }
      />


      {/* ================= INVALID URL ================= */}

      <Route
        path="*"
        element={<Navigate to="/" replace />}
      />

    </Routes>
  );
}

export default AppRoutes;