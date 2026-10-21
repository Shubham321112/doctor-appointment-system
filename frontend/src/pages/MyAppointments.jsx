
import { useCallback, useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import Header from "../components/Header";
import { logout } from "../store/authSlice";

function MyAppointments() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { token, user } = useSelector((state) => state.auth);

  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [cancellingId, setCancellingId] = useState(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [selectedYear, setSelectedYear] = useState("all");

  const handleLogout = () => {
    dispatch(logout());
    navigate("/", { replace: true });
  };

  const fetchAppointments = useCallback(async () => {
    if (!token) {
      setError("Please log in to view your appointments.");
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError("");
      const result = await api.getMyAppointments(token);
      setAppointments(result.appointments || []);
    } catch (err) {
      setError(err.message || "Failed to load appointments.");
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    fetchAppointments();
  }, [fetchAppointments]);

  const getYear = (dateValue) => {
    if (!dateValue) return "";
    const match = String(dateValue).match(/^(\d{4})/);
    if (match) return match[1];

    const date = new Date(dateValue);
    return Number.isNaN(date.getTime())
      ? ""
      : String(date.getFullYear());
  };

  const years = useMemo(() => {
    return [
      ...new Set(
        appointments.map((item) => getYear(item.date)).filter(Boolean)
      ),
    ].sort((a, b) => Number(b) - Number(a));
  }, [appointments]);

  const filteredAppointments = useMemo(() => {
    if (selectedYear === "all") return appointments;
    return appointments.filter(
      (item) => getYear(item.date) === selectedYear
    );
  }, [appointments, selectedYear]);

  const counts = useMemo(() => {
    const statusCount = (status) =>
      appointments.filter(
        (item) => item.status?.toLowerCase() === status
      ).length;

    return {
      total: appointments.length,
      pending: statusCount("pending"),
      confirmed: statusCount("confirmed"),
      cancelled: statusCount("cancelled"),
    };
  }, [appointments]);

  const handleCancelAppointment = async (appointmentId) => {
    if (
      !window.confirm(
        "Are you sure you want to cancel this appointment?"
      )
    ) {
      return;
    }

    try {
      setCancellingId(appointmentId);
      setError("");
      setSuccess("");

      const result = await api.cancelAppointment(appointmentId, token);
      setSuccess(result.message || "Appointment cancelled successfully.");
      await fetchAppointments();
    } catch (err) {
      setError(err.message || "Failed to cancel appointment.");
    } finally {
      setCancellingId(null);
    }
  };

  const formatDate = (value) => {
    if (!value) return "Date not provided";

    const date = new Date(`${value}`.slice(0, 10) + "T12:00:00");
    if (Number.isNaN(date.getTime())) return value;

    return date.toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  const statusStyle = (status) => {
    switch (status?.toLowerCase()) {
      case "confirmed":
        return "bg-emerald-50 text-emerald-700 ring-emerald-200";
      case "cancelled":
        return "bg-red-50 text-red-700 ring-red-200";
      case "completed":
        return "bg-blue-50 text-blue-700 ring-blue-200";
      default:
        return "bg-amber-50 text-amber-700 ring-amber-200";
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <Header user={user} onLogout={handleLogout} />

      <main className="mx-auto w-full max-w-7xl px-4 py-7 sm:px-6 sm:py-10 lg:px-8">
        <div className="mb-7 flex flex-wrap items-center gap-2 text-sm text-slate-500">
          <button
            onClick={() => navigate("/dashboard")}
            className="transition hover:text-teal-700"
          >
            Dashboard
          </button>
          <span>/</span>
          <span className="font-semibold text-teal-700">
            My Appointments
          </span>
        </div>

        <section className="relative mb-8 overflow-hidden rounded-3xl bg-gradient-to-br from-teal-800 via-teal-700 to-cyan-600 p-6 text-white shadow-lg sm:p-9 lg:p-10">
          <div className="pointer-events-none absolute -right-12 -top-16 h-64 w-64 rounded-full border-[35px] border-white/10" />
          <div className="pointer-events-none absolute -bottom-28 right-40 h-56 w-56 rounded-full bg-white/5" />

          <div className="relative flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
            <div className="max-w-2xl">
              <span className="inline-flex rounded-full border border-white/25 bg-white/10 px-3 py-1.5 text-xs font-semibold uppercase tracking-wider">
                Patient Portal
              </span>
              <h1 className="mt-5 text-3xl font-bold sm:text-4xl">
                My Appointments
              </h1>
              <p className="mt-3 text-sm leading-7 text-teal-50 sm:text-base">
                Hello, {user?.name?.trim().split(" ")[0] || "Patient"}.
                View your bookings, check their status, and manage
                upcoming visits from one place.
              </p>
            </div>

            <button
              onClick={() => navigate("/book-appointment")}
              className="relative shrink-0 rounded-xl bg-white px-5 py-3 font-bold text-teal-800 transition hover:-translate-y-0.5 hover:bg-teal-50"
            >
              + Book Appointment
            </button>
          </div>
        </section>

        {success && (
          <div
            role="status"
            className="mb-6 flex items-center gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-800"
          >
            <span className="text-xl">✓</span>
            <p className="font-semibold">{success}</p>
            <button
              onClick={() => setSuccess("")}
              className="ml-auto px-2 text-lg"
              aria-label="Dismiss success message"
            >
              ×
            </button>
          </div>
        )}

        {error && (
          <div
            role="alert"
            className="mb-6 flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700"
          >
            <span className="text-lg">!</span>
            <div>
              <p className="font-bold">Unable to complete request</p>
              <p className="mt-1">{error}</p>
            </div>
            <button
              onClick={() => setError("")}
              className="ml-auto px-2 text-lg"
              aria-label="Dismiss error"
            >
              ×
            </button>
          </div>
        )}

        <section className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {[
            {
              label: "Total Appointments",
              value: counts.total,
              icon: "▤",
              color: "bg-teal-50 text-teal-700",
            },
            {
              label: "Pending",
              value: counts.pending,
              icon: "◷",
              color: "bg-amber-50 text-amber-700",
            },
            {
              label: "Confirmed",
              value: counts.confirmed,
              icon: "✓",
              color: "bg-emerald-50 text-emerald-700",
            },
            {
              label: "Cancelled",
              value: counts.cancelled,
              icon: "×",
              color: "bg-red-50 text-red-700",
            },
          ].map((item) => (
            <article
              key={item.label}
              className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
            >
              <div className="flex items-center gap-4">
                <div
                  className={`flex h-12 w-12 items-center justify-center rounded-xl text-xl font-bold ${item.color}`}
                >
                  {item.icon}
                </div>
                <div>
                  <p className="text-sm text-slate-500">{item.label}</p>
                  <p className="mt-1 text-2xl font-bold text-slate-900">
                    {loading ? "—" : item.value}
                  </p>
                </div>
              </div>
            </article>
          ))}
        </section>

        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7">
          <div className="flex flex-col gap-4 border-b border-slate-100 pb-6 md:flex-row md:items-center md:justify-between">
            <div>
              <h2 className="text-xl font-bold text-slate-900 sm:text-2xl">
                Your bookings
              </h2>
              <p className="mt-1 text-sm text-slate-500">
                Review the details and current status of each appointment.
              </p>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row">
              <label className="flex items-center gap-3 text-sm font-semibold text-slate-700">
                Year
                <select
                  value={selectedYear}
                  onChange={(event) => setSelectedYear(event.target.value)}
                  className="rounded-xl border border-slate-200 bg-white px-3 py-2.5 outline-none focus:border-teal-500 focus:ring-4 focus:ring-teal-500/10"
                >
                  <option value="all">All years</option>
                  {years.map((year) => (
                    <option key={year} value={year}>
                      {year}
                    </option>
                  ))}
                </select>
              </label>

              <button
                onClick={fetchAppointments}
                disabled={loading}
                className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:opacity-50"
              >
                {loading ? "Loading..." : "↻ Refresh"}
              </button>
            </div>
          </div>

          {loading && (
            <div className="py-16 text-center">
              <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-teal-100 border-t-teal-700" />
              <p className="mt-4 text-sm text-slate-500">
                Loading your appointments...
              </p>
            </div>
          )}

          {!loading && !error && filteredAppointments.length === 0 && (
            <div className="py-16 text-center">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-teal-50 text-3xl text-teal-700">
                ▤
              </div>
              <h3 className="mt-5 text-xl font-bold text-slate-900">
                {appointments.length === 0
                  ? "No appointments yet"
                  : "No appointments for this year"}
              </h3>
              <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">
                {appointments.length === 0
                  ? "When you book a consultation, its details will appear here."
                  : "Choose another year or view all appointments."}
              </p>

              {appointments.length === 0 ? (
                <button
                  onClick={() => navigate("/book-appointment")}
                  className="mt-6 rounded-xl bg-teal-700 px-5 py-3 text-sm font-bold text-white transition hover:bg-teal-800"
                >
                  Book Your First Appointment →
                </button>
              ) : (
                <button
                  onClick={() => setSelectedYear("all")}
                  className="mt-6 rounded-xl border border-slate-200 px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                >
                  Show All Years
                </button>
              )}
            </div>
          )}

          {!loading && !error && filteredAppointments.length > 0 && (
            <div className="space-y-4 pt-6">
              {filteredAppointments.map((appointment) => {
                const status = appointment.status?.toLowerCase() || "pending";

                return (
                  <article
                    key={appointment._id}
                    className="group rounded-2xl border border-slate-200 bg-white p-5 transition hover:border-teal-200 hover:shadow-md sm:p-6"
                  >
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                      <div className="flex min-w-0 items-start gap-4">
                        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-teal-50 text-xl text-teal-700">
                          +
                        </div>
                        <div className="min-w-0">
                          <p className="text-xs font-bold uppercase tracking-wider text-teal-700">
                            Consultation
                          </p>
                          <h3 className="mt-1 break-words text-lg font-bold text-slate-900 sm:text-xl">
                            {appointment.doctor || "Doctor"}
                          </h3>
                          <p className="mt-1 text-sm text-slate-500">
                            Appointment ID: {appointment._id}
                          </p>
                        </div>
                      </div>

                      <span
                        className={`w-fit shrink-0 rounded-full px-3 py-1.5 text-xs font-bold capitalize ring-1 ring-inset ${statusStyle(status)}`}
                      >
                        {appointment.status || "Pending"}
                      </span>
                    </div>

                    <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                      <div className="rounded-xl bg-slate-50 p-4">
                        <p className="text-xs font-medium text-slate-500">
                          Date
                        </p>
                        <p className="mt-2 text-sm font-bold text-slate-800">
                          {formatDate(appointment.date)}
                        </p>
                      </div>

                      <div className="rounded-xl bg-slate-50 p-4">
                        <p className="text-xs font-medium text-slate-500">
                          Time
                        </p>
                        <p className="mt-2 text-sm font-bold text-slate-800">
                          {appointment.time || "Not provided"}
                        </p>
                      </div>

                      <div className="rounded-xl bg-slate-50 p-4">
                        <p className="text-xs font-medium text-slate-500">
                          Status
                        </p>
                        <p className="mt-2 text-sm font-bold capitalize text-slate-800">
                          {appointment.status || "Pending"}
                        </p>
                      </div>
                    </div>

                    {appointment.reason && (
                      <div className="mt-4 rounded-xl border border-slate-100 p-4">
                        <p className="text-xs font-bold uppercase tracking-wider text-slate-500">
                          Additional comments
                        </p>
                        <p className="mt-2 whitespace-pre-wrap break-words text-sm leading-6 text-slate-700">
                          {appointment.reason}
                        </p>
                      </div>
                    )}

                    {status === "pending" && (
                      <div className="mt-5 flex justify-end border-t border-slate-100 pt-4">
                        <button
                          onClick={() =>
                            handleCancelAppointment(appointment._id)
                          }
                          disabled={cancellingId === appointment._id}
                          className="rounded-xl border border-red-200 px-4 py-2.5 text-sm font-bold text-red-600 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          {cancellingId === appointment._id
                            ? "Cancelling..."
                            : "Cancel Appointment"}
                        </button>
                      </div>
                    )}
                  </article>
                );
              })}
            </div>
          )}

          {!loading && !error && appointments.length > 0 && (
            <p className="mt-6 border-t border-slate-100 pt-4 text-xs text-slate-400">
              Showing {filteredAppointments.length} of {appointments.length} appointments
            </p>
          )}
        </section>

        <footer className="py-8 text-center text-xs text-slate-400">
          MediCare Patient Portal · Your healthcare, made simpler.
        </footer>
      </main>
    </div>
  );
}

export default MyAppointments;
