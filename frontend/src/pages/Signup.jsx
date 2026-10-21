
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

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-slate-50 px-4 py-10 sm:px-6">
      <div className="pointer-events-none absolute -left-28 -top-28 h-80 w-80 rounded-full bg-teal-100/70 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-32 -right-20 h-96 w-96 rounded-full bg-cyan-100/70 blur-3xl" />

      <div className="relative grid w-full max-w-5xl overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-xl lg:grid-cols-2">
        {/* Left information panel */}
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
                Start your journey
              </span>

              <h1 className="mt-6 text-4xl font-bold leading-tight xl:text-5xl">
                Your health,
                <br />
                our priority.
              </h1>

              <p className="mt-5 max-w-md text-base leading-8 text-teal-50">
                Create your account to book doctor appointments and manage
                your healthcare journey in one convenient place.
              </p>
            </div>
          </div>

          <div className="relative rounded-2xl border border-white/20 bg-white/10 p-5">
            <div className="flex items-start gap-3">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/15 text-xl">
                ✓
              </span>
              <div>
                <p className="font-semibold">Simple and convenient</p>
                <p className="mt-1 text-sm leading-6 text-teal-50">
                  Keep your account details and appointments organised.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Signup form */}
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

          <div className="mt-7 lg:mt-4">
            <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-teal-50 text-2xl text-teal-700">
              👤
            </div>

            <p className="text-sm font-bold uppercase tracking-wider text-teal-700">
              Join MediCare
            </p>

            <h2 className="mt-2 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
              Create your account
            </h2>

            <p className="mt-3 text-sm leading-6 text-slate-500">
              Fill in your details to get started.
            </p>
          </div>

          <form onSubmit={handleSignup} className="mt-7 space-y-4">
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
                htmlFor="signup-name"
                className="mb-2 block text-sm font-semibold text-slate-700"
              >
                Full name
              </label>
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
                className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none transition placeholder:text-slate-400 focus:border-teal-600 focus:ring-4 focus:ring-teal-600/10 disabled:bg-slate-50"
              />
            </div>

            <div>
              <label
                htmlFor="signup-email"
                className="mb-2 block text-sm font-semibold text-slate-700"
              >
                Email address
              </label>
              <input
                id="signup-email"
                type="email"
                autoComplete="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="you@example.com"
                required
                disabled={loading}
                className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none transition placeholder:text-slate-400 focus:border-teal-600 focus:ring-4 focus:ring-teal-600/10 disabled:bg-slate-50"
              />
            </div>

            <div>
              <label
                htmlFor="signup-contact"
                className="mb-2 block text-sm font-semibold text-slate-700"
              >
                Contact number
              </label>
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
                className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none transition placeholder:text-slate-400 focus:border-teal-600 focus:ring-4 focus:ring-teal-600/10 disabled:bg-slate-50"
              />
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
                  className="w-full rounded-xl border border-slate-200 px-4 py-3 pr-20 text-sm outline-none transition placeholder:text-slate-400 focus:border-teal-600 focus:ring-4 focus:ring-teal-600/10 disabled:bg-slate-50"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((current) => !current)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 rounded-lg px-2 py-1 text-xs font-bold text-teal-700 hover:bg-teal-50"
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
                <input
                  id="signup-confirm-password"
                  type={showConfirmPassword ? "text" : "password"}
                  autoComplete="new-password"
                  value={confirmPassword}
                  onChange={(event) => setConfirmPassword(event.target.value)}
                  placeholder="Enter your password again"
                  required
                  disabled={loading}
                  className="w-full rounded-xl border border-slate-200 px-4 py-3 pr-20 text-sm outline-none transition placeholder:text-slate-400 focus:border-teal-600 focus:ring-4 focus:ring-teal-600/10 disabled:bg-slate-50"
                />
                <button
                  type="button"
                  onClick={() =>
                    setShowConfirmPassword((current) => !current)
                  }
                  className="absolute right-3 top-1/2 -translate-y-1/2 rounded-lg px-2 py-1 text-xs font-bold text-teal-700 hover:bg-teal-50"
                >
                  {showConfirmPassword ? "Hide" : "Show"}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-teal-700 px-5 py-3.5 text-sm font-bold text-white shadow-sm transition hover:-translate-y-0.5 hover:bg-teal-800 hover:shadow-md disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? (
                <>
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
                  Creating account...
                </>
              ) : (
                <>
                  Create Account
                  <span>→</span>
                </>
              )}
            </button>
          </form>

          <div className="my-6 flex items-center gap-4">
            <div className="h-px flex-1 bg-slate-200" />
            <span className="text-xs font-medium text-slate-400">
              ALREADY REGISTERED?
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

          <p className="mt-6 text-center text-xs leading-5 text-slate-400">
            Your information will be used to create your MediCare account.
          </p>
        </section>
      </div>
    </main>
  );
}

export default Signup;
