
import React from "react";
import {
  FaHeartbeat,
  FaXRay,
  FaFlask,
  FaFemale,
  FaLeaf,
  FaTooth,
  FaArrowRight,
  FaCheckCircle,
} from "react-icons/fa";

const services = [
  {
    title: "Regular Healthcare Package",
    description:
      "Routine health checkups to help you stay informed about your health.",
    icon: FaHeartbeat,
    color: "bg-blue-50 text-blue-600",
    tag: "Popular",
  },
  {
    title: "CT-Scan | X-Ray",
    description:
      "Medical imaging services to support accurate diagnosis and treatment.",
    icon: FaXRay,
    color: "bg-violet-50 text-violet-600",
    tag: "Imaging",
  },
  {
    title: "Lab Test",
    description:
      "Diagnostic tests and laboratory investigations for your healthcare needs.",
    icon: FaFlask,
    color: "bg-emerald-50 text-emerald-600",
    tag: "Diagnostics",
  },
  {
    title: "Gynae Health",
    description:
      "Healthcare services focused on women's health and well-being.",
    icon: FaFemale,
    color: "bg-pink-50 text-pink-600",
    tag: "Women's health",
  },
  {
    title: "Ayurveda Treatment",
    description:
      "Explore traditional Ayurvedic care as part of your wellness journey.",
    icon: FaLeaf,
    color: "bg-amber-50 text-amber-700",
    tag: "Wellness",
  },
  {
    title: "Dental Checkup",
    description:
      "Routine dental examinations to help maintain healthy teeth and gums.",
    icon: FaTooth,
    color: "bg-cyan-50 text-cyan-700",
    tag: "Dental care",
  },
];

export default function Services() {
  return (
    <main className="min-h-screen bg-slate-50 px-4 py-8 sm:px-6 lg:px-10">
      <div className="mx-auto max-w-7xl">
        <section className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-violet-800 via-purple-700 to-indigo-700 px-6 py-10 text-white shadow-lg sm:px-10 sm:py-14">
          <div className="absolute -right-12 -top-16 h-56 w-56 rounded-full bg-white/10" />
          <div className="absolute -bottom-24 right-40 h-48 w-48 rounded-full bg-white/10" />

          <div className="relative max-w-2xl">
            <span className="inline-flex items-center gap-2 rounded-full bg-white/15 px-3 py-1.5 text-sm font-medium">
              <FaHeartbeat />
              Your health, our priority
            </span>

            <h1 className="mt-5 text-3xl font-bold tracking-tight sm:text-4xl lg:text-5xl">
              Healthcare Services
            </h1>

            <p className="mt-4 max-w-xl text-sm leading-7 text-purple-100 sm:text-base">
              Find the healthcare services you need, all in one place.
              Explore our services and take the next step toward better health.
            </p>

            <a
              href="/book-appointment"
              className="mt-7 inline-flex items-center gap-2 rounded-xl bg-white px-5 py-3 font-semibold text-violet-800 shadow-md transition hover:-translate-y-0.5 hover:bg-purple-50"
            >
              Book an appointment
              <FaArrowRight />
            </a>
          </div>
        </section>

        <section className="py-10 sm:py-12">
          <div className="mb-7 flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
            <div>
              <p className="text-sm font-semibold uppercase tracking-widest text-violet-600">
                Explore our services
              </p>
              <h2 className="mt-2 text-2xl font-bold text-slate-900 sm:text-3xl">
                Care for every need
              </h2>
              <p className="mt-2 text-sm text-slate-500 sm:text-base">
                Choose from our available healthcare categories.
              </p>
            </div>

            <span className="w-fit rounded-full bg-violet-100 px-4 py-2 text-sm font-semibold text-violet-700">
              {services.length} services
            </span>
          </div>

          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {services.map((service) => {
              const Icon = service.icon;

              return (
                <article
                  key={service.title}
                  className="group flex flex-col rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition duration-300 hover:-translate-y-1 hover:border-violet-200 hover:shadow-xl"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div
                      className={`flex h-14 w-14 items-center justify-center rounded-2xl text-2xl ${service.color}`}
                    >
                      <Icon />
                    </div>

                    <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
                      {service.tag}
                    </span>
                  </div>

                  <h3 className="mt-5 text-lg font-bold text-slate-900">
                    {service.title}
                  </h3>

                  <p className="mt-2 flex-1 text-sm leading-6 text-slate-500">
                    {service.description}
                  </p>

                  <div className="mt-6 border-t border-slate-100 pt-4">
                    <a
                      href="/book-appointment"
                      className="inline-flex items-center gap-2 text-sm font-semibold text-violet-700 transition group-hover:gap-3"
                    >
                      Book an appointment
                      <FaArrowRight />
                    </a>
                  </div>
                </article>
              );
            })}
          </div>
        </section>

        <section className="mb-6 flex flex-col gap-4 rounded-2xl border border-emerald-100 bg-emerald-50 p-5 sm:flex-row sm:items-center sm:p-6">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-white text-xl text-emerald-600 shadow-sm">
            <FaCheckCircle />
          </div>

          <div>
            <h3 className="font-bold text-slate-900">
              Your health journey starts here
            </h3>
            <p className="mt-1 text-sm leading-6 text-slate-600">
              Select a service and book your appointment through our
              appointment booking system.
            </p>
          </div>

          <a
            href="/book-appointment"
            className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-emerald-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-emerald-700 sm:ml-auto"
          >
            Get started
            <FaArrowRight />
          </a>
        </section>
      </div>
    </main>
  );
}
