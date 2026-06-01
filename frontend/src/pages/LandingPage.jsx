import { useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

// ── SVG icons ────────────────────────────────────────────────────────────────
const IconGrid = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
    <rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/>
    <rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/>
  </svg>
);
const IconCheck = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
    <path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/>
  </svg>
);
const IconNote = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
    <polyline points="14 2 14 8 20 8"/>
    <line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/>
  </svg>
);
const IconCalendar = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
    <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
    <line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/>
    <line x1="3" y1="10" x2="21" y2="10"/>
  </svg>
);
const IconChat = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
  </svg>
);
const IconUpload = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
    <polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/>
  </svg>
);

const FEATURES = [
  {
    Icon: IconGrid,
    title: "Module Catalog",
    description: "Browse all official BIT modules. Filter by semester and type, view full details, and access the official module description PDF.",
  },
  {
    Icon: IconCheck,
    title: "Semester Planner",
    description: "Build your personal semester plan. The system enforces the 2-elective limit and prevents duplicate entries automatically.",
  },
  {
    Icon: IconNote,
    title: "Personal Notes",
    description: "Write and edit one note per module. Edit inline on the dashboard or open the full-page editor. Notes stay linked to your modules.",
  },
  {
    Icon: IconCalendar,
    title: "Calendar Integration",
    description: "Connect ICS calendars from Outlook, Google, or FHNW. View events in a weekly grid with automatic overlap detection.",
  },
  {
    Icon: IconChat,
    title: "AI Study Assistant",
    description: "Ask questions about your modules, notes, deadlines, and schedule. Available on every page, answers in real time.",
    highlight: true,
  },
  {
    Icon: IconUpload,
    title: "Document Upload & Analysis",
    description: "Upload lecture slides, bonus point sheets, or exam info as PDF or DOCX. The assistant extracts what matters and pre-fills your module notes.",
  },
];

