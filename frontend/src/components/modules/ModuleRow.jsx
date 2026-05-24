import Badge from "../common/Badge";

export default function ModuleRow({ module, actions }) {
  return (
    <tr className="border-b border-surface-divider hover:bg-surface-section transition-colors">
      <td className="px-4 py-3 text-sm text-dark-secondary">{module.title}</td>
      <td className="px-4 py-3 text-sm text-dark-muted">{module.semester}</td>
      <td className="px-4 py-3">
        <Badge type={module.moduleType} />
      </td>
      <td className="px-4 py-3 text-sm text-dark-muted">{module.credits} ECTS</td>
      <td className="px-4 py-3">
        <div className="flex items-center gap-2 justify-end">
          {actions}
        </div>
      </td>
    </tr>
  );
}
