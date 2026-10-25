
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";

import api from "../services/api";
import Header from "../components/Header";
import { logout, updateUser } from "../store/authSlice";

function Profile() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { token, user } = useSelector((state) => state.auth);

  const [profile, setProfile] = useState(user || null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ name: "", contact: "" });

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
          const currentUser = result.user || user || null;

          setProfile(currentUser);
          setForm({
            name: currentUser?.name || "",
            contact: currentUser?.contact || currentUser?.phone || "",
          });
        }
      } catch (err) {
        if (active) {
          setError(err.message || "Failed to load your profile.");
          setProfile(user || null);
          setForm({
            name: user?.name || "",
            contact: user?.contact || user?.phone || "",
          });
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token, navigate]);

  const handleLogout = () => {
    dispatch(logout());
    navigate("/", { replace: true });
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

  const startEditing = () => {
    setForm({
      name: profile?.name || "",
      contact: profile?.contact || profile?.phone || "",
    });
    setError("");
    setSuccess("");
    setIsEditing(true);
  };

  const cancelEditing = () => {
    setForm({
      name: profile?.name || "",
      contact: profile?.contact || profile?.phone || "",
    });
    setError("");
    setIsEditing(false);
  };

  const handleSave = async (event) => {
    event.preventDefault();

    const name = form.name.trim();
    const contact = form.contact.trim();

    if (!name || !contact) {
      setError("Name and contact number are required.");
      return;
    }

    if (name.length > 100) {
      setError("Name must be 100 characters or fewer.");
      return;
    }

    if (contact.length > 20) {
      setError("Contact number must be 20 characters or fewer.");
      return;
    }

    try {
      setSaving(true);
      setError("");
      setSuccess("");

      const result = await api.updateMyProfile(name, contact, token);

      const updatedUser = result.user || {
        ...profile,
        name,
        contact,
      };

      // Update local component state.
      setProfile(updatedUser);

      // Update Redux state and localStorage.
      dispatch(updateUser(updatedUser));

      setForm({
        name: updatedUser.name || name,
        contact:
          updatedUser.contact ||
          updatedUser.phone ||
          contact,
      });

      setIsEditing(false);
      setSuccess("Your profile has been updated successfully.");
    } catch (err) {
      setError(err.message || "Unable to update your profile.");
    } finally {
      setSaving(false);
    }
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
      try {
        localStorage.setItem("patientProfileImage", reader.result);
        setProfileImage(reader.result);
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
    <div className="min-h-screen bg-[#f5f8fc]">
      <Header user={profile || user} onLogout={handleLogout} />

      <main className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 sm:py-9 lg:px-8">
        <div className="mb-7 flex flex-wrap items-center justify-between gap-3">
          <div>
            <div className="mb-2 flex items-center gap-2 text-sm text-slate-500">
              <button
                type="button"
                onClick={handleBack}
                className="transition hover:text-teal-700"
              >
                Dashboard
              </button>
              <span>/</span>
              <span className="font-semibold text-slate-800">My Profile</span>
            </div>
            <p className="text-sm text-slate-500">
              Manage your personal information and account settings.
            </p>
          </div>

          <span className="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs font-semibold text-emerald-700">
            <span className="h-2 w-2 rounded-full bg-emerald-500" />
            Account active
          </span>
        </div>

        <section className="relative mb-8 overflow-hidden rounded-3xl bg-gradient-to-r from-[#102f46] via-[#12566a] to-[#0e8790] p-6 text-white shadow-xl sm:p-9 lg:p-10">
          <div className="pointer-events-none absolute -right-16 -top-24 h-72 w-72 rounded-full border-[36px] border-white/[0.06]" />
          <div className="pointer-events-none absolute bottom-[-100px] right-[20%] h-56 w-56 rounded-full bg-cyan-300/10 blur-3xl" />

          <div className="relative flex flex-col justify-between gap-6 sm:flex-row sm:items-center">
            <div>
              <span className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.16em] text-teal-50">
                Account management
              </span>

              <h1 className="mt-5 text-3xl font-bold tracking-tight sm:text-4xl">
                My Profile
              </h1>
              <p className="mt-3 max-w-xl text-sm leading-7 text-teal-50/90 sm:text-base">
                Keep your account details up to date for a smoother healthcare
                experience.
              </p>
            </div>

            <button
              type="button"
              onClick={handleBack}
              className="inline-flex w-fit items-center gap-2 rounded-xl bg-white px-5 py-3 text-sm font-bold text-[#12566a] shadow-md transition hover:-translate-y-0.5 hover:bg-teal-50"
            >
              ← Back to dashboard
            </button>
          </div>
        </section>

        {error && (
          <div
            role="alert"
            className="mb-5 flex items-start justify-between gap-4 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700"
          >
            <p>{error}</p>
            <button
              type="button"
              onClick={() => setError("")}
              className="rounded-lg px-2 py-1 font-bold hover:bg-red-100"
              aria-label="Dismiss error"
            >
              ×
            </button>
          </div>
        )}

        {success && (
          <div
            role="status"
            className="mb-5 flex items-start justify-between gap-4 rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-800"
          >
            <p>✓ {success}</p>
            <button
              type="button"
              onClick={() => setSuccess("")}
              className="rounded-lg px-2 py-1 font-bold hover:bg-emerald-100"
              aria-label="Dismiss success"
            >
              ×
            </button>
          </div>
        )}

        {!profile ? (
          <section className="rounded-3xl border border-slate-200 bg-white p-8 text-center shadow-sm">
            <h2 className="text-xl font-bold text-slate-900">
              Profile unavailable
            </h2>
            <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">
              We couldn't retrieve your account details. Please log in again to
              continue.
            </p>
            <button
              type="button"
              onClick={() => navigate("/")}
              className="mt-5 rounded-xl bg-teal-700 px-5 py-3 font-semibold text-white transition hover:bg-teal-800"
            >
              Go to login
            </button>
          </section>
        ) : (
          <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-3">
            <aside className="overflow-hidden rounded-3xl border border-slate-200/80 bg-white shadow-[0_8px_30px_rgba(15,23,42,0.04)]">
              <div className="h-28 bg-gradient-to-r from-[#12566a] to-[#0e8790]" />

              <div className="px-5 pb-6 sm:px-6">
                <div className="-mt-14 flex justify-center">
                  <div className="relative">
                    {profileImage ? (
                      <img
                        src={profileImage}
                        alt="Profile"
                        className="h-28 w-28 rounded-full border-4 border-white bg-white object-cover shadow-lg"
                      />
                    ) : (
                      <div className="flex h-28 w-28 items-center justify-center rounded-full border-4 border-white bg-teal-50 text-3xl font-bold text-teal-800 shadow-lg">
                        {initials}
                      </div>
                    )}

                    <label
                      htmlFor="profile-image"
                      title="Upload profile picture"
                      className="absolute bottom-1 right-1 flex h-9 w-9 cursor-pointer items-center justify-center rounded-full border-2 border-white bg-teal-700 text-white shadow-md transition hover:bg-teal-800"
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
                </div>

                <div className="mt-4 text-center">
                  <h2 className="break-words text-xl font-bold text-slate-900">
                    {profile.name || "Patient"}
                  </h2>
                  <p className="mt-1 break-all text-sm text-slate-500">
                    {profile.email || "Email not available"}
                  </p>
                  <span className="mt-3 inline-flex items-center gap-2 rounded-full bg-teal-50 px-3 py-1.5 text-xs font-bold capitalize text-teal-800">
                    {profile.role || "patient"} account
                  </span>
                  <p className="mt-3 text-xs text-slate-400">
                    JPG, PNG or other image · Max 2 MB
                  </p>
                </div>

                <div className="mt-6 border-t border-slate-100 pt-5">
                  <p className="mb-3 px-2 text-[11px] font-bold uppercase tracking-[0.16em] text-slate-400">
                    Account menu
                  </p>

                  <button
                    type="button"
                    onClick={() =>
                      document
                        .getElementById("personal-information")
                        ?.scrollIntoView({ behavior: "smooth" })
                    }
                    className="flex w-full items-center gap-3 rounded-xl bg-teal-50 px-4 py-3 text-left text-sm font-semibold text-teal-800"
                  >
                    Personal information
                  </button>

                  {profile.role === "patient" && (
                    <>
                      <button
                        type="button"
                        onClick={() => navigate("/book-appointment")}
                        className="mt-2 flex w-full rounded-xl px-4 py-3 text-left text-sm font-medium text-slate-600 transition hover:bg-slate-50 hover:text-teal-800"
                      >
                        Book an appointment
                      </button>
                      <button
                        type="button"
                        onClick={() => navigate("/my-appointments")}
                        className="mt-2 flex w-full rounded-xl px-4 py-3 text-left text-sm font-medium text-slate-600 transition hover:bg-slate-50 hover:text-teal-800"
                      >
                        My appointments
                      </button>
                    </>
                  )}

                  {profile.role === "doctor" && (
                    <button
                      type="button"
                      onClick={() => navigate("/doctor-dashboard")}
                      className="mt-2 flex w-full rounded-xl px-4 py-3 text-left text-sm font-medium text-slate-600 transition hover:bg-slate-50 hover:text-teal-800"
                    >
                      Manage appointments
                    </button>
                  )}

                  <button
                    type="button"
                    onClick={handleLogout}
                    className="mt-2 flex w-full rounded-xl px-4 py-3 text-left text-sm font-semibold text-red-600 transition hover:bg-red-50"
                  >
                    Log out
                  </button>
                </div>
              </div>
            </aside>

            <section
              id="personal-information"
              className="scroll-mt-24 rounded-3xl border border-slate-200/80 bg-white p-5 shadow-[0_8px_30px_rgba(15,23,42,0.04)] sm:p-7 lg:col-span-2"
            >
              <div className="flex flex-col gap-4 border-b border-slate-100 pb-6 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <span className="text-xs font-bold uppercase tracking-[0.15em] text-teal-700">
                    Profile settings
                  </span>
                  <h2 className="mt-2 text-xl font-bold text-slate-900 sm:text-2xl">
                    Personal information
                  </h2>
                  <p className="mt-2 text-sm leading-6 text-slate-500">
                    View and update your registered account details.
                  </p>
                </div>

                {!isEditing && (
                  <button
                    type="button"
                    onClick={startEditing}
                    className="inline-flex w-fit items-center justify-center rounded-xl bg-teal-700 px-5 py-3 text-sm font-bold text-white shadow-sm transition hover:bg-teal-800"
                  >
                    Edit profile
                  </button>
                )}
              </div>

              {isEditing ? (
                <form onSubmit={handleSave} className="mt-6 space-y-5">
                  <div>
                    <label
                      htmlFor="profile-name"
                      className="mb-2 block text-sm font-semibold text-slate-700"
                    >
                      Full name
                    </label>
                    <input
                      id="profile-name"
                      type="text"
                      value={form.name}
                      onChange={(event) =>
                        setForm({ ...form, name: event.target.value })
                      }
                      maxLength={100}
                      required
                      className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-800 outline-none transition focus:border-teal-600 focus:ring-4 focus:ring-teal-50"
                      placeholder="Enter your full name"
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="profile-email"
                      className="mb-2 block text-sm font-semibold text-slate-700"
                    >
                      Email address
                    </label>
                    <input
                      id="profile-email"
                      type="email"
                      value={profile.email || ""}
                      readOnly
                      className="w-full cursor-not-allowed rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-500"
                    />
                    <p className="mt-2 text-xs text-slate-400">
                      Your registered email address cannot be changed here.
                    </p>
                  </div>

                  <div>
                    <label
                      htmlFor="profile-contact"
                      className="mb-2 block text-sm font-semibold text-slate-700"
                    >
                      Contact number
                    </label>
                    <input
                      id="profile-contact"
                      type="tel"
                      value={form.contact}
                      onChange={(event) =>
                        setForm({ ...form, contact: event.target.value })
                      }
                      maxLength={20}
                      required
                      className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-800 outline-none transition focus:border-teal-600 focus:ring-4 focus:ring-teal-50"
                      placeholder="Enter your contact number"
                    />
                  </div>

                  <div className="flex flex-col gap-3 border-t border-slate-100 pt-5 sm:flex-row">
                    <button
                      type="submit"
                      disabled={saving}
                      className="inline-flex items-center justify-center gap-2 rounded-xl bg-teal-700 px-6 py-3 text-sm font-bold text-white transition hover:bg-teal-800 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {saving ? "Saving changes..." : "Save changes"}
                    </button>

                    <button
                      type="button"
                      onClick={cancelEditing}
                      disabled={saving}
                      className="rounded-xl border border-slate-200 px-6 py-3 text-sm font-bold text-slate-700 transition hover:bg-slate-50 disabled:opacity-60"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              ) : (
                <>
                  <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <InfoCard label="Full name" value={profile.name} />
                    <InfoCard label="Email address" value={profile.email} />
                    <InfoCard
                      label="Contact number"
                      value={profile.contact || profile.phone}
                    />
                    <InfoCard label="Account type" value={profile.role || "Patient"} />
                  </div>

                  <div className="mt-6 rounded-2xl border border-teal-100 bg-teal-50/70 p-5">
                    <h3 className="font-bold text-slate-900">
                      Your information is protected
                    </h3>
                    <p className="mt-1 text-sm leading-6 text-slate-600">
                      Your profile is accessed through your authenticated
                      session. Your registered email and account type cannot
                      be edited on this page.
                    </p>
                  </div>

                  <div className="mt-6 flex flex-col gap-3 border-t border-slate-100 pt-6 sm:flex-row">
                    <button
                      type="button"
                      onClick={handleBack}
                      className="rounded-xl border border-slate-200 px-5 py-3 text-sm font-bold text-slate-700 transition hover:bg-teal-50"
                    >
                      Back to dashboard
                    </button>

                    {profile.role === "patient" && (
                      <button
                        type="button"
                        onClick={() => navigate("/my-appointments")}
                        className="rounded-xl bg-teal-700 px-5 py-3 text-sm font-bold text-white transition hover:bg-teal-800"
                      >
                        View my appointments →
                      </button>
                    )}

                    {profile.role === "doctor" && (
                      <button
                        type="button"
                        onClick={() => navigate("/doctor-dashboard")}
                        className="rounded-xl bg-teal-700 px-5 py-3 text-sm font-bold text-white transition hover:bg-teal-800"
                      >
                        Manage appointments →
                      </button>
                    )}
                  </div>
                </>
              )}
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

function InfoCard({ label, value }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-slate-50/60 p-5 transition hover:border-teal-200">
      <p className="text-xs font-bold uppercase tracking-wider text-slate-500">
        {label}
      </p>
      <p className="mt-4 break-words font-semibold capitalize text-slate-900">
        {value || "Not available"}
      </p>
    </div>
  );
}

export default Profile;
