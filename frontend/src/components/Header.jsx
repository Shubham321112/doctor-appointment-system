
import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";

function Header({ user, onLogout }) {
  const navigate = useNavigate();
  const location = useLocation();

  const [menuOpen, setMenuOpen] = useState(false);
  const [profileImage, setProfileImage] = useState("");

  useEffect(() => {
    const savedImage = localStorage.getItem("patientProfileImage");
    if (savedImage) setProfileImage(savedImage);
  }, []);

  const handleImageUpload = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      alert("Please select an image file.");
      event.target.value = "";
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      alert("Image size must be less than 2 MB.");
      event.target.value = "";
      return;
    }

    const reader = new FileReader();

    reader.onload = () => {
      const image = reader.result;

      try {
        localStorage.setItem("patientProfileImage", image);
        setProfileImage(image);
      } catch {
        alert("Image could not be saved. Please choose a smaller image.");
      }
    };

    reader.readAsDataURL(file);
  };

  const goTo = (path) => {
    setMenuOpen(false);
    navigate(path);
  };

  const navClass = (path) =>
    `rounded-lg px-4 py-2.5 text-sm font-semibold transition ${
      location.pathname === path
        ? "bg-teal-50 text-teal-700"
        : "text-slate-600 hover:bg-slate-100 hover:text-teal-700"
    }`;

  const menuClass = (path) =>
    `flex w-full items-center gap-3 rounded-xl px-4 py-3 text-left font-medium transition ${
      location.pathname === path
        ? "bg-teal-50 text-teal-700"
        : "text-slate-700 hover:bg-teal-50 hover:text-teal-700"
    }`;

  return (
    <>
      <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/95 shadow-sm backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex shrink-0 items-center gap-3">
            <button
              type="button"
              onClick={() => setMenuOpen(true)}
              aria-label="Open patient menu"
              className="flex h-11 w-11 items-center justify-center rounded-xl border border-slate-200 text-2xl text-slate-700 transition hover:bg-slate-100"
            >
              ☰
            </button>

            <button
              type="button"
              onClick={() => goTo("/dashboard")}
              className="flex items-center gap-3 text-left"
            >
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-teal-600 text-2xl text-white shadow-sm">
                +
              </div>

              <div>
                <h1 className="text-base font-bold tracking-tight text-slate-900 sm:text-lg">
                  MediCare
                </h1>
                <p className="text-xs text-slate-500">Patient Portal</p>
              </div>
            </button>
          </div>

          <nav className="hidden items-center gap-1 lg:flex">
            <button
              onClick={() => goTo("/dashboard")}
              className={navClass("/dashboard")}
            >
              Dashboard
            </button>

            <button
              onClick={() => goTo("/book-appointment")}
              className={navClass("/book-appointment")}
            >
              Book Appointment
            </button>

            <button
              onClick={() => goTo("/my-appointments")}
              className={navClass("/my-appointments")}
            >
              My Appointments
            </button>

            <button
              onClick={() => goTo("/services")}
              className={navClass("/services")}
            >
              Services
            </button>

            <button
              onClick={() => goTo("/profile")}
              className={navClass("/profile")}
            >
              Profile
            </button>
          </nav>

          <button
            type="button"
            onClick={onLogout}
            className="shrink-0 rounded-lg border border-red-200 px-3 py-2 text-sm font-semibold text-red-600 transition hover:bg-red-50 sm:px-4"
          >
            Logout
          </button>
        </div>
      </header>

      {menuOpen && (
        <div className="fixed inset-0 z-50">
          <button
            type="button"
            aria-label="Close patient menu"
            onClick={() => setMenuOpen(false)}
            className="absolute inset-0 h-full w-full bg-slate-950/50"
          />

          <aside className="relative flex h-full w-[min(330px,88vw)] flex-col overflow-y-auto bg-white shadow-2xl">
            <div className="flex items-center justify-between bg-teal-700 px-5 py-6 text-white">
              <div>
                <p className="text-sm text-teal-100">Welcome to</p>
                <h2 className="text-xl font-bold">MediCare</h2>
              </div>

              <button
                type="button"
                onClick={() => setMenuOpen(false)}
                aria-label="Close menu"
                className="rounded-lg px-3 py-1 text-2xl transition hover:bg-white/15"
              >
                ×
              </button>
            </div>

            <div className="border-b border-slate-100 px-5 py-6">
              <div className="flex flex-col items-center text-center">
                <div className="flex h-24 w-24 items-center justify-center overflow-hidden rounded-full border-4 border-teal-100 bg-teal-50 text-4xl font-bold text-teal-700">
                  {profileImage ? (
                    <img
                      src={profileImage}
                      alt="Patient profile"
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    (user?.name || "P").charAt(0).toUpperCase()
                  )}
                </div>

                <h3 className="mt-3 text-lg font-bold text-slate-900">
                  {user?.name || "Patient"}
                </h3>

                <span className="mt-1 rounded-full bg-teal-50 px-3 py-1 text-xs font-semibold capitalize text-teal-700">
                  {user?.role || "Patient"}
                </span>

                <label className="mt-4 cursor-pointer rounded-lg border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50">
                  Upload Profile Picture
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                  />
                </label>

                <p className="mt-2 text-xs text-slate-400">
                  Image only · Maximum 2 MB
                </p>
              </div>
            </div>

            <div className="flex-1 space-y-1 px-3 py-4">
              <p className="px-3 pb-2 text-xs font-bold uppercase tracking-wider text-slate-400">
                Patient Menu
              </p>

              <button
                onClick={() => goTo("/dashboard")}
                className={menuClass("/dashboard")}
              >
                <span className="text-lg">⌂</span>
                Dashboard
              </button>

              <button
                onClick={() => goTo("/profile")}
                className={menuClass("/profile")}
              >
                <span className="text-lg">◎</span>
                Patient Details
              </button>

              <button
                onClick={() => goTo("/book-appointment")}
                className={menuClass("/book-appointment")}
              >
                <span className="text-lg">＋</span>
                Book an Appointment
              </button>

              <button
                onClick={() => goTo("/my-appointments")}
                className={menuClass("/my-appointments")}
              >
                <span className="text-lg">▤</span>
                My Appointments
              </button>

              <button
                onClick={() => goTo("/services")}
                className={menuClass("/services")}
              >
                <span className="text-lg">✚</span>
                Healthcare Services
              </button>
            </div>

            <div className="border-t border-slate-100 p-4">
              <button
                onClick={() => {
                  setMenuOpen(false);
                  onLogout?.();
                }}
                className="w-full rounded-xl bg-red-50 px-4 py-3 text-left font-semibold text-red-600 transition hover:bg-red-100"
              >
                ↪ Logout
              </button>
            </div>
          </aside>
        </div>
      )}
    </>
  );
}

export default Header;
