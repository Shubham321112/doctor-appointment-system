import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";

import api from "../services/api";
import { logout } from "../store/authSlice";

function DoctorDashboard() {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const { user, token } = useSelector(
    (state) => state.auth
  );

  const [appointments, setAppointments] = useState([]);
  const [doctor, setDoctor] = useState(null);

  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState(null);

  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const fetchDoctorData = async () => {
    try {
      setLoading(true);
      setError("");

      const result =
        await api.getDoctorAppointments(token);

      setAppointments(
        result.appointments || []
      );

      setDoctor(result.doctor || null);
    } catch (err) {
      setError(
        err.message ||
          "Failed to load doctor dashboard"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!token) {
      navigate("/");
      return;
    }

    if (user?.role !== "doctor") {
      navigate("/dashboard");
      return;
    }

    fetchDoctorData();
  }, [token, user, navigate]);

  const handleStatusUpdate = async (
    appointmentId,
    status
  ) => {
    const actionText =
      status === "confirmed"
        ? "confirm"
        : "cancel";

    const confirmAction = window.confirm(
      `Are you sure you want to ${actionText} this appointment?`
    );

    if (!confirmAction) return;

    try {
      setUpdatingId(appointmentId);
      setError("");
      setMessage("");

      const result =
        await api.updateAppointmentStatus(
          appointmentId,
          status,
          token
        );

      setMessage(
        result.message ||
          `Appointment ${status} successfully`
      );

      await fetchDoctorData();
    } catch (err) {
      setError(
        err.message ||
          "Failed to update appointment"
      );
    } finally {
      setUpdatingId(null);
    }
  };

  const handleLogout = () => {
    dispatch(logout());
    navigate("/");
  };

  const pendingAppointments =
    appointments.filter(
      (appointment) =>
        appointment.status === "pending"
    );

  const confirmedAppointments =
    appointments.filter(
      (appointment) =>
        appointment.status === "confirmed"
    );

  const cancelledAppointments =
    appointments.filter(
      (appointment) =>
        appointment.status === "cancelled"
    );

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center px-4">
        <div className="bg-white rounded-2xl shadow-lg p-8 text-center">
          <div className="text-5xl mb-4 animate-pulse">
            🩺
          </div>

          <h2 className="text-xl font-bold text-gray-800">
            Loading Doctor Dashboard...
          </h2>

          <p className="text-gray-500 mt-2">
            Please wait a moment.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* ================= NAVBAR ================= */}
      <nav className="bg-blue-600 text-white shadow-lg sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 py-4">
            <button
              onClick={() =>
                navigate("/doctor-dashboard")
              }
              className="text-left"
            >
              <h1 className="text-xl sm:text-2xl font-bold">
                🩺 Doctor Appointment System
              </h1>

              <p className="text-blue-100 text-sm mt-1">
                Doctor Portal
              </p>
            </button>

            <div className="flex flex-wrap items-center gap-2 sm:gap-3">
              <div className="text-right mr-1">
                <p className="font-semibold">
                  {doctor?.name ||
                    user?.name ||
                    "Doctor"}
                </p>

                <p className="text-xs text-blue-100">
                  Medical Professional
                </p>
              </div>

              <button
                onClick={() =>
                  navigate("/profile")
                }
                className="px-4 py-2 bg-white text-blue-600 rounded-lg font-semibold hover:bg-blue-50 transition"
              >
                👤 Profile
              </button>

              <button
                onClick={handleLogout}
                className="px-4 py-2 bg-red-500 hover:bg-red-600 rounded-lg font-semibold transition"
              >
                🚪 Logout
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* ================= MAIN ================= */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* ================= HEADER ================= */}
        <section className="bg-white rounded-2xl shadow-lg p-6 md:p-8 mb-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-5">
            <div>
              <p className="text-blue-600 font-semibold">
                Doctor Dashboard
              </p>

              <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mt-1">
                Welcome,{" "}
                {doctor?.name ||
                  user?.name ||
                  "Doctor"}{" "}
                👨‍⚕️
              </h2>

              <p className="text-gray-500 mt-2">
                Manage your appointments and check
                your availability from one place.
              </p>
            </div>

            <button
              onClick={fetchDoctorData}
              disabled={loading}
              className="px-5 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 disabled:opacity-50 font-semibold transition"
            >
              🔄 Refresh Dashboard
            </button>
          </div>
        </section>

        {/* ================= MESSAGES ================= */}
        {message && (
          <div className="mb-6 p-4 bg-green-100 border border-green-300 text-green-700 rounded-xl">
            <div className="flex gap-3 items-start">
              <span className="text-xl">
                ✅
              </span>

              <div>
                <p className="font-semibold">
                  {message}
                </p>

                <p className="text-sm mt-1">
                  Appointment information has been
                  updated.
                </p>
              </div>
            </div>
          </div>
        )}

        {error && (
          <div className="mb-6 p-4 bg-red-100 border border-red-300 text-red-700 rounded-xl">
            <div className="flex gap-3 items-start">
              <span className="text-xl">
                ⚠️
              </span>

              <div>
                <p className="font-semibold">
                  Something went wrong
                </p>

                <p className="text-sm mt-1">
                  {error}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* ================= DOCTOR INFORMATION ================= */}
        <section className="bg-white rounded-2xl shadow-lg p-6 md:p-8 mb-8">
          <div className="mb-6">
            <p className="text-blue-600 font-semibold">
              My Profile
            </p>

            <h2 className="text-2xl font-bold text-gray-800 mt-1">
              Doctor Information
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            <div className="bg-blue-50 border border-blue-100 rounded-xl p-5">
              <p className="text-sm text-gray-500">
                Doctor Name
              </p>

              <p className="text-lg font-bold text-gray-800 mt-2">
                👨‍⚕️{" "}
                {doctor?.name ||
                  user?.name ||
                  "-"}
              </p>
            </div>

            <div className="bg-blue-50 border border-blue-100 rounded-xl p-5">
              <p className="text-sm text-gray-500">
                Email Address
              </p>

              <p className="font-bold text-gray-800 mt-2 break-all">
                📧 {doctor?.email || "-"}
              </p>
            </div>

            <div className="bg-blue-50 border border-blue-100 rounded-xl p-5">
              <p className="text-sm text-gray-500">
                Contact Number
              </p>

              <p className="font-bold text-gray-800 mt-2">
                📱 {doctor?.contact || "-"}
              </p>
            </div>
          </div>
        </section>

        {/* ================= STATISTICS ================= */}
        <section className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-5 mb-8">
          <div className="bg-white rounded-2xl shadow p-5 border-l-4 border-blue-600">
            <div className="flex items-center justify-between">
              <p className="text-gray-500 text-sm">
                Total
              </p>

              <span className="text-2xl">
                📋
              </span>
            </div>

            <h2 className="text-3xl font-bold text-blue-600 mt-3">
              {appointments.length}
            </h2>

            <p className="text-xs text-gray-400 mt-1">
              All appointments
            </p>
          </div>

          <div className="bg-white rounded-2xl shadow p-5 border-l-4 border-yellow-500">
            <div className="flex items-center justify-between">
              <p className="text-gray-500 text-sm">
                Pending
              </p>

              <span className="text-2xl">
                ⏳
              </span>
            </div>

            <h2 className="text-3xl font-bold text-yellow-600 mt-3">
              {pendingAppointments.length}
            </h2>

            <p className="text-xs text-gray-400 mt-1">
              Need your action
            </p>
          </div>

          <div className="bg-white rounded-2xl shadow p-5 border-l-4 border-green-500">
            <div className="flex items-center justify-between">
              <p className="text-gray-500 text-sm">
                Confirmed
              </p>

              <span className="text-2xl">
                ✅
              </span>
            </div>

            <h2 className="text-3xl font-bold text-green-600 mt-3">
              {confirmedAppointments.length}
            </h2>

            <p className="text-xs text-gray-400 mt-1">
              Approved appointments
            </p>
          </div>

          <div className="bg-white rounded-2xl shadow p-5 border-l-4 border-red-500">
            <div className="flex items-center justify-between">
              <p className="text-gray-500 text-sm">
                Cancelled
              </p>

              <span className="text-2xl">
                ❌
              </span>
            </div>

            <h2 className="text-3xl font-bold text-red-600 mt-3">
              {cancelledAppointments.length}
            </h2>

            <p className="text-xs text-gray-400 mt-1">
              Cancelled appointments
            </p>
          </div>
        </section>

        {/* ================= AVAILABILITY ================= */}
        <section className="bg-white rounded-2xl shadow-lg p-6 md:p-8 mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6">
            <div>
              <p className="text-purple-600 font-semibold">
                Schedule
              </p>

              <h2 className="text-2xl font-bold text-gray-800 mt-1">
                My Availability
              </h2>

              <p className="text-gray-500 text-sm mt-1">
                Your currently configured working
                days and time slots.
              </p>
            </div>

            <span className="px-4 py-2 bg-purple-100 text-purple-700 rounded-full text-sm font-semibold">
              {doctor?.availability?.length || 0}{" "}
              working days
            </span>
          </div>

          {!doctor?.availability ||
          doctor.availability.length === 0 ? (
            <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-5">
              <div className="flex gap-3">
                <span className="text-2xl">
                  ⚠️
                </span>

                <div>
                  <h3 className="font-bold text-yellow-800">
                    No availability set
                  </h3>

                  <p className="text-sm text-yellow-700 mt-1">
                    Your working schedule has not
                    been configured yet. Please
                    contact the administrator.
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {doctor.availability.map(
                (item) => (
                  <div
                    key={item.day}
                    className="border border-purple-100 bg-purple-50 rounded-xl p-5"
                  >
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="font-bold text-lg text-purple-800">
                        📅 {item.day}
                      </h3>

                      <span className="text-xs bg-white text-purple-600 px-2 py-1 rounded-full font-semibold">
                        {item.slots?.length || 0}{" "}
                        slots
                      </span>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      {item.slots?.length ? (
                        item.slots.map(
                          (slot) => (
                            <span
                              key={slot}
                              className="bg-white border border-purple-200 text-purple-700 px-3 py-1.5 rounded-lg text-sm font-medium"
                            >
                              🕐 {slot}
                            </span>
                          )
                        )
                      ) : (
                        <span className="text-sm text-gray-500">
                          No time slots
                        </span>
                      )}
                    </div>
                  </div>
                )
              )}
            </div>
          )}
        </section>

        {/* ================= APPOINTMENTS ================= */}
        <section className="bg-white rounded-2xl shadow-lg p-6 md:p-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
            <div>
              <p className="text-green-600 font-semibold">
                Appointment Management
              </p>

              <h2 className="text-2xl font-bold text-gray-800 mt-1">
                My Appointments
              </h2>

              <p className="text-gray-500 mt-1">
                Review and manage appointments
                assigned to you.
              </p>
            </div>

            <button
              onClick={fetchDoctorData}
              disabled={loading}
              className="px-5 py-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 disabled:opacity-50 font-semibold transition"
            >
              🔄 Refresh
            </button>
          </div>

          {appointments.length === 0 ? (
            <div className="text-center py-14 bg-gray-50 rounded-2xl border border-dashed border-gray-300">
              <div className="text-5xl mb-4">
                📅
              </div>

              <h3 className="text-xl font-bold text-gray-700">
                No appointments yet
              </h3>

              <p className="text-gray-500 mt-2">
                Patient appointments will appear
                here after they book with you.
              </p>
            </div>
          ) : (
            <div className="space-y-5">
              {appointments.map(
                (appointment) => {
                  const isUpdating =
                    updatingId ===
                    appointment._id;

                  return (
                    <div
                      key={appointment._id}
                      className="border border-gray-200 rounded-2xl overflow-hidden hover:shadow-md transition"
                    >
                      {/* Appointment Top */}
                      <div className="bg-gray-50 p-5">
                        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                          <div>
                            <div className="flex items-center gap-3">
                              <div className="w-11 h-11 rounded-full bg-blue-100 flex items-center justify-center text-xl">
                                👤
                              </div>

                              <div>
                                <h3 className="text-lg font-bold text-gray-800">
                                  {appointment
                                    .patient
                                    ?.name ||
                                    "Unknown Patient"}
                                </h3>

                                <p className="text-sm text-gray-500">
                                  Patient
                                </p>
                              </div>
                            </div>
                          </div>

                          <span
                            className={`self-start lg:self-auto px-4 py-2 rounded-full text-sm font-bold capitalize ${
                              appointment.status ===
                              "pending"
                                ? "bg-yellow-100 text-yellow-700"
                                : appointment.status ===
                                  "confirmed"
                                ? "bg-green-100 text-green-700"
                                : "bg-red-100 text-red-700"
                            }`}
                          >
                            {appointment.status ===
                            "pending"
                              ? "⏳ Pending"
                              : appointment.status ===
                                "confirmed"
                              ? "✅ Confirmed"
                              : "❌ Cancelled"}
                          </span>
                        </div>
                      </div>

                      {/* Patient Details */}
                      <div className="p-5">
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-5">
                          <div className="bg-gray-50 rounded-xl p-4">
                            <p className="text-xs text-gray-500">
                              Patient Name
                            </p>

                            <p className="font-semibold text-gray-800 mt-1">
                              {appointment
                                .patient
                                ?.name ||
                                "Unknown"}
                            </p>
                          </div>

                          <div className="bg-gray-50 rounded-xl p-4">
                            <p className="text-xs text-gray-500">
                              Email
                            </p>

                            <p className="font-semibold text-gray-800 mt-1 break-all">
                              {appointment
                                .patient
                                ?.email ||
                                "Not available"}
                            </p>
                          </div>

                          <div className="bg-gray-50 rounded-xl p-4">
                            <p className="text-xs text-gray-500">
                              Contact
                            </p>

                            <p className="font-semibold text-gray-800 mt-1">
                              {appointment
                                .patient
                                ?.contact ||
                                "Not available"}
                            </p>
                          </div>

                          <div className="bg-gray-50 rounded-xl p-4">
                            <p className="text-xs text-gray-500">
                              Reason
                            </p>

                            <p className="font-semibold text-gray-800 mt-1">
                              {appointment.reason ||
                                "Not provided"}
                            </p>
                          </div>
                        </div>

                        {/* Date Time */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-5">
                          <div className="bg-blue-50 border border-blue-100 rounded-xl p-5">
                            <p className="text-sm text-gray-500">
                              Appointment Date
                            </p>

                            <p className="font-bold text-xl text-blue-700 mt-2">
                              📅{" "}
                              {appointment.date}
                            </p>
                          </div>

                          <div className="bg-purple-50 border border-purple-100 rounded-xl p-5">
                            <p className="text-sm text-gray-500">
                              Appointment Time
                            </p>

                            <p className="font-bold text-xl text-purple-700 mt-2">
                              🕐{" "}
                              {appointment.time}
                            </p>
                          </div>
                        </div>

                        {/* Appointment ID */}
                        <div className="mb-5">
                          <p className="text-xs text-gray-400 break-all">
                            Appointment ID:{" "}
                            {appointment._id}
                          </p>
                        </div>

                        {/* Actions */}
                        <div className="flex flex-col sm:flex-row gap-3">
                          {appointment.status ===
                            "pending" && (
                            <>
                              <button
                                onClick={() =>
                                  handleStatusUpdate(
                                    appointment._id,
                                    "confirmed"
                                  )
                                }
                                disabled={
                                  isUpdating
                                }
                                className="flex-1 px-5 py-3 bg-green-600 text-white rounded-xl hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed font-bold transition"
                              >
                                {isUpdating
                                  ? "⏳ Updating..."
                                  : "✅ Confirm Appointment"}
                              </button>

                              <button
                                onClick={() =>
                                  handleStatusUpdate(
                                    appointment._id,
                                    "cancelled"
                                  )
                                }
                                disabled={
                                  isUpdating
                                }
                                className="flex-1 px-5 py-3 bg-red-500 text-white rounded-xl hover:bg-red-600 disabled:opacity-50 disabled:cursor-not-allowed font-bold transition"
                              >
                                {isUpdating
                                  ? "⏳ Updating..."
                                  : "❌ Cancel Appointment"}
                              </button>
                            </>
                          )}

                          {appointment.status ===
                            "confirmed" && (
                            <div className="w-full flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 bg-green-50 border border-green-200 rounded-xl px-5 py-4">
                              <div>
                                <p className="font-bold text-green-700">
                                  ✅ Appointment
                                  Confirmed
                                </p>

                                <p className="text-sm text-green-600 mt-1">
                                  This appointment is
                                  currently confirmed.
                                </p>
                              </div>

                              <button
                                onClick={() =>
                                  handleStatusUpdate(
                                    appointment._id,
                                    "cancelled"
                                  )
                                }
                                disabled={
                                  isUpdating
                                }
                                className="px-5 py-2.5 bg-red-500 text-white rounded-lg hover:bg-red-600 disabled:opacity-50 font-semibold"
                              >
                                {isUpdating
                                  ? "Updating..."
                                  : "Cancel Appointment"}
                              </button>
                            </div>
                          )}

                          {appointment.status ===
                            "cancelled" && (
                            <div className="w-full bg-red-50 border border-red-200 rounded-xl px-5 py-4">
                              <p className="font-bold text-red-700">
                                ❌ Appointment
                                Cancelled
                              </p>

                              <p className="text-sm text-red-600 mt-1">
                                This appointment has
                                been cancelled.
                              </p>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                }
              )}
            </div>
          )}
        </section>

        {/* ================= FOOTER INFO ================= */}
        <div className="mt-8 text-center text-sm text-gray-400">
          <p>
            🩺 Doctor Appointment System
          </p>

          <p className="mt-1">
            Manage your appointments efficiently
            and provide better patient care.
          </p>
        </div>
      </main>
    </div>
  );
}

export default DoctorDashboard;