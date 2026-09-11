import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";

import api from "../services/api";
import { loginSuccess } from "../store/authSlice";

function Login() {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();

    setError("");
    setLoading(true);

    try {
      // Email and password are passed separately
      const data = await api.login(
        email,
        password
      );

      // Save user and token in Redux + localStorage
      dispatch(loginSuccess(data));

      // Redirect according to user role
      if (data.user.role === "admin") {
        navigate("/admin-dashboard");
      } else if (data.user.role === "doctor") {
        navigate("/doctor-dashboard");
      } else {
        navigate("/dashboard");
      }
    } catch (error) {
      setError(
        error.message || "Login failed"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#fdf2f8] flex items-center justify-center px-4">

      <div className="w-full max-w-md bg-white rounded-2xl shadow-lg overflow-hidden">

        {/* ================= HEADER ================= */}
        <div className="bg-purple-600 text-white text-center py-6">

          <div className="text-4xl mb-2">
            🩺
          </div>

          <h1 className="text-2xl font-bold">
            Doctor Appointment System
          </h1>

          <p className="text-purple-100 mt-1">
            Login to your account
          </p>

        </div>

        {/* ================= FORM ================= */}
        <div className="p-8">

          <form
            onSubmit={handleLogin}
            className="space-y-5"
          >

            {/* Error */}
            {error && (
              <div className="bg-red-100 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                {error}
              </div>
            )}

            {/* Email */}
            <div>

              <label className="block text-gray-700 font-medium mb-2">
                Email
              </label>

              <input
                type="email"
                value={email}
                onChange={(e) =>
                  setEmail(e.target.value)
                }
                placeholder="Enter your email"
                required
                className="w-full border border-gray-300 rounded-lg px-4 py-3 outline-none focus:ring-2 focus:ring-purple-500"
              />

            </div>

            {/* Password */}
            <div>

              <label className="block text-gray-700 font-medium mb-2">
                Password
              </label>

              <input
                type="password"
                value={password}
                onChange={(e) =>
                  setPassword(e.target.value)
                }
                placeholder="Enter your password"
                required
                className="w-full border border-gray-300 rounded-lg px-4 py-3 outline-none focus:ring-2 focus:ring-purple-500"
              />

            </div>

            {/* Remember / Forgot */}
            <div className="flex items-center justify-between text-sm">

              <label className="flex items-center gap-2 text-gray-600">

                <input
                  type="checkbox"
                  className="accent-purple-600"
                />

                Remember me

              </label>

              <button
                type="button"
                className="text-purple-600 hover:underline"
              >
                Forgot Password?
              </button>

            </div>

            {/* Login Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-purple-600 hover:bg-purple-700 disabled:bg-purple-300 text-white font-semibold py-3 rounded-lg transition"
            >
              {loading
                ? "Logging in..."
                : "Login"}
            </button>

          </form>

          {/* Signup */}
          <p className="text-center text-gray-600 mt-6">

            Don't have an account?{" "}

            <Link
              to="/signup"
              className="text-purple-600 font-semibold hover:underline"
            >
              Sign Up
            </Link>

          </p>

        </div>
      </div>
    </div>
  );
}

export default Login;