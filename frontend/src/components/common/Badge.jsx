export default function Badge({ type }) {
  const isCompulsory = type === "COMPULSORY";
  return (
    <span
      className={`inline-block px-2.5 py-0.5 rounded-badge text-xs font-medium ${
        isCompulsory
          ? "bg-primary-light text-primary"
          : "bg-success-light text-success-dark"
      }`}
    >
      {isCompulsory ? "Compulsory" : "Elective"}
    </span>
  );
}
