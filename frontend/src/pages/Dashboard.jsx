
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import Header from "../components/Header";
import { logout } from "../store/authSlice";

function Dashboard() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);

  const firstName = user?.name?.trim()?.split(/\s+/)[0] || "Patient";

  const handleLogout = () => {
    dispatch(logout());
    navigate("/", { replace: true });
  };

  const services = [
    {
      title: "Book an Appointment",
      description:
        "Find a doctor and schedule a consultation at a convenient time.",
      path: "/book-appointment",
      label: "Book appointment",
      number: "01",
      icon: "calendar",
      color: "blue",
    },
    {
      title: "My Appointments",
      description:
        "View your appointments, track their status, and manage bookings.",
      path: "/my-appointments",
      label: "View appointments",
      number: "02",
      icon: "clipboard",
      color: "teal",
    },
    {
      title: "My Profile",
      description:
        "Review your account details and keep your information up to date.",
      path: "/profile",
      label: "Manage profile",
      number: "03",
      icon: "user",
      color: "violet",
    },
  ];

  const icons = {
    calendar: (
      <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <rect x="3.5" y="5" width="17" height="15.5" rx="2.5" />
        <path d="M7.5 3.5v3M16.5 3.5v3M3.5 9.5h17M8 13h2m4 0h2M8 16.5h2" />
      </svg>
    ),
    clipboard: (
      <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <rect x="5" y="4.5" width="14" height="17" rx="2" />
        <path d="M9 4.5v-1h6v1M8.5 10h7M8.5 14h7M8.5 18h4" />
      </svg>
    ),
    user: (
      <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <circle cx="12" cy="8" r="4" />
        <path d="M4.5 20a7.5 7.5 0 0 1 15 0" />
      </svg>
    ),
  };

  const accountDetails = [
    {
      label: "Full name",
      value: user?.name || "Not available",
      icon: "user",
      color: "blue",
    },
    {
      label: "Email address",
      value: user?.email || "Not available",
      icon: "mail",
      color: "teal",
    },
    {
      label: "Account type",
      value: user?.role || "Patient",
      icon: "shield",
      color: "violet",
    },
  ];

  const detailIcons = {
    user: (
      <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <circle cx="12" cy="8" r="4" />
        <path d="M4.5 20a7.5 7.5 0 0 1 15 0" />
      </svg>
    ),
    mail: (
      <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <rect x="3" y="5" width="18" height="14" rx="2.5" />
        <path d="m4 7 8 6 8-6" />
      </svg>
    ),
    shield: (
      <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path d="M12 3 20 6v5c0 5-3.4 8-8 10-4.6-2-8-5-8-10V6l8-3Z" />
        <path d="m8.5 12 2.2 2.2 4.8-4.8" />
      </svg>
    ),
  };

  const colorStyles = {
    blue: {
      icon: "bg-blue-50 text-blue-700 ring-blue-100",
      number: "text-blue-200",
      hover: "group-hover:border-blue-200",
      button:
        "border-blue-100 text-blue-700 hover:bg-blue-50 hover:border-blue-200",
    },
    teal: {
      icon: "bg-teal-50 text-teal-700 ring-teal-100",
      number: "text-teal-200",
      hover: "group-hover:border-teal-200",
      button:
        "border-teal-100 text-teal-700 hover:bg-teal-50 hover:border-teal-200",
    },
    violet: {
      icon: "bg-violet-50 text-violet-700 ring-violet-100",
      number: "text-violet-200",
      hover: "group-hover:border-violet-200",
      button:
        "border-violet-100 text-violet-700 hover:bg-violet-50 hover:border-violet-200",
    },
  };

  return (
    <div className="min-h-screen bg-[#f5f8fc] text-slate-800">
      <Header user={user} onLogout={handleLogout} />

      <main className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
        {/* Page heading */}
        <section className="mb-7 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="flex items-center gap-2 text-sm font-semibold text-teal-700">
              <span className="h-2 w-2 rounded-full bg-teal-500" />
              Patient portal
            </div>

            <h1 className="mt-2 text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
              Patient Dashboard
            </h1>

            <p className="mt-2 text-sm leading-6 text-slate-500 sm:text-base">
              Manage your healthcare and appointments from one place.
            </p>
          </div>

          <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-3 shadow-sm">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-teal-500 to-blue-600 text-lg font-bold text-white">
              {firstName.charAt(0).toUpperCase()}
            </div>

            <div className="min-w-0">
              <p className="text-xs font-medium text-slate-500">
                Signed in as
              </p>
              <p className="max-w-44 truncate text-sm font-bold text-slate-900">
                {user?.name || "Patient"}
              </p>
            </div>
          </div>
        </section>

        {/* Welcome banner */}
        <section className="relative isolate overflow-hidden rounded-3xl bg-gradient-to-br from-[#102c52] via-[#174d70] to-[#087e80] shadow-lg">
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -right-20 -top-24 -z-10 h-72 w-72 rounded-full border-[45px] border-white/[0.07]"
          />
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -bottom-32 right-1/3 -z-10 h-64 w-64 rounded-full bg-cyan-300/10 blur-3xl"
          />

          <div className="relative grid gap-8 px-6 py-8 sm:px-9 sm:py-10 lg:grid-cols-[1fr_auto] lg:items-center lg:px-12 lg:py-12">
            <div className="max-w-2xl">
              <span className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1.5 text-xs font-semibold tracking-wide text-cyan-50">
                <span className="h-2 w-2 rounded-full bg-emerald-300" />
                YOUR HEALTH, YOUR PRIORITY
              </span>

              <h2 className="mt-5 text-3xl font-bold leading-tight tracking-tight text-white sm:text-4xl lg:text-[42px]">
                Welcome back, {firstName}
                <span className="text-cyan-300">!</span>
              </h2>

              <p className="mt-4 max-w-xl text-sm leading-7 text-blue-50/90 sm:text-base">
                Taking care of your health starts with the right steps. Book a
                consultation, keep track of your appointments, and manage your
                patient profile with ease.
              </p>

              <div className="mt-7 flex flex-col gap-3 sm:flex-row">
                <button
                  type="button"
                  onClick={() => navigate("/book-appointment")}
                  className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-white px-5 py-3 text-sm font-bold text-[#163e61] shadow-md transition hover:-translate-y-0.5 hover:bg-cyan-50 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white"
                >
                  <span>Book an Appointment</span>
                  <span aria-hidden="true">→</span>
                </button>

                <button
                  type="button"
                  onClick={() => navigate("/my-appointments")}
                  className="inline-flex min-h-12 items-center justify-center rounded-xl border border-white/30 bg-white/10 px-5 py-3 text-sm font-semibold text-white transition hover:bg-white/20 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
                >
                  View my appointments
                </button>
              </div>
            </div>

            {/* Decorative healthcare illustration */}
            <div className="hidden lg:flex lg:items-center lg:justify-center">
              <div className="flex h-44 w-44 items-center justify-center rounded-full border border-white/20 bg-white/10 shadow-inner">
                <div className="flex h-28 w-28 items-center justify-center rounded-[2rem] border border-white/30 bg-white/15 shadow-xl">
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    className="h-16 w-16 stroke-white"
                    strokeWidth="1.25"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    aria-hidden="true"
                  >
                    <path d="M8 4.5H6A2.5 2.5 0 0 0 3.5 7v12A2.5 2.5 0 0 0 6 21.5h12a2.5 2.5 0 0 0 2.5-2.5V7A2.5 2.5 0 0 0 18 4.5h-2" />
                    <rect x="8" y="2.5" width="8" height="4" rx="1.5" />
                    <path d="M12 10v7m-3.5-3.5h7" />
                  </svg>
                </div>
              </div>
            </div>
          </div>

          <div className="relative flex flex-col gap-3 border-t border-white/15 bg-white/[0.05] px-6 py-4 sm:flex-row sm:items-center sm:px-9 lg:px-12">
            <div className="flex min-w-0 flex-1 items-center gap-3">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white/15 text-sm font-bold text-white">
                {firstName.charAt(0).toUpperCase()}
              </div>

              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-white">
                  {user?.name || "Patient"}
                </p>
                <p className="truncate text-xs text-blue-100/80">
                  {user?.email || "Your patient account"}
                </p>
              </div>
            </div>

            <span className="w-fit rounded-full border border-emerald-200/20 bg-emerald-300/10 px-3 py-1.5 text-xs font-semibold capitalize text-emerald-100">
              {user?.role || "Patient"} account
            </span>
          </div>
        </section>

        {/* Account overview */}
        <section className="mt-9 sm:mt-11">
          <div className="mb-5">
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-teal-700">
              Account overview
            </p>

            <h2 className="mt-2 text-xl font-bold tracking-tight text-slate-900 sm:text-2xl">
              Your details at a glance
            </h2>

            <p className="mt-1.5 text-sm leading-6 text-slate-500">
              Your registered information, all in one place.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {accountDetails.map((detail) => (
              <article
                key={detail.label}
                className="group flex min-w-0 items-center gap-4 rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm transition duration-200 hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-md sm:p-6"
              >
                <div
                  className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl ring-1 ${colorStyles[detail.color].icon}`}
                >
                  <span className="h-6 w-6 [&_svg]:h-full [&_svg]:w-full [&_svg]:stroke-current [&_svg]:stroke-[1.7]">
                    {detailIcons[detail.icon]}
                  </span>
                </div>

                <div className="min-w-0 flex-1">
                  <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                    {detail.label}
                  </p>
                  <p className="mt-1.5 break-words text-sm font-bold text-slate-900 sm:text-[15px]">
                    {detail.value}
                  </p>
                </div>
              </article>
            ))}
          </div>
        </section>

        {/* Patient services */}
        <section className="mt-10 sm:mt-12">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.16em] text-teal-700">
                Patient services
              </p>

              <h2 className="mt-2 text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
                How can we help you?
              </h2>

              <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
                Choose a service to get started with your healthcare.
              </p>
            </div>

            <span className="w-fit rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-500">
              3 services available
            </span>
          </div>

          <div className="mt-6 grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
            {services.map((service) => (
              <article
                key={service.path}
                className={`group flex min-w-0 flex-col rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm transition duration-200 hover:-translate-y-1 hover:shadow-lg sm:p-7 ${colorStyles[service.color].hover}`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div
                    className={`flex h-14 w-14 items-center justify-center rounded-2xl ring-1 ${colorStyles[service.color].icon}`}
                  >
                    <span className="h-7 w-7 [&_svg]:h-full [&_svg]:w-full [&_svg]:stroke-current [&_svg]:stroke-[1.7]">
                      {icons[service.icon]}
                    </span>
                  </div>

                  <span
                    className={`text-sm font-bold tracking-widest ${colorStyles[service.color].number}`}
                  >
                    {service.number}
                  </span>
                </div>

                <h3 className="mt-5 text-lg font-bold tracking-tight text-slate-900 sm:text-xl">
                  {service.title}
                </h3>

                <p className="mt-3 flex-1 text-sm leading-7 text-slate-500">
                  {service.description}
                </p>

                <button
                  type="button"
                  onClick={() => navigate(service.path)}
                  className={`mt-6 flex min-h-11 w-full items-center justify-between gap-3 rounded-xl border px-4 py-3 text-left text-sm font-bold transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-500 ${colorStyles[service.color].button}`}
                >
                  {service.label}
                  <span
                    aria-hidden="true"
                    className="text-lg transition-transform group-hover:translate-x-1"
                  >
                    →
                  </span>
                </button>
              </article>
            ))}
          </div>
        </section>

        {/* Closing call to action */}
        <section className="mt-8 overflow-hidden rounded-2xl border border-teal-100 bg-gradient-to-r from-teal-50 via-white to-blue-50 p-6 sm:mt-10 sm:p-8">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
            <div className="max-w-2xl">
              <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-teal-800">
                <span className="h-2 w-2 rounded-full bg-teal-500" />
                Your wellbeing matters
              </div>

              <h2 className="mt-3 text-xl font-bold tracking-tight text-slate-900 sm:text-2xl">
                Make time for your health.
              </h2>

              <p className="mt-2 text-sm leading-7 text-slate-600">
                Ready for your next consultation? Schedule an appointment and
                keep your healthcare plans organized.
              </p>
            </div>

            <button
              type="button"
              onClick={() => navigate("/book-appointment")}
              className="inline-flex min-h-12 shrink-0 items-center justify-center gap-2 rounded-xl bg-teal-700 px-5 py-3 text-sm font-bold text-white shadow-sm transition hover:-translate-y-0.5 hover:bg-teal-800 hover:shadow-md focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-700"
            >
              Get started
              <span aria-hidden="true">→</span>
            </button>
          </div>
        </section>

        {/* Footer */}
        <footer className="pb-3 pt-9 text-center">
          <p className="text-xs font-semibold text-slate-500">
            MediCare Patient Portal
          </p>
          <p className="mt-1 text-xs text-slate-400">
            Your healthcare, made simpler.
          </p>
          <button
            type="button"
            onClick={handleLogout}
            className="mt-3 text-xs font-semibold text-slate-500 underline-offset-4 transition hover:text-rose-600 hover:underline"
          >
            Sign out
          </button>
        </footer>
      </main>
    </div>
  );
}

export default Dashboard;
