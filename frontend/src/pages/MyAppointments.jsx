import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";

import api from "../services/api";
import { logout } from "../store/authSlice";

function MyAppointments() {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const { token, user } = useSelector(
    (state) => state.auth
  );

  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [cancellingId, setCancellingId] =
    useState(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // ===============================
  // Fetch Appointments
  // ===============================
  const fetchAppointments = async () => {
    try {
      setLoading(true);
      setError("");

      const result =
        await api.getMyAppointments(token);

      setAppointments(result.appointments || []);
    } catch (error) {
      setError(
        error.message ||
          "Failed to load appointments"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) {
      fetchAppointments();
    } else {
      setError("Please login first");
      setLoading(false);
    }
  }, [token]);

  // ===============================
  // Cancel Appointment
  // ===============================
  const handleCancelAppointment = async (
    appointmentId
  ) => {
    const confirmCancel = window.confirm(
      "Are you sure you want to cancel this appointment?"
    );

    if (!confirmCancel) {
      return;
    }

    try {
      setCancellingId(appointmentId);
      setError("");
      setSuccess("");

      const result =
        await api.cancelAppointment(
          appointmentId,
          token
        );

      setSuccess(
        result.message ||
          "Appointment cancelled successfully"
      );

      await fetchAppointments();
    } catch (error) {
      setError(
        error.message ||
          "Failed to cancel appointment"
      );
    } finally {
      setCancellingId(null);
    }
  };

  // ===============================
  // Logout
  // ===============================
  const handleLogout = () => {
    dispatch(logout());
    navigate("/");
  };

  // ===============================
  // Statistics
  // ===============================
  const pending = appointments.filter(
    (appointment) =>
      appointment.status?.toLowerCase() ===
      "pending"
  ).length;

  const confirmed = appointments.filter(
    (appointment) =>
      appointment.status?.toLowerCase() ===
      "confirmed"
  ).length;

  const cancelled = appointments.filter(
    (appointment) =>
      appointment.status?.toLowerCase() ===
      "cancelled"
  ).length;

  return (
    <div className="min-h-screen bg-gray-100">

      {/* Navbar */}
      <header className="bg-purple-600 text-white shadow-lg">
        <div className="max-w-7xl mx-auto px-6 md:px-10">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 py-5">

            <div>
              <h1 className="text-2xl font-bold">
                🩺 Doctor Appointment System
              </h1>

              <p className="text-purple-100 text-sm mt-1">
                Patient Portal
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">

              <button
                onClick={() =>
                  navigate("/dashboard")
                }
                className="bg-purple-700 hover:bg-purple-800 text-white px-4 py-2 rounded-lg font-medium transition"
              >
                🏠 Dashboard
              </button>

              <button
                onClick={() =>
                  navigate("/book-appointment")
                }
                className="bg-white text-purple-600 hover:bg-purple-50 px-4 py-2 rounded-lg font-semibold transition"
              >
                📅 Book
              </button>

              <button
                onClick={() =>
                  navigate("/profile")
                }
                className="bg-white text-purple-600 hover:bg-purple-50 px-4 py-2 rounded-lg font-semibold transition"
              >
                👤 Profile
              </button>

              <button
                onClick={handleLogout}
                className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg font-semibold transition"
              >
                🚪 Logout
              </button>

            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-6 md:px-10 py-10">

        {/* Welcome */}
        <div className="bg-white rounded-2xl shadow-lg p-6 md:p-8 mb-8">

          <p className="text-purple-600 font-semibold">
            Patient Portal
          </p>

          <h2 className="text-3xl font-bold text-gray-800 mt-1">
            My Appointments 📋
          </h2>

          <p className="text-gray-500 mt-2">
            View and track all your doctor appointments
            from one place.
          </p>

          {user?.name && (
            <p className="text-gray-600 mt-3">
              Patient:{" "}
              <span className="font-semibold text-gray-800">
                {user.name}
              </span>
            </p>
          )}

        </div>

        {/* Success Message */}
        {success && (
          <div className="bg-green-100 border border-green-300 text-green-700 px-5 py-4 rounded-xl mb-6">
            <div className="flex items-center gap-3">
              <span className="text-2xl">
                ✅
              </span>

              <p className="font-semibold">
                {success}
              </p>
            </div>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="bg-red-100 border border-red-300 text-red-700 px-5 py-4 rounded-xl mb-6">
            <div className="flex items-center gap-3">
              <span className="text-2xl">
                ⚠️
              </span>

              <div>
                <p className="font-semibold">
                  Unable to process request
                </p>

                <p className="text-sm mt-1">
                  {error}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Statistics */}
        {!loading &&
          !error &&
          appointments.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">

              <div className="bg-white rounded-2xl shadow p-6 border-l-4 border-purple-600">
                <p className="text-gray-500 font-medium">
                  Total Appointments
                </p>

                <h3 className="text-3xl font-bold text-purple-600 mt-2">
                  {appointments.length}
                </h3>
              </div>

              <div className="bg-white rounded-2xl shadow p-6 border-l-4 border-yellow-500">
                <p className="text-gray-500 font-medium">
                  Pending
                </p>

                <h3 className="text-3xl font-bold text-yellow-600 mt-2">
                  {pending}
                </h3>
              </div>

              <div className="bg-white rounded-2xl shadow p-6 border-l-4 border-green-500">
                <p className="text-gray-500 font-medium">
                  Confirmed
                </p>

                <h3 className="text-3xl font-bold text-green-600 mt-2">
                  {confirmed}
                </h3>
              </div>

              <div className="bg-white rounded-2xl shadow p-6 border-l-4 border-red-500">
                <p className="text-gray-500 font-medium">
                  Cancelled
                </p>

                <h3 className="text-3xl font-bold text-red-600 mt-2">
                  {cancelled}
                </h3>
              </div>

            </div>
          )}

        {/* Appointments */}
        <div className="bg-white rounded-2xl shadow-lg p-6 md:p-8">

          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">

            <div>
              <h2 className="text-2xl font-bold text-gray-800">
                Your Appointments
              </h2>

              <p className="text-gray-500 mt-1">
                Check your appointment details and status.
              </p>
            </div>

            <div className="flex gap-3">

              <button
                onClick={fetchAppointments}
                disabled={loading}
                className="bg-gray-800 hover:bg-gray-900 disabled:bg-gray-400 text-white px-5 py-2 rounded-lg font-semibold transition"
              >
                🔄{" "}
                {loading
                  ? "Loading..."
                  : "Refresh"}
              </button>

              <button
                onClick={() =>
                  navigate("/book-appointment")
                }
                className="bg-purple-600 hover:bg-purple-700 text-white px-5 py-2 rounded-lg font-semibold transition"
              >
                + Book
              </button>

            </div>
          </div>

          {/* Loading */}
          {loading && (
            <div className="text-center py-12">
              <div className="text-5xl mb-4">
                ⏳
              </div>

              <p className="text-gray-500 text-lg">
                Loading your appointments...
              </p>
            </div>
          )}

          {/* No Appointments */}
          {!loading &&
            !error &&
            appointments.length === 0 && (
              <div className="text-center py-14">

                <div className="text-6xl mb-5">
                  📅
                </div>

                <h3 className="text-2xl font-bold text-gray-700">
                  No appointments found
                </h3>

                <p className="text-gray-500 mt-2">
                  You haven't booked any appointment yet.
                </p>

                <button
                  onClick={() =>
                    navigate("/book-appointment")
                  }
                  className="mt-6 bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-xl font-semibold transition"
                >
                  📅 Book Your First Appointment
                </button>

              </div>
            )}

          {/* Appointment Cards */}
          {!loading &&
            !error &&
            appointments.length > 0 && (
              <div className="space-y-5">

                {appointments.map(
                  (appointment) => {

                    const status =
                      appointment.status?.toLowerCase();

                    return (
                      <div
                        key={appointment._id}
                        className="border border-gray-200 rounded-2xl p-6 hover:shadow-lg transition"
                      >

                        {/* Top */}
                        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-5">

                          <div>
                            <p className="text-sm text-purple-600 font-semibold mb-1">
                              Doctor
                            </p>

                            <h3 className="text-2xl font-bold text-gray-800">
                              {appointment.doctor}
                            </h3>
                          </div>

                          <span
                            className={`w-fit px-4 py-2 rounded-full text-sm font-semibold capitalize ${
                              status === "confirmed"
                                ? "bg-green-100 text-green-700"
                                : status === "cancelled"
                                ? "bg-red-100 text-red-700"
                                : "bg-yellow-100 text-yellow-700"
                            }`}
                          >
                            {appointment.status ||
                              "Pending"}
                          </span>

                        </div>

                        {/* Details */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-gray-50 rounded-xl p-5">

                          <div>
                            <p className="text-sm text-gray-500">
                              Appointment Date
                            </p>

                            <p className="font-semibold text-gray-800 mt-1">
                              📅 {appointment.date}
                            </p>
                          </div>

                          <div>
                            <p className="text-sm text-gray-500">
                              Appointment Time
                            </p>

                            <p className="font-semibold text-gray-800 mt-1">
                              🕐 {appointment.time}
                            </p>
                          </div>

                          <div>
                            <p className="text-sm text-gray-500">
                              Status
                            </p>

                            <p className="font-semibold text-gray-800 mt-1 capitalize">
                              {appointment.status ||
                                "Pending"}
                            </p>
                          </div>

                        </div>

                        {/* Reason */}
                        {appointment.reason && (
                          <div className="mt-5 bg-purple-50 border border-purple-100 rounded-xl p-4">

                            <p className="text-sm text-purple-600 font-semibold">
                              Reason for Visit
                            </p>

                            <p className="text-gray-700 mt-1">
                              📝 {appointment.reason}
                            </p>

                          </div>
                        )}

                        {/* Cancel Button */}
                        {status === "pending" && (
                          <div className="mt-5 flex justify-end">

                            <button
                              onClick={() =>
                                handleCancelAppointment(
                                  appointment._id
                                )
                              }
                              disabled={
                                cancellingId ===
                                appointment._id
                              }
                              className="bg-red-500 hover:bg-red-600 disabled:bg-gray-400 text-white px-5 py-2.5 rounded-lg font-semibold transition"
                            >
                              {cancellingId ===
                              appointment._id
                                ? "Cancelling..."
                                : "Cancel Appointment"}
                            </button>

                          </div>
                        )}

                      </div>
                    );
                  }
                )}

              </div>
            )}

        </div>

        {/* Bottom Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-8">

          <button
            onClick={() =>
              navigate("/dashboard")
            }
            className="border border-purple-600 text-purple-600 hover:bg-purple-50 py-3 rounded-xl font-semibold transition"
          >
            ← Back to Dashboard
          </button>

          <button
            onClick={() =>
              navigate("/book-appointment")
            }
            className="bg-purple-600 hover:bg-purple-700 text-white py-3 rounded-xl font-semibold transition"
          >
            📅 Book New Appointment
          </button>

        </div>

        {/* Information */}
        <div className="bg-purple-50 border border-purple-100 rounded-2xl p-5 mt-6">

          <div className="flex gap-4">

            <div className="text-2xl">
              💡
            </div>

            <div>
              <h4 className="font-bold text-gray-800">
                Appointment Information
              </h4>

              <p className="text-gray-600 text-sm mt-1">
                Pending appointments can be cancelled
                by you. Once an appointment is confirmed
                by the doctor, please contact the doctor
                if you need to cancel it.
              </p>
            </div>

          </div>

        </div>

      </main>
    </div>
  );
}

export default MyAppointments;