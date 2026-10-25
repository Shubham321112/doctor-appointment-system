
import { useCallback, useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";

import api from "../services/api";
import { logout } from "../store/authSlice";

function DoctorDashboard() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { user, token } = useSelector((state) => state.auth);

  const [appointments, setAppointments] = useState([]);
  const [doctor, setDoctor] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [updatingId, setUpdatingId] = useState(null);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");

  const fetchDoctorData = useCallback(
    async (showLoader = true) => {
      try {
        if (showLoader) setLoading(true);
        else setRefreshing(true);

        setError("");

        const result = await api.getDoctorAppointments(token);
        setAppointments(result.appointments || []);
        setDoctor(result.doctor || null);
      } catch (err) {
        setError(err.message || "Failed to load doctor dashboard.");
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [token]
  );

  useEffect(() => {
    if (!token) {
      navigate("/", { replace: true });
      return;
    }

    if (user?.role !== "doctor") {
      navigate("/dashboard", { replace: true });
      return;
    }

    fetchDoctorData();
  }, [token, user?.role, navigate, fetchDoctorData]);

  const handleStatusUpdate = async (appointmentId, status) => {
    const action = status === "confirmed" ? "confirm" : "cancel";

    if (!window.confirm(`Are you sure you want to ${action} this appointment?`)) {
      return;
    }

    try {
      setUpdatingId(appointmentId);
      setError("");
      setMessage("");

      const result = await api.updateAppointmentStatus(
        appointmentId,
        status,
        token
      );

      setMessage(result.message || `Appointment ${status} successfully.`);
      await fetchDoctorData(false);
    } catch (err) {
      setError(err.message || "Failed to update appointment.");
    } finally {
      setUpdatingId(null);
    }
  };

  const handleLogout = () => {
    dispatch(logout());
    navigate("/", { replace: true });
  };

  // Clean the doctor name so the "Dr." prefix is never duplicated.
  const rawDoctorName = doctor?.name || user?.name || "Doctor";
  const cleanDoctorName = rawDoctorName
    .replace(/^(dr\.?\s*)+/i, "")
    .trim();

  const doctorName = cleanDoctorName || "Doctor";
  const displayDoctorName = `Dr. ${doctorName}`;
  const firstName = doctorName.split(/\s+/)[0] || "Doctor";

  const pendingAppointments = appointments.filter(
    (item) => item.status === "pending"
  );
  const confirmedAppointments = appointments.filter(
    (item) => item.status === "confirmed"
  );
  const cancelledAppointments = appointments.filter(
    (item) => item.status === "cancelled"
  );

  const filteredAppointments = appointments.filter((appointment) => {
    const patient = appointment.patient || {};
    const query = search.trim().toLowerCase();

    const matchesSearch = [
      patient.name,
      patient.email,
      patient.contact,
      appointment.reason,
      appointment.date,
      appointment.time,
    ].some((value) => String(value || "").toLowerCase().includes(query));

    return (
      matchesSearch &&
      (filter === "all" || appointment.status === filter)
    );
  });

  if (loading) {
    return (
      <div className="flex min-h-screen w-full items-center justify-center bg-slate-50 px-4">
        <div className="w-full max-w-sm rounded-3xl border border-slate-200 bg-white p-9 text-center shadow-sm">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-teal-50 text-2xl font-bold text-teal-700">
            M+
          </div>
          <div className="mx-auto mt-6 h-8 w-8 animate-spin rounded-full border-4 border-slate-200 border-t-teal-600" />
          <h2 className="mt-5 text-xl font-bold text-slate-900">
            Loading your dashboard
          </h2>
          <p className="mt-2 text-sm text-slate-500">
            Please wait while we prepare your workspace.
          </p>
        </div>
      </div>
    );
  }

  const stats = [
    {
      label: "Total appointments",
      value: appointments.length,
      detail: "All appointment requests",
      icon: "▤",
      color: "blue",
      status: "all",
    },
    {
      label: "Pending",
      value: pendingAppointments.length,
      detail: "Awaiting your response",
      icon: "◷",
      color: "amber",
      status: "pending",
    },
    {
      label: "Confirmed",
      value: confirmedAppointments.length,
      detail: "Approved appointments",
      icon: "✓",
      color: "emerald",
      status: "confirmed",
    },
    {
      label: "Cancelled",
      value: cancelledAppointments.length,
      detail: "Cancelled appointments",
      icon: "×",
      color: "rose",
      status: "cancelled",
    },
  ];

  const statColors = {
    blue: {
      icon: "bg-blue-50 text-blue-700",
      number: "text-slate-900",
      accent: "bg-blue-500",
    },
    amber: {
      icon: "bg-amber-50 text-amber-700",
      number: "text-amber-700",
      accent: "bg-amber-500",
    },
    emerald: {
      icon: "bg-emerald-50 text-emerald-700",
      number: "text-emerald-700",
      accent: "bg-emerald-500",
    },
    rose: {
      icon: "bg-rose-50 text-rose-700",
      number: "text-rose-700",
      accent: "bg-rose-500",
    },
  };

  return (
    <div className="min-h-screen w-full min-w-0 overflow-x-clip bg-[#f5f7fb] text-slate-800">
      {/* Top navigation */}
      <header className="sticky top-0 z-40 w-full border-b border-slate-200/80 bg-white/95 backdrop-blur-xl">
        <div className="mx-auto flex w-full max-w-[1440px] flex-wrap items-center justify-between gap-4 px-4 py-3 sm:px-6 lg:px-10">
          <button
            type="button"
            onClick={() => navigate("/doctor-dashboard")}
            className="flex min-w-0 items-center gap-3 text-left"
          >
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-teal-700 text-lg font-black text-white shadow-md shadow-teal-900/15">
              M+
            </span>
            <span className="min-w-0">
              <span className="block text-xl font-extrabold tracking-tight text-slate-900">
                MediCare
              </span>
              <span className="block text-[10px] font-bold tracking-[0.2em] text-slate-500">
                DOCTOR WORKSPACE
              </span>
            </span>
          </button>

          <div className="flex flex-wrap items-center gap-2 sm:gap-3">
            <div className="mr-1 flex min-w-0 items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-teal-100 text-base font-bold text-teal-800">
                {doctorName.charAt(0).toUpperCase()}
              </div>
              <div className="max-w-36 sm:max-w-48">
                <p className="truncate text-sm font-bold text-slate-900">
                  {displayDoctorName}
                </p>
                <p className="text-xs text-slate-500">Medical professional</p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => navigate("/profile")}
              className="rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm font-semibold text-slate-700 hover:border-teal-300 hover:bg-teal-50 sm:px-4"
            >
              My Profile
            </button>
            <button
              type="button"
              onClick={handleLogout}
              className="rounded-xl bg-slate-900 px-3 py-2.5 text-sm font-semibold text-white hover:bg-rose-600 sm:px-4"
            >
              Log out
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto w-full max-w-[1440px] min-w-0 px-4 py-6 sm:px-6 sm:py-8 lg:px-10 lg:py-10">
        {/* Welcome banner */}
        <section className="relative isolate overflow-hidden rounded-3xl bg-gradient-to-br from-[#102c3b] via-[#075b60] to-[#0d817b] p-5 text-white shadow-lg shadow-teal-950/10 sm:p-8 lg:p-10">
          <div className="pointer-events-none absolute -right-20 -top-28 -z-10 h-80 w-80 rounded-full border-[45px] border-white/[0.06]" />
          <div className="pointer-events-none absolute bottom-[-100px] right-[20%] -z-10 h-64 w-64 rounded-full bg-teal-300/10 blur-3xl" />

          <div className="flex flex-col gap-7 lg:flex-row lg:items-center lg:justify-between">
            <div className="max-w-2xl">
              <span className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1.5 text-xs font-semibold text-teal-50">
                <span className="h-2 w-2 rounded-full bg-emerald-300" />
                Doctor portal
              </span>
              <p className="mt-5 text-xs font-bold tracking-[0.2em] text-teal-100">
                YOUR PROFESSIONAL WORKSPACE
              </p>
              <h1 className="mt-2 break-words text-3xl font-extrabold tracking-tight sm:text-4xl lg:text-[42px]">
                Good day, Dr. {firstName}
              </h1>
              <p className="mt-3 max-w-xl text-sm leading-7 text-teal-50/90 sm:text-base">
                Welcome back. Review your appointments, manage patient
                requests, and keep your daily schedule organized.
              </p>
            </div>

            <button
              type="button"
              onClick={() => fetchDoctorData(false)}
              disabled={refreshing}
              className="inline-flex shrink-0 items-center justify-center gap-2 self-start rounded-xl bg-white px-5 py-3 text-sm font-bold text-teal-900 shadow-sm transition hover:bg-teal-50 disabled:opacity-60 lg:self-center"
            >
              <span className={refreshing ? "inline-block animate-spin" : ""}>
                ↻
              </span>
              {refreshing ? "Refreshing..." : "Refresh dashboard"}
            </button>
          </div>

          <div className="mt-8 grid grid-cols-1 gap-4 border-t border-white/15 pt-6 sm:grid-cols-3 sm:gap-6">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white/10 text-xl">
                ▤
              </div>
              <div>
                <p className="text-xs text-teal-100">Total appointments</p>
                <p className="mt-0.5 text-2xl font-extrabold">
                  {appointments.length}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white/10 text-xl">
                ◷
              </div>
              <div>
                <p className="text-xs text-teal-100">Awaiting your action</p>
                <p className="mt-0.5 text-2xl font-extrabold">
                  {pendingAppointments.length}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white/10 text-xl">
                ✓
              </div>
              <div>
                <p className="text-xs text-teal-100">Confirmed appointments</p>
                <p className="mt-0.5 text-2xl font-extrabold">
                  {confirmedAppointments.length}
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Feedback */}
        {message && (
          <div
            role="status"
            className="mt-6 flex items-start gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-emerald-900"
          >
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-emerald-100 font-bold">
              ✓
            </span>
            <div className="min-w-0 flex-1">
              <p className="font-bold">Update successful</p>
              <p className="mt-1 break-words text-sm">{message}</p>
            </div>
            <button
              type="button"
              onClick={() => setMessage("")}
              aria-label="Dismiss success message"
              className="rounded-lg px-2 py-1 hover:bg-emerald-100"
            >
              ×
            </button>
          </div>
        )}

        {error && (
          <div
            role="alert"
            className="mt-6 flex items-start gap-3 rounded-2xl border border-rose-200 bg-rose-50 p-4 text-rose-900"
          >
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-rose-100 font-bold">
              !
            </span>
            <div className="min-w-0 flex-1">
              <p className="font-bold">Unable to complete request</p>
              <p className="mt-1 break-words text-sm">{error}</p>
            </div>
            <button
              type="button"
              onClick={() => setError("")}
              aria-label="Dismiss error message"
              className="rounded-lg px-2 py-1 hover:bg-rose-100"
            >
              ×
            </button>
          </div>
        )}

        {/* Statistics */}
        <section className="mt-9">
          <SectionHeading
            eyebrow="YOUR ACTIVITY"
            title="Appointment overview"
            description="A quick look at your patient appointment requests."
          />

          <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {stats.map((item) => {
              const colors = statColors[item.color];

              return (
                <button
                  key={item.label}
                  type="button"
                  onClick={() => {
                    setFilter(item.status);
                    document
                      .getElementById("appointments-section")
                      ?.scrollIntoView({ behavior: "smooth", block: "start" });
                  }}
                  className="group relative min-w-0 overflow-hidden rounded-2xl border border-slate-200 bg-white p-5 text-left shadow-sm transition hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-md"
                >
                  <span
                    className={`absolute inset-x-0 top-0 h-1 ${colors.accent}`}
                  />
                  <div className="flex items-center justify-between gap-3">
                    <p className="text-sm font-semibold text-slate-500">
                      {item.label}
                    </p>
                    <span
                      className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-xl font-bold ${colors.icon}`}
                    >
                      {item.icon}
                    </span>
                  </div>
                  <p className={`mt-5 text-4xl font-extrabold tracking-tight ${colors.number}`}>
                    {item.value}
                  </p>
                  <p className="mt-2 text-xs leading-5 text-slate-500">
                    {item.detail}
                  </p>
                  <p className="mt-4 text-xs font-bold text-teal-700 group-hover:text-teal-900">
                    View appointments →
                  </p>
                </button>
              );
            })}
          </div>
        </section>

        {/* Doctor information */}
        <section className="mt-9 rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <SectionHeading
              eyebrow="YOUR ACCOUNT"
              title="Doctor information"
              description="Your professional contact details."
            />
            <button
              type="button"
              onClick={() => navigate("/profile")}
              className="self-start rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-bold text-slate-700 hover:border-teal-300 hover:bg-teal-50 hover:text-teal-800 sm:self-auto"
            >
              View my profile →
            </button>
          </div>

          <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-3">
            <InfoCard
              icon="DR"
              label="Doctor name"
              value={doctor?.name || user?.name || "Not available"}
            />
            <InfoCard
              icon="@"
              label="Email address"
              value={doctor?.email || user?.email || "Not available"}
            />
            <InfoCard
              icon="☎"
              label="Contact number"
              value={doctor?.contact || user?.contact || "Not available"}
            />
          </div>
        </section>

        {/* Availability */}
        <section className="mt-9 rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <SectionHeading
              eyebrow="WORKING SCHEDULE"
              title="My availability"
              description="Your configured working days and appointment time slots."
            />
            <span className="self-start rounded-full bg-violet-50 px-4 py-2 text-sm font-bold text-violet-700 sm:self-auto">
              {doctor?.availability?.length || 0} working days
            </span>
          </div>

          {!doctor?.availability?.length ? (
            <div className="mt-6 rounded-2xl border border-dashed border-amber-300 bg-amber-50 p-5">
              <h3 className="font-bold text-amber-900">
                No availability configured
              </h3>
              <p className="mt-1 text-sm leading-6 text-amber-800">
                Your working schedule has not been configured yet. Please
                contact the administrator.
              </p>
            </div>
          ) : (
            <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {doctor.availability.map((item, index) => (
                <div
                  key={`${item.day}-${index}`}
                  className="min-w-0 rounded-2xl border border-violet-100 bg-gradient-to-br from-violet-50/80 to-white p-5"
                >
                  <div className="flex items-center justify-between gap-3">
                    <h3 className="font-bold text-slate-900">{item.day}</h3>
                    <span className="shrink-0 rounded-full bg-white px-3 py-1 text-xs font-bold text-violet-700 shadow-sm">
                      {item.slots?.length || 0} slots
                    </span>
                  </div>

                  <div className="mt-4 flex flex-wrap gap-2">
                    {item.slots?.length ? (
                      item.slots.map((slot, slotIndex) => (
                        <span
                          key={`${slot}-${slotIndex}`}
                          className="rounded-lg border border-violet-100 bg-white px-3 py-2 text-sm font-medium text-violet-800"
                        >
                          ◷ {slot}
                        </span>
                      ))
                    ) : (
                      <p className="text-sm text-slate-500">
                        No time slots configured.
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Appointments */}
        <section
          id="appointments-section"
          className="mt-9 scroll-mt-24 rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7"
        >
          <div className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
            <SectionHeading
              eyebrow="PATIENT CARE"
              title="My appointments"
              description="Review patient details and manage appointment requests."
            />
            <button
              type="button"
              onClick={() => fetchDoctorData(false)}
              disabled={refreshing}
              className="self-start rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-bold text-slate-700 hover:border-teal-300 hover:bg-teal-50 disabled:opacity-50 xl:self-auto"
            >
              {refreshing ? "Refreshing..." : "↻ Refresh appointments"}
            </button>
          </div>

          {/* Search and filter */}
          <div className="mt-6 grid grid-cols-1 gap-3 md:grid-cols-[minmax(0,1fr)_220px]">
            <div className="relative min-w-0">
              <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-lg text-slate-400">
                ⌕
              </span>
              <input
                type="search"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search patient, email, contact, date..."
                aria-label="Search appointments"
                className="w-full min-w-0 rounded-xl border border-slate-200 bg-slate-50 py-3 pl-11 pr-4 text-sm outline-none transition placeholder:text-slate-400 focus:border-teal-500 focus:bg-white focus:ring-4 focus:ring-teal-500/10"
              />
            </div>

            <select
              value={filter}
              onChange={(event) => setFilter(event.target.value)}
              aria-label="Filter appointments by status"
              className="w-full min-w-0 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-semibold outline-none focus:border-teal-500 focus:ring-4 focus:ring-teal-500/10"
            >
              <option value="all">All appointments</option>
              <option value="pending">Pending</option>
              <option value="confirmed">Confirmed</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>

          <div className="mt-5 flex flex-wrap items-center justify-between gap-3">
            <p className="text-sm text-slate-500">
              Showing{" "}
              <span className="font-bold text-slate-900">
                {filteredAppointments.length}
              </span>{" "}
              of {appointments.length} appointments
            </p>
            {(filter !== "all" || search) && (
              <button
                type="button"
                onClick={() => {
                  setFilter("all");
                  setSearch("");
                }}
                className="text-sm font-bold text-teal-700 hover:text-teal-900"
              >
                Clear filters
              </button>
            )}
          </div>

          {appointments.length === 0 ? (
            <EmptyState
              title="No appointments yet"
              description="Patient appointment requests will appear here when patients book with you."
            />
          ) : filteredAppointments.length === 0 ? (
            <EmptyState
              title="No matching appointments"
              description="Try a different search term or change the status filter."
            />
          ) : (
            <div className="mt-5 space-y-4">
              {filteredAppointments.map((appointment) => {
                const isUpdating = updatingId === appointment._id;
                const patientName =
                  appointment.patient?.name || "Unknown Patient";

                const statusStyles = {
                  pending: "bg-amber-50 text-amber-800 ring-amber-200",
                  confirmed: "bg-emerald-50 text-emerald-800 ring-emerald-200",
                  cancelled: "bg-rose-50 text-rose-800 ring-rose-200",
                };

                return (
                  <article
                    key={appointment._id}
                    className="min-w-0 overflow-hidden rounded-2xl border border-slate-200 bg-white transition hover:border-teal-200 hover:shadow-md"
                  >
                    <div className="flex flex-col gap-3 bg-slate-50/80 p-4 sm:flex-row sm:items-center sm:justify-between sm:p-5">
                      <div className="flex min-w-0 items-center gap-3">
                        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-teal-100 text-lg font-extrabold text-teal-800">
                          {patientName.charAt(0).toUpperCase()}
                        </div>
                        <div className="min-w-0">
                          <h3 className="break-words font-extrabold text-slate-900">
                            {patientName}
                          </h3>
                          <p className="mt-1 text-xs text-slate-500">
                            Patient appointment
                          </p>
                        </div>
                      </div>

                      <span
                        className={`inline-flex w-fit shrink-0 items-center gap-2 rounded-full px-3 py-1.5 text-xs font-bold capitalize ring-1 ${
                          {
                            pending: "bg-amber-50 text-amber-800 ring-amber-200",
                            confirmed: "bg-emerald-50 text-emerald-800 ring-emerald-200",
                            cancelled: "bg-rose-50 text-rose-800 ring-rose-200",
                          }[appointment.status] ||
                          "bg-slate-100 text-slate-700 ring-slate-200"
                        }`}
                      >
                        <span className="h-1.5 w-1.5 rounded-full bg-current" />
                        {appointment.status || "Unknown"}
                      </span>
                    </div>

                    <div className="min-w-0 p-4 sm:p-5">
                      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
                        <DetailItem label="Patient name" value={patientName} />
                        <DetailItem
                          label="Email address"
                          value={appointment.patient?.email || "Not available"}
                        />
                        <DetailItem
                          label="Contact number"
                          value={appointment.patient?.contact || "Not available"}
                        />
                        <DetailItem
                          label="Reason for visit"
                          value={appointment.reason || "Not provided"}
                        />
                      </div>

                      <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
                        <AppointmentInfo
                          icon="▦"
                          label="Appointment date"
                          value={appointment.date || "Not available"}
                          color="teal"
                        />
                        <AppointmentInfo
                          icon="◷"
                          label="Appointment time"
                          value={appointment.time || "Not available"}
                          color="violet"
                        />
                      </div>

                      <p className="mt-4 break-all text-[11px] text-slate-400">
                        Appointment ID: {appointment._id}
                      </p>

                      <div className="mt-5 border-t border-slate-100 pt-4">
                        {appointment.status === "pending" && (
                          <div className="flex flex-col gap-3 sm:flex-row">
                            <button
                              type="button"
                              onClick={() =>
                                handleStatusUpdate(appointment._id, "confirmed")
                              }
                              disabled={isUpdating}
                              className="flex-1 rounded-xl bg-emerald-600 px-5 py-3 text-sm font-bold text-white hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-50"
                            >
                              {isUpdating ? "Updating..." : "✓ Confirm appointment"}
                            </button>
                            <button
                              type="button"
                              onClick={() =>
                                handleStatusUpdate(appointment._id, "cancelled")
                              }
                              disabled={isUpdating}
                              className="flex-1 rounded-xl border border-rose-200 bg-white px-5 py-3 text-sm font-bold text-rose-700 hover:bg-rose-50 disabled:cursor-not-allowed disabled:opacity-50"
                            >
                              {isUpdating ? "Updating..." : "Cancel appointment"}
                            </button>
                          </div>
                        )}

                        {appointment.status === "confirmed" && (
                          <div className="flex flex-col gap-3 rounded-xl border border-emerald-200 bg-emerald-50 p-4 sm:flex-row sm:items-center sm:justify-between">
                            <div>
                              <p className="font-bold text-emerald-800">
                                ✓ Appointment confirmed
                              </p>
                              <p className="mt-1 text-sm text-emerald-700">
                                This appointment has been approved.
                              </p>
                            </div>
                            <button
                              type="button"
                              onClick={() =>
                                handleStatusUpdate(appointment._id, "cancelled")
                              }
                              disabled={isUpdating}
                              className="rounded-xl border border-rose-200 bg-white px-4 py-2.5 text-sm font-bold text-rose-700 hover:bg-rose-50 disabled:opacity-50"
                            >
                              {isUpdating ? "Updating..." : "Cancel appointment"}
                            </button>
                          </div>
                        )}

                        {appointment.status === "cancelled" && (
                          <div className="rounded-xl border border-rose-200 bg-rose-50 p-4">
                            <p className="font-bold text-rose-800">
                              Appointment cancelled
                            </p>
                            <p className="mt-1 text-sm text-rose-700">
                              This appointment is currently cancelled.
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </section>

        <footer className="py-9 text-center">
          <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-xl bg-teal-100 text-sm font-black text-teal-800">
            M+
          </div>
          <p className="mt-3 text-sm font-bold text-slate-700">
            MediCare · Doctor Workspace
          </p>
          <p className="mt-1 text-xs text-slate-500">
            Organized appointments, better patient care.
          </p>
        </footer>
      </main>
    </div>
  );
}

function SectionHeading({ eyebrow, title, description }) {
  return (
    <div className="min-w-0">
      <p className="text-[10px] font-extrabold tracking-[0.2em] text-teal-700">
        {eyebrow}
      </p>
      <h2 className="mt-1.5 break-words text-xl font-extrabold tracking-tight text-slate-900 sm:text-2xl">
        {title}
      </h2>
      {description && (
        <p className="mt-1.5 text-sm leading-6 text-slate-500">
          {description}
        </p>
      )}
    </div>
  );
}

function InfoCard({ icon, label, value }) {
  return (
    <div className="min-w-0 rounded-2xl border border-slate-200 bg-slate-50/80 p-4 transition hover:border-teal-200">
      <div className="flex items-center gap-3">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white text-sm font-extrabold text-teal-700 shadow-sm">
          {icon}
        </span>
        <p className="text-sm font-semibold text-slate-500">{label}</p>
      </div>
      <p className="mt-3 break-words text-sm font-bold leading-6 text-slate-900">
        {value}
      </p>
    </div>
  );
}

function DetailItem({ label, value }) {
  return (
    <div className="min-w-0 rounded-xl border border-slate-100 bg-slate-50 p-3.5">
      <p className="text-xs font-medium text-slate-500">{label}</p>
      <p className="mt-1.5 break-words text-sm font-semibold leading-5 text-slate-800">
        {value}
      </p>
    </div>
  );
}

function AppointmentInfo({ icon, label, value, color }) {
  const styles =
    color === "violet"
      ? "border-violet-100 bg-violet-50/70 text-violet-700"
      : "border-teal-100 bg-teal-50/70 text-teal-700";

  return (
    <div className={`flex min-w-0 items-center gap-3 rounded-xl border p-4 ${styles}`}>
      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white text-lg">
        {icon}
      </span>
      <div className="min-w-0">
        <p className="text-xs font-medium text-slate-500">{label}</p>
        <p className="mt-1 break-words text-sm font-bold text-slate-900">
          {value}
        </p>
      </div>
    </div>
  );
}

function EmptyState({ title, description }) {
  return (
    <div className="mt-5 rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-5 py-12 text-center">
      <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-white text-2xl text-teal-700 shadow-sm">
        ▤
      </div>
      <h3 className="mt-4 text-lg font-extrabold text-slate-900">{title}</h3>
      <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">
        {description}
      </p>
    </div>
  );
}

export default DoctorDashboard;
