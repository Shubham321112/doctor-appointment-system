import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";

import api from "../services/api";
import { logout } from "../store/authSlice";

const daysList = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
];

const timeSlots = [
  "09:00 AM",
  "10:00 AM",
  "11:00 AM",
  "12:00 PM",
  "01:00 PM",
  "02:00 PM",
  "03:00 PM",
  "04:00 PM",
  "05:00 PM",
  "06:00 PM",
];

function AdminDashboard() {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { user, token } = useSelector(
    (state) => state.auth
  );

  const [appointments, setAppointments] = useState([]);
  const [users, setUsers] = useState([]);

  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const [doctorForm, setDoctorForm] = useState({
    name: "",
    email: "",
    contact: "",
    password: "",
  });

  const [selectedDays, setSelectedDays] = useState({});
  const [selectedSlots, setSelectedSlots] = useState({});

  const [creatingDoctor, setCreatingDoctor] =
    useState(false);

  const [editingDoctorId, setEditingDoctorId] =
    useState(null);

  const [editingDays, setEditingDays] = useState({});
  const [editingSlots, setEditingSlots] = useState({});
  const [savingAvailability, setSavingAvailability] =
    useState(false);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError("");

      const [appointmentData, userData] =
        await Promise.all([
          api.getAllAppointments(token),
          api.getAllUsers(token),
        ]);

      setAppointments(
        appointmentData.appointments || []
      );

      setUsers(userData.users || []);
    } catch (err) {
      setError(
        err.message ||
          "Failed to load admin dashboard"
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

    if (user?.role !== "admin") {
      navigate("/dashboard");
      return;
    }

    fetchData();
  }, [token, user]);

  const patients = users.filter(
    (item) => item.role === "patient"
  );

  const doctors = users.filter(
    (item) => item.role === "doctor"
  );

  const pendingAppointments = appointments.filter(
    (item) => item.status === "pending"
  );

  const confirmedAppointments = appointments.filter(
    (item) => item.status === "confirmed"
  );

  const cancelledAppointments = appointments.filter(
    (item) => item.status === "cancelled"
  );

  const handleLogout = () => {
    dispatch(logout());
    navigate("/");
  };

  const handleDoctorInput = (e) => {
    setDoctorForm({
      ...doctorForm,
      [e.target.name]: e.target.value,
    });
  };

  const toggleDay = (day) => {
    setSelectedDays((prev) => ({
      ...prev,
      [day]: !prev[day],
    }));

    if (selectedDays[day]) {
      setSelectedSlots((prev) => ({
        ...prev,
        [day]: [],
      }));
    }
  };

  const toggleSlot = (day, slot) => {
    setSelectedSlots((prev) => {
      const currentSlots = prev[day] || [];

      const exists = currentSlots.includes(slot);

      return {
        ...prev,
        [day]: exists
          ? currentSlots.filter(
              (item) => item !== slot
            )
          : [...currentSlots, slot],
      };
    });
  };

  const handleCreateDoctor = async (e) => {
    e.preventDefault();

    try {
      setCreatingDoctor(true);
      setError("");
      setMessage("");

      const availability = daysList
        .filter((day) => selectedDays[day])
        .map((day) => ({
          day,
          slots: selectedSlots[day] || [],
        }))
        .filter(
          (item) => item.slots.length > 0
        );

      if (availability.length === 0) {
        setError(
          "Please select at least one day and one time slot."
        );
        setCreatingDoctor(false);
        return;
      }

      const result = await api.createDoctor(
        {
          ...doctorForm,
          availability,
        },
        token
      );

      setMessage(
        result.message ||
          "Doctor created successfully"
      );

      setDoctorForm({
        name: "",
        email: "",
        contact: "",
        password: "",
      });

      setSelectedDays({});
      setSelectedSlots({});

      await fetchData();
    } catch (err) {
      setError(
        err.message ||
          "Failed to create doctor"
      );
    } finally {
      setCreatingDoctor(false);
    }
  };

  // Start editing doctor availability
  const handleEditAvailability = (doctor) => {
    const days = {};
    const slots = {};

    daysList.forEach((day) => {
      const availability =
        doctor.availability?.find(
          (item) => item.day === day
        );

      if (availability) {
        days[day] = true;
        slots[day] = [
          ...(availability.slots || []),
        ];
      } else {
        days[day] = false;
        slots[day] = [];
      }
    });

    setEditingDoctorId(doctor._id);
    setEditingDays(days);
    setEditingSlots(slots);
    setMessage("");
    setError("");
  };

  // Cancel editing
  const handleCancelEdit = () => {
    setEditingDoctorId(null);
    setEditingDays({});
    setEditingSlots({});
  };

  // Toggle edit day
  const toggleEditingDay = (day) => {
    setEditingDays((prev) => ({
      ...prev,
      [day]: !prev[day],
    }));

    if (editingDays[day]) {
      setEditingSlots((prev) => ({
        ...prev,
        [day]: [],
      }));
    }
  };

  // Toggle edit time slot
  const toggleEditingSlot = (day, slot) => {
    setEditingSlots((prev) => {
      const currentSlots = prev[day] || [];

      const exists = currentSlots.includes(slot);

      return {
        ...prev,
        [day]: exists
          ? currentSlots.filter(
              (item) => item !== slot
            )
          : [...currentSlots, slot],
      };
    });
  };

  // Save doctor availability
  const handleSaveAvailability = async () => {
    try {
      setSavingAvailability(true);
      setError("");
      setMessage("");

      const availability = daysList
        .filter((day) => editingDays[day])
        .map((day) => ({
          day,
          slots: editingSlots[day] || [],
        }))
        .filter(
          (item) => item.slots.length > 0
        );

      if (availability.length === 0) {
        setError(
          "Please select at least one day and one time slot."
        );
        setSavingAvailability(false);
        return;
      }

      const result =
        await api.updateDoctorAvailability(
          editingDoctorId,
          availability,
          token
        );

      setMessage(
        result.message ||
          "Doctor availability updated successfully"
      );

      setEditingDoctorId(null);
      setEditingDays({});
      setEditingSlots({});

      await fetchData();
    } catch (err) {
      setError(
        err.message ||
          "Failed to update doctor availability"
      );
    } finally {
      setSavingAvailability(false);
    }
  };

  const handleDeleteUser = async (id) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this user?"
    );

    if (!confirmDelete) return;

    try {
      setError("");
      setMessage("");

      const result = await api.deleteUser(
        id,
        token
      );

      setMessage(
        result.message ||
          "User deleted successfully"
      );

      await fetchData();
    } catch (err) {
      setError(
        err.message ||
          "Failed to delete user"
      );
    }
  };

  const handleDeleteAppointment = async (id) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this appointment?"
    );

    if (!confirmDelete) return;

    try {
      setError("");
      setMessage("");

      const result =
        await api.deleteAppointment(
          id,
          token
        );

      setMessage(
        result.message ||
          "Appointment deleted successfully"
      );

      await fetchData();
    } catch (err) {
      setError(
        err.message ||
          "Failed to delete appointment"
      );
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-center">
          <div className="text-5xl mb-4 animate-pulse">
            🛡️
          </div>

          <p className="text-xl font-semibold text-gray-700">
            Loading Admin Dashboard...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Navbar */}
      <nav className="bg-purple-600 text-white shadow-lg sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 py-4">
            <button
              onClick={() =>
                navigate("/admin-dashboard")
              }
              className="text-left"
            >
              <h1 className="text-xl sm:text-2xl font-bold">
                🩺 Doctor Appointment System
              </h1>

              <p className="text-purple-100 text-sm mt-1">
                Admin Portal
              </p>
            </button>

            <div className="flex flex-wrap items-center gap-2 sm:gap-3">
              <div className="text-right mr-1">
                <p className="font-semibold">
                  {user?.name || "Admin"}
                </p>

                <p className="text-xs text-purple-100">
                  Administrator
                </p>
              </div>

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
                className="bg-red-500 hover:bg-red-600 px-4 py-2 rounded-lg font-semibold transition"
              >
                🚪 Logout
              </button>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8 py-8">
        {/* Messages */}
        {message && (
          <div className="mb-5 p-4 bg-green-100 border border-green-300 text-green-700 rounded-xl">
            <div className="flex gap-3">
              <span className="text-xl">
                ✅
              </span>

              <p className="font-medium">
                {message}
              </p>
            </div>
          </div>
        )}

        {error && (
          <div className="mb-5 p-4 bg-red-100 border border-red-300 text-red-700 rounded-xl">
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

        {/* Header */}
        <section className="bg-white rounded-2xl shadow-lg p-6 md:p-8 mb-8">
          <p className="text-purple-600 font-semibold">
            Administration
          </p>

          <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mt-1">
            Admin Dashboard 🛡️
          </h2>

          <p className="text-gray-500 mt-2">
            Manage doctors, patients, availability and
            appointments from one place.
          </p>
        </section>

        {/* Statistics */}
        <section className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
          <div className="bg-white p-5 rounded-2xl shadow border-l-4 border-purple-600">
            <p className="text-gray-500 text-sm">
              Appointments
            </p>

            <h2 className="text-3xl font-bold text-purple-600 mt-2">
              {appointments.length}
            </h2>
          </div>

          <div className="bg-white p-5 rounded-2xl shadow border-l-4 border-blue-500">
            <p className="text-gray-500 text-sm">
              Patients
            </p>

            <h2 className="text-3xl font-bold text-blue-600 mt-2">
              {patients.length}
            </h2>
          </div>

          <div className="bg-white p-5 rounded-2xl shadow border-l-4 border-indigo-500">
            <p className="text-gray-500 text-sm">
              Doctors
            </p>

            <h2 className="text-3xl font-bold text-indigo-600 mt-2">
              {doctors.length}
            </h2>
          </div>

          <div className="bg-white p-5 rounded-2xl shadow border-l-4 border-yellow-500">
            <p className="text-gray-500 text-sm">
              Pending
            </p>

            <h2 className="text-3xl font-bold text-yellow-600 mt-2">
              {pendingAppointments.length}
            </h2>
          </div>

          <div className="bg-white p-5 rounded-2xl shadow border-l-4 border-green-500">
            <p className="text-gray-500 text-sm">
              Confirmed
            </p>

            <h2 className="text-3xl font-bold text-green-600 mt-2">
              {confirmedAppointments.length}
            </h2>
          </div>

          <div className="bg-white p-5 rounded-2xl shadow border-l-4 border-red-500">
            <p className="text-gray-500 text-sm">
              Cancelled
            </p>

            <h2 className="text-3xl font-bold text-red-600 mt-2">
              {cancelledAppointments.length}
            </h2>
          </div>
        </section>

        {/* Add Doctor */}
        <section className="bg-white rounded-2xl shadow-lg p-6 md:p-8 mb-8">
          <div className="mb-6">
            <p className="text-purple-600 font-semibold">
              Doctor Management
            </p>

            <h2 className="text-2xl font-bold text-gray-800 mt-1">
              Add New Doctor
            </h2>

            <p className="text-gray-500 mt-1">
              Create a doctor account and configure their
              working schedule.
            </p>
          </div>

          <form onSubmit={handleCreateDoctor}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <input
                type="text"
                name="name"
                placeholder="Doctor Name"
                value={doctorForm.name}
                onChange={handleDoctorInput}
                required
                className="border border-gray-300 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-purple-500"
              />

              <input
                type="email"
                name="email"
                placeholder="Doctor Email"
                value={doctorForm.email}
                onChange={handleDoctorInput}
                required
                className="border border-gray-300 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-purple-500"
              />

              <input
                type="text"
                name="contact"
                placeholder="Contact Number"
                value={doctorForm.contact}
                onChange={handleDoctorInput}
                required
                className="border border-gray-300 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-purple-500"
              />

              <input
                type="password"
                name="password"
                placeholder="Password"
                value={doctorForm.password}
                onChange={handleDoctorInput}
                required
                minLength={6}
                className="border border-gray-300 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>

            {/* Days */}
            <div className="mt-7">
              <h3 className="font-bold text-lg text-gray-800 mb-3">
                Available Days
              </h3>

              <div className="flex flex-wrap gap-3">
                {daysList.map((day) => (
                  <label
                    key={day}
                    className={`flex items-center gap-2 border px-4 py-2.5 rounded-xl cursor-pointer transition ${
                      selectedDays[day]
                        ? "bg-purple-100 border-purple-500 text-purple-700"
                        : "bg-white hover:bg-gray-50"
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={
                        !!selectedDays[day]
                      }
                      onChange={() =>
                        toggleDay(day)
                      }
                    />

                    <span className="font-medium">
                      {day}
                    </span>
                  </label>
                ))}
              </div>
            </div>

            {/* Slots */}
            <div className="mt-7">
              <h3 className="font-bold text-lg text-gray-800 mb-3">
                Available Time Slots
              </h3>

              <div className="space-y-5">
                {daysList
                  .filter(
                    (day) => selectedDays[day]
                  )
                  .map((day) => (
                    <div
                      key={day}
                      className="border border-gray-200 rounded-xl p-5"
                    >
                      <h4 className="font-bold text-gray-800 mb-3">
                        {day}
                      </h4>

                      <div className="flex flex-wrap gap-3">
                        {timeSlots.map(
                          (slot) => (
                            <label
                              key={slot}
                              className={`flex items-center gap-2 border px-3 py-2 rounded-lg cursor-pointer transition ${
                                (
                                  selectedSlots[
                                    day
                                  ] || []
                                ).includes(
                                  slot
                                )
                                  ? "bg-purple-100 border-purple-500 text-purple-700"
                                  : "hover:bg-gray-50"
                              }`}
                            >
                              <input
                                type="checkbox"
                                checked={(
                                  selectedSlots[
                                    day
                                  ] || []
                                ).includes(
                                  slot
                                )}
                                onChange={() =>
                                  toggleSlot(
                                    day,
                                    slot
                                  )
                                }
                              />

                              <span>
                                {slot}
                              </span>
                            </label>
                          )
                        )}
                      </div>
                    </div>
                  ))}
              </div>
            </div>

            <button
              type="submit"
              disabled={creatingDoctor}
              className="mt-7 px-7 py-3 bg-purple-600 text-white rounded-xl hover:bg-purple-700 disabled:opacity-50 font-semibold transition"
            >
              {creatingDoctor
                ? "Creating Doctor..."
                : "➕ Add Doctor"}
            </button>
          </form>
        </section>

        {/* Doctors */}
        <section className="bg-white rounded-2xl shadow-lg p-6 md:p-8 mb-8">
          <div className="mb-6">
            <p className="text-purple-600 font-semibold">
              Manage Doctors
            </p>

            <h2 className="text-2xl font-bold text-gray-800 mt-1">
              Doctor Management
            </h2>

            <p className="text-gray-500 mt-1">
              Edit doctor availability or remove a doctor
              account.
            </p>
          </div>

          {doctors.length === 0 ? (
            <div className="text-center py-10">
              <div className="text-5xl mb-3">
                👨‍⚕️
              </div>

              <p className="text-gray-500">
                No doctors found.
              </p>
            </div>
          ) : (
            <div className="space-y-5">
              {doctors.map((doctor) => (
                <div
                  key={doctor._id}
                  className="border border-gray-200 rounded-2xl overflow-hidden"
                >
                  {/* Doctor Info */}
                  <div className="bg-gray-50 p-5">
                    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                      <div>
                        <h3 className="text-xl font-bold text-gray-800">
                          👨‍⚕️ {doctor.name}
                        </h3>

                        <div className="text-sm text-gray-500 mt-2 space-y-1">
                          <p>
                            📧 {doctor.email}
                          </p>

                          <p>
                            📱 {doctor.contact}
                          </p>
                        </div>
                      </div>

                      <div className="flex flex-wrap gap-2">
                        {editingDoctorId !==
                          doctor._id && (
                          <button
                            onClick={() =>
                              handleEditAvailability(
                                doctor
                              )
                            }
                            className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 font-semibold transition"
                          >
                            ✏️ Edit Availability
                          </button>
                        )}

                        <button
                          onClick={() =>
                            handleDeleteUser(
                              doctor._id
                            )
                          }
                          className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 font-semibold transition"
                        >
                          🗑️ Delete
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Edit Availability */}
                  {editingDoctorId ===
                    doctor._id && (
                    <div className="p-5 md:p-6 bg-purple-50 border-t border-purple-100">
                      <div className="mb-5">
                        <h3 className="text-xl font-bold text-gray-800">
                          Edit Availability
                        </h3>

                        <p className="text-gray-500 text-sm mt-1">
                          Select the days and time slots when{" "}
                          <span className="font-semibold">
                            {doctor.name}
                          </span>{" "}
                          is available.
                        </p>
                      </div>

                      {/* Edit Days */}
                      <div className="flex flex-wrap gap-3">
                        {daysList.map((day) => (
                          <label
                            key={day}
                            className={`flex items-center gap-2 border px-4 py-2.5 rounded-xl cursor-pointer transition ${
                              editingDays[day]
                                ? "bg-purple-600 text-white border-purple-600"
                                : "bg-white hover:bg-gray-50"
                            }`}
                          >
                            <input
                              type="checkbox"
                              checked={
                                !!editingDays[
                                  day
                                ]
                              }
                              onChange={() =>
                                toggleEditingDay(
                                  day
                                )
                              }
                            />

                            <span className="font-medium">
                              {day}
                            </span>
                          </label>
                        ))}
                      </div>

                      {/* Edit Slots */}
                      <div className="mt-6 space-y-5">
                        {daysList
                          .filter(
                            (day) =>
                              editingDays[
                                day
                              ]
                          )
                          .map((day) => (
                            <div
                              key={day}
                              className="bg-white border border-gray-200 rounded-xl p-5"
                            >
                              <h4 className="font-bold text-gray-800 mb-3">
                                {day}
                              </h4>

                              <div className="flex flex-wrap gap-3">
                                {timeSlots.map(
                                  (slot) => (
                                    <label
                                      key={slot}
                                      className={`flex items-center gap-2 border px-3 py-2 rounded-lg cursor-pointer transition ${
                                        (
                                          editingSlots[
                                            day
                                          ] || []
                                        ).includes(
                                          slot
                                        )
                                          ? "bg-purple-100 border-purple-500 text-purple-700"
                                          : "hover:bg-gray-50"
                                      }`}
                                    >
                                      <input
                                        type="checkbox"
                                        checked={(
                                          editingSlots[
                                            day
                                          ] || []
                                        ).includes(
                                          slot
                                        )}
                                        onChange={() =>
                                          toggleEditingSlot(
                                            day,
                                            slot
                                          )
                                        }
                                      />

                                      <span>
                                        {slot}
                                      </span>
                                    </label>
                                  )
                                )}
                              </div>
                            </div>
                          ))}
                      </div>

                      <div className="flex flex-col sm:flex-row gap-3 mt-6">
                        <button
                          onClick={
                            handleSaveAvailability
                          }
                          disabled={
                            savingAvailability
                          }
                          className="px-6 py-3 bg-green-600 text-white rounded-xl hover:bg-green-700 disabled:opacity-50 font-semibold transition"
                        >
                          {savingAvailability
                            ? "Saving..."
                            : "💾 Save Availability"}
                        </button>

                        <button
                          onClick={
                            handleCancelEdit
                          }
                          disabled={
                            savingAvailability
                          }
                          className="px-6 py-3 bg-gray-600 text-white rounded-xl hover:bg-gray-700 disabled:opacity-50 font-semibold transition"
                        >
                          ✖ Cancel
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Current Availability */}
                  {editingDoctorId !==
                    doctor._id && (
                    <div className="p-5">
                      <h4 className="font-semibold text-gray-700 mb-3">
                        Current Availability
                      </h4>

                      {doctor.availability
                        ?.length ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          {doctor.availability.map(
                            (item) => (
                              <div
                                key={item.day}
                                className="bg-purple-50 border border-purple-100 rounded-xl p-4"
                              >
                                <p className="font-bold text-purple-700">
                                  {item.day}
                                </p>

                                <p className="text-sm text-gray-600 mt-1">
                                  {item.slots.join(
                                    ", "
                                  )}
                                </p>
                              </div>
                            )
                          )}
                        </div>
                      ) : (
                        <p className="text-gray-500">
                          Availability not set.
                        </p>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Patients */}
        <section className="bg-white rounded-2xl shadow-lg p-6 md:p-8 mb-8">
          <div className="mb-5">
            <p className="text-blue-600 font-semibold">
              User Management
            </p>

            <h2 className="text-2xl font-bold text-gray-800 mt-1">
              Patient Management
            </h2>
          </div>

          {patients.length === 0 ? (
            <p className="text-gray-500">
              No patients found.
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[700px]">
                <thead>
                  <tr className="border-b text-left">
                    <th className="p-3">
                      Name
                    </th>

                    <th className="p-3">
                      Email
                    </th>

                    <th className="p-3">
                      Contact
                    </th>

                    <th className="p-3">
                      Action
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {patients.map(
                    (patient) => (
                      <tr
                        key={patient._id}
                        className="border-b hover:bg-gray-50"
                      >
                        <td className="p-3 font-semibold">
                          {patient.name}
                        </td>

                        <td className="p-3">
                          {patient.email}
                        </td>

                        <td className="p-3">
                          {patient.contact}
                        </td>

                        <td className="p-3">
                          <button
                            onClick={() =>
                              handleDeleteUser(
                                patient._id
                              )
                            }
                            className="px-3 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
                          >
                            🗑️ Delete
                          </button>
                        </td>
                      </tr>
                    )
                  )}
                </tbody>
              </table>
            </div>
          )}
        </section>

        {/* Appointments */}
        <section className="bg-white rounded-2xl shadow-lg p-6 md:p-8">
          <div className="mb-5">
            <p className="text-green-600 font-semibold">
              Appointment Management
            </p>

            <h2 className="text-2xl font-bold text-gray-800 mt-1">
              All Appointments
            </h2>
          </div>

          {appointments.length === 0 ? (
            <p className="text-gray-500">
              No appointments found.
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[1000px]">
                <thead>
                  <tr className="border-b text-left">
                    <th className="p-3">
                      Patient
                    </th>

                    <th className="p-3">
                      Doctor
                    </th>

                    <th className="p-3">
                      Date
                    </th>

                    <th className="p-3">
                      Time
                    </th>

                    <th className="p-3">
                      Reason
                    </th>

                    <th className="p-3">
                      Status
                    </th>

                    <th className="p-3">
                      Action
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {appointments.map(
                    (appointment) => (
                      <tr
                        key={appointment._id}
                        className="border-b hover:bg-gray-50"
                      >
                        <td className="p-3">
                          {appointment.patient
                            ?.name ||
                            "Unknown"}
                        </td>

                        <td className="p-3">
                          {appointment.doctor}
                        </td>

                        <td className="p-3">
                          {appointment.date}
                        </td>

                        <td className="p-3">
                          {appointment.time}
                        </td>

                        <td className="p-3">
                          {appointment.reason ||
                            "-"}
                        </td>

                        <td className="p-3 capitalize">
                          <span
                            className={`px-3 py-1 rounded-full text-sm font-semibold ${
                              appointment.status ===
                              "confirmed"
                                ? "bg-green-100 text-green-700"
                                : appointment.status ===
                                  "cancelled"
                                ? "bg-red-100 text-red-700"
                                : "bg-yellow-100 text-yellow-700"
                            }`}
                          >
                            {
                              appointment.status
                            }
                          </span>
                        </td>

                        <td className="p-3">
                          <button
                            onClick={() =>
                              handleDeleteAppointment(
                                appointment._id
                              )
                            }
                            className="px-3 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
                          >
                            🗑️ Delete
                          </button>
                        </td>
                      </tr>
                    )
                  )}
                </tbody>
              </table>
            </div>
          )}
        </section>

        <div className="mt-6 text-sm text-gray-500">
          Cancelled Appointments:{" "}
          {cancelledAppointments.length}
        </div>
      </main>
    </div>
  );
}

export default AdminDashboard;