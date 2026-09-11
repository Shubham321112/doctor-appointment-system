const express = require("express");

const cors = require("cors");

const morgan = require("morgan");

const authRoutes = require("./routes/authRoutes");

const appointmentRoutes = require("./routes/appointmentRoutes");

const userRoutes = require("./routes/userRoutes");

const app = express();

app.use(cors());

app.use(express.json());

app.use(morgan("dev"));

app.get("/", (req, res) => {
  res.json({
    message: "Doctor Appointment API is running successfully",
  });
});

// Authentication routes
app.use("/api/auth", authRoutes);

// Appointment routes
app.use("/api/appointments", appointmentRoutes);

// User management routes
app.use("/api/users", userRoutes);

module.exports = app;