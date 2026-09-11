import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";

import { logout } from "../store/authSlice";

function Dashboard() {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { user } = useSelector((state) => state.auth);

  const handleLogout = () => {
    dispatch(logout());
    navigate("/");
  };

  const firstName = user?.name
    ? user.name.split(" ")[0]
    : "Patient";

  return (
    <div className="min-h-screen bg-gray-100">
      {/* ================= NAVBAR ================= */}
      <header className="bg-purple-600 text-white shadow-lg sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-10">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 py-4">
            {/* Logo */}
            <button
              onClick={() => navigate("/dashboard")}
              className="text-left"
            >
              <h1 className="text-xl sm:text-2xl font-bold">
                🩺 Doctor Appointment System
              </h1>

              <p className="text-purple-100 text-sm mt-1">
                Patient Portal
              </p>
            </button>

            {/* Navigation */}
            <nav className="flex flex-wrap items-center gap-2 sm:gap-3">
              <button
                onClick={() => navigate("/dashboard")}
                className="bg-purple-800 hover:bg-purple-900 px-3 sm:px-4 py-2 rounded-lg font-medium transition"
              >
                🏠 Dashboard
              </button>

              <button
                onClick={() => navigate("/book-appointment")}
                className="bg-white text-purple-600 hover:bg-purple-50 px-3 sm:px-4 py-2 rounded-lg font-semibold transition"
              >
                📅 Book
              </button>

              <button
                onClick={() => navigate("/my-appointments")}
                className="bg-white text-purple-600 hover:bg-purple-50 px-3 sm:px-4 py-2 rounded-lg font-semibold transition"
              >
                📋 Appointments
              </button>

              <button
                onClick={() => navigate("/profile")}
                className="bg-white text-purple-600 hover:bg-purple-50 px-3 sm:px-4 py-2 rounded-lg font-semibold transition"
              >
                👤 Profile
              </button>

              <button
                onClick={handleLogout}
                className="bg-red-500 hover:bg-red-600 px-3 sm:px-4 py-2 rounded-lg font-semibold transition"
              >
                🚪 Logout
              </button>
            </nav>
          </div>
        </div>
      </header>

      {/* ================= MAIN ================= */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 md:px-10 py-8 md:py-10">
        {/* ================= WELCOME ================= */}
        <section className="bg-white rounded-2xl shadow-lg overflow-hidden mb-8">
          <div className="bg-gradient-to-r from-purple-600 to-purple-700 p-6 md:p-8 text-white">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
              <div>
                <p className="text-purple-100 font-semibold mb-2">
                  Patient Dashboard
                </p>

                <h2 className="text-3xl md:text-4xl font-bold">
                  Welcome, {firstName}! 👋
                </h2>

                <p className="text-purple-100 mt-3 max-w-2xl">
                  Manage your appointments, find doctors and
                  keep your account information up to date.
                </p>
              </div>

              <div className="w-20 h-20 md:w-24 md:h-24 bg-white/20 rounded-full flex items-center justify-center text-5xl shadow-inner">
                👤
              </div>
            </div>
          </div>

          {/* User Summary */}
          <div className="p-5 md:p-6">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="bg-purple-50 rounded-xl p-4">
                <p className="text-sm text-gray-500">
                  Patient Name
                </p>

                <p className="font-semibold text-gray-800 mt-1">
                  {user?.name || "Not available"}
                </p>
              </div>

              <div className="bg-purple-50 rounded-xl p-4">
                <p className="text-sm text-gray-500">
                  Email
                </p>

                <p className="font-semibold text-gray-800 mt-1 break-all">
                  {user?.email || "Not available"}
                </p>
              </div>

              <div className="bg-purple-50 rounded-xl p-4">
                <p className="text-sm text-gray-500">
                  Account Type
                </p>

                <p className="font-semibold text-purple-700 mt-1 capitalize">
                  {user?.role || "Patient"}
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* ================= QUICK ACTIONS ================= */}
        <section className="mb-5">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-800">
            Quick Actions
          </h2>

          <p className="text-gray-500 mt-1">
            Everything you need to manage your appointments.
          </p>
        </section>

        {/* ================= ACTION CARDS ================= */}
        <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Book */}
          <button
            onClick={() => navigate("/book-appointment")}
            className="text-left bg-white rounded-2xl shadow-md p-6 border border-transparent hover:border-purple-400 hover:shadow-xl hover:-translate-y-1 transition-all group"
          >
            <div className="w-14 h-14 bg-purple-100 rounded-xl flex items-center justify-center text-3xl mb-5 group-hover:bg-purple-600 group-hover:scale-105 transition">
              📅
            </div>

            <h3 className="text-xl font-bold text-gray-800">
              Book Appointment
            </h3>

            <p className="text-gray-500 mt-2 leading-relaxed">
              Choose a doctor, select an available date and
              time, and book your appointment.
            </p>

            <p className="text-purple-600 font-semibold mt-5">
              Book Now →
            </p>
          </button>

          {/* Appointments */}
          <button
            onClick={() => navigate("/my-appointments")}
            className="text-left bg-white rounded-2xl shadow-md p-6 border border-transparent hover:border-purple-400 hover:shadow-xl hover:-translate-y-1 transition-all group"
          >
            <div className="w-14 h-14 bg-purple-100 rounded-xl flex items-center justify-center text-3xl mb-5 group-hover:bg-purple-600 group-hover:scale-105 transition">
              📋
            </div>

            <h3 className="text-xl font-bold text-gray-800">
              My Appointments
            </h3>

            <p className="text-gray-500 mt-2 leading-relaxed">
              View your upcoming and previous appointments
              and check their current status.
            </p>

            <p className="text-purple-600 font-semibold mt-5">
              View Appointments →
            </p>
          </button>

          {/* Profile */}
          <button
            onClick={() => navigate("/profile")}
            className="text-left bg-white rounded-2xl shadow-md p-6 border border-transparent hover:border-purple-400 hover:shadow-xl hover:-translate-y-1 transition-all group"
          >
            <div className="w-14 h-14 bg-purple-100 rounded-xl flex items-center justify-center text-3xl mb-5 group-hover:bg-purple-600 group-hover:scale-105 transition">
              👤
            </div>

            <h3 className="text-xl font-bold text-gray-800">
              My Profile
            </h3>

            <p className="text-gray-500 mt-2 leading-relaxed">
              View your registered name, email, contact and
              account information.
            </p>

            <p className="text-purple-600 font-semibold mt-5">
              View Profile →
            </p>
          </button>
        </section>

        {/* ================= HOW IT WORKS ================= */}
        <section className="bg-white rounded-2xl shadow-lg p-6 md:p-8 mt-8">
          <div className="mb-6">
            <p className="text-purple-600 font-semibold">
              Simple & Easy
            </p>

            <h2 className="text-2xl font-bold text-gray-800 mt-1">
              How to Book an Appointment
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            <div className="bg-gray-50 rounded-xl p-5">
              <div className="w-11 h-11 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center font-bold text-lg">
                1
              </div>

              <h3 className="font-bold text-gray-800 mt-4">
                Choose Doctor
              </h3>

              <p className="text-gray-500 text-sm mt-2">
                Select your preferred doctor from the available
                doctors list.
              </p>
            </div>

            <div className="bg-gray-50 rounded-xl p-5">
              <div className="w-11 h-11 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center font-bold text-lg">
                2
              </div>

              <h3 className="font-bold text-gray-800 mt-4">
                Select Date & Time
              </h3>

              <p className="text-gray-500 text-sm mt-2">
                Choose an available date and time slot provided
                by the doctor.
              </p>
            </div>

            <div className="bg-gray-50 rounded-xl p-5">
              <div className="w-11 h-11 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center font-bold text-lg">
                3
              </div>

              <h3 className="font-bold text-gray-800 mt-4">
                Track Appointment
              </h3>

              <p className="text-gray-500 text-sm mt-2">
                Check your appointment status anytime from My
                Appointments.
              </p>
            </div>
          </div>
        </section>

        {/* ================= INFORMATION ================= */}
        <section className="bg-purple-50 border border-purple-100 rounded-2xl p-6 mt-8">
          <div className="flex gap-4">
            <div className="text-3xl">💡</div>

            <div>
              <h3 className="font-bold text-gray-800 text-lg">
                Need a Doctor?
              </h3>

              <p className="text-gray-600 mt-1">
                Book an appointment with a doctor and manage
                everything from one place.
              </p>

              <button
                onClick={() => navigate("/book-appointment")}
                className="mt-4 bg-purple-600 hover:bg-purple-700 text-white px-5 py-2.5 rounded-lg font-semibold transition"
              >
                📅 Book Appointment
              </button>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}

export default Dashboard;