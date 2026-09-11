const bcrypt = require("bcryptjs");
const User = require("../models/user");

// Get All Users - Admin
const getAllUsers = async (req, res) => {
  try {
    if (req.userRole !== "admin") {
      return res.status(403).json({
        message: "Only admin can access users",
      });
    }

    const users = await User.find()
      .select("-password")
      .sort({ createdAt: -1 });

    res.status(200).json({
      message: "Users fetched successfully",
      users,
    });
  } catch (error) {
    console.error("Get Users Error:", error);

    res.status(500).json({
      message: "Server error",
    });
  }
};

// Get All Doctors
const getAllDoctors = async (req, res) => {
  try {
    const doctors = await User.find({
      role: "doctor",
    })
      .select("-password")
      .sort({ name: 1 });

    res.status(200).json({
      message: "Doctors fetched successfully",
      doctors,
    });
  } catch (error) {
    console.error("Get Doctors Error:", error);

    res.status(500).json({
      message: "Server error",
    });
  }
};

// Add New Doctor - Admin
const createDoctor = async (req, res) => {
  try {
    if (req.userRole !== "admin") {
      return res.status(403).json({
        message: "Only admin can create doctors",
      });
    }

    const {
      name,
      email,
      contact,
      password,
      availability,
    } = req.body;

    if (!name || !email || !contact || !password) {
      return res.status(400).json({
        message:
          "Name, email, contact and password are required",
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        message: "Password must be at least 6 characters",
      });
    }

    const existingUser = await User.findOne({
      email: email.toLowerCase(),
    });

    if (existingUser) {
      return res.status(400).json({
        message: "A user with this email already exists",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const doctorAvailability = Array.isArray(
      availability
    )
      ? availability
          .filter(
            (item) =>
              item.day &&
              Array.isArray(item.slots) &&
              item.slots.length > 0
          )
          .map((item) => ({
            day: item.day,
            slots: item.slots,
          }))
      : [];

    const doctor = await User.create({
      name,
      email: email.toLowerCase(),
      contact,
      password: hashedPassword,
      role: "doctor",
      availability: doctorAvailability,
    });

    res.status(201).json({
      message: "Doctor created successfully",
      doctor: {
        id: doctor._id,
        name: doctor.name,
        email: doctor.email,
        contact: doctor.contact,
        role: doctor.role,
        availability: doctor.availability,
      },
    });
  } catch (error) {
    console.error("Create Doctor Error:", error);

    res.status(500).json({
      message: "Server error",
      error: error.message,
    });
  }
};

// Update Doctor Availability - Admin
const updateDoctorAvailability = async (req, res) => {
  try {
    if (req.userRole !== "admin") {
      return res.status(403).json({
        message:
          "Only admin can update doctor availability",
      });
    }

    const { availability } = req.body;

    if (!Array.isArray(availability)) {
      return res.status(400).json({
        message: "Availability must be an array",
      });
    }

    const validDays = [
      "Monday",
      "Tuesday",
      "Wednesday",
      "Thursday",
      "Friday",
      "Saturday",
      "Sunday",
    ];

    const cleanedAvailability = availability
      .filter(
        (item) =>
          validDays.includes(item.day) &&
          Array.isArray(item.slots) &&
          item.slots.length > 0
      )
      .map((item) => ({
        day: item.day,
        slots: [...new Set(item.slots)],
      }));

    if (cleanedAvailability.length === 0) {
      return res.status(400).json({
        message:
          "Please select at least one day and one time slot.",
      });
    }

    const doctor = await User.findOne({
      _id: req.params.id,
      role: "doctor",
    });

    if (!doctor) {
      return res.status(404).json({
        message: "Doctor not found",
      });
    }

    doctor.availability = cleanedAvailability;

    await doctor.save();

    res.status(200).json({
      message: "Doctor availability updated successfully",
      doctor: {
        id: doctor._id,
        name: doctor.name,
        email: doctor.email,
        contact: doctor.contact,
        role: doctor.role,
        availability: doctor.availability,
      },
    });
  } catch (error) {
    console.error(
      "Update Doctor Availability Error:",
      error
    );

    res.status(500).json({
      message: "Server error",
      error: error.message,
    });
  }
};

// Delete User - Admin
const deleteUser = async (req, res) => {
  try {
    if (req.userRole !== "admin") {
      return res.status(403).json({
        message: "Only admin can delete users",
      });
    }

    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    if (user.role === "admin") {
      return res.status(403).json({
        message: "Admin users cannot be deleted",
      });
    }

    await User.findByIdAndDelete(req.params.id);

    res.status(200).json({
      message: "User deleted successfully",
    });
  } catch (error) {
    console.error("Delete User Error:", error);

    res.status(500).json({
      message: "Server error",
    });
  }
};

module.exports = {
  getAllUsers,
  getAllDoctors,
  createDoctor,
  updateDoctorAvailability,
  deleteUser,
};