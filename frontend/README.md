# 🩺 Doctor Appointment System

A full-stack Doctor Appointment Management System that allows patients to book appointments with doctors based on their availability. Doctors can manage appointments, while administrators can manage doctors, patients, availability, and appointments.

---

## 📌 Project Overview

The Doctor Appointment System is a web-based application designed to simplify the process of booking and managing doctor appointments.

The system provides separate dashboards and functionality for:

- 👤 Patients
- 👨‍⚕️ Doctors
- 🛡️ Administrators

Patients can select a doctor, choose an available date and time slot, and book an appointment.

Doctors can view their appointments and confirm or cancel them.

Administrators can create doctors, manage doctor availability, manage patients, and manage all appointments.

---

## ✨ Features

### 👤 Patient Features

- Patient Registration
- Patient Login
- JWT Authentication
- Patient Dashboard
- View Available Doctors
- View Doctor Availability
- Select Appointment Date
- Select Available Time Slot
- Book Appointment
- View My Appointments
- Cancel Appointment
- View Appointment Status
- View Profile
- Logout

---

### 👨‍⚕️ Doctor Features

- Doctor Login
- Doctor Dashboard
- View Doctor Profile
- View Working Days
- View Available Time Slots
- View Patient Appointments
- View Patient Details
- Confirm Appointments
- Cancel Appointments
- Appointment Statistics
- Refresh Dashboard
- Logout

---

### 🛡️ Admin Features

- Admin Login
- Admin Dashboard
- Dashboard Statistics
- Add New Doctor
- Create Doctor Account
- Configure Doctor Availability
- Edit Doctor Availability
- View Doctor List
- Delete Doctor
- View Patient List
- Delete Patient
- View All Appointments
- Delete Appointments
- View Appointment Statistics
- Manage Users

---

## 🔄 Appointment Flow

```text
Patient
   ↓
Login / Signup
   ↓
Select Doctor
   ↓
Select Date
   ↓
Check Doctor Availability
   ↓
Select Available Time Slot
   ↓
Enter Reason
   ↓
Book Appointment
   ↓
Appointment Status: Pending
   ↓
Doctor Reviews Appointment
   ↓
Confirm / Cancel
   ↓
Patient Sees Updated Status