export default function InputField({ label, id, error, className = "", ...props }) {
  return (
    <div className={`flex flex-col gap-1 ${className}`}>
      {label && (
        <label htmlFor={id} className="text-sm font-medium text-dark-secondary">
          {label}
        </label>
      )}
      <input
        id={id}
        className={`w-full px-3 py-2.5 rounded-input border text-sm text-dark placeholder-dark-subtle focus:outline-none focus:ring-2 focus:ring-primary/30 transition-colors ${
          error
            ? "border-danger bg-danger-light focus:border-danger"
            : "border-surface-border bg-white focus:border-primary"
        } disabled:bg-surface-section disabled:text-dark-muted disabled:cursor-not-allowed`}
        {...props}
      />
      {error && <p className="text-xs text-danger mt-0.5">{error}</p>}
    </div>
  );
}
