import { useState, useEffect } from "react";
import PdfViewerModal from "./PdfViewerModal";

function getAuthHeaders() {
  const stored = localStorage.getItem("auth_credentials");
  if (!stored) return {};
  try {
    const { email, password } = JSON.parse(atob(stored));
    return { Authorization: "Basic " + btoa(`${email}:${password}`) };
  } catch { return {}; }
}

export default function ProgrammeDocsModal({ isAdmin, onClose }) {
  const [sections, setSections] = useState([]);
  const [viewingPdf, setViewingPdf] = useState(null); // { url, title }
  const [uploading, setUploading] = useState({}); // { section: bool }
  const [uploadErrors, setUploadErrors] = useState({});
  const [deleteConfirm, setDeleteConfirm] = useState(null); // { section, filename }

  useEffect(() => {
    fetch("/api/programme-docs")
      .then(r => r.ok ? r.json() : [])
      .then(setSections)
      .catch(() => setSections([]));
  }, []);

  const openFile = async (section, filename) => {
    if (filename.toLowerCase().endsWith(".pdf")) {
      const res = await fetch(`/api/programme-docs/${section}/${encodeURIComponent(filename)}`);
      if (!res.ok) return;
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      setViewingPdf({ url, title: filename });
    } else {
      const a = document.createElement("a");
      a.href = `/api/programme-docs/${section}/${encodeURIComponent(filename)}`;
      a.download = filename;
      a.click();
    }
  };

  const handleUpload = async (section, file) => {
    if (!file) return;
    setUploading(p => ({ ...p, [section]: true }));
    setUploadErrors(p => { const n = { ...p }; delete n[section]; return n; });
    const formData = new FormData();
    formData.append("file", file);
    try {
      const res = await fetch(`/api/programme-docs/${section}`, {
        method: "POST",
        headers: getAuthHeaders(),
        body: formData,
      });
      if (res.ok || res.status === 201) {
        const updated = await fetch("/api/programme-docs").then(r => r.json());
        setSections(updated);
      } else {
        setUploadErrors(p => ({ ...p, [section]: "Upload failed." }));
      }
    } catch {
      setUploadErrors(p => ({ ...p, [section]: "Upload failed." }));
    } finally {
      setUploading(p => ({ ...p, [section]: false }));
    }
  };

  const handleDelete = async (section, filename) => {
    setDeleteConfirm(null);
    const res = await fetch(`/api/programme-docs/${section}/${encodeURIComponent(filename)}`, {
      method: "DELETE",
      headers: getAuthHeaders(),
    });
    if (res.ok || res.status === 204) {
      const updated = await fetch("/api/programme-docs").then(r => r.json());
      setSections(updated);
    }
  };

  return (
    <>
      {viewingPdf && (
        <PdfViewerModal
          pdfUrl={viewingPdf.url}
          title={viewingPdf.title}
          onClose={() => { URL.revokeObjectURL(viewingPdf.url); setViewingPdf(null); }}
        />
      )}

      <div
        className="fixed inset-0 z-50 flex items-center justify-center"
        style={{ backgroundColor: "rgba(0,0,0,0.6)" }}
        onClick={onClose}
      >
        <div
          className="bg-white rounded-card shadow-modal flex flex-col overflow-hidden"
          style={{ width: "min(680px, 95vw)", maxHeight: "85vh" }}
          onClick={e => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-5 py-4 border-b border-surface-border flex-shrink-0">
            <div>
              <h2 className="text-base font-semibold text-dark">BIT Programme Resources</h2>
              <p className="text-xs text-dark-muted mt-0.5">Official FHNW documents for the BIT programme</p>
            </div>
            <button
              onClick={onClose}
              className="w-7 h-7 flex items-center justify-center rounded-full hover:bg-surface-section text-dark-muted hover:text-dark transition-colors"
            >
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                <path d="M1 1l12 12M13 1L1 13" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round"/>
              </svg>
            </button>
          </div>

          {/* Sections */}
          <div className="overflow-y-auto flex-1 px-5 py-4 flex flex-col gap-5">
            {sections.length === 0 && (
              <p className="text-sm text-dark-muted text-center py-8">No documents available.</p>
            )}
            {sections.map(sec => (
              <div key={sec.section}>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-semibold text-dark uppercase tracking-wide">
                    {sec.displayName}
                  </span>
                  {isAdmin && (
                    <label className="cursor-pointer text-xs text-primary font-medium hover:text-primary-dark transition-colors">
                      + Add file
                      <input
                        type="file"
                        accept=".pdf,.docx,.doc"
                        className="hidden"
                        disabled={uploading[sec.section]}
                        onChange={e => { handleUpload(sec.section, e.target.files[0]); e.target.value = ""; }}
                      />
                    </label>
                  )}
                </div>
                {uploadErrors[sec.section] && (
                  <p className="text-xs text-danger mb-1">{uploadErrors[sec.section]}</p>
                )}
                {uploading[sec.section] && (
                  <p className="text-xs text-dark-muted mb-1">Uploading...</p>
                )}
                {sec.files.length === 0 ? (
                  <p className="text-xs text-dark-subtle italic">No documents in this section.</p>
                ) : (
                  <div className="flex flex-col gap-1">
                    {sec.files.map(filename => (
                      <div
                        key={filename}
                        className="flex items-center gap-2 px-3 py-2 bg-surface-section rounded-input border border-surface-border"
                      >
                        <svg width="13" height="13" viewBox="0 0 16 16" fill="none" className="flex-shrink-0 text-dark-muted">
                          <path d="M3 2h7l3 3v9a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1V3a1 1 0 0 1 1-1z" stroke="currentColor" strokeWidth="1.2" strokeLinejoin="round"/>
                          <path d="M10 2v3h3" stroke="currentColor" strokeWidth="1.2" strokeLinejoin="round"/>
                        </svg>
                        <button
                          onClick={() => openFile(sec.section, filename)}
                          className="text-xs text-primary hover:underline flex-1 text-left truncate"
                        >
                          {filename}
                        </button>
                        {filename.toLowerCase().endsWith(".docx") && (
                          <span className="text-xs text-dark-muted flex-shrink-0">DOCX</span>
                        )}
                        {isAdmin && (
                          deleteConfirm?.section === sec.section && deleteConfirm?.filename === filename ? (
                            <div className="flex items-center gap-1 flex-shrink-0">
                              <button
                                onClick={() => handleDelete(sec.section, filename)}
                                className="text-xs text-white bg-danger px-2 py-0.5 rounded hover:bg-red-700 transition-colors"
                              >Yes</button>
                              <button
                                onClick={() => setDeleteConfirm(null)}
                                className="text-xs text-dark-muted px-2 py-0.5 border border-surface-border rounded hover:text-dark transition-colors"
                              >No</button>
                            </div>
                          ) : (
                            <button
                              onClick={() => setDeleteConfirm({ section: sec.section, filename })}
                              className="flex-shrink-0 text-danger/50 hover:text-danger transition-colors"
                              aria-label={`Delete ${filename}`}
                            >
                              <svg width="13" height="13" viewBox="0 0 16 16" fill="none">
                                <path d="M2 4h12M5 4V2h6v2M3 4l1 9a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1l1-9" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
                              </svg>
                            </button>
                          )
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
