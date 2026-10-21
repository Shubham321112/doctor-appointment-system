const Appointment = require("../models/Appointment");
const User = require("../models/user");

const MAX_REPORTS = 3;
const MAX_FILE_SIZE = 1 * 1024 * 1024;

const ALLOWED_TYPES = [
  "application/pdf",
  "image/jpeg",
  "image/png",
];

// Check actual file signature.
const hasValidSignature = (file) => {
  if (!file?.buffer || file.buffer.length < 4) {
    return false;
  }

  const buffer = file.buffer;

  if (file.mimetype === "application/pdf") {
    return buffer.subarray(0, 5).toString() === "%PDF-";
  }

  if (file.mimetype === "image/jpeg") {
    return (
      buffer[0] === 0xff &&
      buffer[1] === 0xd8 &&
      buffer[2] === 0xff
    );
  }

  if (file.mimetype === "image/png") {
    return (
      buffer.length >= 8 &&
      buffer
        .subarray(0, 8)
        .equals(
          Buffer.from([137, 80, 78, 71, 13, 10, 26, 10])
        )
    );
  }

  return false;
};

// Never send the binary contents of reports in normal responses.
const safeAppointment = (appointment) => {
  const data = appointment.toObject
    ? appointment.toObject()
    : { ...appointment };

  if (Array.isArray(data.reports)) {
    data.reports = data.reports.map((report) => {
      const { fileData, ...metadata } = report;
      return metadata;
    });
  }

  return data;
};

const safeAppointments = (appointments) =>
  appointments.map(safeAppointment);

// Get weekday from YYYY-MM-DD.
const getDayName = (dateString) => {
  if (
    typeof dateString !== "string" ||
    !/^\d{4}-\d{2}-\d{2}$/.test(dateString)
  ) {
    return null;
  }

  const date = new Date(`${dateString}T00:00:00.000Z`);

  if (
    Number.isNaN(date.getTime()) ||
    date.toISOString().slice(0, 10) !== dateString
  ) {
    return null;
  }

  return date.toLocaleDateString("en-US", {
    weekday: "long",
    timeZone: "UTC",
  });
};

// Book Appointment - Patient
const createAppointment = async (req, res) => {
  try {
    const { doctor, date, time, reason } = req.body;
    const files = req.files || [];

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

    if (
      typeof doctor !== "string" ||
      typeof date !== "string" ||
      typeof time !== "string" ||
      (reason !== undefined && typeof reason !== "string")
    ) {
      return res.status(400).json({
        message: "Invalid appointment details",
      });
    }

    if (reason && reason.length > 1000) {
      return res.status(400).json({
        message: "Reason must not exceed 1000 characters",
      });
    }

    if (files.length > MAX_REPORTS) {
      return res.status(400).json({
        message: `You can upload a maximum of ${MAX_REPORTS} reports`,
      });
    }

    for (const file of files) {
      if (
        !ALLOWED_TYPES.includes(file.mimetype) ||
        !file.buffer ||
        file.size === 0 ||
        file.size > MAX_FILE_SIZE ||
        !hasValidSignature(file)
      ) {
        return res.status(400).json({
          message:
            "Invalid report. Upload valid PDF, JPG or PNG files up to 1 MB each.",
        });
      }
    }

    const dayName = getDayName(date);
    const today = new Date().toISOString().slice(0, 10);

    if (!dayName || date < today) {
      return res.status(400).json({
        message: "Please select a valid current or future date",
      });
    }

    const doctorUser = await User.findOne({
      name: doctor.trim(),
      role: "doctor",
    });

    if (!doctorUser) {
      return res.status(400).json({
        message: "Selected doctor does not exist",
      });
    }

    const dayAvailability = (doctorUser.availability || []).find(
      (item) => item.day?.toLowerCase() === dayName.toLowerCase()
    );

    if (!dayAvailability) {
      return res.status(400).json({
        message: `Doctor is not available on ${dayName}`,
      });
    }

    if (!(dayAvailability.slots || []).includes(time)) {
      return res.status(400).json({
        message: "Selected time is not available for this doctor",
      });
    }

    const existingAppointment = await Appointment.findOne({
      doctor: doctorUser.name,
      date,
      time,
      status: { $ne: "cancelled" },
    });

    if (existingAppointment) {
      return res.status(409).json({
        message:
          "This doctor is already booked for this date and time. Please choose another time.",
      });
    }

    const reportDocuments = files.map((file) => ({
      fileName: file.originalname
        .replace(/[\\/]/g, "_")
        .slice(0, 150),
      mimeType: file.mimetype,
      fileData: file.buffer,
      uploadedAt: new Date(),
    }));

    const appointment = await Appointment.create({
      patient: req.user,
      doctor: doctorUser.name,
      date,
      time,
      reason: reason || "",
      status: "pending",
      reports: reportDocuments,
    });

    return res.status(201).json({
      message: "Appointment booked successfully",
      appointment: safeAppointment(appointment),
    });
  } catch (error) {
    console.error("Appointment Error:", error);

    if (error.code === 11000) {
      return res.status(409).json({
        message:
          "This doctor is already booked for this date and time. Please choose another time.",
      });
    }

    return res.status(500).json({
      message: "Server error while booking appointment",
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
      .select("-reports.fileData")
      .populate("patient", "name email contact")
      .sort({ createdAt: -1 });

    return res.status(200).json({
      message: "Appointments fetched successfully",
      appointments: safeAppointments(appointments),
    });
  } catch (error) {
    console.error("Get Appointments Error:", error);

    return res.status(500).json({
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

    return res.status(200).json({
      message: "Appointment cancelled successfully",
      appointment: safeAppointment(appointment),
    });
  } catch (error) {
    console.error("Cancel Appointment Error:", error);

    return res.status(500).json({
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
      .select("-reports.fileData")
      .populate("patient", "name email contact")
      .sort({ date: 1, time: 1, createdAt: -1 });

    return res.status(200).json({
      message: "Doctor appointments fetched successfully",
      doctor: {
        id: doctorUser._id,
        name: doctorUser.name,
        email: doctorUser.email,
        contact: doctorUser.contact,
        availability: doctorUser.availability,
      },
      appointments: safeAppointments(appointments),
    });
  } catch (error) {
    console.error("Doctor Appointments Error:", error);

    return res.status(500).json({
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
      .select("-reports.fileData")
      .populate("patient", "name email contact")
      .sort({ createdAt: -1 });

    return res.status(200).json({
      message: "All appointments fetched successfully",
      appointments: safeAppointments(appointments),
    });
  } catch (error) {
    console.error("All Appointments Error:", error);

    return res.status(500).json({
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

    const doctorUser = await User.findById(req.user).select("name role");

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

    await appointment.populate("patient", "name email contact");

    return res.status(200).json({
      message: "Appointment status updated successfully",
      appointment: safeAppointment(appointment),
    });
  } catch (error) {
    console.error("Update Status Error:", error);

    return res.status(500).json({
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

    return res.status(200).json({
      message: "Appointment deleted successfully",
    });
  } catch (error) {
    console.error("Delete Appointment Error:", error);

    return res.status(500).json({
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