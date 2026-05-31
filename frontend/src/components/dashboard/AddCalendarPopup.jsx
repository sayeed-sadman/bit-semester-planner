import { useState } from "react";
import { addCalendar } from "../../services/calendarService";
import InputField from "../common/InputField";

export default function AddCalendarPopup({ onClose, onAdded }) {
  const [icsUrl, setIcsUrl] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState("");

  const handleSave = async () => {
    const e = {};
    if (!icsUrl.trim()) e.icsUrl = "ICS URL is required.";
    if (!displayName.trim()) e.displayName = "Display name is required.";
    if (Object.keys(e).length) { setErrors(e); return; }

    setLoading(true);
    setApiError("");
    try {
      await addCalendar(icsUrl, displayName);
      onAdded();
    } catch (err) {
      setApiError(err?.response?.data?.message || "Failed to add calendar. Check the URL and try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={onClose}>
      <div
        className="bg-white rounded-modal w-full max-w-md mx-4 p-6"
        style={{ boxShadow: "0 12px 40px rgba(12, 18, 41, 0.2)" }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-base font-semibold text-dark">Add Calendar</h3>
          <button onClick={onClose} className="text-dark-muted hover:text-dark transition-colors">
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              <path d="M15 5L5 15M5 5l10 10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
          </button>
        </div>

        <div className="flex flex-col gap-4">
          <InputField
            id="icsUrl"
            label="ICS Calendar URL"
            type="url"
            value={icsUrl}
            onChange={(e) => { setIcsUrl(e.target.value); setErrors((er) => ({ ...er, icsUrl: undefined })); }}
            error={errors.icsUrl}
            placeholder="https://example.com/calendar.ics"
          />
          <InputField
            id="displayName"
            label="Display Name"
            value={displayName}
            onChange={(e) => { setDisplayName(e.target.value); setErrors((er) => ({ ...er, displayName: undefined })); }}
            error={errors.displayName}
            placeholder="e.g. FHNW Timetable"
          />

          {apiError && (
            <p className="text-sm text-danger bg-danger-light border border-danger-border rounded-input px-3 py-2">
              {apiError}
            </p>
          )}
        </div>

        <div className="flex gap-3 mt-6">
          <button
            onClick={onClose}
            className="flex-1 py-2.5 border border-surface-border text-dark-secondary text-sm font-medium rounded-button hover:bg-surface-section transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={loading}
            className="flex-1 py-2.5 bg-primary text-white text-sm font-semibold rounded-button hover:bg-primary-dark transition-colors disabled:opacity-60"
          >
            {loading ? "Adding…" : "Add Calendar"}
          </button>
        </div>
      </div>
    </div>
  );
}
