
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import api from "../services/api";

function Signup() {
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [contact, setContact] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSignup = async (event) => {
    event.preventDefault();
    setError("");
    setSuccess("");

    const cleanName = name.trim();
    const cleanEmail = email.trim().toLowerCase();
    const cleanContact = contact.trim();

    if (cleanName.length < 2) {
      setError("Please enter your full name (at least 2 characters).");
      return;
    }

    if (cleanName.length > 80) {
      setError("Your name must not exceed 80 characters.");
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)) {
      setError("Please enter a valid email address.");
      return;
    }

    if (!/^[0-9]{10}$/.test(cleanContact)) {
      setError("Please enter a valid 10-digit contact number.");
      return;
    }

    if (password.length < 8) {
      setError("Password must contain at least 8 characters.");
      return;
    }

    if (!/[A-Za-z]/.test(password) || !/[0-9]/.test(password)) {
      setError("Password must contain at least one letter and one number.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    try {
      setLoading(true);

      await api.register(cleanName, cleanEmail, cleanContact, password);

      setSuccess("Account created successfully! Redirecting to login...");

      setTimeout(() => {
        navigate("/", { replace: true });
      }, 1200);
    } catch (err) {
      setError(err.message || "Registration failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const inputClass =
    "w-full rounded-xl border border-slate-200 bg-slate-50/70 py-3.5 pl-11 pr-4 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 hover:border-slate-300 focus:border-teal-600 focus:bg-white focus:ring-4 focus:ring-teal-600/10 disabled:cursor-not-allowed disabled:opacity-60";

  const fieldIconClass =
    "pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400";

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#f4f7fb] px-4 py-8 sm:px-6 lg:py-12">
      <div className="pointer-events-none absolute -left-32 -top-32 h-96 w-96 rounded-full bg-teal-200/30 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-32 -right-24 h-96 w-96 rounded-full bg-blue-200/40 blur-3xl" />

      <div className="relative grid w-full max-w-6xl overflow-hidden rounded-[28px] border border-white bg-white shadow-[0_25px_80px_-25px_rgba(15,23,42,0.20)] lg:grid-cols-[0.9fr_1.1fr]">
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

            <div className="mt-20 xl:mt-24">
              <span className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-2 text-xs font-semibold tracking-wide text-teal-50">
                <span className="h-2 w-2 rounded-full bg-emerald-300" />
                YOUR HEALTH, OUR PRIORITY
              </span>

              <h1 className="mt-7 text-4xl font-bold leading-[1.15] tracking-tight xl:text-5xl">
                A healthier
                <br />
                <span className="text-teal-200">tomorrow starts here.</span>
              </h1>

              <p className="mt-6 max-w-md text-sm leading-7 text-slate-200 xl:text-base">
                Create your account and make managing your healthcare easier.
                Book consultations, organise appointments, and keep your
                patient details accessible in one place.
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
              </div>

              <div>
                <p className="text-sm font-semibold">
                  Your healthcare, organised
                </p>
                <p className="mt-1 text-xs leading-5 text-teal-100">
                  One account to manage your patient journey.
                </p>
              </div>
            </div>

            <p className="px-1 text-xs leading-5 text-teal-100">
              Create your account with your name, email, and mobile number.
            </p>
          </div>
        </section>

        {/* Signup form */}
        <section className="flex flex-col justify-center px-6 py-9 sm:px-10 sm:py-12 lg:px-12 xl:px-16">
          <Link
            to="/"
            className="mb-8 inline-flex w-fit items-center gap-3 lg:hidden"
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

          <div className="mb-7">
            <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-2xl bg-teal-50 text-teal-700 ring-1 ring-teal-100">
              <svg
                viewBox="0 0 24 24"
                fill="none"
                className="h-6 w-6"
                aria-hidden="true"
              >
                <path
                  d="M16 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"
                  stroke="currentColor"
                  strokeWidth="1.7"
                  strokeLinecap="round"
                />
                <circle
                  cx="10"
                  cy="7"
                  r="4"
                  stroke="currentColor"
                  strokeWidth="1.7"
                />
                <path
                  d="M19 8v6M16 11h6"
                  stroke="currentColor"
                  strokeWidth="1.7"
                  strokeLinecap="round"
                />
              </svg>
            </div>

            <p className="text-xs font-bold uppercase tracking-[0.2em] text-teal-700">
              Join MediCare
            </p>

            <h2 className="mt-2 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
              Create your account
            </h2>

            <p className="mt-3 text-sm leading-6 text-slate-500">
              Enter your details below to get started.
            </p>
          </div>

          <form onSubmit={handleSignup} className="space-y-4">
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
                className="flex items-start gap-3 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm leading-6 text-emerald-700"
              >
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  className="mt-0.5 h-5 w-5 shrink-0"
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
                <p>{success}</p>
              </div>
            )}

            <div>
              <label
                htmlFor="signup-name"
                className="mb-2 block text-sm font-semibold text-slate-700"
              >
                Full name
              </label>

              <div className="relative">
                <span className={fieldIconClass}>
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    className="h-5 w-5"
                    aria-hidden="true"
                  >
                    <circle
                      cx="12"
                      cy="8"
                      r="4"
                      stroke="currentColor"
                      strokeWidth="1.6"
                    />
                    <path
                      d="M4 21v-2a8 8 0 0 1 16 0v2H4Z"
                      stroke="currentColor"
                      strokeWidth="1.6"
                      strokeLinejoin="round"
                    />
                  </svg>
                </span>

                <input
                  id="signup-name"
                  type="text"
                  autoComplete="name"
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  placeholder="Enter your full name"
                  minLength={2}
                  maxLength={80}
                  required
                  disabled={loading}
                  className={inputClass}
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="signup-email"
                className="mb-2 block text-sm font-semibold text-slate-700"
              >
                Email address
              </label>

              <div className="relative">
                <span className={fieldIconClass}>
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
                  id="signup-email"
                  type="email"
                  autoComplete="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  placeholder="you@example.com"
                  required
                  disabled={loading}
                  className={inputClass}
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="signup-contact"
                className="mb-2 block text-sm font-semibold text-slate-700"
              >
                Contact number
              </label>

              <div className="relative">
                <span className={fieldIconClass}>
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    className="h-5 w-5"
                    aria-hidden="true"
                  >
                    <path
                      d="M7 3h10a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2Z"
                      stroke="currentColor"
                      strokeWidth="1.6"
                    />
                    <path
                      d="M10 17h4"
                      stroke="currentColor"
                      strokeWidth="1.6"
                      strokeLinecap="round"
                    />
                  </svg>
                </span>

                <input
                  id="signup-contact"
                  type="tel"
                  inputMode="numeric"
                  autoComplete="tel"
                  value={contact}
                  onChange={(event) =>
                    setContact(event.target.value.replace(/\D/g, "").slice(0, 10))
                  }
                  placeholder="10-digit mobile number"
                  maxLength={10}
                  minLength={10}
                  required
                  disabled={loading}
                  className={inputClass}
                />
              </div>

              <p className="mt-1.5 text-xs text-slate-400">
                Enter your 10-digit mobile number.
              </p>
            </div>

            <div>
              <label
                htmlFor="signup-password"
                className="mb-2 block text-sm font-semibold text-slate-700"
              >
                Password
              </label>

              <div className="relative">
                <span className={fieldIconClass}>
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
                  id="signup-password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="new-password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  placeholder="Create a strong password"
                  minLength={8}
                  required
                  disabled={loading}
                  className={`${inputClass} pr-20`}
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

              <p className="mt-1.5 text-xs text-slate-400">
                At least 8 characters, including a letter and a number.
              </p>
            </div>

            <div>
              <label
                htmlFor="signup-confirm-password"
                className="mb-2 block text-sm font-semibold text-slate-700"
              >
                Confirm password
              </label>

              <div className="relative">
                <span className={fieldIconClass}>
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
                      d="M8 10V7a4 4 0 0 1 8 0v3"
                      stroke="currentColor"
                      strokeWidth="1.6"
                      strokeLinecap="round"
                    />
                    <path
                      d="m9 15 2 2 4-4"
                      stroke="currentColor"
                      strokeWidth="1.6"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </span>

                <input
                  id="signup-confirm-password"
                  type={showConfirmPassword ? "text" : "password"}
                  autoComplete="new-password"
                  value={confirmPassword}
                  onChange={(event) => setConfirmPassword(event.target.value)}
                  placeholder="Enter your password again"
                  required
                  disabled={loading}
                  className={`${inputClass} pr-20`}
                />

                <button
                  type="button"
                  onClick={() =>
                    setShowConfirmPassword((current) => !current)
                  }
                  disabled={loading}
                  className="absolute right-3 top-1/2 -translate-y-1/2 rounded-lg px-2 py-1.5 text-xs font-bold text-teal-700 transition hover:bg-teal-50 disabled:opacity-50"
                  aria-label={
                    showConfirmPassword
                      ? "Hide confirm password"
                      : "Show confirm password"
                  }
                >
                  {showConfirmPassword ? "Hide" : "Show"}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="group flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-teal-700 to-teal-600 px-5 py-3.5 text-sm font-bold text-white shadow-lg shadow-teal-700/15 transition duration-200 hover:-translate-y-0.5 hover:from-teal-800 hover:to-teal-700 hover:shadow-xl focus:outline-none focus:ring-4 focus:ring-teal-600/20 disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:translate-y-0"
            >
              {loading ? (
                <>
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
                  Creating account...
                </>
              ) : (
                <>
                  Create account
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

          <div className="my-6 flex items-center gap-4">
            <div className="h-px flex-1 bg-slate-200" />
            <span className="whitespace-nowrap text-[10px] font-bold uppercase tracking-[0.18em] text-slate-400">
              Already registered?
            </span>
            <div className="h-px flex-1 bg-slate-200" />
          </div>

          <p className="text-center text-sm text-slate-600">
            Already have an account?{" "}
            <Link
              to="/"
              className="font-bold text-teal-700 transition hover:text-teal-900 hover:underline"
            >
              Sign in
            </Link>
          </p>

          <div className="mt-7 flex items-center justify-center gap-2 text-center text-xs leading-5 text-slate-400">
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
            Your information is used to create your patient account.
          </div>
        </section>
      </div>
    </main>
  );
}

export default Signup;
