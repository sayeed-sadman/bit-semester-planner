import { Link } from "react-router-dom";
import Badge from "../common/Badge";

export default function ModuleRowPlanner({ module, onNotes, onRemove }) {
  return (
    <div className="flex items-center justify-between gap-4 py-2 border-b border-surface-divider last:border-0">
      <div className="flex flex-col min-w-0">
        <span className="text-sm font-medium text-dark truncate">{module.title}</span>
        <div className="flex items-center gap-2 mt-1">
          <span className="text-xs text-dark-muted">Semester {module.semester} · {module.credits} ECTS</span>
          <Badge type={module.moduleType} />
        </div>
      </div>
      <div className="flex items-center gap-2 flex-shrink-0">
        <Link
          to={`/modules/${module.id}?from=planner`}
          className="px-2.5 py-1.5 border border-surface-border text-dark-secondary text-xs font-medium rounded-input hover:bg-surface-section transition-colors"
        >
          View Detail
        </Link>
        <button
          onClick={() => onNotes(module)}
          className="px-2.5 py-1.5 bg-indigo-50 text-indigo-600 text-xs font-medium rounded-input hover:bg-indigo-100 transition-colors"
        >
          My Notes
        </button>
        <button
          onClick={() => onRemove(module)}
          className="px-2.5 py-1.5 bg-red-50 text-red-600 text-xs font-medium rounded-input hover:bg-red-100 transition-colors"
        >
          Remove
        </button>
      </div>
    </div>
  );
}
