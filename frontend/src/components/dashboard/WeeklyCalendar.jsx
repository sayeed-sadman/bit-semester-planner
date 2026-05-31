import { useState, useEffect, useRef, useCallback } from "react";
import CalendarEvent from "./CalendarEvent";

const HOURS       = Array.from({ length: 24 }, (_, i) => i); // 00 – 23
const SLOT_HEIGHT = 56; // px per hour
const DAY_LABELS  = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

/* ── pure helpers ───────────────────────────────────────────── */

// Handles ISO strings ("2026-05-21T17:15:00") and Jackson arrays ([2026,5,21,17,15,0]).
function parseDate(val) {
  if (!val) return new Date(NaN);
  if (Array.isArray(val)) {
    const [y, mo, d, h = 0, min = 0, s = 0] = val;
    return new Date(y, mo - 1, d, h, min, s);
  }
  return new Date(val);
}

function isAllDay(ev) {
  const s = parseDate(ev.start);
  const e = parseDate(ev.end);
  return (
    s.getHours() === 0 && s.getMinutes() === 0 && s.getSeconds() === 0 &&
    (e - s) >= 23 * 3600 * 1000
  );
}

function isSameDay(a, b) {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth()    === b.getMonth()    &&
    a.getDate()     === b.getDate()
  );
}

function getMonday(d) {
  const date = new Date(d);
  const day  = date.getDay();
  date.setDate(date.getDate() + (day === 0 ? -6 : 1 - day));
  date.setHours(0, 0, 0, 0);
  return date;
}

function getISOWeek(date) {
  const d      = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const dayNum = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  return Math.ceil((((d - yearStart) / 86400000) + 1) / 7);
}

// Returns an array of week arrays covering the full month grid (Mon-Sun rows).
function getMonthGrid(date) {
  const year     = date.getFullYear();
  const month    = date.getMonth();
  const firstDay = new Date(year, month, 1);
  const lastDay  = new Date(year, month + 1, 0);
  const cur      = getMonday(firstDay);
  const days     = [];
  while (cur <= lastDay || days.length % 7 !== 0) {
    days.push(new Date(cur));
    cur.setDate(cur.getDate() + 1);
  }
  const weeks = [];
  for (let i = 0; i < days.length; i += 7) weeks.push(days.slice(i, i + 7));
  return weeks;
}

// Groups overlapping timed events into columns so they render side-by-side.
function positionEvents(dayEvents) {
  const sorted = [...dayEvents].sort((a, b) => parseDate(a.start) - parseDate(b.start));
  const groups = [];
  for (const ev of sorted) {
    const evStart = parseDate(ev.start).getTime();
    const evEnd   = parseDate(ev.end).getTime();
    let placed = false;
    for (const group of groups) {
      const groupEnd = Math.max(...group.map((g) => parseDate(g.end).getTime()));
      if (evStart < groupEnd) { group.push(ev); placed = true; break; }
    }
    if (!placed) groups.push([ev]);
  }
  const positioned = [];
  for (const group of groups) {
    const cols = group.length;
    group.forEach((ev, idx) => {
      const s  = parseDate(ev.start);
      const e  = parseDate(ev.end);
      const sh = s.getHours() + s.getMinutes() / 60;
      const eh = e.getHours() + e.getMinutes() / 60;
      positioned.push({
        ...ev,
        top:      sh * SLOT_HEIGHT,
        height:   Math.max((eh - sh) * SLOT_HEIGHT, 20),
        widthPct: 100 / cols,
        leftPct:  idx * (100 / cols),
      });
    });
  }
  return positioned;
}

/* ── main component ─────────────────────────────────────────── */

