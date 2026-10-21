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
const multer = require("multer");

const router = express.Router();

// Store uploaded reports in memory temporarily.
const storage = multer.memoryStorage();

const upload = multer({
  storage,
  limits: {
    fileSize: 1 * 1024 * 1024, // Maximum 1 MB per file
    files: 3, // Maximum 3 reports
  },
  fileFilter: (req, file, callback) => {
    const allowedTypes = [
      "application/pdf",
      "image/jpeg",
      "image/png",
    ];

    if (allowedTypes.includes(file.mimetype)) {
      callback(null, true);
    } else {
      callback(
        new Error("Only PDF, JPG and PNG reports are allowed.")
      );
    }
  },
});

// ===============================
// Patient Routes
// ===============================

router.post(
  "/book",
  authMiddleware,

  // Debug: Check the incoming request format.
  (req, res, next) => {
    console.log("Appointment request Content-Type:", req.headers["content-type"]);
    next();
  },

  // Parse multipart/form-data and uploaded reports.
  upload.array("reports", 3),

  // Debug: Check the parsed body and files.
  (req, res, next) => {
    console.log("Appointment parsed body:", req.body);
    console.log("Appointment uploaded files:", req.files?.length || 0);
    next();
  },

  createAppointment
);

router.get("/my", authMiddleware, getMyAppointments);

router.put("/:id/cancel", authMiddleware, cancelMyAppointment);

// ===============================
// Doctor Routes
// ===============================

router.get("/doctor/my", authMiddleware, getDoctorAppointments);

router.put("/:id/status", authMiddleware, updateAppointmentStatus);

// ===============================
// Admin Routes
// ===============================

router.get("/all", authMiddleware, getAllAppointments);

router.delete("/:id", authMiddleware, deleteAppointment);

module.exports = router;
