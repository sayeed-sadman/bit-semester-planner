export default function ConfirmModal({ isOpen, onClose, onConfirm, title, message, confirmText, confirmVariant = "danger" }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div
        className="bg-white rounded-modal p-8 w-full max-w-md mx-4"
        style={{ boxShadow: "0 12px 40px rgba(12, 18, 41, 0.2)" }}
      >
        <div className="flex flex-col items-center text-center">
          <div className="w-14 h-14 rounded-full bg-danger-light border-2 border-danger-border flex items-center justify-center mb-4">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path d="M12 9v4M12 17h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"
                stroke="#DC2626" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-dark mb-2">{title}</h3>
          <p className="text-dark-muted text-sm mb-6">{message}</p>

          <div className="flex gap-3 w-full">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-2.5 rounded-button border border-surface-border text-dark-secondary text-sm font-medium hover:bg-surface-section transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={onConfirm}
              className={`flex-1 px-4 py-2.5 rounded-button text-white text-sm font-medium transition-colors ${
                confirmVariant === "danger"
                  ? "bg-danger hover:bg-red-700"
                  : "bg-primary hover:bg-primary-dark"
              }`}
            >
              {confirmText}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
