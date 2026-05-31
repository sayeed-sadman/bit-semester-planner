import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { create } from "../services/moduleService";
import PageHeader from "../components/layout/PageHeader";
import ModuleFormCard from "../components/modules/ModuleFormCard";

const REQUIRED_FIELDS = ["title", "semester", "credits", "moduleType", "lecturerName", "lecturerEmail", "campus"];

function getAuthHeaders() {
  const headers = {};
  const stored = localStorage.getItem("auth_credentials");
  if (stored) {
    try {
      const { email, password } = JSON.parse(atob(stored));
      headers["Authorization"] = "Basic " + btoa(`${email}:${password}`);
    } catch {}
  }
  return headers;
}

export default function AdminAddModulePage() {
  const navigate = useNavigate();
  const [values, setValues] = useState({});
  const [errors, setErrors] = useState({});
  const [apiError, setApiError] = useState("");
  const [loading, setLoading] = useState(false);
  const [pdfFile, setPdfFile] = useState(null);

  const handleChange = (key, value) => {
    setValues((v) => ({ ...v, [key]: value }));
    setErrors((e) => ({ ...e, [key]: undefined }));
  };

  const validate = () => {
    const e = {};
    REQUIRED_FIELDS.forEach((f) => {
      const v = values[f];
      if (v === undefined || v === null || v === "" || (typeof v === "string" && v.trim() === "")) {
        e[f] = "This field is required.";
      }
    });
    if (!e.credits && Number(values.credits) < 1) {
      e.credits = "Credits must be at least 1.";
    }
    return e;
  };

  const handleSave = async () => {
    const e = validate();
    if (Object.keys(e).length) { setErrors(e); return; }
    setApiError("");
    setLoading(true);
    try {
      const created = await create(values);
      if (pdfFile) {
        const formData = new FormData();
        formData.append("file", pdfFile);
        await fetch(`/api/modules/${created.moduleID}/pdf`, {
          method: "POST",
          headers: getAuthHeaders(),
          body: formData,
        });
      }
      navigate(`/admin/modules/${created.moduleID}?created=true`);
    } catch (err) {
      setApiError(err?.response?.data?.message || "Failed to save module. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-screen-lg mx-auto px-6 py-8">
      <PageHeader backTo="/admin/modules" backLabel="Back to Catalog" title="Add New Module" />

      <ModuleFormCard values={values} onChange={handleChange} errors={errors} />

      <div className="mt-4 bg-white border border-surface-border rounded-card px-4 py-4">
        <span className="text-xs font-medium text-dark-muted uppercase tracking-wide block mb-2">
          Official Description PDF <span className="normal-case font-normal">(optional)</span>
        </span>
        <label className="cursor-pointer inline-flex items-center gap-2 px-3 py-2 border border-surface-border rounded-input text-sm text-dark-muted hover:border-primary hover:text-primary transition-colors">
          <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
            <path d="M3 2h7l3 3v9a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1V3a1 1 0 0 1 1-1z" stroke="currentColor" strokeWidth="1.25" strokeLinejoin="round"/>
            <path d="M10 2v3h3" stroke="currentColor" strokeWidth="1.25" strokeLinejoin="round"/>
          </svg>
          {pdfFile ? pdfFile.name : "Choose PDF file…"}
          <input type="file" accept=".pdf" className="hidden" onChange={(e) => setPdfFile(e.target.files[0] || null)} />
        </label>
        {pdfFile && (
          <button onClick={() => setPdfFile(null)} className="ml-3 text-xs text-danger hover:underline">Remove</button>
        )}
      </div>

      {apiError && (
        <p className="text-sm text-danger bg-danger-light border border-danger-border rounded-input px-3 py-2 mt-4">
          {apiError}
        </p>
      )}

      <div className="mt-6 flex gap-3 justify-end">
        <button
          onClick={() => navigate("/admin/modules")}
          className="px-5 py-2.5 border border-surface-border text-dark-secondary text-sm font-medium rounded-button hover:bg-surface-section transition-colors"
        >
          Cancel
        </button>
        <button
          onClick={handleSave}
          disabled={loading}
          className="px-5 py-2.5 bg-primary text-white text-sm font-semibold rounded-button hover:bg-primary-dark transition-colors disabled:opacity-60"
        >
          {loading ? "Saving…" : "Save Module"}
        </button>
      </div>
    </div>
  );
}
