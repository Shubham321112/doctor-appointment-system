# 🩺 Doctor Appointment System

A full-stack Doctor Appointment System built using React, Node.js, Express.js, MongoDB, JWT authentication, Redux Toolkit and Tailwind CSS.

The application provides separate workflows for Patients, Doctors and Admins.

## 🚀 Live Demo

### Frontend
https://doctor-appointment-system-alpha.vercel.app

### Backend API
https://doctor-appointment-system-p2pw.onrender.com

## ✨ Features

### 👤 Patient

- Patient registration and login
- JWT authentication
- Patient dashboard
- View available doctors
- View doctor availability
- Book appointments
- View my appointments
- Cancel appointments
- View profile
- Logout

### 👨‍⚕️ Doctor

- Doctor login
- Doctor dashboard
- View appointment statistics
- View patient appointments
- Confirm appointments
- Cancel appointments
- View profile
- Logout

### 🛠️ Admin

- Admin login
- Admin dashboard
- View system statistics
- Create doctors
- Manage doctors
- Manage patients
- Manage appointments
- Set doctor availability
- Update doctor availability
- Delete users
- Delete appointments

## 🧰 Tech Stack

### Frontend

- React.js
- Vite
- React Router DOM
- Redux Toolkit
- React Redux
- Tailwind CSS
- JavaScript

### Backend

- Node.js
- Express.js
- MongoDB
- Mongoose
- JWT
- bcryptjs
- CORS
- Morgan

### Deployment

- Frontend: Vercel
- Backend: Render
- Database: MongoDB Atlas

## 📁 Project Structure

```text
doctor-appointment/
│
├── backend/
│   ├── config/
│   ├── controllers/
│   ├── middleware/
│   ├── models/
│   ├── routes/
│   ├── app.js
│   ├── server.js
│   └── package.json
│
├── frontend/
│   ├── src/
│   │   ├── pages/
│   │   ├── routes/
│   │   ├── services/
│   │   ├── store/
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── package.json
│   └── vite.config.js
│
├── screenshots/
│   ├── login.png
│   ├── signup.png
│   ├── patient-dashboard.png
│   ├── book-appointment.png
│   ├── my-appointments.png
│   ├── doctor-dashboard.png
│   └── admin-dashboard.png
│
├── .gitignore
└── README.md