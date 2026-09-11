const Appointment = require("../models/Appointment");
const User = require("../models/user");

// Get day name from YYYY-MM-DD
const getDayName = (dateString) => {
  const date = new Date(`${dateString}T00:00:00`);

  if (Number.isNaN(date.getTime())) {
    return null;
  }

  return date.toLocaleDateString("en-US", {
    weekday: "long",
  });
};

// Book Appointment - Patient
const createAppointment = async (req, res) => {
  try {
    const { doctor, date, time, reason } = req.body;

    if (!doctor || !date || !time) {
      return res.status(400).json({
        message: "Doctor, date and time are required",
      });
    }

    if (req.userRole !== "patient") {
      return res.status(403).json({
        message: "Only patients can book appointments",
      });
    }

    const doctorUser = await User.findOne({
      name: doctor,
      role: "doctor",
    });

    if (!doctorUser) {
      return res.status(400).json({
        message: "Selected doctor does not exist",
      });
    }

    const dayName = getDayName(date);

    if (!dayName) {
      return res.status(400).json({
        message: "Invalid appointment date",
      });
    }

    const dayAvailability = doctorUser.availability.find(
      (item) => item.day === dayName
    );

    if (!dayAvailability) {
      return res.status(400).json({
        message: `Doctor is not available on ${dayName}`,
      });
    }

    if (!dayAvailability.slots.includes(time)) {
      return res.status(400).json({
        message:
          "Selected time is not available for this doctor",
      });
    }

    const existingAppointment = await Appointment.findOne({
      doctor,
      date,
      time,
    });

    if (existingAppointment) {
      return res.status(409).json({
        message:
          "This doctor is already booked for this date and time. Please choose another time.",
      });
    }

    const appointment = await Appointment.create({
      patient: req.user,
      doctor,
      date,
      time,
      reason: reason || "",
      status: "pending",
    });

    res.status(201).json({
      message: "Appointment booked successfully",
      appointment,
    });
  } catch (error) {
    console.error("Appointment Error:", error);

    if (error.code === 11000) {
      return res.status(409).json({
        message:
          "This doctor is already booked for this date and time. Please choose another time.",
      });
    }

    res.status(500).json({
      message: "Server error",
    });
  }
};

// Get My Appointments - Patient
const getMyAppointments = async (req, res) => {
  try {
    if (req.userRole !== "patient") {
      return res.status(403).json({
        message: "Only patients can access this route",
      });
    }

    const appointments = await Appointment.find({
      patient: req.user,
    })
      .populate("patient", "name email contact")
      .sort({ createdAt: -1 });

    res.status(200).json({
      message: "Appointments fetched successfully",
      appointments,
    });
  } catch (error) {
    console.error("Get Appointments Error:", error);

    res.status(500).json({
      message: "Server error",
    });
  }
};

// Cancel My Appointment - Patient
const cancelMyAppointment = async (req, res) => {
  try {
    if (req.userRole !== "patient") {
      return res.status(403).json({
        message: "Only patients can cancel appointments",
      });
    }

    const appointment = await Appointment.findOne({
      _id: req.params.id,
      patient: req.user,
    });

    if (!appointment) {
      return res.status(404).json({
        message: "Appointment not found",
      });
    }

    if (appointment.status === "cancelled") {
      return res.status(400).json({
        message: "Appointment is already cancelled",
      });
    }

    if (appointment.status === "confirmed") {
      return res.status(400).json({
        message:
          "Confirmed appointment cannot be cancelled. Please contact the doctor.",
      });
    }

    appointment.status = "cancelled";

    await appointment.save();

    res.status(200).json({
      message: "Appointment cancelled successfully",
      appointment,
    });
  } catch (error) {
    console.error("Cancel Appointment Error:", error);

    res.status(500).json({
      message: "Server error",
    });
  }
};

// Get Doctor's Own Appointments
const getDoctorAppointments = async (req, res) => {
  try {
    if (req.userRole !== "doctor") {
      return res.status(403).json({
        message: "Only doctors can access this route",
      });
    }

    const doctorUser = await User.findById(req.user).select(
      "name email contact role availability"
    );

    if (!doctorUser) {
      return res.status(404).json({
        message: "Doctor not found",
      });
    }

    const appointments = await Appointment.find({
      doctor: doctorUser.name,
    })
      .populate("patient", "name email contact")
      .sort({ date: 1, time: 1, createdAt: -1 });

    res.status(200).json({
      message: "Doctor appointments fetched successfully",
      doctor: {
        id: doctorUser._id,
        name: doctorUser.name,
        email: doctorUser.email,
        contact: doctorUser.contact,
        availability: doctorUser.availability,
      },
      appointments,
    });
  } catch (error) {
    console.error("Doctor Appointments Error:", error);

    res.status(500).json({
      message: "Server error",
    });
  }
};

// Get All Appointments - Admin
const getAllAppointments = async (req, res) => {
  try {
    if (req.userRole !== "admin") {
      return res.status(403).json({
        message: "Only admin can access all appointments",
      });
    }

    const appointments = await Appointment.find()
      .populate("patient", "name email contact")
      .sort({ createdAt: -1 });

    res.status(200).json({
      message: "All appointments fetched successfully",
      appointments,
    });
  } catch (error) {
    console.error("All Appointments Error:", error);

    res.status(500).json({
      message: "Server error",
    });
  }
};

// Update Appointment Status - Doctor
const updateAppointmentStatus = async (req, res) => {
  try {
    if (req.userRole !== "doctor") {
      return res.status(403).json({
        message: "Only doctors can update appointment status",
      });
    }

    const { status } = req.body;

    if (!["pending", "confirmed", "cancelled"].includes(status)) {
      return res.status(400).json({
        message:
          "Invalid status. Status must be pending, confirmed or cancelled.",
      });
    }

    const doctorUser = await User.findById(req.user).select(
      "name role"
    );

    if (!doctorUser) {
      return res.status(404).json({
        message: "Doctor not found",
      });
    }

    const appointment = await Appointment.findOne({
      _id: req.params.id,
      doctor: doctorUser.name,
    });

    if (!appointment) {
      return res.status(404).json({
        message: "Appointment not found or not assigned to you",
      });
    }

    appointment.status = status;

    await appointment.save();

    await appointment.populate(
      "patient",
      "name email contact"
    );

    res.status(200).json({
      message: "Appointment status updated successfully",
      appointment,
    });
  } catch (error) {
    console.error("Update Status Error:", error);

    res.status(500).json({
      message: "Server error",
    });
  }
};

// Delete Appointment - Admin
const deleteAppointment = async (req, res) => {
  try {
    if (req.userRole !== "admin") {
      return res.status(403).json({
        message: "Only admin can delete appointments",
      });
    }

    const appointment = await Appointment.findById(req.params.id);

    if (!appointment) {
      return res.status(404).json({
        message: "Appointment not found",
      });
    }

    await Appointment.findByIdAndDelete(req.params.id);

    res.status(200).json({
      message: "Appointment deleted successfully",
    });
  } catch (error) {
    console.error("Delete Appointment Error:", error);

    res.status(500).json({
      message: "Server error",
    });
  }
};

module.exports = {
  createAppointment,
  getMyAppointments,
  cancelMyAppointment,
  getDoctorAppointments,
  getAllAppointments,
  updateAppointmentStatus,
  deleteAppointment,
};