export default function WeeklyCalendar({
  view = "week",
  currentDate,
  events = [],
  selectedCalendar,
  calendarColors = {},
  onPrev,
  onNext,
  onToday,
}) {
  const today     = new Date();
  const [now, setNow] = useState(new Date());
  const [scrollbarWidth, setScrollbarWidth] = useState(0);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const scrollRef = useRef(null);

  const openEvent = useCallback((ev) => setSelectedEvent(ev), []);
  const closeEvent = useCallback(() => setSelectedEvent(null), []);

  // Keep the current-time line accurate
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 60_000);
    return () => clearInterval(id);
  }, []);

  // Auto-scroll to 07:00 whenever a time-based view is shown, and
  // measure the actual scrollbar width so header spacers stay aligned.
  useEffect(() => {
    if (view !== "month" && scrollRef.current) {
      scrollRef.current.scrollTop = 7 * SLOT_HEIGHT;
      setScrollbarWidth(scrollRef.current.offsetWidth - scrollRef.current.clientWidth);
    }
  }, [view]);

  /* ── derived display data ── */

  const evColor = (ev) => calendarColors[ev.calendarName] || "#1a73e8";

  const monday = getMonday(currentDate);

  // Columns to display in day / week views
  const days =
    view === "day"
      ? [new Date(currentDate)]
      : Array.from({ length: 7 }, (_, i) => {
          const d = new Date(monday);
          d.setDate(d.getDate() + i);
          return d;
        });

  const filteredEvents = events.filter(
    (ev) => selectedCalendar === "all" || ev.calendarName === selectedCalendar
  );
  const allDayEvents = filteredEvents.filter(isAllDay);
  const timedEvents  = filteredEvents.filter((ev) => !isAllDay(ev));

  const nowTop          = (now.getHours() + now.getMinutes() / 60) * SLOT_HEIGHT;
  const isCurrentPeriod = view !== "month" && days.some((d) => isSameDay(d, today));

  // Navigation bar label
  let navLabel;
  if (view === "day") {
    navLabel = currentDate.toLocaleDateString("en-GB", {
      weekday: "long", day: "numeric", month: "long", year: "numeric",
    });
  } else if (view === "week") {
    navLabel =
      `${days[0].toLocaleDateString("en-GB", { day: "numeric", month: "short" })} – ` +
      `${days[6].toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}`;
  } else {
    navLabel = currentDate.toLocaleDateString("en-GB", { month: "long", year: "numeric" });
  }

  const monthGrid = view === "month" ? getMonthGrid(currentDate) : null;

  // Agenda list: events from today onwards, grouped by date, all-day first within each day.
  const agendaDays = (() => {
    if (view !== "events") return [];
    const todayMidnight = new Date(today);
    todayMidnight.setHours(0, 0, 0, 0);
    const map = new Map();
    filteredEvents.forEach((ev) => {
      const d = parseDate(ev.start);
      if (isNaN(d)) return;
      d.setHours(0, 0, 0, 0);
      if (d < todayMidnight) return; // skip past events
      const key = d.toDateString();
      if (!map.has(key)) map.set(key, { date: new Date(d), items: [] });
      map.get(key).items.push(ev);
    });
    return [...map.values()]
      .sort((a, b) => a.date - b.date)
      .map(({ date, items }) => ({
        date,
        items: items.slice().sort((a, b) => {
          const aAD = isAllDay(a), bAD = isAllDay(b);
          if (aAD !== bAD) return aAD ? -1 : 1;
          return parseDate(a.start) - parseDate(b.start);
        }),
      }));
  })();

  /* ── render ── */
  return (
    <div className="h-full flex flex-col">

      {/* ── Navigation bar — hidden for Events view ── */}
      {view !== "events" && (
        <div className="flex items-center gap-2 px-4 py-2.5 border-b border-surface-divider flex-shrink-0">
          <button
            onClick={onPrev}
            className="p-1.5 rounded hover:bg-surface-section transition-colors text-dark-muted hover:text-dark"
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M10 12L6 8l4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>

          <span className="text-sm font-medium text-dark-secondary flex-1 text-center select-none">
            {navLabel}
          </span>

          <button
            onClick={onNext}
            className="p-1.5 rounded hover:bg-surface-section transition-colors text-dark-muted hover:text-dark"
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M6 12l4-4-4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>

          {view === "week" && (
            <span className="text-xs font-semibold text-primary bg-primary-light px-2 py-0.5 rounded-badge">
              W{getISOWeek(monday)}
            </span>
          )}
        </div>
      )}

      {/* ════════════════════════════════════════════════════════
          EVENTS / AGENDA VIEW
          ════════════════════════════════════════════════════════ */}
      {view === "events" && (
        <div className="flex-1 min-h-0 overflow-y-auto px-4 py-3">
          {agendaDays.length === 0 ? (
            <p className="text-sm text-dark-muted text-center py-10">No upcoming events.</p>
          ) : (
            agendaDays.map(({ date, items }) => {
              const isToday_ = isSameDay(date, today);
              const dateLabel = isToday_
                ? "Today"
                : date.toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long", year: "numeric" });

              return (
                <div key={date.toDateString()} className="mb-5">
                  {/* Date header */}
                  <p className={`text-[11px] font-semibold uppercase tracking-wide mb-2 ${isToday_ ? "text-primary" : "text-dark-muted"}`}>
                    {dateLabel}
                  </p>

                  <div className="flex flex-col gap-1.5">
                    {items.map((ev) => {
                      const hex = evColor(ev);
                      if (isAllDay(ev)) {
                        return (
                          <div key={ev.id} onClick={() => openEvent(ev)} className="rounded-lg px-3 py-2 cursor-pointer hover:opacity-80 transition-opacity" style={{ backgroundColor: hex + "22" }}>
                            <p className="text-xs font-medium text-dark leading-snug">{ev.title}</p>
                            <p className="text-[11px] mt-0.5" style={{ color: hex }}>{ev.calendarName}</p>
                          </div>
                        );
                      }
                      const start = parseDate(ev.start);
                      const timeStr = start.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" });
                      return (
                        <div key={ev.id} onClick={() => openEvent(ev)} className="flex items-start gap-2.5 py-1 cursor-pointer hover:opacity-70 transition-opacity">
                          <div className="w-2 h-2 rounded-full mt-1 flex-shrink-0" style={{ backgroundColor: hex }} />
                          <span className="text-[11px] font-mono text-dark-muted w-9 flex-shrink-0 pt-px">{timeStr}</span>
                          <div>
                            <p className="text-xs font-semibold text-dark leading-snug">{ev.title}</p>
                            <p className="text-[11px] text-dark-muted mt-0.5">{ev.calendarName}</p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}

      {/* ════════════════════════════════════════════════════════
          MONTH VIEW
          ════════════════════════════════════════════════════════ */}
      {view === "month" && monthGrid && (
        <div className="flex flex-col flex-1 min-h-0">
          {/* Weekday column headers */}
          <div className="flex flex-shrink-0 border-b border-surface-divider">
            {DAY_LABELS.map((label) => (
              <div
                key={label}
                className="flex-1 py-1.5 text-center text-[10px] font-semibold text-dark-muted uppercase tracking-wide border-l border-surface-divider first:border-l-0"
              >
                {label}
              </div>
            ))}
          </div>

          {/* Week rows */}
          {monthGrid.map((week, wi) => (
            <div key={wi} className="flex flex-1 min-h-0 border-b border-surface-divider last:border-b-0">
              {week.map((day, di) => {
                const isToday     = isSameDay(day, today);
                const isThisMonth = day.getMonth() === currentDate.getMonth();
                const dayAllDay   = allDayEvents.filter((ev) => isSameDay(parseDate(ev.start), day));
                const dayTimed    = timedEvents.filter((ev) => isSameDay(parseDate(ev.start), day));

                return (
                  <div
                    key={di}
                    className="flex-1 min-w-0 border-l border-surface-divider first:border-l-0 p-1 flex flex-col gap-0.5"
                    style={{ backgroundColor: isToday ? "#EBF3FE" : undefined }}
                  >
                    {/* Day number */}
                    <span
                      className={`text-[11px] font-semibold leading-none mb-0.5 ${
                        isToday
                          ? "text-primary"
                          : isThisMonth
                            ? "text-dark-secondary"
                            : "text-dark-subtle opacity-40"
                      }`}
                    >
                      {day.getDate()}
                    </span>

                    {/* All-day event pills */}
                    {dayAllDay.map((ev) => (
                      <div
                        key={ev.id}
                        onClick={() => openEvent(ev)}
                        className="text-[9px] font-semibold truncate rounded-sm px-1 py-px text-white cursor-pointer hover:opacity-80 transition-opacity"
                        style={{ backgroundColor: evColor(ev) }}
                      >
                        {ev.title}
                      </div>
                    ))}

                    {/* Timed events (up to 3, then overflow count) */}
                    {dayTimed.slice(0, 3).map((ev) => (
                      <div
                        key={ev.id}
                        onClick={() => openEvent(ev)}
                        className="text-[9px] font-medium truncate rounded-sm px-1 py-px cursor-pointer hover:opacity-80 transition-opacity"
                        style={{
                          borderLeft:      `2px solid ${evColor(ev)}`,
                          color:           evColor(ev),
                          backgroundColor: evColor(ev) + "22",
                        }}
                      >
                        {ev.title}
                      </div>
                    ))}
                    {dayTimed.length > 3 && (
                      <span className="text-[9px] text-dark-muted">+{dayTimed.length - 3} more</span>
                    )}
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      )}

      {/* ════════════════════════════════════════════════════════
          DAY / WEEK TIME-GRID VIEW
          ════════════════════════════════════════════════════════ */}
      {view !== "month" && view !== "events" && (
        <div className="flex flex-col flex-1 min-h-0">

          {/* Day-column headers */}
          <div className="flex flex-shrink-0 border-b border-surface-divider">
            <div className="w-12 flex-shrink-0" />
            <div className="flex flex-1 min-w-0">
              {days.map((day, di) => {
                const isToday = isSameDay(day, today);
                return (
                  <div
                    key={di}
                    className="flex-1 min-w-0 border-l border-surface-divider h-9 flex flex-col items-center justify-center text-[10px]"
                    style={{ backgroundColor: isToday ? "#EBF3FE" : undefined }}
                  >
                    <span className="font-medium text-dark-muted">
                      {day.toLocaleDateString("en-GB", { weekday: "short" })}
                    </span>
                    <span className={`font-semibold ${isToday ? "text-primary" : "text-dark-secondary"}`}>
                      {day.getDate()}
                    </span>
                  </div>
                );
              })}
            </div>
            {/* Scrollbar gutter spacer — keeps header columns aligned with the scrollable grid */}
            <div style={{ width: scrollbarWidth, flexShrink: 0 }} />
          </div>

          {/* All-day strip — only shown when there are all-day events */}
          {allDayEvents.length > 0 && (
            <div className="flex flex-shrink-0 border-b border-surface-divider">
              <div className="w-12 flex-shrink-0 flex items-center justify-end pr-2 py-1">
                <span className="text-[9px] text-dark-subtle leading-none">All day</span>
              </div>
              <div className="flex flex-1 min-w-0">
                {days.map((day, di) => {
                  const isToday   = isSameDay(day, today);
                  const dayAllDay = allDayEvents.filter((ev) => isSameDay(parseDate(ev.start), day));
                  return (
                    <div
                      key={di}
                      className="flex-1 min-w-0 border-l border-surface-divider py-0.5 px-0.5 flex flex-col gap-0.5 min-h-[22px]"
                      style={{ backgroundColor: isToday ? "#EBF3FE" : undefined }}
                    >
                      {dayAllDay.map((ev) => (
                        <div
                          key={ev.id}
                          onClick={() => openEvent(ev)}
                          className="text-[9px] font-semibold truncate rounded-sm px-1 py-px text-white w-full cursor-pointer hover:opacity-80 transition-opacity"
                          style={{ backgroundColor: evColor(ev) }}
                        >
                          {ev.title}
                        </div>
                      ))}
                    </div>
                  );
                })}
              </div>
              {/* Scrollbar gutter spacer */}
              <div style={{ width: scrollbarWidth, flexShrink: 0 }} />
            </div>
          )}

          {/* ── Scrollable 24-hour grid ── */}
          {/* min-h-0 is critical: without it flex-1 won't constrain height and overflow-y-auto won't scroll */}
          <div ref={scrollRef} className="overflow-y-auto flex-1 min-h-0">
            <div className="flex">

              {/* Hour gutter */}
              <div className="w-12 flex-shrink-0 flex-none">
                {HOURS.map((h) => (
                  <div
                    key={h}
                    style={{ height: SLOT_HEIGHT }}
                    className="flex items-start pr-2 justify-end pt-px"
                  >
                    <span className="text-[10px] text-dark-subtle leading-none">
                      {String(h).padStart(2, "0")}:00
                    </span>
                  </div>
                ))}
              </div>

              {/* Day columns — position:relative wrapper lets the now-line span all of them */}
              <div className="flex flex-1 min-w-0 relative">

                {/* Current-time indicator */}
                {isCurrentPeriod && (
                  <div
                    className="absolute left-0 right-0 z-20 pointer-events-none flex items-center"
                    style={{ top: nowTop }}
                  >
                    <div className="w-2 h-2 rounded-full bg-red-500 flex-shrink-0 -ml-1" />
                    <div className="flex-1 border-t border-red-500" />
                  </div>
                )}

                {days.map((day, di) => {
                  const isToday    = isSameDay(day, today);
                  const dayEvs     = timedEvents.filter((ev) => isSameDay(parseDate(ev.start), day));
                  const positioned = positionEvents(dayEvs);

                  return (
                    <div
                      key={di}
                      className="flex-1 min-w-0 border-l border-surface-divider"
                      style={{ backgroundColor: isToday ? "#EBF3FE" : undefined }}
                    >
                      <div className="relative">
                        {HOURS.map((h) => (
                          <div
                            key={h}
                            style={{ height: SLOT_HEIGHT }}
                            className="border-b border-surface-divider/50"
                          />
                        ))}
                        {positioned.map((ev) => (
                          <CalendarEvent
                            key={ev.id}
                            event={ev}
                            color={evColor(ev)}
                            onClick={() => openEvent(ev)}
                            style={{
                              top:    ev.top,
                              height: ev.height,
                              left:   `${ev.leftPct}%`,
                              width:  `${ev.widthPct}%`,
                              zIndex: 1,
                            }}
                          />
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>

            </div>
          </div>
        </div>
      )}

      {/* ── Event detail modal ── */}
      {selectedEvent && (() => {
        const ev = selectedEvent;
        const hex = evColor(ev);
        const allDay = isAllDay(ev);
        const start = parseDate(ev.start);
        const end   = parseDate(ev.end);
        const dateStr = start.toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long", year: "numeric" });
        const startTime = start.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" });
        const endTime   = end.toLocaleTimeString("en-GB",   { hour: "2-digit", minute: "2-digit" });
        return (
          <div className="fixed inset-0 z-50 flex items-center justify-center" onClick={closeEvent}>
            {/* Backdrop */}
            <div className="absolute inset-0 bg-black/40" />
            {/* Card */}
            <div
              className="relative bg-white rounded-2xl shadow-2xl w-full max-w-sm mx-4 overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Colour bar */}
              <div className="h-1.5 w-full" style={{ backgroundColor: hex }} />
              <div className="p-5">
                {/* Close */}
                <button
                  onClick={closeEvent}
                  className="absolute top-3 right-3 text-dark-muted hover:text-dark transition-colors text-lg leading-none"
                  aria-label="Close"
                >
                  ×
                </button>

                {/* Title */}
                <h3 className="text-base font-semibold text-dark pr-6 leading-snug mb-4">{ev.title}</h3>

                <div className="flex flex-col gap-2.5 text-sm">
                  {/* Date */}
                  <div className="flex items-start gap-2.5">
                    <span className="text-dark-muted w-16 flex-shrink-0 text-xs pt-px">Date</span>
                    <span className="text-dark text-xs">{dateStr}</span>
                  </div>
                  {/* Time */}
                  <div className="flex items-start gap-2.5">
                    <span className="text-dark-muted w-16 flex-shrink-0 text-xs pt-px">Time</span>
                    <span className="text-dark text-xs">
                      {allDay ? "All day" : `${startTime} – ${endTime}`}
                    </span>
                  </div>
                  {/* Calendar */}
                  <div className="flex items-start gap-2.5">
                    <span className="text-dark-muted w-16 flex-shrink-0 text-xs pt-px">Calendar</span>
                    <span className="text-xs font-medium" style={{ color: hex }}>{ev.calendarName}</span>
                  </div>
                  {/* Overlap warning */}
                  {ev.isOverlapping && (
                    <div className="mt-1 rounded-lg px-3 py-2 text-xs" style={{ background: "#FEF3E1", border: "1px solid #F5C460", color: "#AA6D0D" }}>
                      This event overlaps with another event in your calendar.
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        );
      })()}

    </div>
  );
}
