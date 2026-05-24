import { useState, useEffect, useRef } from "react";
import { getCalendars, getAllEvents, deleteCalendar } from "../../services/calendarService";
import WeeklyCalendar from "./WeeklyCalendar";
import AddCalendarPopup from "./AddCalendarPopup";

const VIEWS = ["Events", "Day", "Week", "Month"];
const CALENDAR_PALETTE = ["#1a73e8", "#e67c73", "#33b679", "#f6bf26", "#8e24aa", "#039be5"];

/* ── component ────────────────────────────────────────────── */

export default function MyCalendarSection() {
  const [view, setView]               = useState("events");
  const [currentDate, setCurrentDate] = useState(new Date());
  const [calendars, setCalendars]     = useState([]);
  const [events, setEvents]           = useState([]);
  const [selectedCalendar, setSelectedCalendar] = useState("all");
  const [showAddPopup, setShowAddPopup]         = useState(false);
  const [loading, setLoading]                   = useState(true);
  const [refreshKey, setRefreshKey]             = useState(0);
  const [dropdownOpen, setDropdownOpen]         = useState(false);
  const [confirmDeleteId, setConfirmDeleteId]   = useState(null);
  const dropdownRef                             = useRef(null);

  // Load calendars (re-runs when a calendar is added or removed)
  useEffect(() => {
    getCalendars().then(setCalendars).catch(() => {});
  }, [refreshKey]);

  // Assign a palette color to each calendar by insertion order.
  // Recomputed whenever the calendar list changes.
  const calendarColors = Object.fromEntries(
    calendars.map((c, i) => [c.displayName, CALENDAR_PALETTE[i % CALENDAR_PALETTE.length]])
  );

  // Load all events once (backend returns full year; views filter client-side).
  // Re-runs only when a calendar is added or removed.
  useEffect(() => {
    setLoading(true);
    getAllEvents()
      .then((evs) => {
        console.log("Raw events from backend:", evs);
        const mapped = evs.map((ev) => ({
          ...ev,
          start: ev.startDateTime,
          end:   ev.endDateTime,
          id:    `${ev.calendarName}-${ev.startDateTime}-${ev.title}`,
        }));
        setEvents(mapped);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [refreshKey]);

  useEffect(() => {
    if (!dropdownOpen) return;
    const handler = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false);
        setConfirmDeleteId(null);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [dropdownOpen]);

  const handleDeleteConfirm = async () => {
    await deleteCalendar(confirmDeleteId).catch(() => {});
    if (selectedCalendar === calendars.find((c) => c.calendarID === confirmDeleteId)?.displayName) {
      setSelectedCalendar("all");
    }
    setConfirmDeleteId(null);
    setDropdownOpen(false);
    setRefreshKey((k) => k + 1);
  };

  const selectedLabel =
    selectedCalendar === "all"
      ? "All Calendars"
      : calendars.find((c) => c.displayName === selectedCalendar)?.displayName ?? "All Calendars";

  // Navigation — delta depends on the active view
  const handlePrev = () => {
    setCurrentDate((d) => {
      const n = new Date(d);
      if (view === "day")        n.setDate(n.getDate() - 1);
      else if (view === "week")  n.setDate(n.getDate() - 7);
      else if (view === "month") n.setMonth(n.getMonth() - 1);
      return n;
    });
  };
  const handleNext = () => {
    setCurrentDate((d) => {
      const n = new Date(d);
      if (view === "day")        n.setDate(n.getDate() + 1);
      else if (view === "week")  n.setDate(n.getDate() + 7);
      else if (view === "month") n.setMonth(n.getMonth() + 1);
      return n;
    });
  };
  const handleToday = () => setCurrentDate(new Date());

  return (
    <div className="bg-white rounded-card shadow-card h-full flex flex-col overflow-hidden">

      {/* ── Card header ── */}
      <div className="px-5 pt-3.5 pb-2.5 border-b border-surface-divider flex-shrink-0">
        {/* Row 1: title + controls */}
        <div className="flex items-center justify-between gap-3">
          <h2 className="text-base font-semibold text-dark">My Calendar</h2>
          <div className="flex items-center gap-2">
            {/* Custom calendar dropdown */}
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => { setDropdownOpen((o) => !o); setConfirmDeleteId(null); }}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-input border border-surface-border bg-white text-xs text-dark-secondary hover:bg-surface-section transition-colors min-w-[120px] justify-between"
              >
                <span className="flex items-center gap-1.5 min-w-0">
                  {selectedCalendar !== "all" && (
                    <span
                      className="inline-block w-3 h-3 rounded-full flex-shrink-0"
                      style={{ backgroundColor: calendarColors[selectedCalendar] }}
                    />
                  )}
                  <span className="truncate max-w-[100px]">{selectedLabel}</span>
                </span>
                <svg width="10" height="10" viewBox="0 0 10 10" fill="none" className="flex-shrink-0">
                  <path d="M2 3.5l3 3 3-3" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>

              {dropdownOpen && (
                <div className="absolute left-0 top-full mt-1 z-50 bg-white border border-surface-border rounded-input shadow-card min-w-[160px]">
                  {/* All Calendars — no trash */}
                  <button
                    onClick={() => { setSelectedCalendar("all"); setDropdownOpen(false); setConfirmDeleteId(null); }}
                    className={`w-full text-left px-3 py-1.5 text-xs transition-colors ${
                      selectedCalendar === "all"
                        ? "bg-primary/10 text-primary font-medium"
                        : "text-dark-secondary hover:bg-surface-section"
                    }`}
                  >
                    All Calendars
                  </button>

                  {calendars.map((cal) => (
                    <div key={cal.calendarID} className="relative">
                      {confirmDeleteId === cal.calendarID ? (
                        <div className="px-3 py-2 border-t border-surface-divider">
                          <p className="text-xs text-dark mb-1.5">Remove this calendar?</p>
                          <div className="flex items-center gap-1.5">
                            <button
                              onClick={handleDeleteConfirm}
                              className="px-2 py-0.5 bg-red-600 text-white text-xs font-medium rounded hover:bg-red-700 transition-colors"
                            >
                              Yes
                            </button>
                            <button
                              onClick={() => setConfirmDeleteId(null)}
                              className="px-2 py-0.5 border border-surface-border text-dark-secondary text-xs rounded hover:bg-surface-section transition-colors"
                            >
                              Cancel
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div className="flex items-center border-t border-surface-divider">
                          <button
                            onClick={() => { setSelectedCalendar(cal.displayName); setDropdownOpen(false); setConfirmDeleteId(null); }}
                            className={`flex-1 text-left px-3 py-1.5 text-xs transition-colors flex items-center gap-2 min-w-0 ${
                              selectedCalendar === cal.displayName
                                ? "bg-primary/10 text-primary font-medium"
                                : "text-dark-secondary hover:bg-surface-section"
                            }`}
                          >
                            <span
                              className="inline-block w-3 h-3 rounded-full flex-shrink-0"
                              style={{ backgroundColor: calendarColors[cal.displayName] }}
                            />
                            <span className="truncate">{cal.displayName}</span>
                          </button>
                          <button
                            onClick={(e) => { e.stopPropagation(); setConfirmDeleteId(cal.calendarID); }}
                            className="px-2 py-1.5 text-red-400 hover:text-red-600 hover:bg-red-50 transition-colors flex-shrink-0"
                            title="Remove calendar"
                          >
                            <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                              <path d="M1.5 3h9M4.5 3V1.5h3V3M5 5.5v4M7 5.5v4M2.5 3l.5 7h6l.5-7" stroke="currentColor" strokeWidth="1.1" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                          </button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
            <button
              onClick={() => setShowAddPopup(true)}
              className="inline-flex items-center gap-1 px-3 py-1.5 bg-primary text-white text-xs font-medium rounded-button hover:bg-primary-dark transition-colors"
            >
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                <path d="M6 2v8M2 6h8" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
              Add Calendar
            </button>
          </div>
        </div>

        {/* Row 2: view toggle */}
        <div className="flex rounded-button border border-surface-border overflow-hidden mt-2.5 w-fit">
          {VIEWS.map((v) => (
            <button
              key={v}
              onClick={() => setView(v.toLowerCase())}
              className={`px-2.5 py-1 text-xs font-medium transition-colors border-r border-surface-border last:border-r-0 ${
                view === v.toLowerCase()
                  ? "bg-primary text-white"
                  : "text-dark-secondary bg-white hover:bg-surface-section"
              }`}
            >
              {v}
            </button>
          ))}
        </div>
      </div>

      {/* ── Calendar body ── */}
      <div className="flex-1 min-h-0 flex flex-col">
        {loading ? (
          <div className="text-center py-12 text-dark-muted text-sm">Loading calendar…</div>
        ) : (
          <WeeklyCalendar
            view={view}
            currentDate={currentDate}
            events={events}
            selectedCalendar={selectedCalendar}
            calendarColors={calendarColors}
            onPrev={handlePrev}
            onNext={handleNext}
            onToday={handleToday}
          />
        )}
      </div>

      {showAddPopup && (
        <AddCalendarPopup
          onClose={() => setShowAddPopup(false)}
          onAdded={() => { setShowAddPopup(false); setRefreshKey((k) => k + 1); }}
        />
      )}
    </div>
  );
}
