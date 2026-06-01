import { useState, useEffect } from "react";
import { useParams, useSearchParams, useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { getById } from "../services/moduleService";
import { addModule, removeModule, getStatus } from "../services/plannerService";
import Badge from "../components/common/Badge";
import PdfViewerModal from "../components/common/PdfViewerModal";

const FIELDS = [
  { key: "title",         label: "Module Name" },
  { key: "description",   label: "Description" },
  { key: "moduleType",    label: "Module Type" },
  { key: "credits",       label: "Credits (ECTS)" },
  { key: "campus",        label: "Campus" },
  { key: "semester",      label: "Semester" },
  { key: "lecturerName",  label: "Lecturer" },
  { key: "lecturerEmail", label: "Lecturer Email" },
];

function ReadOnlyField({ label, value, isBadge, preWrap }) {
  return (
    <div className="bg-white border border-surface-border rounded-card px-4 py-4">
      <span className="text-xs font-medium text-dark-muted uppercase tracking-wide block mb-2">
        {label}
      </span>
      <span className={`text-sm text-dark-secondary${preWrap ? " whitespace-pre-wrap" : ""}`}>
        {isBadge ? <Badge type={value} /> : (value || "—")}
      </span>
    </div>
  );
}

export default function StudentModuleDetailPage() {
  const { id } = useParams();
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  const [module, setModule] = useState(null);
  const [inPlanner, setInPlanner] = useState(false);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPdf, setShowPdf] = useState(false);

  const fromPlanner = params.get("from") === "planner";
  const backTo = fromPlanner ? "/dashboard" : "/modules";
  const backLabel = fromPlanner ? "Back to My Planner" : "Back to Catalog";

  useEffect(() => {
    const fetches = isAuthenticated
      ? Promise.all([getById(id), getStatus(id).catch(() => ({ inPlanner: false }))])
      : getById(id).then((mod) => [mod, { inPlanner: false }]);
    fetches
      .then(([mod, status]) => {
        setModule(mod);
        setInPlanner(status?.inPlanner ?? false);
      })
      .catch(() => setError("Module not found or server unavailable."))
      .finally(() => setLoading(false));
  }, [id, isAuthenticated]);

  const handleAdd = async () => {
    setActionLoading(true);
    try {
      await addModule(id);
      navigate(backTo);
    } finally {
      setActionLoading(false);
    }
  };

  const handleRemove = async () => {
    setActionLoading(true);
    try {
      await removeModule(id);
      navigate(backTo);
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) return <div className="text-center py-20 text-dark-muted">Loading…</div>;
  if (error) return <div className="text-center py-20 text-danger">{error}</div>;

  return (
    <div className="max-w-screen-lg mx-auto px-6 py-8">
      <Link
        to={backTo}
        className="inline-flex items-center gap-1 text-primary text-sm font-medium hover:text-primary-dark transition-colors mb-4"
      >
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
          <path d="M10 12L6 8L10 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        {backLabel}
      </Link>

      <div className="relative flex items-center justify-center mb-6">
        <button
          onClick={() => setShowPdf(true)}
          className="absolute left-0 px-4 py-2 bg-primary text-white text-sm font-semibold rounded-button hover:bg-primary-dark transition-colors"
        >
          Official Description
        </button>
        <h1 className="text-2xl font-bold text-dark">Module Detail</h1>
        {!isAuthenticated ? (
          <Link
            to="/login"
            className="absolute right-0 px-4 py-2 bg-primary text-white text-sm font-semibold rounded-button hover:bg-primary-dark transition-colors"
          >
            Login to add
          </Link>
        ) : inPlanner ? (
          <button
            onClick={handleRemove}
            disabled={actionLoading}
            className="absolute right-0 px-4 py-2 bg-danger text-white text-sm font-semibold rounded-button hover:bg-red-700 transition-colors disabled:opacity-60"
          >
            {actionLoading ? "Removing…" : "Remove Module"}
          </button>
        ) : (
          <button
            onClick={handleAdd}
            disabled={actionLoading}
            className="absolute right-0 px-4 py-2 bg-primary text-white text-sm font-semibold rounded-button hover:bg-primary-dark transition-colors disabled:opacity-60"
          >
            {actionLoading ? "Adding…" : "Add Module"}
          </button>
        )}
      </div>

      <div className="flex flex-col gap-3">
        {FIELDS.map(({ key, label }) => (
          <ReadOnlyField
            key={key}
            label={label}
            value={module[key] ?? ""}
            isBadge={key === "moduleType"}
            preWrap={key === "description"}
          />
        ))}
      </div>

      {showPdf && module && (
        <PdfViewerModal
          pdfUrl={`/api/modules/${module.moduleID}/pdf`}
          title={`${module.title} — Official Description`}
          onClose={() => setShowPdf(false)}
        />
      )}
    </div>
  );
}
