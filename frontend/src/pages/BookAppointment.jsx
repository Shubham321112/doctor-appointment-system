import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import Header from "../components/Header";
import { logout } from "../store/authSlice";

const MAX_FILES = 3;
const MAX_FILE_SIZE = 1 * 1024 * 1024;
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
        if (active) setLoadingDoctors(false);
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
      (item) =>
        item.day?.toLowerCase() === dayName.toLowerCase()
    );

    if (availability) {
      setAvailableSlots(availability.slots || []);
    }
  }, [selectedDoctor, date, doctors]);

  const handleDoctorChange = (event) => {
    setSelectedDoctor(event.target.value);
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
    setDate(event.target.value);
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
      reports.map((file) => `${file.name}-${file.size}-${file.lastModified}`)
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

      setMessage(
        result.message || "Appointment booked successfully!"
      );

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

  const inputClass =
    "w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-teal-500 focus:ring-4 focus:ring-teal-500/10 disabled:cursor-not-allowed disabled:bg-slate-50";

  return (
    <div className="min-h-screen bg-slate-50">
      <Header user={user} onLogout={handleLogout} />

      <main className="mx-auto w-full max-w-7xl px-4 py-7 sm:px-6 sm:py-10 lg:px-8">
        <div className="mb-7 flex flex-wrap items-center gap-2 text-sm text-slate-500">
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
        </div>

        <section className="relative mb-8 overflow-hidden rounded-3xl bg-gradient-to-br from-teal-800 via-teal-700 to-cyan-600 p-6 text-white shadow-lg sm:p-9 lg:p-10">
          <div className="pointer-events-none absolute -right-12 -top-16 h-64 w-64 rounded-full border-[35px] border-white/10" />
          <div className="pointer-events-none absolute -bottom-28 right-40 h-56 w-56 rounded-full bg-white/5" />

          <div className="relative max-w-2xl">
            <span className="inline-flex rounded-full border border-white/25 bg-white/10 px-3 py-1.5 text-xs font-semibold uppercase tracking-wider">
              Patient Services
            </span>

            <h1 className="mt-5 text-3xl font-bold leading-tight sm:text-4xl">
              Book an Appointment
            </h1>

            <p className="mt-3 max-w-xl text-sm leading-7 text-teal-50 sm:text-base">
              Schedule your consultation, select an available slot,
              and optionally attach your medical reports.
            </p>

            <div className="mt-6 flex flex-wrap gap-3">
              <button
                type="button"
                onClick={() => navigate("/my-appointments")}
                className="rounded-xl bg-white px-4 py-3 text-sm font-bold text-teal-800 transition hover:bg-teal-50"
              >
                View My Appointments →
              </button>

              <button
                type="button"
                onClick={() => navigate("/profile")}
                className="rounded-xl border border-white/30 bg-white/10 px-4 py-3 text-sm font-semibold text-white transition hover:bg-white/20"
              >
                My Profile
              </button>
            </div>
          </div>
        </section>

        {message && (
          <div
            role="status"
            className="mb-6 flex flex-col gap-4 rounded-2xl border border-emerald-200 bg-emerald-50 p-5 sm:flex-row sm:items-center sm:justify-between"
          >
            <div className="flex gap-3">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-100 text-xl text-emerald-700">
                ✓
              </span>
              <div>
                <h2 className="font-bold text-emerald-800">
                  Booking submitted
                </h2>
                <p className="mt-1 text-sm text-emerald-700">
                  {message}
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => navigate("/my-appointments")}
              className="rounded-xl bg-emerald-700 px-4 py-3 text-sm font-bold text-white transition hover:bg-emerald-800"
            >
              View Appointments →
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
              <p className="font-bold">Something needs attention</p>
              <p className="mt-1">{error}</p>
            </div>
            <button
              type="button"
              onClick={() => setError("")}
              className="ml-auto rounded-lg px-2 text-lg hover:bg-red-100"
              aria-label="Dismiss error"
            >
              ×
            </button>
          </div>
        )}

        <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
          <section className="min-w-0 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-8">
            <div className="mb-7 border-b border-slate-100 pb-5">
              <p className="text-xs font-bold uppercase tracking-widest text-teal-700">
                Appointment details
              </p>
              <h2 className="mt-2 text-2xl font-bold text-slate-900">
                Schedule your visit
              </h2>
              <p className="mt-2 text-sm leading-6 text-slate-500">
                Complete the details below to request an appointment.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-7">
              <div>
                <label
                  htmlFor="doctor"
                  className="mb-2 block text-sm font-bold text-slate-800"
                >
                  <span className="mr-2 inline-flex h-7 w-7 items-center justify-center rounded-lg bg-teal-50 text-sm text-teal-700">
                    1
                  </span>
                  Select a doctor
                </label>

                <select
                  id="doctor"
                  value={selectedDoctor}
                  onChange={handleDoctorChange}
                  required
                  disabled={loadingDoctors}
                  className={inputClass}
                >
                  <option value="">
                    {loadingDoctors
                      ? "Loading doctors..."
                      : doctors.length === 0
                        ? "No doctors available"
                        : "Choose a doctor"}
                  </option>

                  {doctors.map((doctor) => (
                    <option key={doctor._id} value={doctor.name}>
                      {doctor.name}
                      {doctor.specialization
                        ? ` — ${doctor.specialization}`
                        : ""}
                    </option>
                  ))}
                </select>

                {selectedDoctor && (
                  <p className="mt-2 text-xs text-teal-700">
                    Selected doctor: {selectedDoctor}
                  </p>
                )}
              </div>

              <div>
                <label
                  htmlFor="date"
                  className="mb-2 block text-sm font-bold text-slate-800"
                >
                  <span className="mr-2 inline-flex h-7 w-7 items-center justify-center rounded-lg bg-teal-50 text-sm text-teal-700">
                    2
                  </span>
                  Choose a date
                </label>

                <input
                  id="date"
                  type="date"
                  value={date}
                  min={todayString}
                  onChange={handleDateChange}
                  disabled={!selectedDoctor}
                  required
                  className={inputClass}
                />

                {selectedDay && (
                  <p className="mt-2 text-sm font-medium text-teal-700">
                    Selected day: {selectedDay}
                  </p>
                )}
              </div>

              <div>
                <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                  <label className="block text-sm font-bold text-slate-800">
                    <span className="mr-2 inline-flex h-7 w-7 items-center justify-center rounded-lg bg-teal-50 text-sm text-teal-700">
                      3
                    </span>
                    Available time slots
                  </label>

                  {availableSlots.length > 0 && (
                    <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
                      {availableSlots.length} slots available
                    </span>
                  )}
                </div>

                {!selectedDoctor || !date ? (
                  <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 p-6 text-center">
                    <div className="text-2xl">◷</div>
                    <p className="mt-2 text-sm font-semibold text-slate-700">
                      Choose a doctor and date first
                    </p>
                    <p className="mt-1 text-xs leading-5 text-slate-500">
                      Available time slots will appear here.
                    </p>
                  </div>
                ) : availableSlots.length === 0 ? (
                  <div className="rounded-xl border border-amber-200 bg-amber-50 p-5">
                    <p className="font-semibold text-amber-800">
                      No slots available for {selectedDay}
                    </p>
                    <p className="mt-1 text-sm text-amber-700">
                      Please select another date.
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                    {availableSlots.map((slot) => (
                      <button
                        type="button"
                        key={slot}
                        aria-pressed={time === slot}
                        onClick={() => {
                          setTime(slot);
                          setMessage("");
                          setError("");
                        }}
                        className={`rounded-xl border px-3 py-3 text-sm font-semibold transition ${
                          time === slot
                            ? "border-teal-700 bg-teal-700 text-white shadow-md"
                            : "border-slate-200 bg-white text-slate-700 hover:border-teal-400 hover:bg-teal-50"
                        }`}
                      >
                        <span className="mr-1">◷</span>
                        {slot}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <div>
                <label
                  htmlFor="reason"
                  className="mb-2 block text-sm font-bold text-slate-800"
                >
                  <span className="mr-2 inline-flex h-7 w-7 items-center justify-center rounded-lg bg-teal-50 text-sm text-teal-700">
                    4
                  </span>
                  Reason for your visit
                  <span className="ml-2 font-normal text-slate-400">
                    (optional)
                  </span>
                </label>

                <textarea
                  id="reason"
                  value={reason}
                  onChange={(event) => setReason(event.target.value)}
                  placeholder="Briefly describe your reason for visiting..."
                  rows={4}
                  maxLength={1000}
                  className={`${inputClass} resize-y`}
                />

                <p className="mt-2 text-xs text-slate-400">
                  Avoid including unnecessary sensitive personal details.
                </p>
              </div>

              <div>
                <label
                  htmlFor="reports"
                  className="mb-2 block text-sm font-bold text-slate-800"
                >
                  <span className="mr-2 inline-flex h-7 w-7 items-center justify-center rounded-lg bg-teal-50 text-sm text-teal-700">
                    5
                  </span>
                  Medical reports
                  <span className="ml-2 font-normal text-slate-400">
                    (optional)
                  </span>
                </label>

                <div className="rounded-2xl border-2 border-dashed border-teal-200 bg-teal-50/50 p-5 sm:p-6">
                  <div className="text-center">
                    <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-white text-2xl shadow-sm">
                      📄
                    </div>
                    <p className="mt-3 font-semibold text-slate-800">
                      Attach your medical reports
                    </p>
                    <p className="mt-1 text-sm text-slate-500">
                      PDF, JPG or PNG · Up to 1 MB per file
                    </p>
                    <p className="mt-1 text-xs text-slate-400">
                      Maximum {MAX_FILES} files
                    </p>
                  </div>

                  <input
                    id="reports"
                    type="file"
                    accept=".pdf,.jpg,.jpeg,.png,application/pdf,image/jpeg,image/png"
                    multiple
                    disabled={reports.length >= MAX_FILES || booking}
                    onChange={handleReportChange}
                    className="mt-5 block w-full cursor-pointer rounded-xl border border-slate-200 bg-white text-sm text-slate-600 file:mr-4 file:cursor-pointer file:border-0 file:bg-teal-700 file:px-4 file:py-3 file:font-semibold file:text-white hover:file:bg-teal-800 disabled:opacity-50"
                  />

                  {reports.length > 0 && (
                    <ul className="mt-4 space-y-2">
                      {reports.map((file, index) => (
                        <li
                          key={`${file.name}-${file.lastModified}-${index}`}
                          className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white p-3"
                        >
                          <span className="text-xl">📎</span>
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
                            aria-label={`Remove ${file.name}`}
                            className="rounded-lg px-3 py-2 text-sm font-semibold text-red-600 hover:bg-red-50 disabled:opacity-50"
                          >
                            Remove
                          </button>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>

              {selectedDoctor && date && time && (
                <div className="rounded-2xl border border-teal-100 bg-teal-50/70 p-5">
                  <p className="text-xs font-bold uppercase tracking-wider text-teal-700">
                    Booking summary
                  </p>

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
                        {date}
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
                </div>
              )}

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
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-teal-700 px-5 py-4 text-sm font-bold text-white shadow-sm transition hover:bg-teal-800 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {booking
                  ? "Booking your appointment..."
                  : "Confirm Appointment →"}
              </button>

              <p className="text-center text-xs leading-5 text-slate-400">
                Please review your selected doctor, date, time and attached
                files before confirming.
              </p>
            </form>
          </section>

          <aside className="space-y-5">
            <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-teal-50 text-2xl text-teal-700">
                ♡
              </div>
              <h2 className="mt-4 text-lg font-bold text-slate-900">
                Your health comes first
              </h2>
              <p className="mt-2 text-sm leading-6 text-slate-500">
                Choose a doctor and an available appointment time to submit
                your booking request.
              </p>
            </section>

            <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <h2 className="font-bold text-slate-900">
                Booking checklist
              </h2>

              <ul className="mt-4 space-y-4 text-sm text-slate-600">
                <li className="flex gap-3">
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-teal-50 font-bold text-teal-700">
                    1
                  </span>
                  Select your preferred doctor.
                </li>
                <li className="flex gap-3">
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-teal-50 font-bold text-teal-700">
                    2
                  </span>
                  Pick a date when the doctor is available.
                </li>
                <li className="flex gap-3">
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-teal-50 font-bold text-teal-700">
                    3
                  </span>
                  Select one of the available time slots.
                </li>
                <li className="flex gap-3">
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-teal-50 font-bold text-teal-700">
                    4
                  </span>
                  Attach reports if needed and confirm.
                </li>
              </ul>
            </section>

            <section className="rounded-2xl border border-teal-100 bg-teal-50 p-6">
              <p className="text-sm font-bold text-teal-900">
                Already booked?
              </p>
              <p className="mt-2 text-sm leading-6 text-teal-800">
                Visit your appointments page to review your existing bookings
                and their status.
              </p>
              <button
                type="button"
                onClick={() => navigate("/my-appointments")}
                className="mt-4 w-full rounded-xl border border-teal-200 bg-white px-4 py-3 text-sm font-bold text-teal-800 transition hover:bg-teal-100"
              >
                My Appointments →
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