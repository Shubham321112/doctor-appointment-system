
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

    return res.status(200).json({
      message: "Users fetched successfully",
      users,
    });
  } catch (error) {
    console.error("Get Users Error:", error);
    return res.status(500).json({
      message: "Server error",
    });
  }
};

// Get All Doctors
const getAllDoctors = async (req, res) => {
  try {
    const doctors = await User.find({ role: "doctor" })
      .select("-password")
      .sort({ name: 1 });

    return res.status(200).json({
      message: "Doctors fetched successfully",
      doctors,
    });
  } catch (error) {
    console.error("Get Doctors Error:", error);
    return res.status(500).json({
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
      specialization,
      image,
      rating,
    } = req.body;

    if (!name || !email || !contact || !password) {
      return res.status(400).json({
        message: "Name, email, contact and password are required",
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        message: "Password must be at least 6 characters",
      });
    }

    if (
      specialization !== undefined &&
      typeof specialization !== "string"
    ) {
      return res.status(400).json({
        message: "Specialization must be text",
      });
    }

    if (image !== undefined && typeof image !== "string") {
      return res.status(400).json({
        message: "Image must be a URL string",
      });
    }

    if (image) {
      try {
        const parsedUrl = new URL(image.trim());

        if (!["http:", "https:"].includes(parsedUrl.protocol)) {
          throw new Error("Invalid protocol");
        }
      } catch {
        return res.status(400).json({
          message: "Please provide a valid HTTP or HTTPS image URL",
        });
      }
    }

    let doctorRating = null;

    if (rating !== undefined && rating !== null && rating !== "") {
      doctorRating = Number(rating);

      if (
        !Number.isFinite(doctorRating) ||
        doctorRating < 0 ||
        doctorRating > 5
      ) {
        return res.status(400).json({
          message: "Rating must be between 0 and 5",
        });
      }
    }

    const normalizedEmail = email.trim().toLowerCase();

    const existingUser = await User.findOne({
      email: normalizedEmail,
    });

    if (existingUser) {
      return res.status(400).json({
        message: "A user with this email already exists",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const validDays = [
      "Monday",
      "Tuesday",
      "Wednesday",
      "Thursday",
      "Friday",
      "Saturday",
      "Sunday",
    ];

    const doctorAvailability = Array.isArray(availability)
      ? availability
          .filter(
            (item) =>
              item &&
              validDays.includes(item.day) &&
              Array.isArray(item.slots)
          )
          .map((item) => ({
            day: item.day,
            slots: [...new Set(item.slots)],
          }))
      : [];

    const doctor = await User.create({
      name: name.trim(),
      email: normalizedEmail,
      contact: contact.trim(),
      password: hashedPassword,
      role: "doctor",
      specialization: specialization?.trim() || "",
      image: image?.trim() || "",
      rating: doctorRating,
      availability: doctorAvailability,
    });

    return res.status(201).json({
      message: "Doctor created successfully",
      doctor: {
        id: doctor._id,
        name: doctor.name,
        email: doctor.email,
        contact: doctor.contact,
        role: doctor.role,
        specialization: doctor.specialization,
        image: doctor.image,
        rating: doctor.rating,
        availability: doctor.availability,
      },
    });
  } catch (error) {
    console.error("Create Doctor Error:", error);

    if (error.code === 11000) {
      return res.status(409).json({
        message: "A user with this email already exists",
      });
    }

    return res.status(500).json({
      message: "Server error",
    });
  }
};

// Update Doctor Availability - Admin
const updateDoctorAvailability = async (req, res) => {
  try {
    if (req.userRole !== "admin") {
      return res.status(403).json({
        message: "Only admin can update doctor availability",
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
          item &&
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
        message: "Please select at least one day and one time slot.",
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

    return res.status(200).json({
      message: "Doctor availability updated successfully",
      doctor: {
        id: doctor._id,
        name: doctor.name,
        email: doctor.email,
        contact: doctor.contact,
        role: doctor.role,
        specialization: doctor.specialization,
        image: doctor.image,
        rating: doctor.rating,
        availability: doctor.availability,
      },
    });
  } catch (error) {
    console.error("Update Doctor Availability Error:", error);

    return res.status(500).json({
      message: "Server error",
    });
  }
};

// Update Doctor Profile - Admin
const updateDoctorProfile = async (req, res) => {
  try {
    if (req.userRole !== "admin") {
      return res.status(403).json({
        message: "Only admin can update doctor profiles",
      });
    }

    const { specialization, image, rating } = req.body;

    if (
      specialization !== undefined &&
      typeof specialization !== "string"
    ) {
      return res.status(400).json({
        message: "Specialization must be text",
      });
    }

    if (image !== undefined && typeof image !== "string") {
      return res.status(400).json({
        message: "Image must be a URL string",
      });
    }

    if (image && image.trim()) {
      try {
        const parsedUrl = new URL(image.trim());

        if (!["http:", "https:"].includes(parsedUrl.protocol)) {
          throw new Error("Invalid protocol");
        }
      } catch {
        return res.status(400).json({
          message: "Please provide a valid HTTP or HTTPS image URL",
        });
      }
    }

    let doctorRating;

    if (rating !== undefined) {
      if (rating === null || rating === "") {
        doctorRating = null;
      } else {
        doctorRating = Number(rating);

        if (
          !Number.isFinite(doctorRating) ||
          doctorRating < 0 ||
          doctorRating > 5
        ) {
          return res.status(400).json({
            message: "Rating must be between 0 and 5",
          });
        }
      }
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

    if (specialization !== undefined) {
      doctor.specialization = specialization.trim();
    }

    if (image !== undefined) {
      doctor.image = image.trim();
    }

    if (rating !== undefined) {
      doctor.rating = doctorRating;
    }

    await doctor.save();

    return res.status(200).json({
      message: "Doctor profile updated successfully",
      doctor: {
        id: doctor._id,
        name: doctor.name,
        email: doctor.email,
        contact: doctor.contact,
        role: doctor.role,
        specialization: doctor.specialization,
        image: doctor.image,
        rating: doctor.rating,
        availability: doctor.availability,
      },
    });
  } catch (error) {
    console.error("Update Doctor Profile Error:", error);

    if (error.name === "CastError") {
      return res.status(400).json({
        message: "Invalid doctor ID",
      });
    }

    return res.status(500).json({
      message: "Server error",
    });
  }
};

// Update My Profile - Authenticated User
const updateMyProfile = async (req, res) => {
  try {
    const name =
      typeof req.body.name === "string"
        ? req.body.name.trim()
        : "";

    const contact =
      typeof req.body.contact === "string"
        ? req.body.contact.trim()
        : "";

    if (!name || !contact) {
      return res.status(400).json({
        message: "Name and contact number are required",
      });
    }

    if (name.length > 100) {
      return res.status(400).json({
        message: "Name must be 100 characters or fewer",
      });
    }

    if (contact.length > 20) {
      return res.status(400).json({
        message: "Contact number must be 20 characters or fewer",
      });
    }

    const user = await User.findById(req.user);

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    user.name = name;
    user.contact = contact;

    await user.save();

    return res.status(200).json({
      message: "Profile updated successfully",
      user: {
        id: user._id,
        _id: user._id,
        name: user.name,
        email: user.email,
        contact: user.contact,
        role: user.role,
      },
    });
  } catch (error) {
    console.error("Update My Profile Error:", error);

    return res.status(500).json({
      message: "Server error",
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

    return res.status(200).json({
      message: "User deleted successfully",
    });
  } catch (error) {
    console.error("Delete User Error:", error);

    if (error.name === "CastError") {
      return res.status(400).json({
        message: "Invalid user ID",
      });
    }

    return res.status(500).json({
      message: "Server error",
    });
  }
};

module.exports = {
  getAllUsers,
  getAllDoctors,
  createDoctor,
  updateDoctorAvailability,
  updateDoctorProfile,
  updateMyProfile,
  deleteUser,
};
