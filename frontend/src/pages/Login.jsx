
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

    if (
      !normalizedEmail ||
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)
    ) {
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

      const role = data.user.role;

      if (role === "admin") {
        navigate("/admin-dashboard", { replace: true });
      } else if (role === "doctor") {
        navigate("/doctor-dashboard", { replace: true });
      } else {
        navigate("/profile", { replace: true });
      }
    } catch (err) {
      setError(
        err.message || "Unable to log in. Please check your details."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#f4f7fb] px-4 py-8 sm:px-6 lg:py-12">
      {/* Background decoration */}
      <div className="pointer-events-none absolute -left-32 -top-32 h-96 w-96 rounded-full bg-teal-200/30 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-32 -right-24 h-96 w-96 rounded-full bg-blue-200/40 blur-3xl" />
      <div className="pointer-events-none absolute left-1/2 top-0 h-64 w-64 -translate-x-1/2 rounded-full bg-cyan-100/30 blur-3xl" />

      <div className="relative grid w-full max-w-6xl overflow-hidden rounded-[28px] border border-white bg-white shadow-[0_25px_80px_-25px_rgba(15,23,42,0.20)] lg:min-h-[680px] lg:grid-cols-[0.95fr_1.05fr]">
        {/* Left branding panel */}
        <section className="relative hidden flex-col justify-between overflow-hidden bg-gradient-to-br from-[#102e46] via-[#075e68] to-[#0d9488] p-10 text-white lg:flex xl:p-14">
          <div className="pointer-events-none absolute -right-28 top-16 h-80 w-80 rounded-full border border-white/10" />
          <div className="pointer-events-none absolute -right-16 top-28 h-56 w-56 rounded-full border-[30px] border-white/5" />
          <div className="pointer-events-none absolute -bottom-36 -left-20 h-80 w-80 rounded-full bg-cyan-300/10 blur-2xl" />

          <div className="relative">
            <Link to="/" className="inline-flex items-center gap-3">
              <span className="flex h-12 w-12 items-center justify-center rounded-2xl border border-white/20 bg-white/10 shadow-lg">
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  className="h-7 w-7"
                  aria-hidden="true"
                >
                  <path
                    d="M12 21s-8-4.5-8-11a4.5 4.5 0 0 1 8-2.8A4.5 4.5 0 0 1 20 10c0 6.5-8 11-8 11Z"
                    stroke="currentColor"
                    strokeWidth="1.7"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M5.5 12h4l1.5-3 2.2 6 1.4-3h3.9"
                    stroke="currentColor"
                    strokeWidth="1.7"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </span>

              <span>
                <span className="block text-xl font-bold tracking-tight">
                  MediCare
                </span>
                <span className="block text-[10px] font-semibold uppercase tracking-[0.24em] text-teal-100">
                  Patient care portal
                </span>
              </span>
            </Link>

            <div className="mt-20 max-w-lg xl:mt-24">
              <span className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-2 text-xs font-semibold tracking-wide text-teal-50">
                <span className="h-2 w-2 rounded-full bg-emerald-300" />
                YOUR HEALTH, OUR PRIORITY
              </span>

              <h1 className="mt-7 text-4xl font-bold leading-[1.15] tracking-tight xl:text-5xl">
                Healthcare that
                <br />
                <span className="text-teal-200">fits your life.</span>
              </h1>

              <p className="mt-6 max-w-md text-sm leading-7 text-slate-200 xl:text-base">
                Your healthcare journey, made simpler. Schedule consultations,
                manage upcoming visits, and keep your patient information
                together in one secure place.
              </p>
            </div>
          </div>

          <div className="relative mt-12 space-y-4">
            <div className="flex items-center gap-4 rounded-2xl border border-white/15 bg-white/[0.08] p-4 backdrop-blur-sm">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white/10">
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  className="h-6 w-6"
                  aria-hidden="true"
                >
                  <rect
                    x="3.5"
                    y="5"
                    width="17"
                    height="16"
                    rx="3"
                    stroke="currentColor"
                    strokeWidth="1.6"
                  />
                  <path
                    d="M8 3v4M16 3v4M4 10h16M8 14h3M8 17h6"
                    stroke="currentColor"
                    strokeWidth="1.6"
                    strokeLinecap="round"
                  />
                </svg>
              </div>
              <div>
                <p className="text-sm font-semibold">Simple appointment management</p>
                <p className="mt-1 text-xs leading-5 text-teal-100">
                  Keep track of your visits in one place.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 px-1 text-xs text-teal-100">
              <svg
                viewBox="0 0 24 24"
                fill="none"
                className="h-4 w-4 shrink-0"
                aria-hidden="true"
              >
                <path
                  d="M12 3 5 6v5c0 4.5 3 7.8 7 10 4-2.2 7-5.5 7-10V6l-7-3Z"
                  stroke="currentColor"
                  strokeWidth="1.6"
                  strokeLinejoin="round"
                />
                <path
                  d="m9 12 2 2 4-4"
                  stroke="currentColor"
                  strokeWidth="1.6"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              A convenient place to manage your healthcare
            </div>
          </div>
        </section>

        {/* Login form panel */}
        <section className="flex flex-col justify-center px-6 py-9 sm:px-10 sm:py-12 lg:px-12 xl:px-16">
          <Link
            to="/"
            className="mb-9 inline-flex w-fit items-center gap-3 lg:hidden"
          >
            <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-teal-50 text-teal-700">
              <svg
                viewBox="0 0 24 24"
                fill="none"
                className="h-6 w-6"
                aria-hidden="true"
              >
                <path
                  d="M12 21s-8-4.5-8-11a4.5 4.5 0 0 1 8-2.8A4.5 4.5 0 0 1 20 10c0 6.5-8 11-8 11Z"
                  stroke="currentColor"
                  strokeWidth="1.7"
                  strokeLinejoin="round"
                />
                <path
                  d="M5.5 12h4l1.5-3 2.2 6 1.4-3h3.9"
                  stroke="currentColor"
                  strokeWidth="1.7"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </span>
            <span className="text-xl font-bold text-slate-900">MediCare</span>
          </Link>

          <div className="mb-8">
            <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-2xl bg-teal-50 text-teal-700 ring-1 ring-teal-100">
              <svg
                viewBox="0 0 24 24"
                fill="none"
                className="h-6 w-6"
                aria-hidden="true"
              >
                <path
                  d="M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8Z"
                  stroke="currentColor"
                  strokeWidth="1.7"
                />
                <path
                  d="M4 21v-2a8 8 0 0 1 16 0v2H4Z"
                  stroke="currentColor"
                  strokeWidth="1.7"
                  strokeLinejoin="round"
                />
              </svg>
            </div>

            <p className="text-xs font-bold uppercase tracking-[0.2em] text-teal-700">
              Welcome back
            </p>

            <h2 className="mt-2 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
              Sign in to MediCare
            </h2>

            <p className="mt-3 max-w-md text-sm leading-6 text-slate-500">
              Enter your registered details to access your account and manage
              your healthcare.
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-5">
            {error && (
              <div
                role="alert"
                className="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm leading-6 text-red-700"
              >
                <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-red-100 font-bold">
                  !
                </span>
                <p className="break-words">{error}</p>
              </div>
            )}

            {success && (
              <div
                role="status"
                className="flex items-center gap-3 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm font-medium text-emerald-700"
              >
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  className="h-5 w-5 shrink-0"
                  aria-hidden="true"
                >
                  <path
                    d="m5 12 4 4L19 6"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
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

              <div className="relative">
                <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4 text-slate-400">
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    className="h-5 w-5"
                    aria-hidden="true"
                  >
                    <rect
                      x="3"
                      y="5"
                      width="18"
                      height="14"
                      rx="3"
                      stroke="currentColor"
                      strokeWidth="1.6"
                    />
                    <path
                      d="m4 7 8 6 8-6"
                      stroke="currentColor"
                      strokeWidth="1.6"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </span>

                <input
                  id="login-email"
                  type="email"
                  autoComplete="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  placeholder="you@example.com"
                  required
                  disabled={loading}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50/70 py-3.5 pl-12 pr-4 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 hover:border-slate-300 focus:border-teal-600 focus:bg-white focus:ring-4 focus:ring-teal-600/10 disabled:cursor-not-allowed disabled:opacity-60"
                />
              </div>
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
                <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4 text-slate-400">
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    className="h-5 w-5"
                    aria-hidden="true"
                  >
                    <rect
                      x="4"
                      y="10"
                      width="16"
                      height="11"
                      rx="2.5"
                      stroke="currentColor"
                      strokeWidth="1.6"
                    />
                    <path
                      d="M8 10V7a4 4 0 0 1 8 0v3M12 14v3"
                      stroke="currentColor"
                      strokeWidth="1.6"
                      strokeLinecap="round"
                    />
                  </svg>
                </span>

                <input
                  id="login-password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  placeholder="Enter your password"
                  required
                  disabled={loading}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50/70 py-3.5 pl-12 pr-20 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 hover:border-slate-300 focus:border-teal-600 focus:bg-white focus:ring-4 focus:ring-teal-600/10 disabled:cursor-not-allowed disabled:opacity-60"
                />

                <button
                  type="button"
                  onClick={() => setShowPassword((current) => !current)}
                  disabled={loading}
                  className="absolute right-3 top-1/2 -translate-y-1/2 rounded-lg px-2 py-1.5 text-xs font-bold text-teal-700 transition hover:bg-teal-50 disabled:opacity-50"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? "Hide" : "Show"}
                </button>
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
              <label className="flex cursor-pointer items-center gap-2 text-sm text-slate-600">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(event) => setRememberMe(event.target.checked)}
                  disabled={loading}
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
              className="group flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-teal-700 to-teal-600 px-5 py-3.5 text-sm font-bold text-white shadow-lg shadow-teal-700/15 transition duration-200 hover:-translate-y-0.5 hover:from-teal-800 hover:to-teal-700 hover:shadow-xl hover:shadow-teal-700/20 focus:outline-none focus:ring-4 focus:ring-teal-600/20 disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:translate-y-0"
            >
              {loading ? (
                <>
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
                  Signing in...
                </>
              ) : (
                <>
                  Sign in
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    className="h-4 w-4 transition-transform group-hover:translate-x-1"
                    aria-hidden="true"
                  >
                    <path
                      d="M5 12h14m-6-6 6 6-6 6"
                      stroke="currentColor"
                      strokeWidth="1.8"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </>
              )}
            </button>
          </form>

          <div className="my-7 flex items-center gap-4">
            <div className="h-px flex-1 bg-slate-200" />
            <span className="whitespace-nowrap text-[10px] font-bold uppercase tracking-[0.18em] text-slate-400">
              New to MediCare?
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

          <div className="mt-8 flex items-center justify-center gap-2 text-center text-xs leading-5 text-slate-400">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              className="h-4 w-4 shrink-0"
              aria-hidden="true"
            >
              <path
                d="M12 3 5 6v5c0 4.5 3 7.8 7 10 4-2.2 7-5.5 7-10V6l-7-3Z"
                stroke="currentColor"
                strokeWidth="1.6"
                strokeLinejoin="round"
              />
              <path
                d="m9 12 2 2 4-4"
                stroke="currentColor"
                strokeWidth="1.6"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            Your account details are handled securely.
          </div>
        </section>
      </div>
    </main>
  );
}

export default Login;
