export default function CalendarEvent({ event, color = "#1a73e8", style }) {
  return (
    <div
      className="absolute rounded text-xs overflow-hidden px-1 py-0.5"
      style={{
        backgroundColor: color + "22",
        borderLeft: `3px solid ${color}`,
        color,
        ...style,
      }}
      title={`${event.title}\n${event.calendarName}`}
    >
      <div className="font-medium truncate leading-tight">{event.title}</div>
      <div className="truncate opacity-75 text-[10px]">{event.calendarName}</div>
    </div>
  );
}
