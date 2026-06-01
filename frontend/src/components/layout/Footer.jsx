export default function Footer() {
  return (
    <footer
      className="mt-auto"
      style={{ height: 64, backgroundColor: "#0F172A" }}
    >
      <div className="h-full flex flex-col justify-center px-20">
        <p className="text-[13px] font-normal leading-tight" style={{ color: "#B2BFD1" }}>
          BIT Semester Planner
        </p>
        <p className="text-[13px] font-normal leading-tight" style={{ color: "#B2BFD1" }}>
          FHNW | University of Applied Sciences and Arts Northwestern Switzerland
        </p>
      </div>
    </footer>
  );
}
