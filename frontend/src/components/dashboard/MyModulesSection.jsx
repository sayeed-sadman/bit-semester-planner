import { Link } from "react-router-dom";
import ModuleRowPlanner from "./ModuleRowPlanner";

export default function MyModulesSection({ modules, onNotes, onRemove }) {
  const electiveCount = modules.filter((m) => m.moduleType === "ELECTIVE").length;

  return (
    <div className="bg-white rounded-card shadow-card h-full flex flex-col overflow-hidden">

      {/* ── Header — two rows, mirrors MyCalendarSection header exactly ── */}
      <div className="px-5 pt-3.5 pb-2.5 border-b border-surface-divider flex-shrink-0">
        {/* Row 1: title + action button */}
        <div className="flex items-center justify-between gap-3">
          <h2 className="text-base font-semibold text-dark">My Modules</h2>
          <Link
            to="/modules"
            className="inline-flex items-center gap-1 px-3 py-1.5 bg-primary text-white text-xs font-medium rounded-button hover:bg-primary-dark transition-colors"
          >
            Browse Modules
          </Link>
        </div>

        {/* Row 2: status — styled container matching the view toggle group */}
        <div className="flex items-center gap-1.5 rounded-button border border-surface-border px-3 py-1 mt-2.5 w-fit text-xs text-dark-muted">
          <span className="font-medium text-dark-secondary">{modules.length}</span>
          <span>modules selected</span>
          <span className="inline-block w-2 h-2 rounded-full bg-green-500 flex-shrink-0" />
          <span className="font-medium text-dark-secondary">{electiveCount} of 2</span>
          <span>elective slots used</span>
        </div>
      </div>

      {/* ── Scrollable module list ── */}
      <div className="flex-1 min-h-0 overflow-y-auto px-5">
        {modules.length === 0 ? (
          <div className="py-10 text-center">
            <p className="text-dark-muted text-sm mb-3">No modules added yet.</p>
            <Link
              to="/modules"
              className="text-primary text-sm font-medium hover:text-primary-dark"
            >
              Browse the catalog to add modules
            </Link>
          </div>
        ) : (
          modules.map((m) => (
            <ModuleRowPlanner
              key={m.id}
              module={m}
              onNotes={onNotes}
              onRemove={onRemove}
            />
          ))
        )}
      </div>

    </div>
  );
}
