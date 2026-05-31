export default function CalendarEvent({ event, color = "#1a73e8", style, onClick }) {
  const overlapping = event.isOverlapping;
  return (
    <div
      className="absolute rounded text-xs overflow-hidden px-1 py-0.5 cursor-pointer hover:brightness-95 transition-all"
      style={{
        backgroundColor: overlapping ? "#FFFBEB" : color + "22",
        borderLeft: `3px solid ${overlapping ? "#F59E0B" : color}`,
        color: overlapping ? "#B45309" : color,
        ...style,
      }}
      onClick={onClick}
    >
      <div className="font-medium truncate leading-tight">{event.title}</div>
      <div className="truncate opacity-75 text-[10px]">{event.calendarName}</div>
      {overlapping && <div className="text-[8px] font-bold opacity-80">overlap</div>}
    </div>
  );
}
