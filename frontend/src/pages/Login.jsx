
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
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (event) => {
    event.preventDefault();
    setError("");
    setSuccess("");

    const normalizedEmail = email.trim().toLowerCase();

    if (!normalizedEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)) {
      setError("Please enter a valid email address.");
      return;
    }

    if (!password) {
      setError("Please enter your password.");
      return;
    }

    try {
      setLoading(true);

      const data = await api.login(normalizedEmail, password);

      if (!data?.user || !data?.token) {
        throw new Error("Login response is incomplete. Please try again.");
      }

      dispatch(loginSuccess(data));

      setSuccess("Login successful! Redirecting...");

      // Let the success message appear before navigating.
      const role = data.user.role;

      if (role === "admin") {
        navigate("/admin-dashboard", { replace: true });
      } else if (role === "doctor") {
        navigate("/doctor-dashboard", { replace: true });
      } else {
        navigate("/profile", { replace: true });
      }
    } catch (err) {
      setError(err.message || "Unable to log in. Please check your details.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-slate-50 px-4 py-10 sm:px-6">
      <div className="pointer-events-none absolute -left-28 -top-28 h-80 w-80 rounded-full bg-teal-100/70 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-32 -right-20 h-96 w-96 rounded-full bg-cyan-100/70 blur-3xl" />

      <div className="relative grid w-full max-w-5xl overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-xl lg:grid-cols-2">
        {/* Left panel */}
        <section className="relative hidden flex-col justify-between overflow-hidden bg-gradient-to-br from-teal-800 via-teal-700 to-cyan-600 p-10 text-white lg:flex xl:p-12">
          <div className="pointer-events-none absolute -right-20 top-24 h-72 w-72 rounded-full border-[45px] border-white/10" />
          <div className="pointer-events-none absolute -bottom-20 -left-16 h-64 w-64 rounded-full bg-white/5" />

          <div className="relative">
            <Link to="/" className="inline-flex items-center gap-3">
              <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/15 text-2xl">
                ✚
              </span>
              <span className="text-xl font-bold tracking-tight">
                MediCare
              </span>
            </Link>

            <div className="mt-20">
              <span className="rounded-full border border-white/25 bg-white/10 px-3 py-1.5 text-xs font-semibold uppercase tracking-wider">
                Your health matters
              </span>

              <h1 className="mt-6 text-4xl font-bold leading-tight xl:text-5xl">
                Better care,
                <br />
                healthier lives.
              </h1>

              <p className="mt-5 max-w-md text-base leading-8 text-teal-50">
                Book appointments with doctors, manage your visits, and keep
                your healthcare journey organised in one place.
              </p>
            </div>
          </div>

          <div className="relative mt-12 rounded-2xl border border-white/20 bg-white/10 p-5 backdrop-blur-sm">
            <div className="flex items-start gap-3">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/15 text-xl">
                ✓
              </span>
              <div>
                <p className="font-semibold">Healthcare made simpler</p>
                <p className="mt-1 text-sm leading-6 text-teal-50">
                  Access your account and manage your appointments securely.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Login form */}
        <section className="p-6 sm:p-10 lg:p-12 xl:p-14">
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-lg font-bold text-teal-800 lg:hidden"
          >
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-teal-50 text-xl">
              ✚
            </span>
            MediCare
          </Link>

          <div className="mt-8 lg:mt-4">
            <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-teal-50 text-2xl text-teal-700">
              👋
            </div>

            <p className="text-sm font-bold uppercase tracking-wider text-teal-700">
              Welcome back
            </p>

            <h2 className="mt-2 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
              Sign in to your account
            </h2>

            <p className="mt-3 text-sm leading-6 text-slate-500">
              Enter your registered email and password to continue.
            </p>
          </div>

          <form onSubmit={handleLogin} className="mt-8 space-y-5">
            {error && (
              <div
                role="alert"
                className="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700"
              >
                <span className="font-bold">!</span>
                <p className="break-words">{error}</p>
              </div>
            )}

            {success && (
              <div
                role="status"
                className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm font-medium text-emerald-700"
              >
                {success}
              </div>
            )}

            <div>
              <label
                htmlFor="login-email"
                className="mb-2 block text-sm font-semibold text-slate-700"
              >
                Email address
              </label>

              <input
                id="login-email"
                type="email"
                autoComplete="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="you@example.com"
                required
                disabled={loading}
                className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3.5 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-teal-600 focus:ring-4 focus:ring-teal-600/10 disabled:bg-slate-50"
              />
            </div>

            <div>
              <div className="mb-2 flex items-center justify-between gap-3">
                <label
                  htmlFor="login-password"
                  className="block text-sm font-semibold text-slate-700"
                >
                  Password
                </label>
                <span className="text-xs text-slate-400">
                  Keep it private
                </span>
              </div>

              <div className="relative">
                <input
                  id="login-password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  placeholder="Enter your password"
                  required
                  disabled={loading}
                  className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3.5 pr-20 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-teal-600 focus:ring-4 focus:ring-teal-600/10 disabled:bg-slate-50"
                />

                <button
                  type="button"
                  onClick={() => setShowPassword((current) => !current)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 rounded-lg px-2 py-1 text-xs font-bold text-teal-700 transition hover:bg-teal-50"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? "Hide" : "Show"}
                </button>
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-3">
              <label className="flex cursor-pointer items-center gap-2 text-sm text-slate-600">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(event) => setRememberMe(event.target.checked)}
                  className="h-4 w-4 rounded border-slate-300 accent-teal-700"
                />
                Remember me
              </label>

              <span
                title="Password recovery is not configured yet."
                className="cursor-help text-sm font-medium text-slate-400"
              >
                Forgot password?
              </span>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-teal-700 px-5 py-3.5 text-sm font-bold text-white shadow-sm transition hover:-translate-y-0.5 hover:bg-teal-800 hover:shadow-md disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? (
                <>
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
                  Signing in...
                </>
              ) : (
                <>
                  Sign In
                  <span>→</span>
                </>
              )}
            </button>
          </form>

          <div className="my-7 flex items-center gap-4">
            <div className="h-px flex-1 bg-slate-200" />
            <span className="text-xs font-medium text-slate-400">
              NEW TO MEDICARE?
            </span>
            <div className="h-px flex-1 bg-slate-200" />
          </div>

          <p className="text-center text-sm text-slate-600">
            Don't have an account?{" "}
            <Link
              to="/signup"
              className="font-bold text-teal-700 transition hover:text-teal-900 hover:underline"
            >
              Create an account
            </Link>
          </p>

          <p className="mt-8 text-center text-xs leading-5 text-slate-400">
            By signing in, you agree to use this service responsibly.
          </p>
        </section>
      </div>
    </main>
  );
}

export default Login;
