import { Link } from "react-router-dom";

export default function PageHeader({ backTo, backLabel, title }) {
  return (
    <div className="mb-6">
      {backTo && (
        <Link
          to={backTo}
          className="inline-flex items-center gap-1 text-primary text-sm font-medium hover:text-primary-dark transition-colors mb-3"
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path d="M10 12L6 8L10 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          {backLabel}
        </Link>
      )}
      <h1 className="text-2xl font-semibold text-dark">{title}</h1>
    </div>
  );
}
