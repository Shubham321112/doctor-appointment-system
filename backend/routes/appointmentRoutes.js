const express = require("express");

const {
  createAppointment,
  getMyAppointments,
  cancelMyAppointment,
  getDoctorAppointments,
  getAllAppointments,
  updateAppointmentStatus,
  deleteAppointment,
} = require("../controllers/appointmentController");

const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

// ===============================
// Patient Routes
// ===============================

router.post(
  "/book",
  authMiddleware,
  createAppointment
);

router.get(
  "/my",
  authMiddleware,
  getMyAppointments
);

router.put(
  "/:id/cancel",
  authMiddleware,
  cancelMyAppointment
);

// ===============================
// Doctor Routes
// ===============================

router.get(
  "/doctor/my",
  authMiddleware,
  getDoctorAppointments
);

router.put(
  "/:id/status",
  authMiddleware,
  updateAppointmentStatus
);

// ===============================
// Admin Routes
// ===============================

router.get(
  "/all",
  authMiddleware,
  getAllAppointments
);

router.delete(
  "/:id",
  authMiddleware,
  deleteAppointment
);

module.exports = router;