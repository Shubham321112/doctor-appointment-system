const API_URL = "http://localhost:5000/api";

const api = {
  // =========================
  // LOGIN
  // =========================
  login: async (email, password) => {
    const response = await fetch(
      `${API_URL}/auth/login`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: email.trim().toLowerCase(),
          password,
        }),
      }
    );

    const result = await response.json();

    if (!response.ok) {
      throw new Error(
        result.message || "Login failed"
      );
    }

    return result;
  },

  // =========================
  // REGISTER
  // =========================
  register: async (
    name,
    email,
    contact,
    password
  ) => {
    const response = await fetch(
      `${API_URL}/auth/register`,
      {
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
      }
    );

    const result = await response.json();

    if (!response.ok) {
      throw new Error(
        result.message ||
          "Registration failed"
      );
    }

    return result;
  },

  // =========================
  // PROFILE
  // =========================
  getProfile: async (token) => {
    const response = await fetch(
      `${API_URL}/auth/profile`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    const result = await response.json();

    if (!response.ok) {
      throw new Error(
        result.message ||
          "Failed to fetch profile"
      );
    }

    return result;
  },

  // =========================
  // BOOK APPOINTMENT
  // =========================
  bookAppointment: async (
    doctor,
    date,
    time,
    reason,
    token
  ) => {
    const response = await fetch(
      `${API_URL}/appointments/book`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          doctor,
          date,
          time,
          reason,
        }),
      }
    );

    const result = await response.json();

    if (!response.ok) {
      throw new Error(
        result.message ||
          "Failed to book appointment"
      );
    }

    return result;
  },

  // =========================
  // MY APPOINTMENTS
  // =========================
  getMyAppointments: async (token) => {
    const response = await fetch(
      `${API_URL}/appointments/my`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    const result = await response.json();

    if (!response.ok) {
      throw new Error(
        result.message ||
          "Failed to fetch appointments"
      );
    }

    return result;
  },

  // =========================
  // CANCEL APPOINTMENT
  // =========================
  cancelAppointment: async (id, token) => {
    const response = await fetch(
      `${API_URL}/appointments/${id}/cancel`,
      {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    const result = await response.json();

    if (!response.ok) {
      throw new Error(
        result.message ||
          "Failed to cancel appointment"
      );
    }

    return result;
  },

  // =========================
  // DOCTOR APPOINTMENTS
  // =========================
  getDoctorAppointments: async (token) => {
    const response = await fetch(
      `${API_URL}/appointments/doctor/my`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    const result = await response.json();

    if (!response.ok) {
      throw new Error(
        result.message ||
          "Failed to fetch doctor appointments"
      );
    }

    return result;
  },

  // =========================
  // UPDATE APPOINTMENT STATUS
  // =========================
  updateAppointmentStatus: async (
    id,
    status,
    token
  ) => {
    const response = await fetch(
      `${API_URL}/appointments/${id}/status`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          status,
        }),
      }
    );

    const result = await response.json();

    if (!response.ok) {
      throw new Error(
        result.message ||
          "Failed to update appointment status"
      );
    }

    return result;
  },

  // =========================
  // ALL APPOINTMENTS - ADMIN
  // =========================
  getAllAppointments: async (token) => {
    const response = await fetch(
      `${API_URL}/appointments/all`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    const result = await response.json();

    if (!response.ok) {
      throw new Error(
        result.message ||
          "Failed to fetch all appointments"
      );
    }

    return result;
  },

  // =========================
  // DELETE APPOINTMENT - ADMIN
  // =========================
  deleteAppointment: async (id, token) => {
    const response = await fetch(
      `${API_URL}/appointments/${id}`,
      {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    const result = await response.json();

    if (!response.ok) {
      throw new Error(
        result.message ||
          "Failed to delete appointment"
      );
    }

    return result;
  },

  // =========================
  // ALL USERS - ADMIN
  // =========================
  getAllUsers: async (token) => {
    const response = await fetch(
      `${API_URL}/users/all`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    const result = await response.json();

    if (!response.ok) {
      throw new Error(
        result.message ||
          "Failed to fetch users"
      );
    }

    return result;
  },

  // =========================
  // ALL DOCTORS
  // =========================
  getAllDoctors: async (token) => {
    const response = await fetch(
      `${API_URL}/users/doctors`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    const result = await response.json();

    if (!response.ok) {
      throw new Error(
        result.message ||
          "Failed to fetch doctors"
      );
    }

    return result;
  },

  // =========================
  // CREATE DOCTOR - ADMIN
  // =========================
  createDoctor: async (
    doctorData,
    token
  ) => {
    const response = await fetch(
      `${API_URL}/users/doctor`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(doctorData),
      }
    );

    const result = await response.json();

    if (!response.ok) {
      throw new Error(
        result.message ||
          "Failed to create doctor"
      );
    }

    return result;
  },

  // =========================
  // UPDATE DOCTOR AVAILABILITY
  // =========================
  updateDoctorAvailability: async (
    id,
    availability,
    token
  ) => {
    const response = await fetch(
      `${API_URL}/users/doctor/${id}/availability`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          availability,
        }),
      }
    );

    const result = await response.json();

    if (!response.ok) {
      throw new Error(
        result.message ||
          "Failed to update doctor availability"
      );
    }

    return result;
  },

  // =========================
  // DELETE USER - ADMIN
  // =========================
  deleteUser: async (id, token) => {
    const response = await fetch(
      `${API_URL}/users/${id}`,
      {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    const result = await response.json();

    if (!response.ok) {
      throw new Error(
        result.message ||
          "Failed to delete user"
      );
    }

    return result;
  },
};

export default api;