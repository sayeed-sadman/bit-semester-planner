import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { create } from "../services/moduleService";
import PageHeader from "../components/layout/PageHeader";
import ModuleFormCard from "../components/modules/ModuleFormCard";

const REQUIRED_FIELDS = ["title", "semester", "credits", "moduleType", "lecturerName", "lecturerEmail", "campus"];

export default function AdminAddModulePage() {
  const navigate = useNavigate();
  const [values, setValues] = useState({});
  const [errors, setErrors] = useState({});
  const [apiError, setApiError] = useState("");
  const [loading, setLoading] = useState(false);

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
