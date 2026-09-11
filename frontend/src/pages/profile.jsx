import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";

import api from "../services/api";
import { logout } from "../store/authSlice";

function Profile() {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const { token, user } = useSelector((state) => state.auth);

  const [profile, setProfile] = useState(user || null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchProfile = async () => {
      if (!token) {
        navigate("/");
        return;
      }

      try {
        setLoading(true);
        setError("");

        const result = await api.getProfile(token);

        setProfile(result.user);
      } catch (error) {
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [token, navigate]);

  const handleLogout = () => {
    dispatch(logout());
    navigate("/");
  };

  const handleBack = () => {
    if (profile?.role === "doctor") {
      navigate("/doctor-dashboard");
    } else {
      navigate("/dashboard");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="text-5xl mb-4">
            ⏳
          </div>

          <p className="text-gray-500 text-lg">
            Loading profile...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Navbar */}
      <header className="bg-purple-600 text-white shadow-lg">
        <div className="max-w-7xl mx-auto px-6 md:px-10">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 py-5">
            {/* Logo / Title */}
            <div>
              <h1 className="text-2xl font-bold">
                🩺 Doctor Appointment System
              </h1>

              <p className="text-purple-100 text-sm mt-1">
                {profile?.role === "doctor"
                  ? "Doctor Portal"
                  : "Patient Portal"}
              </p>
            </div>

            {/* Navbar Buttons */}
            <div className="flex flex-wrap items-center gap-3">
              <button
                onClick={handleBack}
                className="bg-purple-700 hover:bg-purple-800 text-white px-4 py-2 rounded-lg font-medium transition"
              >
                🏠 Dashboard
              </button>

              {profile?.role === "patient" && (
                <>
                  <button
                    onClick={() =>
                      navigate("/book-appointment")
                    }
                    className="bg-white text-purple-600 hover:bg-purple-50 px-4 py-2 rounded-lg font-semibold transition"
                  >
                    📅 Book
                  </button>

                  <button
                    onClick={() =>
                      navigate("/my-appointments")
                    }
                    className="bg-white text-purple-600 hover:bg-purple-50 px-4 py-2 rounded-lg font-semibold transition"
                  >
                    📋 Appointments
                  </button>
                </>
              )}

              <button
                onClick={handleLogout}
                className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg font-semibold transition"
              >
                🚪 Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-6 md:px-10 py-10">
        {/* Page Heading */}
        <div className="bg-white rounded-2xl shadow-lg p-6 md:p-8 mb-8">
          <p className="text-purple-600 font-semibold">
            Account Management
          </p>

          <h2 className="text-3xl font-bold text-gray-800 mt-1">
            My Profile 👤
          </h2>

          <p className="text-gray-500 mt-2">
            View your personal and account information.
          </p>
        </div>

        {/* Error */}
        {error && (
          <div className="bg-red-100 border border-red-300 text-red-700 px-5 py-4 rounded-xl mb-6">
            <div className="flex items-center gap-3">
              <span className="text-2xl">
                ⚠️
              </span>

              <div>
                <p className="font-semibold">
                  Unable to load profile
                </p>

                <p className="text-sm mt-1">
                  {error}
                </p>
              </div>
            </div>
          </div>
        )}

        {profile && (
          <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
            {/* Profile Header */}
            <div className="bg-purple-50 p-8 md:p-10 text-center border-b border-purple-100">
              <div className="w-28 h-28 mx-auto bg-purple-600 text-white rounded-full flex items-center justify-center text-5xl font-bold shadow-md">
                {profile.name
                  ?.charAt(0)
                  .toUpperCase()}
              </div>

              <h2 className="text-3xl font-bold text-gray-800 mt-5">
                {profile.name}
              </h2>

              <p className="text-gray-500 mt-2">
                {profile.role === "doctor"
                  ? "👨‍⚕️ Doctor"
                  : "🧑‍⚕️ Patient"}
              </p>

              <span className="inline-block mt-3 bg-purple-100 text-purple-700 px-4 py-1.5 rounded-full text-sm font-semibold capitalize">
                {profile.role}
              </span>
            </div>

            {/* Personal Information */}
            <div className="p-6 md:p-8">
              <div className="mb-6">
                <h3 className="text-2xl font-bold text-gray-800">
                  Personal Information
                </h3>

                <p className="text-gray-500 mt-1">
                  Your registered account details.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {/* Full Name */}
                <div className="border border-gray-200 rounded-xl p-5 hover:shadow-md transition">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-10 h-10 bg-purple-100 text-purple-600 rounded-lg flex items-center justify-center">
                      👤
                    </div>

                    <p className="text-sm text-gray-500 font-medium">
                      Full Name
                    </p>
                  </div>

                  <p className="text-lg font-semibold text-gray-800">
                    {profile.name || "Not available"}
                  </p>
                </div>

                {/* Email */}
                <div className="border border-gray-200 rounded-xl p-5 hover:shadow-md transition">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-10 h-10 bg-purple-100 text-purple-600 rounded-lg flex items-center justify-center">
                      📧
                    </div>

                    <p className="text-sm text-gray-500 font-medium">
                      Email Address
                    </p>
                  </div>

                  <p className="text-lg font-semibold text-gray-800 break-all">
                    {profile.email || "Not available"}
                  </p>
                </div>

                {/* Contact */}
                <div className="border border-gray-200 rounded-xl p-5 hover:shadow-md transition">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-10 h-10 bg-purple-100 text-purple-600 rounded-lg flex items-center justify-center">
                      📱
                    </div>

                    <p className="text-sm text-gray-500 font-medium">
                      Contact Number
                    </p>
                  </div>

                  <p className="text-lg font-semibold text-gray-800">
                    {profile.contact || "Not available"}
                  </p>
                </div>

                {/* Account Type */}
                <div className="border border-gray-200 rounded-xl p-5 hover:shadow-md transition">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-10 h-10 bg-purple-100 text-purple-600 rounded-lg flex items-center justify-center">
                      🔐
                    </div>

                    <p className="text-sm text-gray-500 font-medium">
                      Account Type
                    </p>
                  </div>

                  <p className="text-lg font-semibold text-gray-800 capitalize">
                    {profile.role || "Patient"}
                  </p>
                </div>
              </div>

              {/* Account Status */}
              <div className="bg-green-50 border border-green-200 rounded-xl p-5 mt-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-green-100 text-green-600 rounded-lg flex items-center justify-center text-xl">
                    ✓
                  </div>

                  <div>
                    <h4 className="font-bold text-gray-800">
                      Account Active
                    </h4>

                    <p className="text-sm text-gray-600 mt-1">
                      Your account is currently active and
                      ready to use.
                    </p>
                  </div>
                </div>
              </div>

              {/* Bottom Actions */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-8">
                <button
                  onClick={handleBack}
                  className="border border-purple-600 text-purple-600 hover:bg-purple-50 py-3 rounded-xl font-semibold transition"
                >
                  ← Back to Dashboard
                </button>

                {profile.role === "patient" && (
                  <button
                    onClick={() =>
                      navigate("/my-appointments")
                    }
                    className="bg-purple-600 hover:bg-purple-700 text-white py-3 rounded-xl font-semibold transition"
                  >
                    📋 View My Appointments
                  </button>
                )}

                {profile.role === "doctor" && (
                  <button
                    onClick={() =>
                      navigate("/doctor-dashboard")
                    }
                    className="bg-purple-600 hover:bg-purple-700 text-white py-3 rounded-xl font-semibold transition"
                  >
                    📋 Manage Appointments
                  </button>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Information */}
        <div className="bg-purple-50 border border-purple-100 rounded-2xl p-5 mt-6">
          <div className="flex gap-4">
            <div className="text-2xl">
              💡
            </div>

            <div>
              <h4 className="font-bold text-gray-800">
                Profile Information
              </h4>

              <p className="text-gray-600 text-sm mt-1">
                Your profile information is fetched securely
                from the server using your login session.
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default Profile;