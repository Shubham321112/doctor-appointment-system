
const mongoose = require("mongoose");

const reportSchema = new mongoose.Schema(
  {
    fileName: {
      type: String,
      trim: true,
    },
    mimeType: {
      type: String,
      enum: ["application/pdf", "image/jpeg", "image/png"],
    },
    fileData: {
      type: Buffer,
    },
    uploadedAt: {
      type: Date,
      default: Date.now,
    },
  },
  { _id: false }
);

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

    reports: {
      type: [reportSchema],
      default: [],
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

module.exports = mongoose.model("Appointment", appointmentSchema);
