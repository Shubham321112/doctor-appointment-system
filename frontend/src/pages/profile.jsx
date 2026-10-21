
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";

import api from "../services/api";
import Header from "../components/Header";
import { logout } from "../store/authSlice";

function Profile() {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const { token, user } = useSelector((state) => state.auth);

  const [profile, setProfile] = useState(user || null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [profileImage, setProfileImage] = useState(() => {
    try {
      return localStorage.getItem("patientProfileImage") || "";
    } catch {
      return "";
    }
  });

  useEffect(() => {
    let active = true;

    const fetchProfile = async () => {
      if (!token) {
        navigate("/", { replace: true });
        return;
      }

      try {
        setLoading(true);
        setError("");

        const result = await api.getProfile(token);

        if (active) {
          setProfile(result.user || user || null);
        }
      } catch (err) {
        if (active) {
          setError(err.message || "Failed to load your profile.");
          setProfile(user || null);
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };

    fetchProfile();

    return () => {
      active = false;
    };
  }, [token, navigate, user]);

  const handleLogout = () => {
    dispatch(logout());
    navigate("/", { replace: true });
  };

  const handleImageChange = (event) => {
    const file = event.target.files?.[0];

    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setError("Please select a valid image file.");
      event.target.value = "";
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      setError("Image size must be less than 2 MB.");
      event.target.value = "";
      return;
    }

    const reader = new FileReader();

    reader.onload = () => {
      const image = reader.result;

      try {
        localStorage.setItem("patientProfileImage", image);
        setProfileImage(image);
        setError("");
      } catch {
        setError("Unable to save the image. Please choose a smaller image.");
      }
    };

    reader.onerror = () => {
      setError("Unable to read this image. Please try another file.");
    };

    reader.readAsDataURL(file);
    event.target.value = "";
  };

  const handleBack = () => {
    if (profile?.role === "doctor") {
      navigate("/doctor-dashboard");
    } else if (profile?.role === "admin") {
      navigate("/admin-dashboard");
    } else {
      navigate("/dashboard");
    }
  };

  const initials =
    profile?.name
      ?.trim()
      .split(/\s+/)
      .slice(0, 2)
      .map((part) => part.charAt(0).toUpperCase())
      .join("") || "P";

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <div className="text-center">
          <div className="mx-auto h-12 w-12 animate-spin rounded-full border-4 border-teal-100 border-t-teal-700" />
          <p className="mt-4 text-sm font-medium text-slate-500">
            Loading your profile...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <Header user={profile || user} onLogout={handleLogout} />

      <main className="mx-auto w-full max-w-7xl px-4 py-7 sm:px-6 sm:py-10 lg:px-8">
        <div className="mb-7 flex flex-wrap items-center gap-2 text-sm text-slate-500">
          <button
            onClick={handleBack}
            className="transition hover:text-teal-700"
          >
            Dashboard
          </button>
          <span>/</span>
          <span className="font-semibold text-teal-700">My Profile</span>
        </div>

        <section className="relative mb-8 overflow-hidden rounded-3xl bg-gradient-to-br from-teal-800 via-teal-700 to-cyan-600 p-6 text-white shadow-lg sm:p-9 lg:p-10">
          <div className="pointer-events-none absolute -right-12 -top-16 h-64 w-64 rounded-full border-[35px] border-white/10" />
          <div className="pointer-events-none absolute -bottom-28 right-40 h-56 w-56 rounded-full bg-white/5" />

          <div className="relative flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <span className="inline-flex rounded-full border border-white/25 bg-white/10 px-3 py-1.5 text-xs font-semibold uppercase tracking-wider">
                Account Management
              </span>

              <h1 className="mt-5 text-3xl font-bold sm:text-4xl">
                My Profile
              </h1>

              <p className="mt-3 max-w-xl text-sm leading-7 text-teal-50 sm:text-base">
                Manage your account information and keep your personal details
                in one place.
              </p>
            </div>

            <button
              onClick={handleBack}
              className="relative w-fit shrink-0 rounded-xl bg-white px-5 py-3 font-bold text-teal-800 transition hover:-translate-y-0.5 hover:bg-teal-50"
            >
              ← Dashboard
            </button>
          </div>
        </section>

        {error && (
          <div
            role="alert"
            className="mb-6 flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700"
          >
            <span className="text-lg">!</span>
            <div className="min-w-0">
              <p className="font-bold">Something needs your attention</p>
              <p className="mt-1 break-words">{error}</p>
            </div>
            <button
              onClick={() => setError("")}
              className="ml-auto px-2 text-lg"
              aria-label="Dismiss error"
            >
              ×
            </button>
          </div>
        )}

        {!profile && (
          <section className="rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm">
            <h2 className="text-xl font-bold text-slate-900">
              Profile unavailable
            </h2>
            <p className="mt-2 text-sm text-slate-500">
              We couldn't retrieve your account details. Please try again.
            </p>
            <button
              onClick={() => navigate("/")}
              className="mt-5 rounded-xl bg-teal-700 px-5 py-3 font-semibold text-white transition hover:bg-teal-800"
            >
              Go to Login
            </button>
          </section>
        )}

        {profile && (
          <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-3">
            <aside className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
              <div className="h-24 bg-gradient-to-r from-teal-700 to-cyan-500" />

              <div className="-mt-12 px-6 pb-6">
                <div className="relative mx-auto h-24 w-24">
                  {profileImage ? (
                    <img
                      src={profileImage}
                      alt="Profile"
                      className="h-24 w-24 rounded-full border-4 border-white bg-white object-cover shadow-md"
                    />
                  ) : (
                    <div className="flex h-24 w-24 items-center justify-center rounded-full border-4 border-white bg-teal-100 text-3xl font-bold text-teal-800 shadow-md">
                      {initials}
                    </div>
                  )}

                  <label
                    htmlFor="profile-image"
                    title="Upload profile picture"
                    className="absolute bottom-0 right-0 flex h-9 w-9 cursor-pointer items-center justify-center rounded-full border-2 border-white bg-teal-700 text-lg text-white shadow transition hover:bg-teal-800"
                  >
                    +
                  </label>

                  <input
                    id="profile-image"
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="hidden"
                  />
                </div>

                <div className="mt-4 text-center">
                  <h2 className="break-words text-xl font-bold text-slate-900">
                    {profile.name || "Patient"}
                  </h2>

                  <p className="mt-1 break-all text-sm text-slate-500">
                    {profile.email || "Email not available"}
                  </p>

                  <span className="mt-3 inline-flex rounded-full bg-teal-50 px-3 py-1 text-xs font-bold capitalize text-teal-800 ring-1 ring-inset ring-teal-100">
                    {profile.role || "patient"}
                  </span>
                </div>

                <div className="mt-6 border-t border-slate-100 pt-5">
                  <p className="mb-3 text-xs font-bold uppercase tracking-wider text-slate-400">
                    Account menu
                  </p>

                  <button
                    onClick={() =>
                      document.getElementById("personal-information")?.scrollIntoView({
                        behavior: "smooth",
                        block: "start",
                      })
                    }
                    className="flex w-full items-center gap-3 rounded-xl bg-teal-50 px-4 py-3 text-left text-sm font-semibold text-teal-800"
                  >
                    <span>👤</span>
                    Personal Information
                  </button>

                  {profile.role === "patient" && (
                    <>
                      <button
                        onClick={() => navigate("/book-appointment")}
                        className="mt-2 flex w-full items-center gap-3 rounded-xl px-4 py-3 text-left text-sm font-medium text-slate-600 transition hover:bg-slate-50 hover:text-teal-800"
                      >
                        <span>＋</span>
                        Book an Appointment
                      </button>

                      <button
                        onClick={() => navigate("/my-appointments")}
                        className="mt-2 flex w-full items-center gap-3 rounded-xl px-4 py-3 text-left text-sm font-medium text-slate-600 transition hover:bg-slate-50 hover:text-teal-800"
                      >
                        <span>▤</span>
                        My Appointments
                      </button>
                    </>
                  )}

                  {profile.role === "doctor" && (
                    <button
                      onClick={() => navigate("/doctor-dashboard")}
                      className="mt-2 flex w-full items-center gap-3 rounded-xl px-4 py-3 text-left text-sm font-medium text-slate-600 transition hover:bg-slate-50 hover:text-teal-800"
                    >
                      <span>▤</span>
                      Manage Appointments
                    </button>
                  )}

                  <button
                    onClick={handleLogout}
                    className="mt-2 flex w-full items-center gap-3 rounded-xl px-4 py-3 text-left text-sm font-semibold text-red-600 transition hover:bg-red-50"
                  >
                    <span>↪</span>
                    Logout
                  </button>
                </div>
              </div>
            </aside>

            <section
              id="personal-information"
              className="scroll-mt-24 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7 lg:col-span-2"
            >
              <div className="flex flex-col gap-3 border-b border-slate-100 pb-6 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h2 className="text-xl font-bold text-slate-900 sm:text-2xl">
                    Personal Information
                  </h2>
                  <p className="mt-1 text-sm text-slate-500">
                    Your registered account details.
                  </p>
                </div>

                <span className="w-fit rounded-full bg-emerald-50 px-3 py-1.5 text-xs font-bold text-emerald-700 ring-1 ring-inset ring-emerald-200">
                  ● Account Active
                </span>
              </div>

              <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="rounded-xl border border-slate-200 p-4 transition hover:border-teal-200 hover:shadow-sm">
                  <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                    Full Name
                  </p>
                  <p className="mt-2 break-words text-base font-bold text-slate-900">
                    {profile.name || "Not available"}
                  </p>
                </div>

                <div className="rounded-xl border border-slate-200 p-4 transition hover:border-teal-200 hover:shadow-sm">
                  <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                    Email Address
                  </p>
                  <p className="mt-2 break-all text-base font-bold text-slate-900">
                    {profile.email || "Not available"}
                  </p>
                </div>

                <div className="rounded-xl border border-slate-200 p-4 transition hover:border-teal-200 hover:shadow-sm">
                  <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                    Contact Number
                  </p>
                  <p className="mt-2 break-words text-base font-bold text-slate-900">
                    {profile.contact || profile.phone || "Not available"}
                  </p>
                </div>

                <div className="rounded-xl border border-slate-200 p-4 transition hover:border-teal-200 hover:shadow-sm">
                  <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                    Account Type
                  </p>
                  <p className="mt-2 text-base font-bold capitalize text-slate-900">
                    {profile.role || "Patient"}
                  </p>
                </div>
              </div>

              <div className="mt-6 rounded-xl border border-teal-100 bg-teal-50 p-4 sm:p-5">
                <div className="flex items-start gap-3">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white text-xl">
                    🔒
                  </span>
                  <div>
                    <h3 className="font-bold text-slate-900">
                      Your information is protected
                    </h3>
                    <p className="mt-1 text-sm leading-6 text-slate-600">
                      Your profile details are retrieved from the server using
                      your authenticated session.
                    </p>
                  </div>
                </div>
              </div>

              <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2">
                <button
                  onClick={handleBack}
                  className="rounded-xl border border-slate-200 px-4 py-3 text-sm font-bold text-slate-700 transition hover:border-teal-200 hover:bg-teal-50 hover:text-teal-800"
                >
                  ← Back to Dashboard
                </button>

                {profile.role === "patient" && (
                  <button
                    onClick={() => navigate("/my-appointments")}
                    className="rounded-xl bg-teal-700 px-4 py-3 text-sm font-bold text-white transition hover:bg-teal-800"
                  >
                    View My Appointments →
                  </button>
                )}

                {profile.role === "doctor" && (
                  <button
                    onClick={() => navigate("/doctor-dashboard")}
                    className="rounded-xl bg-teal-700 px-4 py-3 text-sm font-bold text-white transition hover:bg-teal-800"
                  >
                    Manage Appointments →
                  </button>
                )}
              </div>
            </section>
          </div>
        )}

        <footer className="py-8 text-center text-xs text-slate-400">
          MediCare Patient Portal · Your healthcare, made simpler.
        </footer>
      </main>
    </div>
  );
}

export default Profile;
