import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";

import api from "../services/api";
import Header from "../components/Header";
import { logout } from "../store/authSlice";

const MAX_FILES = 3;
const MAX_FILE_SIZE = 1024 * 1024;
const ALLOWED_TYPES = [
  "application/pdf",
  "image/jpeg",
  "image/png",
];

function BookAppointment() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { token, user } = useSelector((state) => state.auth);

  const [doctors, setDoctors] = useState([]);
  const [selectedDoctor, setSelectedDoctor] = useState("");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [reason, setReason] = useState("");
  const [reports, setReports] = useState([]);
  const [availableSlots, setAvailableSlots] = useState([]);
  const [selectedDay, setSelectedDay] = useState("");
  const [loadingDoctors, setLoadingDoctors] = useState(true);
  const [booking, setBooking] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const today = new Date();
  const todayString = [
    today.getFullYear(),
    String(today.getMonth() + 1).padStart(2, "0"),
    String(today.getDate()).padStart(2, "0"),
  ].join("-");

  const selectedDoctorData = doctors.find(
    (doctor) => doctor.name === selectedDoctor
  );

  const handleLogout = () => {
    dispatch(logout());
    navigate("/", { replace: true });
  };

  useEffect(() => {
    if (!token || user?.role !== "patient") {
      navigate("/", { replace: true });
      return;
    }

    let active = true;

    const loadDoctors = async () => {
      try {
        setLoadingDoctors(true);
        setError("");

        const result = await api.getAllDoctors(token);

        if (active) {
          setDoctors(result.doctors || []);
        }
      } catch (err) {
        if (active) {
          setError(err.message || "Failed to load doctors.");
        }
      } finally {
        if (active) {
          setLoadingDoctors(false);
        }
      }
    };

    loadDoctors();

    return () => {
      active = false;
    };
  }, [token, user?.role, navigate]);

  useEffect(() => {
    setTime("");
    setAvailableSlots([]);
    setSelectedDay("");

    if (!selectedDoctor || !date) return;

    const doctor = doctors.find(
      (item) => item.name === selectedDoctor
    );

    if (!doctor) return;

    const selectedDate = new Date(`${date}T12:00:00`);

    const dayName = selectedDate.toLocaleDateString("en-US", {
      weekday: "long",
    });

    setSelectedDay(dayName);

    const availability = doctor.availability?.find(
      (item) => item.day?.toLowerCase() === dayName.toLowerCase()
    );

    if (availability) {
      setAvailableSlots(availability.slots || []);
    }
  }, [selectedDoctor, date, doctors]);

  const handleDoctorChange = (doctorName) => {
    setSelectedDoctor(doctorName);
    setDate("");
    setTime("");
    setReason("");
    setReports([]);
    setAvailableSlots([]);
    setSelectedDay("");
    setMessage("");
    setError("");
  };

  const handleDateChange = (event) => {
    const newDate = event.target.value;

    setDate(newDate);
    setTime("");
    setMessage("");
    setError("");
  };

  const handleReportChange = (event) => {
    const selectedFiles = Array.from(event.target.files || []);

    event.target.value = "";
    setError("");
    setMessage("");

    if (reports.length + selectedFiles.length > MAX_FILES) {
      setError(`You can upload a maximum of ${MAX_FILES} reports.`);
      return;
    }

    for (const file of selectedFiles) {
      if (!ALLOWED_TYPES.includes(file.type)) {
        setError(`${file.name}: Only PDF, JPG and PNG files are allowed.`);
        return;
      }

      if (file.size > MAX_FILE_SIZE) {
        setError(`${file.name}: Each report must be 1 MB or smaller.`);
        return;
      }

      if (file.size === 0) {
        setError(`${file.name}: This file is empty.`);
        return;
      }
    }

    const existingNames = new Set(
      reports.map(
        (file) => `${file.name}-${file.size}-${file.lastModified}`
      )
    );

    const newFiles = selectedFiles.filter(
      (file) =>
        !existingNames.has(
          `${file.name}-${file.size}-${file.lastModified}`
        )
    );

    if (reports.length + newFiles.length > MAX_FILES) {
      setError(`You can upload a maximum of ${MAX_FILES} reports.`);
      return;
    }

    setReports((previous) => [...previous, ...newFiles]);
  };

  const removeReport = (indexToRemove) => {
    setReports((previous) =>
      previous.filter((_, index) => index !== indexToRemove)
    );
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setMessage("");
    setError("");

    if (!selectedDoctor || !date || !time) {
      setError("Please select a doctor, date and time.");
      return;
    }

    if (date < todayString) {
      setError("Please select today or a future date.");
      return;
    }

    if (!availableSlots.includes(time)) {
      setError("This time slot is not available.");
      return;
    }

    try {
      setBooking(true);

      const result = await api.bookAppointment(
        selectedDoctor,
        date,
        time,
        reason,
        token,
        reports
      );

      setMessage(result.message || "Appointment booked successfully!");

      setSelectedDoctor("");
      setDate("");
      setTime("");
      setReason("");
      setReports([]);
      setAvailableSlots([]);
      setSelectedDay("");
    } catch (err) {
      setError(err.message || "Failed to book appointment.");
    } finally {
      setBooking(false);
    }
  };

  const formatDate = (dateValue) => {
    if (!dateValue) return "";

    return new Date(`${dateValue}T12:00:00`).toLocaleDateString("en-IN", {
      weekday: "short",
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };

  const inputClass =
    "w-full rounded-xl border border-slate-200 bg-white px-4 py-3.5 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-teal-600 focus:ring-4 focus:ring-teal-600/10 disabled:cursor-not-allowed disabled:bg-slate-50";

  return (
    <div className="min-h-screen bg-[#f5f8fc]">
      <Header user={user} onLogout={handleLogout} />

      <main className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 sm:py-9 lg:px-8">
        {/* Page navigation */}
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
          <nav
            aria-label="Breadcrumb"
            className="flex items-center gap-2 text-sm text-slate-500"
          >
            <button
              type="button"
              onClick={() => navigate("/dashboard")}
              className="transition hover:text-teal-700"
            >
              Dashboard
            </button>
            <span>/</span>
            <span className="font-semibold text-teal-700">
              Book Appointment
            </span>
          </nav>

          <button
            type="button"
            onClick={() => navigate("/my-appointments")}
            className="rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-sm transition hover:border-teal-300 hover:text-teal-700"
          >
            My appointments →
          </button>
        </div>

        {/* Hero */}
        <section className="relative mb-8 overflow-hidden rounded-3xl bg-gradient-to-br from-[#102e46] via-[#075e68] to-[#0d9488] p-6 text-white shadow-xl shadow-teal-950/10 sm:p-9 lg:p-10">
          <div className="pointer-events-none absolute -right-12 -top-16 h-64 w-64 rounded-full border-[35px] border-white/10" />
          <div className="pointer-events-none absolute -bottom-28 right-40 h-56 w-56 rounded-full bg-white/5" />

          <div className="relative grid gap-8 lg:grid-cols-[1fr_auto] lg:items-center">
            <div className="max-w-2xl">
              <span className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1.5 text-xs font-semibold uppercase tracking-wider text-teal-50">
                <span className="h-2 w-2 rounded-full bg-emerald-300" />
                Patient services
              </span>

              <h1 className="mt-5 text-3xl font-bold leading-tight tracking-tight sm:text-4xl lg:text-5xl">
                Your health,
                <br className="hidden sm:block" /> your schedule.
              </h1>

              <p className="mt-4 max-w-xl text-sm leading-7 text-teal-50 sm:text-base">
                Find your preferred doctor, select an available date and time,
                and arrange your next consultation in a few simple steps.
              </p>

              <div className="mt-6 flex flex-wrap gap-3 text-sm">
                <span className="rounded-full border border-white/20 bg-white/10 px-3 py-2">
                  ✓ Easy scheduling
                </span>
                <span className="rounded-full border border-white/20 bg-white/10 px-3 py-2">
                  ✓ Secure patient portal
                </span>
              </div>
            </div>

            <div className="hidden w-52 rounded-2xl border border-white/15 bg-white/10 p-5 backdrop-blur-sm sm:block">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/15 text-2xl">
                +
              </div>
              <p className="mt-5 text-sm font-semibold text-teal-100">
                Your next step
              </p>
              <p className="mt-1 text-xl font-bold">Book a visit</p>
              <p className="mt-2 text-xs leading-5 text-teal-50/80">
                Choose a doctor and a suitable appointment time.
              </p>
            </div>
          </div>

          <div className="relative mt-8 grid grid-cols-1 gap-3 border-t border-white/15 pt-6 sm:grid-cols-3">
            {[
              { number: "01", label: "Choose your doctor" },
              { number: "02", label: "Pick date and time" },
              { number: "03", label: "Confirm your visit" },
            ].map((step) => (
              <div key={step.number} className="flex items-center gap-3">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white/10 text-xs font-bold text-teal-100">
                  {step.number}
                </span>
                <span className="text-sm font-medium text-white/90">
                  {step.label}
                </span>
              </div>
            ))}
          </div>
        </section>

        {/* Feedback messages */}
        {message && (
          <div
            role="status"
            className="mb-6 flex flex-col gap-4 rounded-2xl border border-emerald-200 bg-emerald-50 p-5 sm:flex-row sm:items-center sm:justify-between"
          >
            <div>
              <p className="font-bold text-emerald-800">
                ✓ Appointment request submitted
              </p>
              <p className="mt-1 text-sm leading-6 text-emerald-700">
                {message}
              </p>
            </div>

            <button
              type="button"
              onClick={() => navigate("/my-appointments")}
              className="shrink-0 rounded-xl bg-emerald-700 px-4 py-3 text-sm font-bold text-white transition hover:bg-emerald-800"
            >
              View appointments →
            </button>
          </div>
        )}

        {error && (
          <div
            role="alert"
            className="mb-6 flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700"
          >
            <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-red-100 font-bold">
              !
            </span>
            <div className="min-w-0 flex-1">
              <p className="font-bold">Something needs attention</p>
              <p className="mt-1 break-words leading-6">{error}</p>
            </div>
            <button
              type="button"
              onClick={() => setError("")}
              className="rounded-lg px-2 py-1 text-lg hover:bg-red-100"
              aria-label="Dismiss error"
            >
              ×
            </button>
          </div>
        )}

        <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-[minmax(0,1fr)_310px]">
          {/* Main form */}
          <section className="min-w-0 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
            <div className="border-b border-slate-100 p-5 sm:p-8">
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-teal-700">
                Appointment details
              </p>
              <h2 className="mt-2 text-2xl font-bold tracking-tight text-slate-900">
                Schedule your visit
              </h2>
              <p className="mt-2 text-sm leading-6 text-slate-500">
                Complete each section to request your appointment.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-8 p-5 sm:p-8">
              {/* 1. Doctor selection */}
              <section>
                <div className="mb-4 flex items-center gap-3">
                  <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-teal-50 font-bold text-teal-700">
                    01
                  </span>
                  <div>
                    <h3 className="font-bold text-slate-900">
                      Choose your doctor
                    </h3>
                    <p className="mt-0.5 text-xs text-slate-500">
                      Select the healthcare professional you prefer.
                    </p>
                  </div>
                </div>

                {loadingDoctors ? (
                  <div className="rounded-xl border border-slate-200 bg-slate-50 p-5 text-sm text-slate-500">
                    Loading available doctors...
                  </div>
                ) : doctors.length === 0 ? (
                  <div className="rounded-xl border border-amber-200 bg-amber-50 p-5 text-sm text-amber-800">
                    No doctors are currently available. Please try again later.
                  </div>
                ) : (
                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                    {doctors.map((doctor) => {
                      const isSelected = selectedDoctor === doctor.name;

                      return (
                        <button
                          key={doctor._id}
                          type="button"
                          onClick={() => handleDoctorChange(doctor.name)}
                          aria-pressed={isSelected}
                          disabled={booking}
                          className={`flex min-w-0 items-start gap-3 rounded-2xl border p-4 text-left transition ${
                            isSelected
                              ? "border-teal-600 bg-teal-50 ring-2 ring-teal-600/10"
                              : "border-slate-200 bg-white hover:border-teal-300 hover:bg-slate-50"
                          } disabled:cursor-not-allowed disabled:opacity-60`}
                        >
                          <span
                            className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl text-lg font-bold ${
                              isSelected
                                ? "bg-teal-700 text-white"
                                : "bg-slate-100 text-slate-600"
                            }`}
                          >
                            {doctor.name?.trim()?.charAt(0)?.toUpperCase() ||
                              "D"}
                          </span>

                          <span className="min-w-0 flex-1">
                            <span className="block break-words font-bold text-slate-900">
                              {doctor.name}
                            </span>
                            <span className="mt-1 block text-sm text-slate-500">
                              {doctor.specialization || "Medical professional"}
                            </span>
                            <span
                              className={`mt-3 inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${
                                isSelected
                                  ? "bg-teal-100 text-teal-800"
                                  : "bg-slate-100 text-slate-600"
                              }`}
                            >
                              {isSelected ? "✓ Selected" : "Select doctor"}
                            </span>
                          </span>
                        </button>
                      );
                    })}
                  </div>
                )}

                {selectedDoctorData && (
                  <p className="mt-3 text-xs text-teal-700">
                    Selected: {selectedDoctorData.name}
                    {selectedDoctorData.specialization
                      ? ` · ${selectedDoctorData.specialization}`
                      : ""}
                  </p>
                )}
              </section>

              <div className="border-t border-slate-100" />

              {/* 2. Date selection */}
              <section>
                <div className="mb-4 flex items-center gap-3">
                  <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-teal-50 font-bold text-teal-700">
                    02
                  </span>
                  <div>
                    <h3 className="font-bold text-slate-900">
                      Select appointment date
                    </h3>
                    <p className="mt-0.5 text-xs text-slate-500">
                      Choose today or a future date.
                    </p>
                  </div>
                </div>

                <div className="rounded-2xl border border-slate-200 bg-slate-50/70 p-4 sm:p-5">
                  <label
                    htmlFor="appointment-date"
                    className="mb-2 block text-sm font-semibold text-slate-700"
                  >
                    Appointment date
                  </label>

                  <input
                    id="appointment-date"
                    type="date"
                    value={date}
                    min={todayString}
                    onChange={handleDateChange}
                    disabled={!selectedDoctor || booking}
                    required
                    className={inputClass}
                  />

                  <div className="mt-4 flex items-start gap-3 rounded-xl bg-white p-3">
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-teal-50 text-teal-700">
                      <svg
                        viewBox="0 0 24 24"
                        fill="none"
                        className="h-5 w-5"
                        aria-hidden="true"
                      >
                        <rect
                          x="3"
                          y="5"
                          width="18"
                          height="16"
                          rx="3"
                          stroke="currentColor"
                          strokeWidth="1.6"
                        />
                        <path
                          d="M8 3v4M16 3v4M4 10h16"
                          stroke="currentColor"
                          strokeWidth="1.6"
                          strokeLinecap="round"
                        />
                      </svg>
                    </span>

                    <div className="min-w-0">
                      <p className="text-xs text-slate-500">
                        {date ? "Your selected date" : "Your appointment date"}
                      </p>
                      <p className="mt-1 break-words text-sm font-bold text-slate-900">
                        {date ? formatDate(date) : "No date selected"}
                      </p>
                      {selectedDay && (
                        <p className="mt-1 text-xs text-teal-700">
                          {selectedDay}
                        </p>
                      )}
                    </div>
                  </div>

                  {!selectedDoctor && (
                    <p className="mt-3 text-xs text-amber-700">
                      Select a doctor first to choose a date.
                    </p>
                  )}
                </div>
              </section>

              <div className="border-t border-slate-100" />

              {/* 3. Time selection */}
              <section>
                <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-teal-50 font-bold text-teal-700">
                      03
                    </span>
                    <div>
                      <h3 className="font-bold text-slate-900">
                        Choose a time slot
                      </h3>
                      <p className="mt-0.5 text-xs text-slate-500">
                        Select one of the doctor's scheduled times.
                      </p>
                    </div>
                  </div>

                  {availableSlots.length > 0 && (
                    <span className="rounded-full bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-700">
                      {availableSlots.length} scheduled slots
                    </span>
                  )}
                </div>

                {!selectedDoctor || !date ? (
                  <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-5 py-8 text-center">
                    <p className="font-semibold text-slate-700">
                      Select a doctor and date
                    </p>
                    <p className="mt-1 text-sm text-slate-500">
                      Scheduled time slots will appear here.
                    </p>
                  </div>
                ) : availableSlots.length === 0 ? (
                  <div className="rounded-2xl border border-amber-200 bg-amber-50 p-5">
                    <p className="font-semibold text-amber-800">
                      No scheduled slots for {selectedDay}
                    </p>
                    <p className="mt-1 text-sm leading-6 text-amber-700">
                      Choose another date when this doctor is scheduled to
                      provide consultations.
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                    {availableSlots.map((slot) => (
                      <button
                        key={slot}
                        type="button"
                        aria-pressed={time === slot}
                        disabled={booking}
                        onClick={() => {
                          setTime(slot);
                          setMessage("");
                          setError("");
                        }}
                        className={`flex items-center justify-center gap-2 rounded-xl border px-3 py-3.5 text-sm font-semibold transition ${
                          time === slot
                            ? "border-teal-700 bg-teal-700 text-white shadow-md shadow-teal-700/15"
                            : "border-slate-200 bg-white text-slate-700 hover:border-teal-400 hover:bg-teal-50"
                        } disabled:cursor-not-allowed disabled:opacity-60`}
                      >
                        <svg
                          viewBox="0 0 24 24"
                          fill="none"
                          className="h-4 w-4 shrink-0"
                          aria-hidden="true"
                        >
                          <circle
                            cx="12"
                            cy="12"
                            r="9"
                            stroke="currentColor"
                            strokeWidth="1.6"
                          />
                          <path
                            d="M12 7v5l3 2"
                            stroke="currentColor"
                            strokeWidth="1.6"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                        {slot}
                      </button>
                    ))}
                  </div>
                )}

                {time && (
                  <p className="mt-3 text-sm font-semibold text-teal-700">
                    ✓ Selected time: {time}
                  </p>
                )}
              </section>

              <div className="border-t border-slate-100" />

              {/* 4. Reason */}
              <section>
                <div className="mb-4 flex items-center gap-3">
                  <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-teal-50 font-bold text-teal-700">
                    04
                  </span>
                  <div>
                    <h3 className="font-bold text-slate-900">
                      Reason for your visit
                    </h3>
                    <p className="mt-0.5 text-xs text-slate-500">
                      Optional information for your appointment.
                    </p>
                  </div>
                </div>

                <label
                  htmlFor="reason"
                  className="mb-2 block text-sm font-semibold text-slate-700"
                >
                  Describe your concern (optional)
                </label>

                <textarea
                  id="reason"
                  value={reason}
                  onChange={(event) => setReason(event.target.value)}
                  placeholder="Briefly describe why you would like to consult the doctor..."
                  rows={4}
                  maxLength={1000}
                  disabled={booking}
                  className={`${inputClass} resize-y`}
                />

                <p className="mt-2 text-right text-xs text-slate-400">
                  {reason.length}/1000 characters
                </p>
              </section>

              <div className="border-t border-slate-100" />

              {/* 5. Medical reports */}
              <section>
                <div className="mb-4 flex items-center gap-3">
                  <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-teal-50 font-bold text-teal-700">
                    05
                  </span>
                  <div>
                    <h3 className="font-bold text-slate-900">
                      Medical reports
                    </h3>
                    <p className="mt-0.5 text-xs text-slate-500">
                      Optional supporting documents.
                    </p>
                  </div>
                </div>

                <div className="rounded-2xl border-2 border-dashed border-teal-200 bg-teal-50/40 p-5 sm:p-6">
                  <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-white text-teal-700 shadow-sm">
                    <svg
                      viewBox="0 0 24 24"
                      fill="none"
                      className="h-6 w-6"
                      aria-hidden="true"
                    >
                      <path
                        d="M7 3h7l5 5v11a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2Z"
                        stroke="currentColor"
                        strokeWidth="1.6"
                        strokeLinejoin="round"
                      />
                      <path
                        d="M14 3v5h5M8 14h8M8 17h6"
                        stroke="currentColor"
                        strokeWidth="1.6"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </div>

                  <div className="mt-3 text-center">
                    <p className="font-semibold text-slate-800">
                      Upload your reports
                    </p>
                    <p className="mt-1 text-sm text-slate-500">
                      PDF, JPG or PNG
                    </p>
                    <p className="mt-1 text-xs text-slate-400">
                      Maximum 3 files · 1 MB per file
                    </p>
                  </div>

                  <label
                    htmlFor="reports"
                    className="mt-5 flex cursor-pointer items-center justify-center rounded-xl bg-teal-700 px-4 py-3 text-sm font-bold text-white transition hover:bg-teal-800"
                  >
                    + Choose files
                  </label>

                  <input
                    id="reports"
                    type="file"
                    accept=".pdf,.jpg,.jpeg,.png,application/pdf,image/jpeg,image/png"
                    multiple
                    disabled={reports.length >= MAX_FILES || booking}
                    onChange={handleReportChange}
                    className="sr-only"
                  />

                  {reports.length > 0 && (
                    <ul className="mt-4 space-y-2">
                      {reports.map((file, index) => (
                        <li
                          key={`${file.name}-${file.lastModified}-${index}`}
                          className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white p-3"
                        >
                          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-teal-50 text-xs font-bold text-teal-800">
                            {file.type === "application/pdf" ? "PDF" : "IMG"}
                          </span>

                          <div className="min-w-0 flex-1">
                            <p className="break-all text-sm font-semibold text-slate-800">
                              {file.name}
                            </p>
                            <p className="text-xs text-slate-500">
                              {(file.size / 1024).toFixed(0)} KB
                            </p>
                          </div>

                          <button
                            type="button"
                            onClick={() => removeReport(index)}
                            disabled={booking}
                            className="rounded-lg px-2 py-2 text-xs font-semibold text-red-600 transition hover:bg-red-50 disabled:opacity-50"
                          >
                            Remove
                          </button>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </section>

              {/* Booking summary */}
              {selectedDoctor && date && time && (
                <section className="rounded-2xl border border-teal-100 bg-teal-50/70 p-5">
                  <div className="flex items-center justify-between gap-3">
                    <h3 className="font-bold text-teal-950">
                      Booking summary
                    </h3>
                    <span className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-teal-800">
                      Ready to confirm
                    </span>
                  </div>

                  <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-3">
                    <div>
                      <p className="text-xs text-slate-500">Doctor</p>
                      <p className="mt-1 break-words text-sm font-bold text-slate-900">
                        {selectedDoctor}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-500">Date</p>
                      <p className="mt-1 text-sm font-bold text-slate-900">
                        {formatDate(date)}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-500">Time</p>
                      <p className="mt-1 text-sm font-bold text-teal-800">
                        {time}
                      </p>
                    </div>
                  </div>

                  {reports.length > 0 && (
                    <p className="mt-4 text-sm text-teal-800">
                      {reports.length} medical report(s) attached
                    </p>
                  )}
                </section>
              )}

              {/* Submit */}
              <button
                type="submit"
                disabled={
                  booking ||
                  loadingDoctors ||
                  !selectedDoctor ||
                  !date ||
                  !time ||
                  !availableSlots.includes(time)
                }
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-teal-700 to-teal-600 px-5 py-4 text-sm font-bold text-white shadow-lg shadow-teal-700/15 transition hover:-translate-y-0.5 hover:from-teal-800 hover:to-teal-700 focus:outline-none focus:ring-4 focus:ring-teal-600/20 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:translate-y-0"
              >
                {booking ? (
                  <>
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
                    Booking your appointment...
                  </>
                ) : (
                  <>
                    Confirm appointment
                    <span aria-hidden="true">→</span>
                  </>
                )}
              </button>

              <p className="text-center text-xs leading-5 text-slate-400">
                Please check your doctor, date, time and uploaded files before
                confirming.
              </p>
            </form>
          </section>

          {/* Sidebar */}
          <aside className="space-y-5">
            <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
              <div className="h-1.5 bg-gradient-to-r from-teal-600 to-cyan-500" />
              <div className="p-6">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-teal-50 text-teal-700">
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    className="h-6 w-6"
                    aria-hidden="true"
                  >
                    <path
                      d="M12 21s-8-4.5-8-11a4.5 4.5 0 0 1 8-2.8A4.5 4.5 0 0 1 20 10c0 6.5-8 11-8 11Z"
                      stroke="currentColor"
                      strokeWidth="1.6"
                      strokeLinejoin="round"
                    />
                    <path
                      d="M5.5 12h4l1.5-3 2.2 6 1.4-3h3.9"
                      stroke="currentColor"
                      strokeWidth="1.6"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </div>

                <h2 className="mt-4 text-lg font-bold text-slate-900">
                  Your health comes first
                </h2>
                <p className="mt-2 text-sm leading-6 text-slate-500">
                  Choose a doctor and a scheduled time to arrange your next
                  consultation.
                </p>
              </div>
            </section>

            <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <h2 className="font-bold text-slate-900">Booking checklist</h2>
              <p className="mt-1 text-sm text-slate-500">
                Follow these steps to complete your booking.
              </p>

              <ol className="mt-5 space-y-4">
                {[
                  "Select your preferred doctor.",
                  "Choose an available date.",
                  "Pick a scheduled time slot.",
                  "Attach reports if needed.",
                  "Review and confirm.",
                ].map((item, index) => (
                  <li key={item} className="flex items-start gap-3">
                    <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-teal-50 text-xs font-bold text-teal-700">
                      {String(index + 1).padStart(2, "0")}
                    </span>
                    <span className="pt-1 text-sm leading-5 text-slate-600">
                      {item}
                    </span>
                  </li>
                ))}
              </ol>
            </section>

            <section className="rounded-2xl border border-teal-100 bg-gradient-to-br from-teal-50 to-cyan-50 p-6">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white text-teal-700 shadow-sm">
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  className="h-5 w-5"
                  aria-hidden="true"
                >
                  <rect
                    x="3"
                    y="5"
                    width="18"
                    height="16"
                    rx="3"
                    stroke="currentColor"
                    strokeWidth="1.6"
                  />
                  <path
                    d="M8 3v4M16 3v4M4 10h16M8 14h3"
                    stroke="currentColor"
                    strokeWidth="1.6"
                    strokeLinecap="round"
                  />
                </svg>
              </div>

              <p className="mt-4 text-sm font-bold text-teal-950">
                Already booked?
              </p>
              <p className="mt-2 text-sm leading-6 text-teal-800">
                Visit your appointments page to review existing bookings and
                check their status.
              </p>

              <button
                type="button"
                onClick={() => navigate("/my-appointments")}
                className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl border border-teal-200 bg-white px-4 py-3 text-sm font-bold text-teal-800 transition hover:bg-teal-100"
              >
                My appointments →
              </button>
            </section>
          </aside>
        </div>

        <footer className="py-8 text-center text-xs text-slate-400">
          MediCare Patient Portal · Your healthcare, made simpler.
        </footer>
      </main>
    </div>
  );
}

export default BookAppointment;