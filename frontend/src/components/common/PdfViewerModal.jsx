import { useEffect } from "react";

export default function PdfViewerModal({ pdfUrl, title, onClose }) {
  useEffect(() => {
    const onKey = (e) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      style={{ backgroundColor: "rgba(0,0,0,0.75)" }}
      onClick={onClose}
    >
      <div
        className="relative flex flex-col bg-white rounded-card shadow-modal"
        style={{ width: "90vw", height: "90vh" }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-4 py-3 border-b border-surface-border flex-shrink-0">
          <span className="text-sm font-semibold text-dark truncate">{title}</span>
          <button
            onClick={onClose}
            className="ml-4 flex-shrink-0 w-7 h-7 flex items-center justify-center rounded-full hover:bg-surface-section text-dark-muted hover:text-dark transition-colors"
            aria-label="Close"
          >
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path d="M1 1l12 12M13 1L1 13" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" />
            </svg>
          </button>
        </div>
        <iframe
          src={pdfUrl}
          title={title}
          className="flex-1 w-full rounded-b-card"
          style={{ border: "none" }}
        />
      </div>
    </div>
  );
}
