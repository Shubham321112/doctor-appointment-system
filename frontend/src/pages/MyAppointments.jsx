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
      setAppointments([]);
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

  const getYear = (value) => {
    if (!value) return "";
    const match = String(value).match(/^(\d{4})/);
    if (match) return match[1];

    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? "" : String(date.getFullYear());
  };

  const years = useMemo(
    () =>
      [...new Set(appointments.map((item) => getYear(item.date)).filter(Boolean))]
        .sort((a, b) => Number(b) - Number(a)),
    [appointments]
  );

  const filteredAppointments = useMemo(
    () =>
      selectedYear === "all"
        ? appointments
        : appointments.filter((item) => getYear(item.date) === selectedYear),
    [appointments, selectedYear]
  );

  const counts = useMemo(() => {
    const count = (status) =>
      appointments.filter((item) => item.status?.toLowerCase() === status).length;

    return {
      total: appointments.length,
      pending: count("pending"),
      confirmed: count("confirmed"),
      cancelled: count("cancelled"),
    };
  }, [appointments]);

  const handleCancelAppointment = async (appointmentId) => {
    if (!window.confirm("Are you sure you want to cancel this appointment?")) {
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
        return "bg-emerald-50 text-emerald-700 ring-emerald-600/20";
      case "cancelled":
        return "bg-rose-50 text-rose-700 ring-rose-600/20";
      case "completed":
        return "bg-blue-50 text-blue-700 ring-blue-600/20";
      default:
        return "bg-amber-50 text-amber-700 ring-amber-600/20";
    }
  };

  const stats = [
    {
      label: "Total appointments",
      value: counts.total,
      icon: "▦",
      color: "bg-cyan-50 text-cyan-700",
      accent: "border-t-cyan-500",
    },
    {
      label: "Awaiting confirmation",
      value: counts.pending,
      icon: "◷",
      color: "bg-amber-50 text-amber-700",
      accent: "border-t-amber-400",
    },
    {
      label: "Confirmed visits",
      value: counts.confirmed,
      icon: "✓",
      color: "bg-emerald-50 text-emerald-700",
      accent: "border-t-emerald-500",
    },
    {
      label: "Cancelled visits",
      value: counts.cancelled,
      icon: "×",
      color: "bg-rose-50 text-rose-700",
      accent: "border-t-rose-500",
    },
  ];

  return (
    <div className="min-h-screen bg-[#f5f8fc] text-slate-800">
      <Header user={user} onLogout={handleLogout} />

      <main className="mx-auto max-w-7xl px-4 py-7 sm:px-6 lg:px-8">
        <div className="mb-7 flex flex-wrap items-center gap-2 text-sm">
          <button
            type="button"
            onClick={() => navigate("/dashboard")}
            className="text-slate-500 transition hover:text-teal-700"
          >
            Dashboard
          </button>
          <span className="text-slate-300">/</span>
          <span className="font-semibold text-slate-800">My Appointments</span>
        </div>

        <section className="relative isolate mb-8 overflow-hidden rounded-[28px] bg-gradient-to-br from-[#102a43] via-[#075e63] to-[#0d9488] p-6 text-white shadow-xl shadow-teal-950/10 sm:p-9 lg:p-10">
          <div className="pointer-events-none absolute -right-16 -top-24 -z-10 h-80 w-80 rounded-full border-[48px] border-white/[0.06]" />
          <div className="pointer-events-none absolute bottom-0 right-1/3 -z-10 h-40 w-40 rounded-full bg-cyan-300/10 blur-3xl" />

          <div className="flex flex-col gap-7 md:flex-row md:items-end md:justify-between">
            <div className="max-w-2xl">
              <span className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1.5 text-xs font-bold tracking-[0.16em] text-teal-50">
                <span className="h-2 w-2 rounded-full bg-emerald-300" />
                PATIENT PORTAL
              </span>

              <h1 className="mt-5 text-3xl font-extrabold tracking-tight sm:text-4xl lg:text-5xl">
                Your health, <span className="text-teal-200">your schedule.</span>
              </h1>

              <p className="mt-4 max-w-xl text-sm leading-7 text-teal-50/90 sm:text-base">
                Welcome back, {user?.name?.trim().split(" ")[0] || "Patient"}.
                Manage your consultations, check booking updates, and keep
                every upcoming visit organized in one place.
              </p>

              <div className="mt-6 flex flex-wrap gap-3 text-xs font-semibold sm:text-sm">
                <span className="rounded-xl border border-white/15 bg-white/10 px-3 py-2">
                  ✓ Appointment tracking
                </span>
                <span className="rounded-xl border border-white/15 bg-white/10 px-3 py-2">
                  ◷ Booking updates
                </span>
              </div>
            </div>

            <button
              type="button"
              onClick={() => navigate("/book-appointment")}
              className="inline-flex shrink-0 items-center justify-center gap-2 rounded-2xl bg-white px-5 py-3.5 text-sm font-bold text-teal-900 shadow-lg transition hover:-translate-y-0.5 hover:bg-teal-50 focus:outline-none focus:ring-4 focus:ring-white/30"
            >
              <span className="text-xl leading-none">+</span>
              Book an appointment
            </button>
          </div>
        </section>

        {success && (
          <div
            role="status"
            className="mb-6 flex items-start gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-800"
          >
            <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-emerald-100 font-bold">
              ✓
            </span>
            <p className="flex-1 pt-1 font-medium">{success}</p>
            <button
              type="button"
              onClick={() => setSuccess("")}
              className="px-2 text-lg leading-none"
              aria-label="Dismiss success message"
            >
              ×
            </button>
          </div>
        )}

        {error && (
          <div
            role="alert"
            className="mb-6 flex items-start gap-3 rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-800"
          >
            <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-rose-100 font-bold">
              !
            </span>
            <div className="flex-1">
              <p className="font-bold">Something needs your attention</p>
              <p className="mt-1 leading-6">{error}</p>
              {!loading && token && (
                <button
                  type="button"
                  onClick={fetchAppointments}
                  className="mt-3 font-bold underline underline-offset-4"
                >
                  Try again
                </button>
              )}
            </div>
            <button
              type="button"
              onClick={() => setError("")}
              className="px-2 text-lg leading-none"
              aria-label="Dismiss error message"
            >
              ×
            </button>
          </div>
        )}

        <section className="mb-9 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {stats.map((item) => (
            <article
              key={item.label}
              className={`group rounded-2xl border border-slate-200/80 border-t-[3px] ${item.accent} bg-white p-5 shadow-sm transition duration-200 hover:-translate-y-1 hover:shadow-lg hover:shadow-slate-900/[0.05]`}
            >
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-sm font-medium text-slate-500">{item.label}</p>
                  <p className="mt-3 text-3xl font-extrabold tracking-tight text-slate-900">
                    {loading ? "—" : item.value}
                  </p>
                  <p className="mt-1 text-xs text-slate-400">All your bookings</p>
                </div>
                <div
                  className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl text-2xl font-bold ${item.color}`}
                >
                  {item.icon}
                </div>
              </div>
            </article>
          ))}
        </section>

        <section className="overflow-hidden rounded-[26px] border border-slate-200/80 bg-white shadow-sm">
          <div className="flex flex-col gap-5 border-b border-slate-100 p-5 sm:p-7 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-teal-700">
                Appointment management
              </p>
              <h2 className="mt-2 text-2xl font-extrabold tracking-tight text-slate-900">
                Your bookings
              </h2>
              <p className="mt-2 text-sm leading-6 text-slate-500">
                All your consultations and their latest status, together.
              </p>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
              <label className="flex items-center gap-3 text-sm font-semibold text-slate-600">
                Year
                <select
                  value={selectedYear}
                  onChange={(event) => setSelectedYear(event.target.value)}
                  className="min-w-32 rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm font-semibold text-slate-700 outline-none transition focus:border-teal-500 focus:ring-4 focus:ring-teal-500/10"
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
                type="button"
                onClick={fetchAppointments}
                disabled={loading}
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-bold text-slate-700 transition hover:border-teal-200 hover:bg-teal-50 hover:text-teal-800 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <span className={loading ? "animate-spin" : ""}>↻</span>
                {loading ? "Loading..." : "Refresh"}
              </button>
            </div>
          </div>

          {loading && (
            <div className="px-5 py-20 text-center">
              <div className="mx-auto h-12 w-12 animate-spin rounded-full border-4 border-teal-100 border-t-teal-700" />
              <p className="mt-5 font-semibold text-slate-700">
                Loading your appointments
              </p>
              <p className="mt-1 text-sm text-slate-400">
                Please wait while we get your latest bookings.
              </p>
            </div>
          )}

          {!loading && !error && filteredAppointments.length === 0 && (
            <div className="px-5 py-20 text-center">
              <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-3xl bg-teal-50 text-4xl text-teal-700">
                ▦
              </div>
              <h3 className="mt-6 text-xl font-extrabold text-slate-900">
                {appointments.length === 0
                  ? "Your next visit starts here"
                  : "No bookings for this year"}
              </h3>
              <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">
                {appointments.length === 0
                  ? "You haven't booked a consultation yet. Find a doctor and schedule your first appointment."
                  : "Try another year or switch back to all years to find your appointments."}
              </p>

              {appointments.length === 0 ? (
                <button
                  type="button"
                  onClick={() => navigate("/book-appointment")}
                  className="mt-6 rounded-xl bg-teal-700 px-5 py-3 text-sm font-bold text-white shadow-sm transition hover:bg-teal-800 focus:outline-none focus:ring-4 focus:ring-teal-700/20"
                >
                  + Book your first appointment
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => setSelectedYear("all")}
                  className="mt-6 rounded-xl border border-slate-200 px-5 py-3 text-sm font-bold text-slate-700 transition hover:bg-slate-50"
                >
                  Show all years
                </button>
              )}
            </div>
          )}

          {!loading && !error && filteredAppointments.length > 0 && (
            <div className="space-y-4 p-4 sm:p-6">
              {filteredAppointments.map((appointment) => {
                const status = appointment.status?.toLowerCase() || "pending";

                return (
                  <article
                    key={appointment._id}
                    className="group rounded-2xl border border-slate-200 bg-white p-5 transition duration-200 hover:border-teal-200 hover:shadow-lg hover:shadow-slate-900/[0.04] sm:p-6"
                  >
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                      <div className="flex min-w-0 items-start gap-4">
                        <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-teal-50 to-cyan-100 text-2xl font-bold text-teal-700 ring-1 ring-teal-100">
                          +
                        </div>

                        <div className="min-w-0">
                          <p className="text-xs font-bold uppercase tracking-[0.16em] text-teal-700">
                            Medical consultation
                          </p>
                          <h3 className="mt-1 break-words text-lg font-extrabold text-slate-900 sm:text-xl">
                            {appointment.doctor || "Doctor"}
                          </h3>
                          <p className="mt-2 break-all text-xs text-slate-400">
                            Booking ID: {appointment._id}
                          </p>
                        </div>
                      </div>

                      <span
                        className={`w-fit shrink-0 rounded-full px-3.5 py-1.5 text-xs font-bold capitalize ring-1 ring-inset ${statusStyle(status)}`}
                      >
                        <span className="mr-1.5">●</span>
                        {appointment.status || "Pending"}
                      </span>
                    </div>

                    <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                      <div className="rounded-xl border border-slate-100 bg-slate-50/70 p-4">
                        <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                          Appointment date
                        </p>
                        <p className="mt-2 font-bold text-slate-900">
                          {formatDate(appointment.date)}
                        </p>
                      </div>

                      <div className="rounded-xl border border-slate-100 bg-slate-50/70 p-4">
                        <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                          Appointment time
                        </p>
                        <p className="mt-2 font-bold text-slate-900">
                          {appointment.time || "Not provided"}
                        </p>
                      </div>

                      <div className="rounded-xl border border-slate-100 bg-slate-50/70 p-4">
                        <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                          Current status
                        </p>
                        <p className="mt-2 font-bold capitalize text-slate-900">
                          {appointment.status || "Pending"}
                        </p>
                      </div>
                    </div>

                    {appointment.reason && (
                      <div className="mt-4 rounded-xl border border-slate-100 p-4">
                        <p className="text-xs font-bold uppercase tracking-wider text-slate-500">
                          Reason for visit
                        </p>
                        <p className="mt-2 whitespace-pre-wrap break-words text-sm leading-6 text-slate-700">
                          {appointment.reason}
                        </p>
                      </div>
                    )}

                    {status === "pending" && (
                      <div className="mt-5 flex justify-end border-t border-slate-100 pt-4">
                        <button
                          type="button"
                          onClick={() => handleCancelAppointment(appointment._id)}
                          disabled={cancellingId === appointment._id}
                          className="inline-flex items-center justify-center gap-2 rounded-xl border border-rose-200 px-4 py-2.5 text-sm font-bold text-rose-600 transition hover:border-rose-300 hover:bg-rose-50 focus:outline-none focus:ring-4 focus:ring-rose-100 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          {cancellingId === appointment._id ? (
                            <>
                              <span className="h-4 w-4 animate-spin rounded-full border-2 border-rose-200 border-t-rose-600" />
                              Cancelling...
                            </>
                          ) : (
                            "Cancel appointment"
                          )}
                        </button>
                      </div>
                    )}
                  </article>
                );
              })}
            </div>
          )}

          {!loading && !error && appointments.length > 0 && (
            <div className="border-t border-slate-100 px-5 py-4 sm:px-7">
              <p className="text-xs font-medium text-slate-400">
                Showing {filteredAppointments.length} of {appointments.length} appointments
              </p>
            </div>
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