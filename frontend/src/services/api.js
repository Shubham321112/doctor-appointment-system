
const API_URL = "http://localhost:5000/api";

// =========================
// COMMON RESPONSE HANDLER
// =========================
const handleResponse = async (response, errorMessage) => {
  const responseText = await response.text();

  let result;

  try {
    result = responseText ? JSON.parse(responseText) : {};
  } catch (error) {
    throw new Error(
      `Server returned invalid response (HTTP ${response.status}). ` +
      `Expected JSON but received HTML or invalid data. ` +
      `Please check your backend URL and server status.`
    );
  }

  if (!response.ok) {
    throw new Error(result.message || errorMessage);
  }

  return result;
};

const api = {
  // =========================
  // LOGIN
  // =========================
  login: async (email, password) => {
    const response = await fetch(`${API_URL}/auth/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email: email.trim().toLowerCase(),
        password,
      }),
    });

    return handleResponse(response, "Login failed");
  },

  // =========================
  // REGISTER
  // =========================
  register: async (name, email, contact, password) => {
    const response = await fetch(`${API_URL}/auth/register`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name: name.trim(),
        email: email.trim().toLowerCase(),
        contact: contact.trim(),
        password,
      }),
    });

    return handleResponse(response, "Registration failed");
  },

  // =========================
  // GET PROFILE
  // =========================
  getProfile: async (token) => {
    const response = await fetch(`${API_URL}/auth/profile`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    return handleResponse(response, "Failed to fetch profile");
  },

  // =========================
  // UPDATE MY PROFILE
  // =========================
  updateMyProfile: async (name, contact, token) => {
    const response = await fetch(`${API_URL}/users/profile`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        name: name.trim(),
        contact: contact.trim(),
      }),
    });

    return handleResponse(response, "Failed to update profile");
  },

  // =========================
  // BOOK APPOINTMENT + REPORTS
  // =========================
  bookAppointment: async (
    doctor,
    date,
    time,
    reason,
    token,
    reports = []
  ) => {
    const formData = new FormData();

    formData.append("doctor", doctor);
    formData.append("date", date);
    formData.append("time", time);
    formData.append("reason", reason || "");

    reports.forEach((file) => {
      formData.append("reports", file);
    });

    const response = await fetch(`${API_URL}/appointments/book`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: formData,
    });

    return handleResponse(response, "Failed to book appointment");
  },

  // =========================
  // MY APPOINTMENTS
  // =========================
  getMyAppointments: async (token) => {
    const response = await fetch(`${API_URL}/appointments/my`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    return handleResponse(response, "Failed to fetch appointments");
  },

  // =========================
  // CANCEL APPOINTMENT
  // =========================
  cancelAppointment: async (id, token) => {
    const response = await fetch(`${API_URL}/appointments/${id}/cancel`, {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    return handleResponse(response, "Failed to cancel appointment");
  },

  // =========================
  // DOCTOR APPOINTMENTS
  // =========================
  getDoctorAppointments: async (token) => {
    const response = await fetch(`${API_URL}/appointments/doctor/my`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    return handleResponse(response, "Failed to fetch doctor appointments");
  },

  // =========================
  // UPDATE APPOINTMENT STATUS
  // =========================
  updateAppointmentStatus: async (id, status, token) => {
    const response = await fetch(`${API_URL}/appointments/${id}/status`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ status }),
    });

    return handleResponse(response, "Failed to update appointment status");
  },

  // =========================
  // ALL APPOINTMENTS - ADMIN
  // =========================
  getAllAppointments: async (token) => {
    const response = await fetch(`${API_URL}/appointments/all`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    return handleResponse(response, "Failed to fetch all appointments");
  },

  // =========================
  // DELETE APPOINTMENT - ADMIN
  // =========================
  deleteAppointment: async (id, token) => {
    const response = await fetch(`${API_URL}/appointments/${id}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    return handleResponse(response, "Failed to delete appointment");
  },

  // =========================
  // ALL USERS - ADMIN
  // =========================
  getAllUsers: async (token) => {
    const response = await fetch(`${API_URL}/users/all`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    return handleResponse(response, "Failed to fetch users");
  },

  // =========================
  // ALL DOCTORS
  // =========================
  getAllDoctors: async (token) => {
    const response = await fetch(`${API_URL}/users/doctors`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    return handleResponse(response, "Failed to fetch doctors");
  },

  // =========================
  // CREATE DOCTOR - ADMIN
  // =========================
  createDoctor: async (doctorData, token) => {
    const response = await fetch(`${API_URL}/users/doctor`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(doctorData),
    });

    return handleResponse(response, "Failed to create doctor");
  },

  // =========================
  // UPDATE DOCTOR PROFILE - ADMIN
  // =========================
  updateDoctorProfile: async (id, doctorData, token) => {
    const response = await fetch(`${API_URL}/users/doctor/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(doctorData),
    });

    return handleResponse(response, "Failed to update doctor profile");
  },

  // =========================
  // UPDATE DOCTOR AVAILABILITY
  // =========================
  updateDoctorAvailability: async (id, availability, token) => {
    const response = await fetch(
      `${API_URL}/users/doctor/${id}/availability`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ availability }),
      }
    );

    return handleResponse(response, "Failed to update doctor availability");
  },

  // =========================
  // DELETE USER - ADMIN
  // =========================
  deleteUser: async (id, token) => {
    const response = await fetch(`${API_URL}/users/${id}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    return handleResponse(response, "Failed to delete user");
  },
};

export default api;
