
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";

import api from "../services/api";
import { logout } from "../store/authSlice";

const daysList = [
  "Monday", "Tuesday", "Wednesday", "Thursday",
  "Friday", "Saturday", "Sunday",
];

const timeSlots = [
  "09:00 AM", "10:00 AM", "11:00 AM", "12:00 PM",
  "01:00 PM", "02:00 PM", "03:00 PM", "04:00 PM",
  "05:00 PM", "06:00 PM",
];

const specializations = [
  "General Physician",
  "Cardiologist",
  "Dermatologist",
  "Neurologist",
  "Orthopedic",
  "Pediatrician",
  "Dentist",
  "Gynecologist",
  "Psychiatrist",
  "Ophthalmologist",
  "ENT Specialist",
  "Other",
];

function AdminDashboard() {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { user, token } = useSelector((state) => state.auth);

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
    specialization: "",
  });

  const [selectedDays, setSelectedDays] = useState({});
  const [selectedSlots, setSelectedSlots] = useState({});
  const [creatingDoctor, setCreatingDoctor] = useState(false);

  const [editingDoctorId, setEditingDoctorId] = useState(null);
  const [editingDays, setEditingDays] = useState({});
  const [editingSlots, setEditingSlots] = useState({});
  const [savingAvailability, setSavingAvailability] = useState(false);

  // Doctor profile editing states
  const [editingProfileId, setEditingProfileId] = useState(null);
  const [profileForm, setProfileForm] = useState({
    name: "",
    contact: "",
    specialization: "",
  });
  const [savingProfile, setSavingProfile] = useState(false);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError("");

      const [appointmentData, userData] = await Promise.all([
        api.getAllAppointments(token),
        api.getAllUsers(token),
      ]);

      setAppointments(appointmentData.appointments || []);
      setUsers(userData.users || []);
    } catch (err) {
      setError(err.message || "Failed to load admin dashboard");
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

  const patients = users.filter((item) => item.role === "patient");
  const doctors = users.filter((item) => item.role === "doctor");

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

  // =========================
  // CREATE DOCTOR
  // =========================

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
          ? currentSlots.filter((item) => item !== slot)
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
        .filter((item) => item.slots.length > 0);

      if (availability.length === 0) {
        setError("Please select at least one day and one time slot.");
        return;
      }

      const result = await api.createDoctor(
        { ...doctorForm, availability },
        token
      );

      setMessage(result.message || "Doctor created successfully");

      setDoctorForm({
        name: "",
        email: "",
        contact: "",
        password: "",
        specialization: "",
      });

      setSelectedDays({});
      setSelectedSlots({});

      await fetchData();
    } catch (err) {
      setError(err.message || "Failed to create doctor");
    } finally {
      setCreatingDoctor(false);
    }
  };

  // =========================
  // EDIT DOCTOR PROFILE
  // =========================

  const handleEditProfile = (doctor) => {
    setEditingProfileId(doctor._id);

    setProfileForm({
      name: doctor.name || "",
      contact: doctor.contact || "",
      specialization: doctor.specialization || "",
    });

    setMessage("");
    setError("");
  };

  const handleProfileInput = (e) => {
    setProfileForm((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleCancelProfileEdit = () => {
    setEditingProfileId(null);
    setProfileForm({
      name: "",
      contact: "",
      specialization: "",
    });
  };

  const handleSaveDoctorProfile = async (id) => {
    try {
      setSavingProfile(true);
      setError("");
      setMessage("");

      if (
        !profileForm.name.trim() ||
        !profileForm.contact.trim() ||
        !profileForm.specialization
      ) {
        setError("Please fill all doctor profile fields.");
        return;
      }

      const result = await api.updateDoctorProfile(
        id,
        {
          name: profileForm.name.trim(),
          contact: profileForm.contact.trim(),
          specialization: profileForm.specialization,
        },
        token
      );

      setMessage(result.message || "Doctor profile updated successfully");

      setEditingProfileId(null);

      await fetchData();
    } catch (err) {
      setError(err.message || "Failed to update doctor profile");
    } finally {
      setSavingProfile(false);
    }
  };

  // =========================
  // EDIT DOCTOR AVAILABILITY
  // =========================

  const handleEditAvailability = (doctor) => {
    const days = {};
    const slots = {};

    daysList.forEach((day) => {
      const availability = doctor.availability?.find(
        (item) => item.day === day
      );

      if (availability) {
        days[day] = true;
        slots[day] = [...(availability.slots || [])];
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

  const handleCancelEdit = () => {
    setEditingDoctorId(null);
    setEditingDays({});
    setEditingSlots({});
  };

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

  const toggleEditingSlot = (day, slot) => {
    setEditingSlots((prev) => {
      const currentSlots = prev[day] || [];
      const exists = currentSlots.includes(slot);

      return {
        ...prev,
        [day]: exists
          ? currentSlots.filter((item) => item !== slot)
          : [...currentSlots, slot],
      };
    });
  };

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
        .filter((item) => item.slots.length > 0);

      if (availability.length === 0) {
        setError("Please select at least one day and one time slot.");
        return;
      }

      const result = await api.updateDoctorAvailability(
        editingDoctorId,
        availability,
        token
      );

      setMessage(
        result.message || "Doctor availability updated successfully"
      );

      setEditingDoctorId(null);
      setEditingDays({});
      setEditingSlots({});

      await fetchData();
    } catch (err) {
      setError(err.message || "Failed to update doctor availability");
    } finally {
      setSavingAvailability(false);
    }
  };

  // =========================
  // DELETE USER
  // =========================

  const handleDeleteUser = async (id) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this user?"
    );

    if (!confirmDelete) return;

    try {
      setError("");
      setMessage("");

      const result = await api.deleteUser(id, token);

      setMessage(result.message || "User deleted successfully");
      await fetchData();
    } catch (err) {
      setError(err.message || "Failed to delete user");
    }
  };

  // =========================
  // DELETE APPOINTMENT
  // =========================

  const handleDeleteAppointment = async (id) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this appointment?"
    );

    if (!confirmDelete) return;

    try {
      setError("");
      setMessage("");

      const result = await api.deleteAppointment(id, token);

      setMessage(result.message || "Appointment deleted successfully");
      await fetchData();
    } catch (err) {
      setError(err.message || "Failed to delete appointment");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-center">
          <div className="text-5xl mb-4 animate-pulse">🛡️</div>
          <p className="text-xl font-semibold text-gray-700">
            Loading Admin Dashboard...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* NAVBAR */}
      <nav className="bg-purple-600 text-white shadow-lg sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 py-4">
            <button
              onClick={() => navigate("/admin-dashboard")}
              className="text-left"
            >
              <h1 className="text-xl sm:text-2xl font-bold">
                🩺 Doctor Appointment System
              </h1>
              <p className="text-purple-100 text-sm mt-1">Admin Portal</p>
            </button>

            <div className="flex flex-wrap items-center gap-2 sm:gap-3">
              <div className="text-right mr-1">
                <p className="font-semibold">{user?.name || "Admin"}</p>
                <p className="text-xs text-purple-100">Administrator</p>
              </div>

              <button
                onClick={() => navigate("/profile")}
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
        {/* MESSAGES */}
        {message && (
          <div className="mb-5 p-4 bg-green-100 border border-green-300 text-green-700 rounded-xl">
            <p className="font-medium">✅ {message}</p>
          </div>
        )}

        {error && (
          <div className="mb-5 p-4 bg-red-100 border border-red-300 text-red-700 rounded-xl">
            <p className="font-medium">⚠️ {error}</p>
          </div>
        )}

        {/* HEADER */}
        <section className="bg-white rounded-2xl shadow-lg p-6 md:p-8 mb-8">
          <p className="text-purple-600 font-semibold">Administration</p>
          <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mt-1">
            Admin Dashboard 🛡️
          </h2>
          <p className="text-gray-500 mt-2">
            Manage doctors, patients, availability and appointments from one place.
          </p>
        </section>

        {/* STATISTICS */}
        <section className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
          {[
            ["Appointments", appointments.length, "purple"],
            ["Patients", patients.length, "blue"],
            ["Doctors", doctors.length, "indigo"],
            ["Pending", pendingAppointments.length, "yellow"],
            ["Confirmed", confirmedAppointments.length, "green"],
            ["Cancelled", cancelledAppointments.length, "red"],
          ].map(([label, count, color]) => (
            <div
              key={label}
              className={`bg-white p-5 rounded-2xl shadow border-l-4 border-${color}-500`}
            >
              <p className="text-gray-500 text-sm">{label}</p>
              <h2 className={`text-3xl font-bold text-${color}-600 mt-2`}>
                {count}
              </h2>
            </div>
          ))}
        </section>

        {/* ADD DOCTOR */}
        <section className="bg-white rounded-2xl shadow-lg p-6 md:p-8 mb-8">
          <div className="mb-6">
            <p className="text-purple-600 font-semibold">Doctor Management</p>
            <h2 className="text-2xl font-bold text-gray-800 mt-1">
              Add New Doctor
            </h2>
            <p className="text-gray-500 mt-1">
              Create a doctor account and configure their working schedule.
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

              <select
                name="specialization"
                value={doctorForm.specialization}
                onChange={handleDoctorInput}
                required
                className="border border-gray-300 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-purple-500 bg-white"
              >
                <option value="">Select Specialization</option>
                {specializations.map((item) => (
                  <option key={item} value={item}>{item}</option>
                ))}
              </select>
            </div>

            <div className="mt-7">
              <h3 className="font-bold text-lg text-gray-800 mb-3">
                Available Days
              </h3>

              <div className="flex flex-wrap gap-3">
                {daysList.map((day) => (
                  <label
                    key={day}
                    className={`flex items-center gap-2 border px-4 py-2.5 rounded-xl cursor-pointer ${
                      selectedDays[day]
                        ? "bg-purple-100 border-purple-500 text-purple-700"
                        : "bg-white hover:bg-gray-50"
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={!!selectedDays[day]}
                      onChange={() => toggleDay(day)}
                    />
                    <span className="font-medium">{day}</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="mt-7">
              <h3 className="font-bold text-lg text-gray-800 mb-3">
                Available Time Slots
              </h3>

              <div className="space-y-5">
                {daysList.filter((day) => selectedDays[day]).map((day) => (
                  <div key={day} className="border border-gray-200 rounded-xl p-5">
                    <h4 className="font-bold text-gray-800 mb-3">{day}</h4>

                    <div className="flex flex-wrap gap-3">
                      {timeSlots.map((slot) => (
                        <label
                          key={slot}
                          className={`flex items-center gap-2 border px-3 py-2 rounded-lg cursor-pointer ${
                            (selectedSlots[day] || []).includes(slot)
                              ? "bg-purple-100 border-purple-500 text-purple-700"
                              : "hover:bg-gray-50"
                          }`}
                        >
                          <input
                            type="checkbox"
                            checked={(selectedSlots[day] || []).includes(slot)}
                            onChange={() => toggleSlot(day, slot)}
                          />
                          <span>{slot}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <button
              type="submit"
              disabled={creatingDoctor}
              className="mt-7 px-7 py-3 bg-purple-600 text-white rounded-xl hover:bg-purple-700 disabled:opacity-50 font-semibold"
            >
              {creatingDoctor ? "Creating Doctor..." : "➕ Add Doctor"}
            </button>
          </form>
        </section>

        {/* DOCTOR MANAGEMENT */}
        <section className="bg-white rounded-2xl shadow-lg p-6 md:p-8 mb-8">
          <div className="mb-6">
            <p className="text-purple-600 font-semibold">Manage Doctors</p>
            <h2 className="text-2xl font-bold text-gray-800 mt-1">
              Doctor Management
            </h2>
            <p className="text-gray-500 mt-1">
              Edit doctor profiles, availability or remove doctor accounts.
            </p>
          </div>

          {doctors.length === 0 ? (
            <p className="text-gray-500 text-center py-10">No doctors found.</p>
          ) : (
            <div className="space-y-5">
              {doctors.map((doctor) => (
                <div
                  key={doctor._id}
                  className="border border-gray-200 rounded-2xl overflow-hidden"
                >
                  <div className="bg-gray-50 p-5">
                    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                      <div>
                        <h3 className="text-xl font-bold text-gray-800">
                          👨‍⚕️ {doctor.name}
                        </h3>

                        <div className="text-sm text-gray-500 mt-2 space-y-1">
                          <p>📧 {doctor.email}</p>
                          <p>📱 {doctor.contact}</p>
                          <p>
                            🩺 {doctor.specialization || "Specialization not set"}
                          </p>
                        </div>
                      </div>

                      <div className="flex flex-wrap gap-2">
                        <button
                          onClick={() => handleEditProfile(doctor)}
                          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold"
                        >
                          ✏️ Edit Profile
                        </button>

                        {editingDoctorId !== doctor._id && (
                          <button
                            onClick={() => handleEditAvailability(doctor)}
                            className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 font-semibold"
                          >
                            📅 Edit Availability
                          </button>
                        )}

                        <button
                          onClick={() => handleDeleteUser(doctor._id)}
                          className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 font-semibold"
                        >
                          🗑️ Delete
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* EDIT PROFILE FORM */}
                  {editingProfileId === doctor._id && (
                    <div className="p-5 md:p-6 bg-blue-50 border-t border-blue-100">
                      <h3 className="text-xl font-bold text-gray-800 mb-5">
                        Edit Doctor Profile
                      </h3>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        <div>
                          <label className="block font-semibold text-gray-700 mb-2">
                            Doctor Name
                          </label>
                          <input
                            type="text"
                            name="name"
                            value={profileForm.name}
                            onChange={handleProfileInput}
                            className="w-full border border-gray-300 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500"
                          />
                        </div>

                        <div>
                          <label className="block font-semibold text-gray-700 mb-2">
                            Contact Number
                          </label>
                          <input
                            type="text"
                            name="contact"
                            value={profileForm.contact}
                            onChange={handleProfileInput}
                            className="w-full border border-gray-300 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500"
                          />
                        </div>

                        <div>
                          <label className="block font-semibold text-gray-700 mb-2">
                            Specialization
                          </label>
                          <select
                            name="specialization"
                            value={profileForm.specialization}
                            onChange={handleProfileInput}
                            className="w-full border border-gray-300 rounded-xl px-4 py-3 bg-white outline-none focus:ring-2 focus:ring-blue-500"
                          >
                            <option value="">Select Specialization</option>
                            {specializations.map((item) => (
                              <option key={item} value={item}>{item}</option>
                            ))}
                          </select>
                        </div>
                      </div>

                      <div className="flex flex-wrap gap-3 mt-6">
                        <button
                          onClick={() => handleSaveDoctorProfile(doctor._id)}
                          disabled={savingProfile}
                          className="px-6 py-3 bg-green-600 text-white rounded-xl hover:bg-green-700 disabled:opacity-50 font-semibold"
                        >
                          {savingProfile ? "Saving..." : "💾 Save Profile"}
                        </button>

                        <button
                          onClick={handleCancelProfileEdit}
                          disabled={savingProfile}
                          className="px-6 py-3 bg-gray-600 text-white rounded-xl hover:bg-gray-700 font-semibold"
                        >
                          ✖ Cancel
                        </button>
                      </div>
                    </div>
                  )}

                  {/* EDIT AVAILABILITY FORM */}
                  {editingDoctorId === doctor._id && (
                    <div className="p-5 md:p-6 bg-purple-50 border-t border-purple-100">
                      <h3 className="text-xl font-bold text-gray-800 mb-5">
                        Edit Availability
                      </h3>

                      <div className="flex flex-wrap gap-3">
                        {daysList.map((day) => (
                          <label
                            key={day}
                            className={`flex items-center gap-2 border px-4 py-2.5 rounded-xl cursor-pointer ${
                              editingDays[day]
                                ? "bg-purple-600 text-white border-purple-600"
                                : "bg-white hover:bg-gray-50"
                            }`}
                          >
                            <input
                              type="checkbox"
                              checked={!!editingDays[day]}
                              onChange={() => toggleEditingDay(day)}
                            />
                            <span className="font-medium">{day}</span>
                          </label>
                        ))}
                      </div>

                      <div className="mt-6 space-y-5">
                        {daysList.filter((day) => editingDays[day]).map((day) => (
                          <div
                            key={day}
                            className="bg-white border border-gray-200 rounded-xl p-5"
                          >
                            <h4 className="font-bold text-gray-800 mb-3">{day}</h4>

                            <div className="flex flex-wrap gap-3">
                              {timeSlots.map((slot) => (
                                <label
                                  key={slot}
                                  className={`flex items-center gap-2 border px-3 py-2 rounded-lg cursor-pointer ${
                                    (editingSlots[day] || []).includes(slot)
                                      ? "bg-purple-100 border-purple-500 text-purple-700"
                                      : "hover:bg-gray-50"
                                  }`}
                                >
                                  <input
                                    type="checkbox"
                                    checked={(editingSlots[day] || []).includes(slot)}
                                    onChange={() => toggleEditingSlot(day, slot)}
                                  />
                                  <span>{slot}</span>
                                </label>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>

                      <div className="flex flex-col sm:flex-row gap-3 mt-6">
                        <button
                          onClick={handleSaveAvailability}
                          disabled={savingAvailability}
                          className="px-6 py-3 bg-green-600 text-white rounded-xl hover:bg-green-700 disabled:opacity-50 font-semibold"
                        >
                          {savingAvailability ? "Saving..." : "💾 Save Availability"}
                        </button>

                        <button
                          onClick={handleCancelEdit}
                          disabled={savingAvailability}
                          className="px-6 py-3 bg-gray-600 text-white rounded-xl hover:bg-gray-700 font-semibold"
                        >
                          ✖ Cancel
                        </button>
                      </div>
                    </div>
                  )}

                  {/* CURRENT AVAILABILITY */}
                  {editingDoctorId !== doctor._id && (
                    <div className="p-5">
                      <h4 className="font-semibold text-gray-700 mb-3">
                        Current Availability
                      </h4>

                      {doctor.availability?.length ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          {doctor.availability.map((item) => (
                            <div
                              key={item.day}
                              className="bg-purple-50 border border-purple-100 rounded-xl p-4"
                            >
                              <p className="font-bold text-purple-700">{item.day}</p>
                              <p className="text-sm text-gray-600 mt-1">
                                {item.slots.join(", ")}
                              </p>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-gray-500">Availability not set.</p>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </section>

        {/* PATIENT MANAGEMENT */}
        <section className="bg-white rounded-2xl shadow-lg p-6 md:p-8 mb-8">
          <div className="mb-5">
            <p className="text-blue-600 font-semibold">User Management</p>
            <h2 className="text-2xl font-bold text-gray-800 mt-1">
              Patient Management
            </h2>
          </div>

          {patients.length === 0 ? (
            <p className="text-gray-500">No patients found.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[700px]">
                <thead>
                  <tr className="border-b text-left">
                    <th className="p-3">Name</th>
                    <th className="p-3">Email</th>
                    <th className="p-3">Contact</th>
                    <th className="p-3">Action</th>
                  </tr>
                </thead>

                <tbody>
                  {patients.map((patient) => (
                    <tr key={patient._id} className="border-b hover:bg-gray-50">
                      <td className="p-3 font-semibold">{patient.name}</td>
                      <td className="p-3">{patient.email}</td>
                      <td className="p-3">{patient.contact}</td>
                      <td className="p-3">
                        <button
                          onClick={() => handleDeleteUser(patient._id)}
                          className="px-3 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
                        >
                          🗑️ Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>

        {/* APPOINTMENT MANAGEMENT */}
        <section className="bg-white rounded-2xl shadow-lg p-6 md:p-8">
          <div className="mb-5">
            <p className="text-green-600 font-semibold">Appointment Management</p>
            <h2 className="text-2xl font-bold text-gray-800 mt-1">
              All Appointments
            </h2>
          </div>

          {appointments.length === 0 ? (
            <p className="text-gray-500">No appointments found.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[1000px]">
                <thead>
                  <tr className="border-b text-left">
                    <th className="p-3">Patient</th>
                    <th className="p-3">Doctor</th>
                    <th className="p-3">Date</th>
                    <th className="p-3">Time</th>
                    <th className="p-3">Reason</th>
                    <th className="p-3">Status</th>
                    <th className="p-3">Action</th>
                  </tr>
                </thead>

                <tbody>
                  {appointments.map((appointment) => (
                    <tr key={appointment._id} className="border-b hover:bg-gray-50">
                      <td className="p-3">
                        {appointment.patient?.name || "Unknown"}
                      </td>
                      <td className="p-3">{appointment.doctor}</td>
                      <td className="p-3">{appointment.date}</td>
                      <td className="p-3">{appointment.time}</td>
                      <td className="p-3">{appointment.reason || "-"}</td>
                      <td className="p-3 capitalize">
                        <span
                          className={`px-3 py-1 rounded-full text-sm font-semibold ${
                            appointment.status === "confirmed"
                              ? "bg-green-100 text-green-700"
                              : appointment.status === "cancelled"
                              ? "bg-red-100 text-red-700"
                              : "bg-yellow-100 text-yellow-700"
                          }`}
                        >
                          {appointment.status}
                        </span>
                      </td>
                      <td className="p-3">
                        <button
                          onClick={() => handleDeleteAppointment(appointment._id)}
                          className="px-3 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
                        >
                          🗑️ Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>

        <div className="mt-6 text-sm text-gray-500">
          Cancelled Appointments: {cancelledAppointments.length}
        </div>
      </main>
    </div>
  );
}

export default AdminDashboard;
