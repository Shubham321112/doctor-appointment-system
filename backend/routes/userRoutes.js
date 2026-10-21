
const express = require("express");

const {
  getAllUsers,
  getAllDoctors,
  createDoctor,
  updateDoctorAvailability,
  updateMyProfile,
  deleteUser,
} = require("../controllers/userController");

const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

// Update logged-in user's own profile
router.put("/profile", authMiddleware, updateMyProfile);

// Get all doctors
router.get("/doctors", authMiddleware, getAllDoctors);

// Get all users - Admin
router.get("/all", authMiddleware, getAllUsers);

// Create doctor - Admin
router.post("/doctor", authMiddleware, createDoctor);

// Update doctor availability - Admin
router.put(
  "/doctor/:id/availability",
  authMiddleware,
  updateDoctorAvailability
);

// Delete user - Admin
router.delete("/:id", authMiddleware, deleteUser);

module.exports = router;
