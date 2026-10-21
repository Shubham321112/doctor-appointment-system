import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";

import Header from "../components/Header";
import { logout } from "../store/authSlice";

function Dashboard() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);

  const firstName = user?.name
    ? user.name.trim().split(" ")[0]
    : "Patient";

  const handleLogout = () => {
    dispatch(logout());
    navigate("/", { replace: true });
  };

  const actions = [
    {
      title: "Book an Appointment",
      description:
        "Find a doctor and choose a suitable date and time for your consultation.",
      icon: "+",
      color: "bg-teal-50 text-teal-700",
      button: "Book appointment",
      path: "/book-appointment",
    },
    {
      title: "My Appointments",
      description:
        "View your scheduled appointments and check their latest status.",
      icon: "▤",
      color: "bg-blue-50 text-blue-700",
      button: "View appointments",
      path: "/my-appointments",
    },
    {
      title: "My Profile",
      description:
        "Review your registered details and keep your patient information handy.",
      icon: "◎",
      color: "bg-violet-50 text-violet-700",
      button: "View profile",
      path: "/profile",
    },
  ];

  return (
    <div className="min-h-screen bg-slate-50">
      <Header user={user} onLogout={handleLogout} />

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-10 lg:px-8">
        <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-teal-700 via-teal-600 to-cyan-600 p-6 text-white shadow-lg sm:p-10">
          <div className="pointer-events-none absolute -right-12 -top-16 h-64 w-64 rounded-full border-[35px] border-white/10" />
          <div className="pointer-events-none absolute -bottom-28 right-40 h-56 w-56 rounded-full bg-white/5" />

          <div className="relative max-w-2xl">
            <span className="inline-flex rounded-full border border-white/25 bg-white/10 px-3 py-1.5 text-xs font-semibold uppercase tracking-wider">
              Patient Dashboard
            </span>

            <h1 className="mt-5 text-3xl font-bold leading-tight sm:text-4xl lg:text-5xl">
              Hello, {firstName}!
            </h1>

            <p className="mt-4 max-w-xl text-sm leading-7 text-teal-50 sm:text-base">
              Welcome to your personal healthcare space. Manage your
              appointments, review your profile, and take the next step
              towards better healthcare.
            </p>

            <button
              onClick={() => navigate("/book-appointment")}
              className="mt-7 inline-flex items-center gap-2 rounded-xl bg-white px-5 py-3 font-bold text-teal-800 shadow-sm transition hover:-translate-y-0.5 hover:bg-teal-50"
            >
              Book an Appointment
              <span aria-hidden="true">→</span>
            </button>
          </div>
        </section>

        <section className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-teal-50 text-xl font-bold text-teal-700">
                {firstName.charAt(0).toUpperCase()}
              </div>

              <div className="min-w-0">
                <p className="text-sm text-slate-500">Patient Name</p>
                <p className="mt-1 truncate font-bold text-slate-900">
                  {user?.name || "Not available"}
                </p>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50 text-xl text-blue-700">
                @
              </div>

              <div className="min-w-0">
                <p className="text-sm text-slate-500">Email Address</p>
                <p className="mt-1 break-all font-bold text-slate-900">
                  {user?.email || "Not available"}
                </p>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:col-span-2 lg:col-span-1">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-violet-50 text-xl text-violet-700">
                ✓
              </div>

              <div>
                <p className="text-sm text-slate-500">Account Type</p>
                <p className="mt-1 font-bold capitalize text-slate-900">
                  {user?.role || "Patient"}
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="mt-10">
          <div className="flex flex-col justify-between gap-2 sm:flex-row sm:items-end">
            <div>
              <p className="text-sm font-bold uppercase tracking-wider text-teal-700">
                Your Healthcare
              </p>
              <h2 className="mt-2 text-2xl font-bold text-slate-900 sm:text-3xl">
                How can we help you?
              </h2>
              <p className="mt-2 text-sm leading-6 text-slate-500">
                Choose an option to manage your healthcare activities.
              </p>
            </div>
          </div>

          <div className="mt-6 grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
            {actions.map((action) => (
              <article
                key={action.path}
                className="group flex flex-col rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition duration-200 hover:-translate-y-1 hover:border-teal-200 hover:shadow-lg"
              >
                <div
                  className={`flex h-14 w-14 items-center justify-center rounded-2xl text-3xl font-semibold ${action.color}`}
                >
                  {action.icon}
                </div>

                <h3 className="mt-5 text-xl font-bold text-slate-900">
                  {action.title}
                </h3>

                <p className="mt-3 flex-1 text-sm leading-7 text-slate-500">
                  {action.description}
                </p>

                <button
                  onClick={() => navigate(action.path)}
                  className="mt-6 flex items-center justify-between rounded-xl border border-slate-200 px-4 py-3 text-left text-sm font-bold text-teal-700 transition hover:border-teal-600 hover:bg-teal-50"
                >
                  {action.button}
                  <span aria-hidden="true" className="text-lg">→</span>
                </button>
              </article>
            ))}
          </div>
        </section>

        <section className="mt-8 rounded-2xl border border-teal-100 bg-teal-50 p-6 sm:p-8">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm font-bold uppercase tracking-wider text-teal-700">
                Your health matters
              </p>

              <h2 className="mt-2 text-xl font-bold text-slate-900 sm:text-2xl">
                Ready for your next consultation?
              </h2>

              <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">
                Book an appointment with a doctor and review your booking
                details whenever you need them.
              </p>
            </div>

            <button
              onClick={() => navigate("/book-appointment")}
              className="shrink-0 rounded-xl bg-teal-700 px-5 py-3 font-bold text-white shadow-sm transition hover:bg-teal-800"
            >
              Get Started →
            </button>
          </div>
        </section>

        <footer className="py-8 text-center text-xs text-slate-400">
          MediCare Patient Portal · Your healthcare, made simpler.
        </footer>
      </main>
    </div>
  );
}

export default Dashboard;