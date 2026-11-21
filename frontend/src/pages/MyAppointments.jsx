
import { useCallback, useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import Header from "../components/Header";
import { logout } from "../store/authSlice";

const DOCTOR_IMAGES = [
  "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&w=1000&q=85",
  "https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?auto=format&fit=crop&w=1000&q=85",
  "https://images.unsplash.com/photo-1582750433449-648ed127bb54?auto=format&fit=crop&w=1000&q=85",
];

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

      setAppointments(
        Array.isArray(result.appointments) ? result.appointments : []
      );
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

    return Number.isNaN(date.getTime())
      ? ""
      : String(date.getFullYear());
  };

  const years = useMemo(
    () =>
      [
        ...new Set(
          appointments.map((item) => getYear(item.date)).filter(Boolean)
        ),
      ].sort((a, b) => Number(b) - Number(a)),
    [appointments]
  );

  const filteredAppointments = useMemo(
    () =>
      selectedYear === "all"
        ? appointments
        : appointments.filter(
            (item) => getYear(item.date) === selectedYear
          ),
    [appointments, selectedYear]
  );

  const counts = useMemo(() => {
    const count = (status) =>
      appointments.filter(
        (item) => item.status?.toLowerCase() === status
      ).length;

    return {
      total: appointments.length,
      pending: count("pending"),
      confirmed: count("confirmed"),
      cancelled: count("cancelled"),
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

      setSuccess(
        result.message || "Appointment cancelled successfully."
      );

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
        return "bg-emerald-100 text-emerald-800";
      case "cancelled":
        return "bg-rose-100 text-rose-700";
      case "completed":
        return "bg-blue-100 text-blue-800";
      default:
        return "bg-amber-100 text-amber-800";
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
    <div className="min-h-screen overflow-x-hidden bg-[#f3f5fa] text-slate-800">
      <Header user={user} onLogout={handleLogout} />

      <main className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <div className="mb-5 flex flex-wrap items-center gap-2 text-sm">
          <button
            type="button"
            onClick={() => navigate("/dashboard")}
            className="text-slate-500 hover:text-teal-700"
          >
            Dashboard
          </button>

          <span className="text-slate-300">/</span>

          <span className="font-bold text-slate-800">
            My Appointments
          </span>
        </div>

        <section className="relative mb-7 overflow-hidden rounded-3xl bg-gradient-to-r from-[#12394b] via-[#087a80] to-[#087f75] p-6 text-white shadow-lg sm:p-8 lg:p-10">
          <div className="pointer-events-none absolute -right-12 -top-20 h-64 w-64 rounded-full border-[35px] border-white/10" />

          <div className="relative flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
            <div className="max-w-2xl">
              <span className="inline-flex rounded-full border border-white/30 bg-white/10 px-3 py-1 text-xs font-bold tracking-widest">
                ● PATIENT PORTAL
              </span>

              <h1 className="mt-4 text-3xl font-extrabold leading-tight sm:text-4xl lg:text-5xl">
                Your health,{" "}
                <span className="text-teal-200">your schedule.</span>
              </h1>

              <p className="mt-3 max-w-xl text-sm leading-7 text-white/90 sm:text-base">
                Welcome back,{" "}
                {user?.name?.trim().split(" ")[0] || "Patient"}.
                Manage your consultations, check booking updates, and keep
                every upcoming visit organized in one place.
              </p>

              <div className="mt-5 flex flex-wrap gap-2 text-xs font-semibold sm:text-sm">
                <span className="rounded-xl border border-white/20 bg-white/10 px-3 py-2">
                  ✓ Appointment tracking
                </span>

                <span className="rounded-xl border border-white/20 bg-white/10 px-3 py-2">
                  ◷ Booking updates
                </span>
              </div>
            </div>

            <button
              type="button"
              onClick={() => navigate("/book-appointment")}
              className="shrink-0 rounded-xl bg-white px-5 py-3 font-bold text-teal-900 shadow transition hover:bg-teal-50"
            >
              + Book an appointment
            </button>
          </div>
        </section>

        {success && (
          <div
            role="status"
            className="mb-5 flex items-center justify-between gap-3 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-800"
          >
            <p>{success}</p>

            <button
              type="button"
              onClick={() => setSuccess("")}
              aria-label="Dismiss success message"
              className="text-xl"
            >
              ×
            </button>
          </div>
        )}

        {error && (
          <div
            role="alert"
            className="mb-5 rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-800"
          >
            <p className="font-bold">Something needs your attention</p>
            <p className="mt-1">{error}</p>

            {!loading && token && (
              <button
                type="button"
                onClick={fetchAppointments}
                className="mt-3 font-bold underline"
              >
                Try again
              </button>
            )}

            <button
              type="button"
              onClick={() => setError("")}
              className="ml-4 font-bold"
              aria-label="Dismiss error message"
            >
              ×
            </button>
          </div>
        )}

        <section className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {stats.map((item) => (
            <article
              key={item.label}
              className={`rounded-2xl border border-slate-200 border-t-4 ${item.accent} bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:shadow-md`}
            >
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-sm font-medium text-slate-500">
                    {item.label}
                  </p>

                  <p className="mt-2 text-3xl font-extrabold text-slate-900">
                    {loading ? "—" : item.value}
                  </p>

                  <p className="mt-1 text-xs text-slate-400">
                    All your bookings
                  </p>
                </div>

                <div
                  className={`flex h-12 w-12 items-center justify-center rounded-2xl text-2xl font-bold ${item.color}`}
                >
                  {item.icon}
                </div>
              </div>
            </article>
          ))}
        </section>

        <section className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
          <div className="flex flex-col gap-4 border-b border-slate-200 p-5 sm:p-6 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="text-xs font-extrabold uppercase tracking-widest text-teal-700">
                Appointment management
              </p>

              <h2 className="mt-2 text-2xl font-extrabold text-slate-900">
                Your bookings
              </h2>

              <p className="mt-2 text-sm text-slate-500">
                All your consultations and their latest status, together.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <label className="flex items-center gap-2 text-sm font-semibold text-slate-600">
                Year

                <select
                  value={selectedYear}
                  onChange={(event) => setSelectedYear(event.target.value)}
                  className="min-w-32 rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm font-semibold outline-none focus:border-teal-500"
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
                className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-bold text-slate-700 transition hover:bg-teal-50 disabled:opacity-50"
              >
                <span className={loading ? "inline-block animate-spin" : ""}>
                  ↻
                </span>{" "}
                {loading ? "Loading..." : "Refresh"}
              </button>
            </div>
          </div>

          {loading && (
            <div className="px-5 py-16 text-center">
              <div className="mx-auto h-12 w-12 animate-spin rounded-full border-4 border-teal-100 border-t-teal-700" />
              <p className="mt-4 font-semibold">
                Loading your appointments...
              </p>
            </div>
          )}

          {!loading && !error && filteredAppointments.length === 0 && (
            <div className="px-5 py-16 text-center">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-teal-50 text-3xl text-teal-700">
                ▦
              </div>

              <h3 className="mt-5 text-xl font-extrabold text-slate-900">
                {appointments.length === 0
                  ? "Your next visit starts here"
                  : "No bookings for this year"}
              </h3>

              <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">
                {appointments.length === 0
                  ? "You haven't booked a consultation yet. Find a doctor and schedule your first appointment."
                  : "Try another year or switch back to all years."}
              </p>

              <button
                type="button"
                onClick={() =>
                  appointments.length === 0
                    ? navigate("/book-appointment")
                    : setSelectedYear("all")
                }
                className="mt-5 rounded-xl bg-teal-700 px-5 py-3 font-bold text-white hover:bg-teal-800"
              >
                {appointments.length === 0
                  ? "+ Book your first appointment"
                  : "Show all years"}
              </button>
            </div>
          )}

          {!loading && !error && filteredAppointments.length > 0 && (
            <div className="grid grid-cols-1 gap-6 p-4 sm:p-6 xl:grid-cols-2">
              {filteredAppointments.map((appointment) => {
                const status =
                  appointment.status?.toLowerCase() || "pending";

                const doctorDetails = appointment.doctorDetails || {};

                const doctorName =
                  doctorDetails.name || appointment.doctor || "Doctor";

                const department =
                  doctorDetails.specialization ||
                  appointment.department ||
                  appointment.specialization ||
                  appointment.specialty ||
                  "Medical Consultation";

                const rating =
                  doctorDetails.rating ??
                  appointment.rating ??
                  appointment.doctorRating ??
                  null;

                const meetingLink =
                  appointment.meetingLink ||
                  appointment.meetingUrl ||
                  appointment.meetingURL ||
                  "";

                // Prefer the real doctor image, then use the old fallback images.
                const appointmentIndex = appointments.findIndex(
                  (item) => item._id === appointment._id
                );

                const fallbackImage =
                  DOCTOR_IMAGES[
                    (appointmentIndex >= 0 ? appointmentIndex : 0) %
                      DOCTOR_IMAGES.length
                  ];

                const doctorImage =
                  doctorDetails.image ||
                  appointment.doctorImage ||
                  fallbackImage;

                const doctorInitials = doctorName
                  .split(" ")
                  .filter(Boolean)
                  .slice(0, 2)
                  .map((part) => part[0].toUpperCase())
                  .join("");

                return (
                  <article
                    key={appointment._id}
                    className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-lg"
                  >
                    <div className="relative flex h-48 items-center justify-center overflow-hidden bg-gradient-to-br from-teal-100 via-sky-100 to-slate-200 sm:h-56">
                      <img
                        src={doctorImage}
                        alt={`Doctor ${doctorName}`}
                        className="h-full w-full object-cover"
                        onError={(event) => {
                          const image = event.currentTarget;

                          if (image.dataset.fallbackApplied !== "true") {
                            image.dataset.fallbackApplied = "true";
                            image.src = fallbackImage;
                          } else if (image.src !== DOCTOR_IMAGES[0]) {
                            image.src = DOCTOR_IMAGES[0];
                          } else {
                            image.style.display = "none";
                          }
                        }}
                      />

                      <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/25 to-transparent" />

                      <span className="absolute right-4 top-4 rounded-lg bg-white/95 px-3 py-2 text-sm font-extrabold text-sky-700 shadow">
                        {formatDate(appointment.date)}
                      </span>

                      <span className="sr-only">
                        {doctorInitials || "DR"}
                      </span>
                    </div>

                    <div className="bg-sky-600 p-4 text-white sm:p-5">
                      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                        <div className="min-w-0 space-y-1 text-sm">
                          <p className="font-extrabold">Doctor Details</p>

                          <p className="break-words">
                            <span className="font-bold">Name:</span>{" "}
                            {doctorName}
                          </p>

                          <p className="break-words">
                            <span className="font-bold">Department:</span>{" "}
                            {department}
                          </p>

                          <p>
                            <span className="font-bold">Rating:</span>{" "}
                            {rating !== null && rating !== ""
                              ? `★ ${rating}`
                              : "Not rated"}
                          </p>

                          <p>
                            <span className="font-bold">Time:</span>{" "}
                            {appointment.time || "Not provided"}
                          </p>
                        </div>

                        {meetingLink ? (
                          <a
                            href={meetingLink}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex shrink-0 items-center justify-center rounded-full bg-white px-8 py-3 text-lg font-extrabold text-sky-700 shadow transition hover:bg-sky-50"
                          >
                            JOIN
                          </a>
                        ) : (
                          <button
                            type="button"
                            disabled
                            title="Meeting link has not been provided"
                            className="inline-flex shrink-0 cursor-not-allowed items-center justify-center rounded-full bg-white/80 px-8 py-3 text-lg font-extrabold text-sky-700 opacity-80"
                          >
                            JOIN
                          </button>
                        )}
                      </div>

                      <div className="mt-4 border-t border-white/25 pt-3">
                        <p className="break-words text-sm font-extrabold uppercase">
                          Patient Name: {user?.name || "Patient"}
                        </p>

                        <p className="mt-2 break-all text-xs text-white/80">
                          Booking ID: {appointment._id}
                        </p>
                      </div>
                    </div>

                    <div className="flex flex-col gap-3 bg-white p-4 sm:flex-row sm:items-center sm:justify-between">
                      <div className="flex flex-wrap items-center gap-2">
                        <span
                          className={`rounded-full px-3 py-1.5 text-xs font-extrabold capitalize ${statusStyle(status)}`}
                        >
                          ● {appointment.status || "Pending"}
                        </span>

                        <span className="text-xs text-slate-500">
                          {appointment.reason
                            ? `Reason: ${appointment.reason}`
                            : "Medical appointment"}
                        </span>
                      </div>

                      {status === "pending" && (
                        <button
                          type="button"
                          onClick={() =>
                            handleCancelAppointment(appointment._id)
                          }
                          disabled={cancellingId === appointment._id}
                          className="rounded-xl border border-rose-200 px-4 py-2.5 text-sm font-bold text-rose-600 transition hover:bg-rose-50 disabled:opacity-50"
                        >
                          {cancellingId === appointment._id
                            ? "Cancelling..."
                            : "Cancel appointment"}
                        </button>
                      )}
                    </div>
                  </article>
                );
              })}
            </div>
          )}

          {!loading && !error && appointments.length > 0 && (
            <div className="border-t border-slate-100 px-5 py-4 sm:px-7">
              <p className="text-xs font-medium text-slate-400">
                Showing {filteredAppointments.length} of{" "}
                {appointments.length} appointments
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
