import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { getAll } from "../services/moduleService";
import { getPlanner, addModule, removeModule } from "../services/plannerService";
import ModuleTable from "../components/modules/ModuleTable";
import ModuleRow from "../components/modules/ModuleRow";
import DropdownFilter from "../components/common/DropdownFilter";
import SuccessBanner from "../components/common/SuccessBanner";
import ConfirmModal from "../components/common/ConfirmModal";
import ProgrammeDocsModal from "../components/common/ProgrammeDocsModal";

export default function StudentCatalogPage() {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const [modules, setModules] = useState([]);
  const [plannerIds, setPlannerIds] = useState(new Set());
  const [plannerModules, setPlannerModules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [semesterFilter, setSemesterFilter] = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [showSuccess, setShowSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [removeTarget, setRemoveTarget] = useState(null);
  const [showProgrammeDocs, setShowProgrammeDocs] = useState(false);
  const [removing, setRemoving] = useState(false);
  const [addingId, setAddingId] = useState(null);

  useEffect(() => {
    const fetches = isAuthenticated
      ? Promise.all([getAll(), getPlanner()])
      : getAll().then((mods) => [mods, []]);
    fetches
      .then(([mods, planner]) => {
        setModules([...mods].sort((a, b) => a.title.localeCompare(b.title)));
        const normalized = planner.map((sm) => sm.module);
        setPlannerModules(normalized);
        setPlannerIds(new Set(normalized.map((m) => m.moduleID)));
      })
      .catch(() => setError("Unable to connect to the server. Please try again later."))
      .finally(() => setLoading(false));
  }, [isAuthenticated]);

  const electiveCount = plannerModules.filter((m) => m.moduleType === "ELECTIVE").length;

  const handleAdd = async (mod) => {
    if (mod.moduleType === "ELECTIVE" && electiveCount >= 2) {
      setErrorMsg("You have reached the maximum of 2 elective modules for your semester plan.");
      return;
    }
    setErrorMsg("");
    setAddingId(mod.moduleID);
    try {
      await addModule(mod.moduleID);
      setPlannerIds((prev) => new Set([...prev, mod.moduleID]));
      setPlannerModules((prev) => [...prev, mod]);
      setSuccessMsg(`"${mod.title}" added to your semester plan.`);
      setShowSuccess(true);
    } catch (err) {
      if (err?.response?.status === 409) {
        setErrorMsg("You have reached the maximum of 2 elective modules for your semester plan.");
      } else {
        setErrorMsg(err?.response?.data?.message || "Failed to add module.");
      }
    } finally {
      setAddingId(null);
    }
  };

  const handleRemoveConfirm = async () => {
    setRemoving(true);
    try {
      await removeModule(removeTarget.moduleID);
      setPlannerIds((prev) => { const n = new Set(prev); n.delete(removeTarget.moduleID); return n; });
      setPlannerModules((prev) => prev.filter((m) => m.moduleID !== removeTarget.moduleID));
      setRemoveTarget(null);
    } finally {
      setRemoving(false);
    }
  };

  const filtered = modules.filter((m) => {
    if (semesterFilter && m.semester !== Number(semesterFilter)) return false;
    if (typeFilter && m.moduleType !== typeFilter) return false;
    return true;
  });

  return (
    <div className="max-w-screen-xl mx-auto px-6 py-8">
      <div className="mb-6">
        {isAuthenticated && (
          <Link
            to="/dashboard"
            className="inline-flex items-center gap-1 text-primary text-sm font-medium hover:text-primary-dark transition-colors mb-3"
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M10 12L6 8L10 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            Back to My Planner
          </Link>
        )}
        <h1 className="text-2xl font-bold text-dark">Module Catalog</h1>
      </div>

      <SuccessBanner isVisible={showSuccess} message={successMsg} onDismiss={() => setShowSuccess(false)} />

      {error && (
        <p className="text-sm text-danger bg-danger-light border border-danger-border rounded-input px-3 py-2 mb-4">
          {error}
        </p>
      )}

      {errorMsg && (
        <p className="text-sm text-danger bg-danger-light border border-danger-border rounded-input px-3 py-2 mb-4">
          {errorMsg}
        </p>
      )}

      <div className="bg-white rounded-card shadow-card overflow-hidden">
        <div className="flex items-end gap-4 p-4 border-b border-surface-border flex-wrap">
          <DropdownFilter
            label="Semester"
            value={semesterFilter}
            onChange={setSemesterFilter}
            options={[
              { value: "", label: "All Semesters" },
              { value: "1", label: "Semester 1" },
              { value: "2", label: "Semester 2" },
              { value: "3", label: "Semester 3" },
              { value: "4", label: "Semester 4" },
              { value: "5", label: "Semester 5" },
              { value: "6", label: "Semester 6" },
            ]}
          />
          <DropdownFilter
            label="Type"
            value={typeFilter}
            onChange={setTypeFilter}
            options={[
              { value: "", label: "All Types" },
              { value: "COMPULSORY", label: "Compulsory" },
              { value: "ELECTIVE", label: "Elective" },
            ]}
          />
          <span className="flex-1 text-center text-sm text-dark-muted">{filtered.length} modules</span>
          <button
            onClick={() => setShowProgrammeDocs(true)}
            className="inline-flex items-center gap-1.5 px-3 py-2 border border-primary text-primary text-sm font-semibold rounded-input hover:bg-primary hover:text-white transition-colors"
          >
            <svg width="13" height="13" viewBox="0 0 16 16" fill="none">
              <path d="M3 2h7l3 3v9a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1V3a1 1 0 0 1 1-1z" stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round"/>
              <path d="M10 2v3h3" stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round"/>
              <path d="M5 9h6M5 11.5h4" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/>
            </svg>
            Programme Resources
          </button>
        </div>
        {showProgrammeDocs && <ProgrammeDocsModal isAdmin={false} onClose={() => setShowProgrammeDocs(false)} />}

        {loading ? (
          <div className="text-center py-12 text-dark-muted text-sm">Loading modules…</div>
        ) : (
          <ModuleTable
            isEmpty={filtered.length === 0}
            emptyMessage={semesterFilter ? "No modules found for this semester." : "No modules found."}
          >
            {filtered.map((m) => {
              const inPlanner = plannerIds.has(m.moduleID);
              return (
                <ModuleRow
                  key={m.moduleID}
                  module={m}
                  actions={
                    <>
                      <button
                        onClick={() => navigate(`/modules/${m.moduleID}`)}
                        className="px-3 py-1.5 border border-surface-border text-dark-secondary text-xs font-medium rounded-input hover:bg-surface-section transition-colors"
                      >
                        View Detail
                      </button>
                      {!isAuthenticated ? (
                        <Link
                          to="/login"
                          className="px-3 py-1.5 bg-success text-white text-xs font-medium rounded-input hover:bg-success-dark transition-colors"
                        >
                          Login to add
                        </Link>
                      ) : inPlanner ? (
                        <>
                          <button
                            onClick={() => setRemoveTarget(m)}
                            className="px-3 py-1.5 bg-red-50 text-red-600 text-xs font-medium rounded-input hover:bg-red-100 transition-colors"
                          >
                            Remove
                          </button>
                          <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-success-dark bg-success-light px-2 py-0.5 rounded-badge">
                            <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                              <path d="M2 5l2 2 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                            Added
                          </span>
                        </>
                      ) : (
                        <button
                          onClick={() => handleAdd(m)}
                          disabled={addingId === m.moduleID}
                          className="px-3 py-1.5 bg-success text-white text-xs font-medium rounded-input hover:bg-success-dark transition-colors disabled:opacity-60"
                        >
                          {addingId === m.moduleID ? "Adding…" : "Add"}
                        </button>
                      )}
                    </>
                  }
                />
              );
            })}
          </ModuleTable>
        )}
      </div>

      <ConfirmModal
        isOpen={!!removeTarget}
        onClose={() => setRemoveTarget(null)}
        onConfirm={handleRemoveConfirm}
        title="Remove from Planner"
        message={`Are you sure you want to remove "${removeTarget?.title}" from your planner? Any notes added for this module will also be deleted.`}
        confirmText={removing ? "Removing…" : "Yes, Remove"}
        confirmVariant="danger"
      />
    </div>
  );
}
