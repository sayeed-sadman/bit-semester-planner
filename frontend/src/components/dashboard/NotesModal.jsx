import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getNote, saveNote, deleteNote } from "../../services/noteService";
import ConfirmModal from "../common/ConfirmModal";

export default function NotesModal({ module, onClose }) {
  const navigate = useNavigate();
  const [note, setNote] = useState(null);
  const [draft, setDraft] = useState("");
  const [mode, setMode] = useState("empty"); // "view" | "edit" | "empty"
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  useEffect(() => {
    if (!module) return;
    setLoading(true);
    getNote(module.id)
      .then((data) => {
        if (data && data.content) {
          setNote(data);
          setDraft(data.content);
          setMode("view");
        } else {
          setMode("empty");
        }
      })
      .catch(() => setMode("empty"))
      .finally(() => setLoading(false));
  }, [module]);

  const handleSave = async () => {
    setSaving(true);
    try {
      const saved = await saveNote(module.id, draft);
      setNote(saved);
      setMode("view");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    await deleteNote(module.id);
    setNote(null);
    setDraft("");
    setMode("empty");
    setShowDeleteConfirm(false);
  };

  if (!module) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={onClose}>
      <div
        className="bg-white rounded-modal w-full max-w-lg mx-4 overflow-hidden flex flex-col"
        style={{ boxShadow: "0 12px 40px rgba(12, 18, 41, 0.2)" }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-start justify-between p-6 border-b border-surface-divider">
          <div>
            <h3 className="text-base font-semibold text-dark">{module.title}</h3>
            <p className="text-sm text-dark-muted mt-0.5">{module.lecturerName} · {module.lecturerEmail}</p>
          </div>
          <div className="flex items-center gap-1 ml-4">
            <button
              onClick={() => navigate(`/notes/${module.id}`)}
              className="text-dark-muted hover:text-dark transition-colors p-0.5"
              title="Open full page"
            >
              <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                <path d="M2.5 6.5V2.5H6.5M11.5 2.5H15.5V6.5M15.5 11.5V15.5H11.5M6.5 15.5H2.5V11.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
            <button onClick={onClose} className="text-dark-muted hover:text-dark transition-colors p-0.5">
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                <path d="M15 5L5 15M5 5l10 10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="p-6">
          {loading ? (
            <div className="text-center text-dark-muted text-sm py-6">Loading…</div>
          ) : (
            <div>
              <div className="flex items-center justify-between mb-3">
                <label className="text-sm font-medium text-dark-secondary">
                  {mode === "edit" ? "My Note (Editing)" : "My Note"}
                </label>
              </div>

              {mode === "view" && (
                <div
                  className="text-sm text-dark-secondary bg-surface-section rounded-input p-3 overflow-y-auto whitespace-pre-wrap"
                  style={{ height: 192 }}
                >
                  {note.content}
                </div>
              )}

              {(mode === "edit" || mode === "empty") && (
                <textarea
                  value={draft}
                  onChange={(e) => setDraft(e.target.value)}
                  placeholder="Write your notes here..."
                  className={`w-full px-3 py-2.5 rounded-input border text-sm text-dark placeholder-dark-subtle focus:outline-none focus:ring-2 resize-none overflow-y-auto ${
                    mode === "edit" ? "border-primary focus:ring-primary/30" : "border-surface-border focus:border-primary focus:ring-primary/30"
                  }`}
                  style={{ height: 192 }}
                />
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        {!loading && (
          <div className="flex justify-end gap-3 px-6 pb-6">
            {mode === "view" && (
              <>
                <button
                  onClick={() => setShowDeleteConfirm(true)}
                  className="px-4 py-2 border border-danger-border text-danger text-sm font-medium rounded-button hover:bg-danger-light transition-colors"
                >
                  Delete Note
                </button>
                <button
                  onClick={() => setMode("edit")}
                  className="px-4 py-2 bg-primary text-white text-sm font-semibold rounded-button hover:bg-primary-dark transition-colors"
                >
                  Edit Note
                </button>
              </>
            )}
            {mode === "edit" && (
              <>
                <button
                  onClick={() => setShowDeleteConfirm(true)}
                  className="px-4 py-2 border border-danger-border text-danger text-sm font-medium rounded-button hover:bg-danger-light transition-colors"
                >
                  Delete Note
                </button>
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="px-4 py-2 bg-success text-white text-sm font-semibold rounded-button hover:bg-success-dark transition-colors disabled:opacity-60"
                >
                  {saving ? "Saving…" : "Save Note"}
                </button>
              </>
            )}
            {mode === "empty" && (
              <button
                onClick={handleSave}
                disabled={saving || !draft.trim()}
                className="px-4 py-2 bg-primary text-white text-sm font-semibold rounded-button hover:bg-primary-dark transition-colors disabled:opacity-60"
              >
                {saving ? "Saving…" : "Save Note"}
              </button>
            )}
          </div>
        )}
      </div>

      <ConfirmModal
        isOpen={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
        onConfirm={handleDelete}
        title="Delete this note?"
        message="Your note for this module will be permanently deleted."
        confirmText="Yes, Delete"
        confirmVariant="danger"
      />
    </div>
  );
}
