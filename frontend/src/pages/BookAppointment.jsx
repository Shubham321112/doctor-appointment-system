import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";

import api from "../services/api";

function BookAppointment() {
  const navigate = useNavigate();

  const { token, user } = useSelector(
    (state) => state.auth
  );

  const [doctors, setDoctors] = useState([]);
  const [selectedDoctor, setSelectedDoctor] =
    useState("");

  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [reason, setReason] = useState("");

  const [availableSlots, setAvailableSlots] =
    useState([]);

  const [selectedDay, setSelectedDay] =
    useState("");

  const [loadingDoctors, setLoadingDoctors] =
    useState(true);

  const [booking, setBooking] = useState(false);

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const today = new Date()
    .toISOString()
    .split("T")[0];

  // Load doctors
  useEffect(() => {
    if (!token || user?.role !== "patient") {
      navigate("/");
      return;
    }

    const loadDoctors = async () => {
      try {
        setLoadingDoctors(true);
        setError("");

        const result =
          await api.getAllDoctors(token);

        setDoctors(result.doctors || []);
      } catch (err) {
        setError(
          err.message ||
            "Failed to load doctors"
        );
      } finally {
        setLoadingDoctors(false);
      }
    };

    loadDoctors();
  }, [token, user, navigate]);

  // Find available slots according to doctor + date
  useEffect(() => {
    setTime("");
    setAvailableSlots([]);
    setSelectedDay("");

    if (!selectedDoctor || !date) {
      return;
    }

    const doctor = doctors.find(
      (item) => item.name === selectedDoctor
    );

    if (!doctor) {
      return;
    }

    const selectedDate = new Date(
      `${date}T00:00:00`
    );

    const dayName =
      selectedDate.toLocaleDateString(
        "en-US",
        {
          weekday: "long",
        }
      );

    setSelectedDay(dayName);

    const availability =
      doctor.availability?.find(
        (item) => item.day === dayName
      );

    if (availability) {
      setAvailableSlots(
        availability.slots || []
      );
    }
  }, [selectedDoctor, date, doctors]);

  // Doctor change
  const handleDoctorChange = (e) => {
    setSelectedDoctor(e.target.value);

    setDate("");
    setTime("");
    setReason("");
    setAvailableSlots([]);
    setSelectedDay("");

    setMessage("");
    setError("");
  };

  // Date change
  const handleDateChange = (e) => {
    setDate(e.target.value);

    setTime("");
    setMessage("");
    setError("");
  };

  // Select time
  const handleTimeSelect = (slot) => {
    setTime(slot);
    setMessage("");
    setError("");
  };

  // Submit appointment
  const handleSubmit = async (e) => {
    e.preventDefault();

    setMessage("");
    setError("");

    if (
      !selectedDoctor ||
      !date ||
      !time
    ) {
      setError(
        "Please select doctor, date and time."
      );
      return;
    }

    if (!availableSlots.includes(time)) {
      setError(
        "Selected time slot is not available."
      );
      return;
    }

    try {
      setBooking(true);

      const result =
        await api.bookAppointment(
          selectedDoctor,
          date,
          time,
          reason,
          token
        );

      setMessage(
        result.message ||
          "Appointment booked successfully!"
      );

      setSelectedDoctor("");
      setDate("");
      setTime("");
      setReason("");
      setAvailableSlots([]);
      setSelectedDay("");
    } catch (err) {
      setError(
        err.message ||
          "Failed to book appointment"
      );
    } finally {
      setBooking(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Navbar */}
      <nav className="bg-blue-600 text-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div>
              <h1 className="text-xl sm:text-2xl font-bold">
                🩺 Doctor Appointment System
              </h1>

              <p className="text-blue-100 text-sm mt-1">
                Book your appointment
              </p>
            </div>

            <div className="flex flex-wrap gap-2">
              <button
                onClick={() =>
                  navigate("/dashboard")
                }
                className="px-4 py-2 bg-white text-blue-600 rounded-lg font-semibold hover:bg-blue-50 transition"
              >
                🏠 Dashboard
              </button>

              <button
                onClick={() =>
                  navigate("/my-appointments")
                }
                className="px-4 py-2 bg-blue-700 hover:bg-blue-800 rounded-lg font-semibold transition"
              >
                📅 My Appointments
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Main */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
        {/* Header */}
        <section className="bg-white rounded-2xl shadow-lg p-6 md:p-8 mb-6">
          <p className="text-blue-600 font-semibold">
            Appointment Booking
          </p>

          <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mt-1">
            Book an Appointment 🩺
          </h2>

          <p className="text-gray-500 mt-2">
            Select a doctor, choose an available date
            and select an available time slot.
          </p>
        </section>

        {/* Success */}
        {message && (
          <div className="mb-6 p-4 bg-green-100 border border-green-300 text-green-700 rounded-xl">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="flex gap-3">
                <span className="text-xl">
                  ✅
                </span>

                <div>
                  <p className="font-semibold">
                    {message}
                  </p>

                  <p className="text-sm mt-1">
                    Your appointment has been
                    submitted successfully.
                  </p>
                </div>
              </div>

              <button
                onClick={() =>
                  navigate(
                    "/my-appointments"
                  )
                }
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-semibold"
              >
                View Appointments
              </button>
            </div>
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="mb-6 p-4 bg-red-100 border border-red-300 text-red-700 rounded-xl">
            <div className="flex gap-3">
              <span className="text-xl">
                ⚠️
              </span>

              <p className="font-medium">
                {error}
              </p>
            </div>
          </div>
        )}

        {/* Booking Card */}
        <div className="bg-white rounded-2xl shadow-lg p-6 md:p-8">
          <form onSubmit={handleSubmit}>
            {/* Doctor */}
            <div className="mb-7">
              <label className="block font-bold text-gray-800 mb-2">
                1. Select Doctor
              </label>

              <select
                value={selectedDoctor}
                onChange={handleDoctorChange}
                required
                disabled={loadingDoctors}
                className="w-full border border-gray-300 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
              >
                <option value="">
                  {loadingDoctors
                    ? "Loading doctors..."
                    : doctors.length === 0
                    ? "No doctors available"
                    : "Select a doctor"}
                </option>

                {doctors.map((doctor) => (
                  <option
                    key={doctor._id}
                    value={doctor.name}
                  >
                    {doctor.name}
                  </option>
                ))}
              </select>

              {selectedDoctor && (
                <p className="text-sm text-gray-500 mt-2">
                  Selected doctor:{" "}
                  <span className="font-semibold text-blue-600">
                    {selectedDoctor}
                  </span>
                </p>
              )}
            </div>

            {/* Date */}
            <div className="mb-7">
              <label className="block font-bold text-gray-800 mb-2">
                2. Select Date
              </label>

              <input
                type="date"
                value={date}
                min={today}
                onChange={handleDateChange}
                disabled={!selectedDoctor}
                required
                className="w-full border border-gray-300 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
              />

              {!selectedDoctor && (
                <p className="text-sm text-gray-400 mt-2">
                  Please select a doctor first.
                </p>
              )}

              {selectedDay && (
                <div className="mt-3 inline-flex items-center gap-2 px-4 py-2 bg-blue-50 border border-blue-100 rounded-lg">
                  <span>📅</span>

                  <span className="text-blue-700 font-semibold">
                    {selectedDay}
                  </span>
                </div>
              )}
            </div>

            {/* Time Slots */}
            <div className="mb-7">
              <label className="block font-bold text-gray-800 mb-2">
                3. Select Available Time
              </label>

              {!selectedDoctor ||
              !date ? (
                <div className="p-4 bg-gray-50 border border-gray-200 rounded-xl">
                  <p className="text-gray-500">
                    First select a doctor and
                    date to see available time
                    slots.
                  </p>
                </div>
              ) : availableSlots.length ===
                0 ? (
                <div className="p-4 bg-red-50 border border-red-200 rounded-xl">
                  <div className="flex gap-3">
                    <span className="text-xl">
                      ❌
                    </span>

                    <div>
                      <p className="font-semibold text-red-700">
                        Doctor is not available
                        on {selectedDay}.
                      </p>

                      <p className="text-sm text-red-600 mt-1">
                        Please choose another
                        date.
                      </p>
                    </div>
                  </div>
                </div>
              ) : (
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <p className="text-sm text-gray-500">
                      Available slots for{" "}
                      <span className="font-semibold text-gray-700">
                        {selectedDay}
                      </span>
                    </p>

                    <span className="text-sm font-semibold text-green-600">
                      {availableSlots.length}{" "}
                      slots
                    </span>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                    {availableSlots.map(
                      (slot) => (
                        <button
                          type="button"
                          key={slot}
                          onClick={() =>
                            handleTimeSelect(
                              slot
                            )
                          }
                          className={`border rounded-xl px-3 py-3 font-semibold transition ${
                            time === slot
                              ? "bg-blue-600 text-white border-blue-600 shadow-md"
                              : "bg-white text-gray-700 border-gray-300 hover:bg-blue-50 hover:border-blue-400"
                          }`}
                        >
                          {time === slot
                            ? "✓ "
                            : "🕐 "}
                          {slot}
                        </button>
                      )
                    )}
                  </div>

                  {time && (
                    <div className="mt-4 p-4 bg-blue-50 border border-blue-100 rounded-xl">
                      <p className="text-blue-700">
                        Selected time:{" "}
                        <span className="font-bold">
                          {time}
                        </span>
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Reason */}
            <div className="mb-7">
              <label className="block font-bold text-gray-800 mb-2">
                4. Reason for Appointment
              </label>

              <textarea
                value={reason}
                onChange={(e) =>
                  setReason(e.target.value)
                }
                placeholder="Example: Fever, headache, regular check-up..."
                rows="4"
                className="w-full border border-gray-300 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500 resize-none"
              />

              <p className="text-xs text-gray-400 mt-2">
                Please briefly describe the reason
                for your appointment.
              </p>
            </div>

            {/* Summary */}
            {selectedDoctor &&
              date &&
              time && (
                <div className="mb-7 p-5 bg-gray-50 border border-gray-200 rounded-xl">
                  <h3 className="font-bold text-gray-800 mb-4">
                    Appointment Summary
                  </h3>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                      <p className="text-xs text-gray-500">
                        Doctor
                      </p>

                      <p className="font-semibold text-gray-800 mt-1">
                        {selectedDoctor}
                      </p>
                    </div>

                    <div>
                      <p className="text-xs text-gray-500">
                        Date
                      </p>

                      <p className="font-semibold text-gray-800 mt-1">
                        {date}
                      </p>
                    </div>

                    <div>
                      <p className="text-xs text-gray-500">
                        Time
                      </p>

                      <p className="font-semibold text-blue-600 mt-1">
                        {time}
                      </p>
                    </div>
                  </div>
                </div>
              )}

            {/* Submit */}
            <button
              type="submit"
              disabled={
                booking ||
                !selectedDoctor ||
                !date ||
                !time ||
                availableSlots.length === 0
              }
              className="w-full py-3.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed font-bold text-lg transition"
            >
              {booking
                ? "⏳ Booking Appointment..."
                : "📅 Book Appointment"}
            </button>
          </form>
        </div>

        {/* Info */}
        <div className="mt-6 bg-blue-50 border border-blue-100 rounded-2xl p-5">
          <h3 className="font-bold text-blue-800 mb-2">
            💡 Booking Information
          </h3>

          <ul className="text-sm text-blue-700 space-y-1">
            <li>
              • Only doctor-available days are
              eligible for booking.
            </li>

            <li>
              • Only available time slots can be
              selected.
            </li>

            <li>
              • Please check your appointment
              details before booking.
            </li>

            <li>
              • You can view your appointment status
              from My Appointments.
            </li>
          </ul>
        </div>
      </main>
    </div>
  );
}

export default BookAppointment;