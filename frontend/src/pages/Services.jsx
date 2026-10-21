import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";

import Header from "../components/Header";
import { logout } from "../store/authSlice";
import api from "../services/api";


const defaultServices = [
  {
    icon: "🩺",
    title: "General Consultation",
    description:
      "Consult a doctor for common health concerns, routine checkups, and medical guidance.",
    color: "bg-teal-50 text-teal-700",
  },
  {
    icon: "❤️",
    title: "Cardiology",
    description:
      "Get professional guidance for heart health, blood pressure, and cardiovascular concerns.",
    color: "bg-rose-50 text-rose-700",
  },
  {
    icon: "🧠",
    title: "Neurology",
    description:
      "Consult a specialist about headaches, nerve-related symptoms, and neurological concerns.",
    color: "bg-violet-50 text-violet-700",
  },
  {
    icon: "🦴",
    title: "Orthopedics",
    description:
      "Get help with joint pain, bone health, mobility issues, and musculoskeletal concerns.",
    color: "bg-amber-50 text-amber-700",
  },
  {
    icon: "👶",
    title: "Pediatrics",
    description:
      "Healthcare consultations focused on children's growth, development, and general wellbeing.",
    color: "bg-sky-50 text-sky-700",
  },
  {
    icon: "🧴",
    title: "Dermatology",
    description:
      "Discuss skin, hair, and nail concerns with a qualified healthcare professional.",
    color: "bg-fuchsia-50 text-fuchsia-700",
  },
];

function Services() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { token, user } = useSelector((state) => state.auth);

  const [services, setServices] = useState(defaultServices);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    let active = true;

    const fetchServices = async () => {
      // Use the backend services method if it exists.
      // Otherwise, keep the built-in service cards visible.
      if (typeof api.getServices !== "function") return;

      try {
        setLoading(true);
        const result = await api.getServices(token);
        const receivedServices = Array.isArray(result)
          ? result
          : result.services;

        if (active && Array.isArray(receivedServices) && receivedServices.length) {
          setServices(
            receivedServices.map((service, index) => ({
              icon: service.icon || defaultServices[index % defaultServices.length].icon,
              title: service.name || service.title || "Healthcare Service",
              description:
                service.description || "Professional healthcare consultation.",
              color: defaultServices[index % defaultServices.length].color,
            }))
          );
        }
      } catch {
        if (active) {
          setMessage("Showing available service information.");
        }
      } finally {
        if (active) setLoading(false);
      }
    };

    fetchServices();

    return () => {
      active = false;
    };
  }, [token]);

  const handleLogout = () => {
    dispatch(logout());
    navigate("/", { replace: true });
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <Header user={user} onLogout={handleLogout} />

      <main className="mx-auto w-full max-w-7xl px-4 py-7 sm:px-6 sm:py-10 lg:px-8">
        <div className="mb-7 flex flex-wrap items-center gap-2 text-sm text-slate-500">
          <button
            onClick={() => navigate("/dashboard")}
            className="transition hover:text-teal-700"
          >
            Dashboard
          </button>
          <span>/</span>
          <span className="font-semibold text-teal-700">Services</span>
        </div>

        <section className="relative mb-10 overflow-hidden rounded-3xl bg-gradient-to-br from-teal-800 via-teal-700 to-cyan-600 p-6 text-white shadow-lg sm:p-10 lg:p-12">
          <div className="pointer-events-none absolute -right-12 -top-16 h-64 w-64 rounded-full border-[35px] border-white/10" />
          <div className="pointer-events-none absolute -bottom-28 right-40 h-56 w-56 rounded-full bg-white/5" />

          <div className="relative max-w-3xl">
            <span className="inline-flex rounded-full border border-white/25 bg-white/10 px-3 py-1.5 text-xs font-semibold uppercase tracking-wider">
              Our Healthcare Services
            </span>

            <h1 className="mt-5 text-3xl font-bold sm:text-4xl lg:text-5xl">
              Care that puts you first.
            </h1>

            <p className="mt-4 max-w-2xl text-sm leading-7 text-teal-50 sm:text-base">
              Explore healthcare specialties and find the right consultation
              for your needs. Your journey to better health starts here.
            </p>

            <button
              onClick={() => navigate("/book-appointment")}
              className="mt-7 rounded-xl bg-white px-5 py-3 font-bold text-teal-800 transition hover:-translate-y-0.5 hover:bg-teal-50"
            >
              Book an Appointment →
            </button>
          </div>
        </section>

        <section className="mb-8 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm font-bold uppercase tracking-wider text-teal-700">
              What we offer
            </p>
            <h2 className="mt-2 text-2xl font-bold text-slate-900 sm:text-3xl">
              Explore Our Services
            </h2>
            <p className="mt-2 text-sm leading-6 text-slate-500">
              Find a specialty and book your consultation with ease.
            </p>
          </div>

          <span className="w-fit rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-600">
            {services.length} Services
          </span>
        </section>

        {message && (
          <p className="mb-5 rounded-xl border border-slate-200 bg-white p-3 text-sm text-slate-600">
            {message}
          </p>
        )}

        {loading && (
          <p className="mb-5 text-sm text-slate-500">
            Checking available services...
          </p>
        )}

        <section className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {services.map((service, index) => (
            <article
              key={`${service.title}-${index}`}
              className="group flex h-full flex-col rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition duration-300 hover:-translate-y-1 hover:border-teal-200 hover:shadow-lg"
            >
              <div className="flex items-start justify-between gap-3">
                <div
                  className={`flex h-14 w-14 items-center justify-center rounded-2xl text-2xl ${service.color}`}
                >
                  {service.icon}
                </div>

                <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
                  Healthcare
                </span>
              </div>

              <h3 className="mt-5 text-xl font-bold text-slate-900 transition group-hover:text-teal-800">
                {service.title}
              </h3>

              <p className="mt-3 flex-1 text-sm leading-7 text-slate-500">
                {service.description}
              </p>

              <button
                onClick={() => navigate("/book-appointment")}
                className="mt-6 flex w-fit items-center gap-2 rounded-xl border border-teal-100 bg-teal-50 px-4 py-2.5 text-sm font-bold text-teal-800 transition hover:bg-teal-700 hover:text-white"
              >
                Book Consultation <span>→</span>
              </button>
            </article>
          ))}
        </section>

        <section className="mt-10 flex flex-col gap-5 rounded-2xl border border-teal-100 bg-white p-6 shadow-sm sm:flex-row sm:items-center sm:justify-between sm:p-8">
          <div>
            <h2 className="text-xl font-bold text-slate-900">
              Need a consultation?
            </h2>
            <p className="mt-2 text-sm leading-6 text-slate-500">
              Visit the booking page to choose an available doctor and
              appointment time.
            </p>
          </div>

          <button
            onClick={() => navigate("/book-appointment")}
            className="shrink-0 rounded-xl bg-teal-700 px-5 py-3 font-bold text-white transition hover:bg-teal-800"
          >
            Book Now →
          </button>
        </section>

        <footer className="py-8 text-center text-xs text-slate-400">
          MediCare Patient Portal · Your healthcare, made simpler.
        </footer>
      </main>
    </div>
  );
}

export default Services;
