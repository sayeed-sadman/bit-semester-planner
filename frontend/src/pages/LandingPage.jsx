import { useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function LandingPage() {
  const { isAuthenticated, isAdmin, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && isAuthenticated) {
      navigate(isAdmin ? "/admin/modules" : "/dashboard", { replace: true });
    }
  }, [isAuthenticated, isAdmin, loading, navigate]);

  if (loading) return null;

  return (
    <div className="bg-surface-page">

      {/* ── Hero ── */}
      <section className="max-w-screen-xl mx-auto px-6 py-20">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">

          {/* Left column */}
          <div>
            <div className="inline-flex items-center gap-2 bg-primary-light text-primary px-4 py-1.5 rounded-full text-sm font-medium mb-6">
              <span className="w-2 h-2 rounded-full bg-primary flex-shrink-0" />
              Built for BIT students at FHNW
            </div>

            <h1 className="text-4xl sm:text-5xl font-bold text-dark leading-tight mb-5">
              Plan your BIT semester<br />with clarity.
            </h1>

            <p className="text-dark-muted text-lg mb-8 max-w-lg leading-relaxed">
              Explore BIT modules, keep personal notes, and connect your calendar in one simple workspace designed to make semester planning easier.
            </p>

            <Link
              to="/register"
              className="inline-block px-6 py-3 bg-primary text-white font-semibold rounded-button hover:bg-primary-dark transition-colors"
            >
              Create account
            </Link>
          </div>

          {/* Right column – app mockup */}
          <div className="w-full">
            <div className="bg-white border border-surface-border rounded-card shadow-[0_8px_32px_rgba(12,18,41,0.12)] overflow-hidden">

              {/* macOS-style title bar */}
              <div className="flex items-center gap-1.5 px-4 py-3 border-b border-surface-border bg-surface-section flex-shrink-0">
                <span className="w-3 h-3 rounded-full bg-red-400" />
                <span className="w-3 h-3 rounded-full bg-yellow-400" />
                <span className="w-3 h-3 rounded-full bg-green-400" />
                <span className="ml-3 text-sm font-semibold text-dark">My Semester Planner</span>
              </div>

              {/* App content — bg-surface-page like the real dashboard */}
              <div className="flex flex-col gap-2.5 p-3 bg-surface-page">

                {/* ── My Modules card ── */}
                <div className="bg-white rounded-card border border-surface-border overflow-hidden">
                  {/* Header row */}
                  <div className="px-3.5 pt-3 pb-2.5 border-b border-surface-divider">
                    <div className="flex items-center justify-between gap-2 mb-2">
                      <span className="text-xs font-semibold text-dark">My Modules</span>
                      <span className="px-2 py-1 bg-primary text-white text-[9px] font-medium rounded-button leading-none">
                        Browse Modules
                      </span>
                    </div>
                    {/* Status pill — mirrors MyModulesSection exactly */}
                    <div className="flex items-center gap-1 rounded-button border border-surface-border px-2.5 py-1 w-fit text-[9px] text-dark-muted">
                      <span className="font-medium text-dark-secondary">2</span>
                      <span>modules selected</span>
                      <span className="w-1.5 h-1.5 rounded-full bg-green-500 flex-shrink-0" />
                      <span className="font-medium text-dark-secondary">1 of 2</span>
                      <span>elective slots used</span>
                    </div>
                  </div>

                  {/* Module rows — mirrors ModuleRowPlanner */}
                  <div className="px-3.5">
                    {/* Row 1 */}
                    <div className="flex items-center justify-between gap-2 py-2 border-b border-surface-divider">
                      <div className="min-w-0">
                        <span className="text-[10px] font-medium text-dark block truncate">Internet Technology</span>
                        <div className="flex items-center gap-1.5 mt-0.5">
                          <span className="text-[9px] text-dark-muted">Semester 4 · 4 ECTS</span>
                          <span className="px-1.5 py-px rounded-badge text-[9px] font-medium bg-primary-light text-primary">Compulsory</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-1 flex-shrink-0">
                        <span className="px-1.5 py-1 border border-surface-border text-dark-secondary text-[8px] font-medium rounded-input leading-none">View Detail</span>
                        <span className="px-1.5 py-1 bg-indigo-50 text-indigo-600 text-[8px] font-medium rounded-input leading-none">My Notes</span>
                        <span className="px-1.5 py-1 bg-red-50 text-red-600 text-[8px] font-medium rounded-input leading-none">Remove</span>
                      </div>
                    </div>
                    {/* Row 2 */}
                    <div className="flex items-center justify-between gap-2 py-2">
                      <div className="min-w-0">
                        <span className="text-[10px] font-medium text-dark block truncate">Digital Marketing</span>
                        <div className="flex items-center gap-1.5 mt-0.5">
                          <span className="text-[9px] text-dark-muted">Semester 4 · 4 ECTS</span>
                          <span className="px-1.5 py-px rounded-badge text-[9px] font-medium bg-success-light text-success-dark">Elective</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-1 flex-shrink-0">
                        <span className="px-1.5 py-1 border border-surface-border text-dark-secondary text-[8px] font-medium rounded-input leading-none">View Detail</span>
                        <span className="px-1.5 py-1 bg-indigo-50 text-indigo-600 text-[8px] font-medium rounded-input leading-none">My Notes</span>
                        <span className="px-1.5 py-1 bg-red-50 text-red-600 text-[8px] font-medium rounded-input leading-none">Remove</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* ── My Note card ── */}
                <div className="bg-white rounded-card border border-surface-border p-3.5">
                  <p className="text-[9px] font-medium text-dark-secondary mb-1.5">My Note</p>
                  <div className="bg-surface-section rounded-input p-2.5 text-[9px] text-dark-secondary leading-relaxed">
                    Exam: 60% written, 40% project grade. Bonus points available for participation.
                  </div>
                </div>

                {/* ── This Week — Events view style ── */}
                <div className="bg-white rounded-card border border-surface-border p-3.5">
                  {/* Date header — matches WeeklyCalendar events view */}
                  <p className="text-[9px] font-semibold uppercase tracking-wide text-dark-muted mb-2">
                    Monday, 26 May 2025
                  </p>
                  <div className="flex flex-col gap-1.5">
                    {/* All-day event pill */}
                    <div className="rounded-lg px-2.5 py-1.5" style={{ backgroundColor: "#2563EB22" }}>
                      <p className="text-[9px] font-medium text-dark leading-snug">Module Fair</p>
                      <p className="text-[9px]" style={{ color: "#2563EB" }}>FHNW — All day</p>
                    </div>
                    {/* Timed event 1 */}
                    <div className="flex items-start gap-2 py-0.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-primary mt-1 flex-shrink-0" />
                      <span className="text-[9px] font-mono text-dark-muted w-8 flex-shrink-0 pt-px">09:00</span>
                      <div>
                        <p className="text-[9px] font-semibold text-dark leading-snug">Internet Technology</p>
                        <p className="text-[9px] text-dark-muted">Lecture Hall A</p>
                      </div>
                    </div>
                    {/* Timed event 2 */}
                    <div className="flex items-start gap-2 py-0.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-success mt-1 flex-shrink-0" />
                      <span className="text-[9px] font-mono text-dark-muted w-8 flex-shrink-0 pt-px">11:00</span>
                      <div>
                        <p className="text-[9px] font-semibold text-dark leading-snug">Digital Marketing</p>
                        <p className="text-[9px] text-dark-muted">Room B204</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* ── Status pill — mirrors MyModulesSection row 2 ── */}
                <div className="flex items-center gap-1.5 rounded-button border border-surface-border px-3 py-1.5 w-fit text-[9px] text-dark-muted bg-white">
                  <span className="font-medium text-dark-secondary">2</span>
                  <span>modules selected</span>
                  <span className="w-1.5 h-1.5 rounded-full bg-green-500 flex-shrink-0" />
                  <span className="font-medium text-dark-secondary">1 of 2</span>
                  <span>elective slots used</span>
                </div>

              </div>
            </div>
          </div>

        </div>
      </section>

      {/* ── Features ── */}
      <section className="bg-white border-y border-surface-border py-16 px-6">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-2xl font-bold text-dark text-center mb-10">Everything you need to plan your semester</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                icon: "📚",
                title: "Module Catalog",
                description: "Browse all available modules with details on credits, lecturers, and schedules."
              },
              {
                icon: "📋",
                title: "Semester Planner",
                description: "Add modules to your personal plan. Track compulsory and elective modules at a glance."
              },
              {
                icon: "📅",
                title: "Weekly Calendar",
                description: "Visualize your schedule in a weekly view. Connect ICS feeds from FHNW or other sources."
              }
            ].map((f) => (
              <div key={f.title} className="bg-surface-section rounded-card p-6 shadow-card">
                <div className="text-3xl mb-4">{f.icon}</div>
                <h3 className="text-base font-semibold text-dark mb-2">{f.title}</h3>
                <p className="text-sm text-dark-muted">{f.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Steps ── */}
      <section className="py-16 px-6">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl font-bold text-dark text-center mb-10">Get started in 3 steps</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { num: "1", title: "Create your account", description: "Register with your FHNW email and set a password." },
              { num: "2", title: "Browse modules", description: "Explore the catalog and add modules to your semester plan." },
              { num: "3", title: "Manage your schedule", description: "Add calendar feeds and see your weekly timetable." }
            ].map((s) => (
              <div key={s.num} className="flex flex-col items-center text-center bg-white rounded-card p-6 shadow-card">
                <div className="w-10 h-10 rounded-full bg-primary-light text-primary font-bold text-lg flex items-center justify-center mb-4">
                  {s.num}
                </div>
                <h3 className="text-base font-semibold text-dark mb-2">{s.title}</h3>
                <p className="text-sm text-dark-muted">{s.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

    </div>
  );
}
