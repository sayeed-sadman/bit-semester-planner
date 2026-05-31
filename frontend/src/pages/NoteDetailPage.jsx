import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getNote, saveNote, deleteNote } from "../services/noteService";
import { getById } from "../services/moduleService";
import PageHeader from "../components/layout/PageHeader";
import ConfirmModal from "../components/common/ConfirmModal";

export default function NoteDetailPage() {
  const { moduleId } = useParams();
  const navigate = useNavigate();

  const [module, setModule] = useState(null);
  const [content, setContent] = useState("");
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    Promise.all([getById(moduleId), getNote(moduleId)])
      .then(([mod, note]) => {
        setModule(mod);
        setContent(note?.content ?? "");
      })
      .catch(() => setError("Could not load note or module."))
      .finally(() => setLoading(false));
  }, [moduleId]);

  const handleSave = async () => {
    setSaving(true);
    try {
      await saveNote(moduleId, content);
      setEditing(false);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await deleteNote(moduleId);
      navigate("/dashboard");
    } finally {
      setDeleting(false);
    }
  };

  if (loading) return <div className="text-center py-20 text-dark-muted">Loading…</div>;
  if (error) return <div className="text-center py-20 text-danger">{error}</div>;

  return (
    <div className="max-w-screen-md mx-auto px-6 py-8">
      <PageHeader
        backTo="/dashboard"
        backLabel="Back to My Planner"
        title={`${module.title} — My Note`}
      />

      <p className="text-sm text-dark-muted mb-6">
        {module.lecturerName} · {module.lecturerEmail}
      </p>

      <div className="bg-white rounded-card shadow-card p-6 flex flex-col gap-6">
        {editing ? (
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="w-full h-96 px-3 py-2.5 rounded-input border border-primary text-sm text-dark focus:outline-none focus:ring-2 focus:ring-primary/30 resize-none overflow-y-auto"
            placeholder="Write your notes here…"
          />
        ) : (
          <pre className="text-sm text-dark-secondary whitespace-pre-wrap min-h-[24rem] leading-relaxed">
            {content || <span className="text-dark-subtle italic">No note written yet.</span>}
          </pre>
        )}

        <div className="flex items-center justify-between pt-2 border-t border-surface-divider">
          <button
            onClick={() => setShowDeleteConfirm(true)}
            className="px-4 py-2 border border-danger-border text-danger text-sm font-medium rounded-button hover:bg-danger-light transition-colors"
          >
            Delete Note
          </button>
          {editing ? (
            <div className="flex items-center gap-3">
              <button
                onClick={() => setEditing(false)}
                className="px-4 py-2 border border-surface-border text-dark-secondary text-sm font-medium rounded-button hover:bg-surface-section transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                className="px-4 py-2 bg-success text-white text-sm font-semibold rounded-button hover:bg-success-dark transition-colors disabled:opacity-60"
              >
                {saving ? "Saving…" : "Save Note"}
              </button>
            </div>
          ) : (
            <button
              onClick={() => setEditing(true)}
              className="px-4 py-2 bg-primary text-white text-sm font-semibold rounded-button hover:bg-primary-dark transition-colors"
            >
              Edit Note
            </button>
          )}
        </div>
      </div>

      <ConfirmModal
        isOpen={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
        onConfirm={handleDelete}
        title="Delete this note?"
        message="Your note for this module will be permanently deleted."
        confirmText={deleting ? "Deleting…" : "Yes, Delete"}
        confirmVariant="danger"
      />
    </div>
  );
}
