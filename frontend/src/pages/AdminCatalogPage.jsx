import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { getAll } from "../services/moduleService";
import ModuleTable from "../components/modules/ModuleTable";
import ModuleRow from "../components/modules/ModuleRow";
import DropdownFilter from "../components/common/DropdownFilter";
import ProgrammeDocsModal from "../components/common/ProgrammeDocsModal";

export default function AdminCatalogPage() {
  const navigate = useNavigate();
  const [modules, setModules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [semesterFilter, setSemesterFilter] = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  const [showProgrammeDocs, setShowProgrammeDocs] = useState(false);

  useEffect(() => {
    setLoading(true);
    getAll()
      .then((data) => setModules([...data].sort((a, b) => a.title.localeCompare(b.title))))
      .catch(() => setError("Unable to connect to the server. Please try again later."))
      .finally(() => setLoading(false));
  }, []);

  const filtered = modules.filter((m) => {
    if (semesterFilter && m.semester !== Number(semesterFilter)) return false;
    if (typeFilter && m.moduleType !== typeFilter) return false;
    return true;
  });

  return (
    <div className="max-w-screen-xl mx-auto px-6 py-8">
      <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-dark">Module Catalog</h1>
          <p className="text-dark-muted text-sm mt-1">Manage all modules in the BIT programme</p>
        </div>
        <Link
          to="/admin/modules/new"
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-primary text-white font-semibold text-sm rounded-button hover:bg-primary-dark transition-colors"
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path d="M8 3v10M3 8h10" stroke="white" strokeWidth="2" strokeLinecap="round" />
          </svg>
          Add New Module
        </Link>
      </div>

      {error && (
        <p className="text-sm text-danger bg-danger-light border border-danger-border rounded-input px-3 py-2 mb-4">
          {error}
        </p>
      )}

      <div className="bg-white rounded-card shadow-card overflow-hidden">
        <div className="flex items-center gap-4 p-4 border-b border-surface-border flex-wrap">
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
          <div className="ml-auto flex items-center gap-3">
            <button
              onClick={() => setShowProgrammeDocs(true)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 border border-primary text-primary text-xs font-semibold rounded-input hover:bg-primary hover:text-white transition-colors"
            >
              <svg width="13" height="13" viewBox="0 0 16 16" fill="none">
                <path d="M3 2h7l3 3v9a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1V3a1 1 0 0 1 1-1z" stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round"/>
                <path d="M10 2v3h3" stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round"/>
                <path d="M5 9h6M5 11.5h4" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/>
              </svg>
              Programme Resources
            </button>
            <span className="text-sm text-dark-muted">{filtered.length} modules</span>
          </div>
        </div>
        {showProgrammeDocs && <ProgrammeDocsModal isAdmin={true} onClose={() => setShowProgrammeDocs(false)} />}

        {loading ? (
          <div className="text-center py-12 text-dark-muted text-sm">Loading modules…</div>
        ) : (
          <ModuleTable
            isEmpty={filtered.length === 0}
            emptyMessage={semesterFilter ? "No modules found for this semester." : "No modules found."}
          >
            {filtered.map((m) => (
              <ModuleRow
                key={m.moduleID}
                module={m}
                actions={
                  <button
                    onClick={() => navigate(`/admin/modules/${m.moduleID}`)}
                    className="px-3 py-1.5 border border-surface-border text-dark-secondary text-xs font-medium rounded-input hover:bg-surface-section transition-colors"
                  >
                    View Details
                  </button>
                }
              />
            ))}
          </ModuleTable>
        )}
      </div>
    </div>
  );
}
