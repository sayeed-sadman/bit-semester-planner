export default function ModuleTable({ children, isEmpty, emptyMessage = "No modules found." }) {
  if (isEmpty) {
    return (
      <div className="text-center py-12 text-dark-muted text-sm">
        {emptyMessage}
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[640px]">
        <thead>
          <tr className="bg-surface-section border-b border-surface-border">
            <th className="px-4 py-3 text-left text-xs font-semibold text-dark-muted uppercase tracking-wide">Module Name</th>
            <th className="px-4 py-3 text-left text-xs font-semibold text-dark-muted uppercase tracking-wide">Semester</th>
            <th className="px-4 py-3 text-left text-xs font-semibold text-dark-muted uppercase tracking-wide">Type</th>
            <th className="px-4 py-3 text-left text-xs font-semibold text-dark-muted uppercase tracking-wide">Credits</th>
            <th className="px-4 py-3 text-right text-xs font-semibold text-dark-muted uppercase tracking-wide">Actions</th>
          </tr>
        </thead>
        <tbody>{children}</tbody>
      </table>
    </div>
  );
}
