const mongoose = require("mongoose");

const appointmentSchema = new mongoose.Schema(
  {
    patient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    doctor: {
      type: String,
      required: true,
      trim: true,
    },

    date: {
      type: String,
      required: true,
    },

    time: {
      type: String,
      required: true,
    },

    reason: {
      type: String,
      default: "",
      trim: true,
    },

    status: {
      type: String,
      enum: ["pending", "confirmed", "cancelled"],
      default: "pending",
    },
  },
  {
    timestamps: true,
  }
);

// Prevent double booking for the same doctor,
// date and time.
appointmentSchema.index(
  {
    doctor: 1,
    date: 1,
    time: 1,
  },
  {
    unique: true,
  }
);

module.exports = mongoose.model(
  "Appointment",
  appointmentSchema
);