const STEPS = [
  {
    num: "1",
    title: "Create an account",
    description: "Register with any email address and a password. Student accounts are available immediately after registration.",
  },
  {
    num: "2",
    title: "Add modules to your plan",
    description: "Browse the BIT module catalog and add the modules you are taking this semester. Compulsory and elective slots are tracked automatically.",
  },
  {
    num: "3",
    title: "Connect your calendar and notes",
    description: "Paste your ICS calendar URL to see your schedule. Write personal notes for each module to capture exam rules, deadlines, and tips.",
  },
  {
    num: "4",
    title: "Ask the AI assistant",
    description: "Open the chatbot in the bottom-right corner. Ask about module content, your upcoming deadlines, or upload a document for instant note extraction.",
  },
];

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

      {/* ══════════════════════════════════════════════════════════
          HERO
          ══════════════════════════════════════════════════════════ */}
      <section className="max-w-screen-xl mx-auto px-6 py-20">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">

          {/* Left — headline + CTAs */}
          <div>
            <div className="inline-flex items-center gap-2 bg-primary-light text-primary px-4 py-1.5 rounded-full text-sm font-medium mb-6">
              <span className="w-2 h-2 rounded-full bg-primary flex-shrink-0" />
              Built for BIT students at FHNW
            </div>

            <h1 className="text-4xl sm:text-5xl font-bold text-dark leading-tight mb-5">
              Plan your BIT semester<br />with an AI study companion.
            </h1>

            <p className="text-dark-muted text-lg mb-8 max-w-lg leading-relaxed">
              Browse modules, build your semester plan, connect your calendar, and get answers from a RAG-powered AI study assistant. All in one place.
            </p>

            <div className="flex flex-wrap gap-3">
              <Link
                to="/register"
                className="inline-block px-6 py-3 bg-primary text-white font-semibold rounded-button hover:bg-primary-dark transition-colors"
              >
                Create account
              </Link>
              <Link
                to="/modules"
                className="inline-block px-6 py-3 border border-surface-border text-dark font-semibold rounded-button hover:border-primary hover:text-primary transition-colors"
              >
                Browse modules
              </Link>
            </div>
          </div>

          {/* Right — dashboard mockup */}
          <div className="w-full">
            <div className="bg-white border border-surface-border rounded-card shadow-[0_8px_32px_rgba(12,18,41,0.12)] overflow-hidden">

              {/* Browser chrome */}
              <div className="flex items-center gap-1.5 px-4 py-3 border-b border-surface-border bg-surface-section flex-shrink-0">
                <span className="w-3 h-3 rounded-full bg-red-400" />
                <span className="w-3 h-3 rounded-full bg-yellow-400" />
                <span className="w-3 h-3 rounded-full bg-green-400" />
                <span className="ml-3 text-sm font-semibold text-dark">My Semester Planner</span>
              </div>

              {/* Two-column dashboard layout */}
              <div className="flex gap-0 bg-surface-page p-3 min-h-0">

                {/* Left — My Modules */}
                <div className="flex-1 min-w-0 bg-white rounded-card border border-surface-border overflow-hidden mr-2">
                  <div className="px-3 pt-2.5 pb-2 border-b border-surface-divider">
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-[10px] font-semibold text-dark">My Modules</span>
                      <span className="px-1.5 py-0.5 bg-primary text-white text-[8px] font-medium rounded-button leading-none">Browse Modules</span>
                    </div>
                    <div className="flex items-center gap-1 rounded-button border border-surface-border px-2 py-0.5 w-fit text-[8px] text-dark-muted">
                      <span className="font-medium text-dark-secondary">7</span>
                      <span>modules selected</span>
                      <span className="w-1.5 h-1.5 rounded-full bg-green-500 flex-shrink-0 mx-0.5" />
                      <span className="font-medium text-dark-secondary">2 of 2</span>
                      <span>elective slots used</span>
                    </div>
                  </div>
                  <div className="px-3 py-0.5">
                    {[
                      { name: "Business Intelligence", type: "Compulsory", ects: 5 },
                      { name: "Internet Technology", type: "Compulsory", ects: 5 },
                      { name: "Logistics and Supply Chain Mgmt", type: "Compulsory", ects: 5 },
                      { name: "Statistics and Probability", type: "Compulsory", ects: 5 },
                      { name: "Algorithms and Data Structures", type: "Elective", ects: 3 },
                      { name: "Quantum Disruption", type: "Elective", ects: 3 },
                    ].map((m, i, arr) => (
                      <div key={m.name} className={`flex items-center justify-between gap-1 py-1.5 ${i < arr.length - 1 ? "border-b border-surface-divider" : ""}`}>
                        <div className="min-w-0">
                          <span className="text-[9px] font-medium text-dark block truncate">{m.name}</span>
                          <div className="flex items-center gap-1 mt-0.5">
                            <span className="text-[8px] text-dark-muted">Sem 4 · {m.ects} ECTS</span>
                            <span className={`px-1 py-px rounded-badge text-[7px] font-medium ${m.type === "Compulsory" ? "bg-primary-light text-primary" : "bg-success-light text-success-dark"}`}>
                              {m.type}
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center gap-0.5 flex-shrink-0">
                          <span className="px-1 py-0.5 border border-surface-border text-dark-secondary text-[7px] rounded-input leading-none">View</span>
                          <span className="px-1 py-0.5 bg-indigo-50 text-indigo-600 text-[7px] rounded-input leading-none">Notes</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Right — Calendar + Chatbot hint */}
                <div className="w-36 flex-shrink-0 flex flex-col gap-2">
                  {/* Calendar events */}
                  <div className="bg-white rounded-card border border-surface-border p-2 flex-1">
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-[8px] font-semibold text-dark">My Calendar</span>
                      <span className="text-[7px] px-1 py-0.5 bg-primary text-white rounded-button leading-none">+ Add</span>
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <p className="text-[7px] font-semibold uppercase tracking-wide text-dark-muted">Thu, 4 Jun 2026</p>
                      <div className="rounded px-1.5 py-1" style={{ backgroundColor: "#2563EB22" }}>
                        <p className="text-[8px] font-medium text-dark truncate">Corpus Christi</p>
                        <p className="text-[7px] text-primary">FHNW — All day</p>
                      </div>
                      {/* Overlapping events */}
                      <div className="flex items-start gap-1 rounded px-1 py-0.5" style={{ borderLeft: "2px solid #F59E0B", backgroundColor: "#FFFBEB" }}>
                        <span className="w-1.5 h-1.5 rounded-full bg-amber-400 mt-0.5 flex-shrink-0" />
                        <div>
                          <div className="flex items-center gap-0.5">
                            <p className="text-[8px] font-semibold truncate" style={{ color: "#B45309" }}>Elective Social Eng.</p>
                            <span className="text-[6px] font-bold bg-amber-200 text-amber-700 px-0.5 rounded flex-shrink-0">!</span>
                          </div>
                          <p className="text-[7px] text-amber-600">18:00 – 21:00 · FHNW</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-1 rounded px-1 py-0.5" style={{ borderLeft: "2px solid #F59E0B", backgroundColor: "#FFFBEB" }}>
                        <span className="w-1.5 h-1.5 rounded-full bg-red-400 mt-0.5 flex-shrink-0" />
                        <div>
                          <div className="flex items-center gap-0.5">
                            <p className="text-[8px] font-semibold truncate" style={{ color: "#B45309" }}>Test Event 2</p>
                            <span className="text-[6px] font-bold bg-amber-200 text-amber-700 px-0.5 rounded flex-shrink-0">!</span>
                          </div>
                          <p className="text-[7px] text-amber-600">18:00 – 19:00 · Google</p>
                        </div>
                      </div>
                      <p className="text-[7px] font-semibold uppercase tracking-wide text-dark-muted mt-0.5">Tue, 16 Jun 2026</p>
                      <div className="flex items-start gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-success mt-0.5 flex-shrink-0" />
                        <div>
                          <p className="text-[8px] font-semibold text-dark truncate">ToBIT oral presentations</p>
                          <p className="text-[7px] text-dark-muted">17:00 – 18:30</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Chatbot hint */}
                  <div className="bg-white rounded-card border border-surface-border p-2">
                    <div className="flex items-center gap-1 mb-1.5">
                      <div className="w-3 h-3 rounded-full bg-primary flex items-center justify-center flex-shrink-0">
                        <svg viewBox="0 0 24 24" fill="white" className="w-2 h-2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
                      </div>
                      <span className="text-[8px] font-semibold text-dark">BIT Study Assistant</span>
                    </div>
                    <div className="rounded px-1.5 py-1 bg-primary text-white text-[7px] mb-1 w-fit ml-auto">
                      What are my upcoming deadlines?
                    </div>
                    <div className="rounded px-1.5 py-1 bg-surface-section text-[7px] text-dark-secondary leading-relaxed">
                      Based on your calendar: ToBIT oral presentations on 16 June at 17:00.
                    </div>
                  </div>
                </div>

              </div>
            </div>
          </div>

        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════
          FEATURES
          ══════════════════════════════════════════════════════════ */}
      <section className="bg-white border-y border-surface-border py-16 px-6">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-2xl font-bold text-dark text-center mb-3">Everything you need to plan your semester</h2>
          <p className="text-dark-muted text-center mb-10 max-w-xl mx-auto">Six integrated tools built around the BIT programme at FHNW.</p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {FEATURES.map((f) => (
              <div
                key={f.title}
                className={`rounded-card p-6 border ${f.highlight ? "border-primary/30 bg-primary-light" : "border-surface-border bg-surface-section"}`}
              >
                <div className={`w-9 h-9 rounded-lg flex items-center justify-center mb-4 ${f.highlight ? "bg-primary text-white" : "bg-white text-primary border border-surface-border"}`}>
                  <f.Icon />
                </div>
                <h3 className="text-sm font-semibold text-dark mb-2">{f.title}</h3>
                <p className="text-sm text-dark-muted leading-relaxed">{f.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════
          AI SPOTLIGHT
          ══════════════════════════════════════════════════════════ */}
      <section className="py-16 px-6">
        <div className="max-w-4xl mx-auto">
          <div className="bg-primary rounded-2xl px-8 py-10 md:px-12 md:py-12 flex flex-col md:flex-row gap-8 items-start">
            <div className="flex-shrink-0">
              <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center">
                <IconChat />
              </div>
            </div>
            <div>
              <p className="text-white/70 text-xs font-semibold uppercase tracking-widest mb-2">AI Study Assistant</p>
              <h2 className="text-2xl font-bold text-white mb-4 leading-snug">
                Ask questions. Get answers.<br />Grounded in your own documents.
              </h2>
              <p className="text-white/80 text-sm leading-relaxed mb-4">
                Before answering, the assistant searches through official BIT module descriptions, your uploaded documents, your personal notes, and your calendar. You get answers based on your actual content, not generic responses.
              </p>
              <ul className="text-white/80 text-sm space-y-1.5">
                {[
                  "Available on every page, including before login",
                  "Answers grounded in 8 official BIT module PDFs",
                  "Reads your uploaded documents for exam and deadline info",
                  "Aware of your connected calendar events",
                  "Responses streamed in real time",
                ].map((item) => (
                  <li key={item} className="flex items-start gap-2">
                    <svg viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4 text-white/60 flex-shrink-0 mt-0.5"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/></svg>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════
          STEPS
          ══════════════════════════════════════════════════════════ */}
      <section className="bg-white border-t border-surface-border py-16 px-6">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl font-bold text-dark text-center mb-10">Get started in 4 steps</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {STEPS.map((s) => (
              <div key={s.num} className="flex flex-col items-center text-center">
                <div className="w-10 h-10 rounded-full bg-primary-light text-primary font-bold text-lg flex items-center justify-center mb-4 flex-shrink-0">
                  {s.num}
                </div>
                <h3 className="text-sm font-semibold text-dark mb-2">{s.title}</h3>
                <p className="text-sm text-dark-muted leading-relaxed">{s.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════
          BOTTOM CTA
          ══════════════════════════════════════════════════════════ */}
      <section className="py-16 px-6 border-t border-surface-border">
        <div className="max-w-xl mx-auto text-center">
          <h2 className="text-2xl font-bold text-dark mb-3">Start planning your semester today</h2>
          <p className="text-dark-muted mb-8">Create an account in seconds. No FHNW system access required — just an email and a password.</p>
          <div className="flex flex-wrap justify-center gap-3">
            <Link
              to="/register"
              className="inline-block px-6 py-3 bg-primary text-white font-semibold rounded-button hover:bg-primary-dark transition-colors"
            >
              Create account
            </Link>
            <Link
              to="/modules"
              className="inline-block px-6 py-3 border border-surface-border text-dark font-semibold rounded-button hover:border-primary hover:text-primary transition-colors"
            >
              Browse modules
            </Link>
          </div>
        </div>
      </section>

    </div>
  );
}
