import { useEffect } from "react";

export default function SuccessBanner({ message, isVisible, onDismiss }) {
  useEffect(() => {
    if (!isVisible) return;
    const timer = setTimeout(onDismiss, 5000);
    return () => clearTimeout(timer);
  }, [isVisible, onDismiss]);

  if (!isVisible) return null;

  return (
    <div className="flex items-center gap-3 px-4 py-3 rounded-input border border-success bg-success-light mb-4">
      <div className="flex-shrink-0 w-5 h-5 rounded-full bg-success flex items-center justify-center">
        <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
          <path d="M2 6l3 3 5-5" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </div>
      <p className="flex-1 text-sm font-medium text-success-dark">{message}</p>
      <button
        onClick={onDismiss}
        className="flex-shrink-0 text-success-dark hover:opacity-70 transition-opacity"
      >
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
          <path d="M12 4L4 12M4 4l8 8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
      </button>
    </div>
  );
}
