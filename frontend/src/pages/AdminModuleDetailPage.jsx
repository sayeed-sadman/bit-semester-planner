import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate, useSearchParams, Link } from "react-router-dom";
import { getById, update, deleteModule } from "../services/moduleService";
import Badge from "../components/common/Badge";
import SuccessBanner from "../components/common/SuccessBanner";
import ConfirmModal from "../components/common/ConfirmModal";

const FIELD_LABELS = {
  title: "Module Name",
  moduleType: "Module Type",
  credits: "Credits (ECTS)",
  campus: "Campus",
  semester: "Semester",
  lecturerName: "Lecturer",
  lecturerEmail: "Lecturer Email",
  description: "Description",
};

function SavedToast({ visible }) {
  return (
    <div
      className={`fixed top-6 right-6 z-50 flex items-center gap-2 bg-success text-white text-sm font-medium px-4 py-3 rounded-card shadow-lg transition-all duration-300 ${
        visible ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-2 pointer-events-none"
      }`}
    >
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
        <path d="M3 8l3.5 3.5L13 4.5" stroke="white" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
      Changes saved successfully.
    </div>
  );
}

function EditableField({ fieldKey, value, onSave, onSaved }) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(value);
  const [loading, setLoading] = useState(false);

  const handleSave = async () => {
    setLoading(true);
    try {
      await onSave(fieldKey, draft);
      setEditing(false);
      onSaved();
    } finally {
      setLoading(false);
    }
  };

  const isTextarea = fieldKey === "description";
  const isSelect = fieldKey === "moduleType";

  return (
    <div className="bg-white border border-surface-border rounded-card px-4 py-4">
      <span className="text-xs font-medium text-dark-muted uppercase tracking-wide block mb-2">
        {FIELD_LABELS[fieldKey]}
      </span>
      {editing ? (
        <div className="flex items-start gap-2">
          {isTextarea ? (
            <textarea
              rows={3}
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              className="flex-1 px-3 py-2 rounded-input border border-primary text-sm text-dark focus:outline-none focus:ring-2 focus:ring-primary/30 resize-none"
            />
          ) : isSelect ? (
            <select
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              className="flex-1 px-3 py-2 rounded-input border border-primary text-sm text-dark focus:outline-none focus:ring-2 focus:ring-primary/30"
            >
              <option value="COMPULSORY">Compulsory</option>
              <option value="ELECTIVE">Elective</option>
            </select>
          ) : (
            <input
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              className="flex-1 px-3 py-2 rounded-input border border-primary text-sm text-dark focus:outline-none focus:ring-2 focus:ring-primary/30"
            />
          )}
          <button
            onClick={handleSave}
            disabled={loading}
            className="px-3 py-1.5 bg-primary text-white text-xs font-medium rounded-input hover:bg-primary-dark transition-colors disabled:opacity-60"
          >
            Save
          </button>
          <button
            onClick={() => { setEditing(false); setDraft(value); }}
            className="px-3 py-1.5 border border-surface-border text-dark-secondary text-xs font-medium rounded-input hover:bg-surface-section transition-colors"
          >
            Cancel
          </button>
        </div>
      ) : (
        <div className="flex items-center justify-between gap-4">
          <span className="text-sm text-dark-secondary">
            {fieldKey === "moduleType" ? <Badge type={value} /> : (value || "—")}
          </span>
          <button
            onClick={() => { setEditing(true); setDraft(value); }}
            className="text-primary text-xs font-medium hover:text-primary-dark transition-colors flex-shrink-0"
          >
            Edit
          </button>
        </div>
      )}
    </div>
  );
}

export default function AdminModuleDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [params] = useSearchParams();

  const [module, setModule] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showCreatedBanner, setShowCreatedBanner] = useState(params.get("created") === "true");
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [savedToast, setSavedToast] = useState(false);
  const toastTimerRef = useRef(null);

  useEffect(() => {
    getById(id)
      .then(setModule)
      .catch(() => setError("Module not found or server unavailable."))
      .finally(() => setLoading(false));
  }, [id]);

  useEffect(() => {
    return () => { if (toastTimerRef.current) clearTimeout(toastTimerRef.current); };
  }, []);

  const showSavedToast = () => {
    setSavedToast(true);
    if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    toastTimerRef.current = setTimeout(() => setSavedToast(false), 2500);
  };

  const handleSaveField = async (key, value) => {
    const updated = await update(id, { ...module, [key]: value });
    setModule(updated);
  };

  const handleDelete = async () => {
    setDeleteLoading(true);
    try {
      await deleteModule(id);
      navigate("/admin/modules");
    } finally {
      setDeleteLoading(false);
    }
  };

  if (loading) return <div className="text-center py-20 text-dark-muted">Loading…</div>;
  if (error) return <div className="text-center py-20 text-danger">{error}</div>;

  return (
    <div className="max-w-screen-lg mx-auto px-6 py-8">
      <SavedToast visible={savedToast} />

      <Link
        to="/admin/modules"
        className="inline-flex items-center gap-1 text-primary text-sm font-medium hover:text-primary-dark transition-colors mb-4"
      >
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
          <path d="M10 12L6 8L10 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        Back to Catalog
      </Link>

      <div className="relative flex items-center justify-center mb-6">
        <h1 className="text-2xl font-bold text-dark">Module Detail</h1>
        <button
          onClick={() => setShowDeleteModal(true)}
          className="absolute right-0 px-4 py-2 bg-danger text-white text-sm font-semibold rounded-button hover:bg-red-700 transition-colors"
        >
          Delete Module
        </button>
      </div>

      <SuccessBanner
        isVisible={showCreatedBanner}
        message="New module has been added successfully!"
        onDismiss={() => setShowCreatedBanner(false)}
      />

      <div className="flex flex-col gap-3">
        {Object.keys(FIELD_LABELS).map((key) => (
          <EditableField
            key={key}
            fieldKey={key}
            value={module[key] ?? ""}
            onSave={handleSaveField}
            onSaved={showSavedToast}
          />
        ))}
      </div>

      <ConfirmModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={handleDelete}
        title="Delete this module?"
        message="This will permanently remove the module from the catalog. This action cannot be undone."
        confirmText={deleteLoading ? "Deleting…" : "Yes, Delete"}
        confirmVariant="danger"
      />
    </div>
  );
}
