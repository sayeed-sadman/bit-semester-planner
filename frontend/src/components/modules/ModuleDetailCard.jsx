import Badge from "../common/Badge";

function Field({ label, value }) {
  return (
    <div className="flex flex-col gap-1">
      <span className="text-xs font-medium text-dark-muted uppercase tracking-wide">{label}</span>
      <span className="text-sm text-dark-secondary">{value || "—"}</span>
    </div>
  );
}

export default function ModuleDetailCard({ module }) {
  if (!module) return null;

  return (
    <div className="bg-white rounded-card p-6 shadow-card grid grid-cols-1 sm:grid-cols-2 gap-5">
      <Field label="Module Name" value={module.title} />
      <Field label="Semester" value={module.semester} />
      <div className="flex flex-col gap-1">
        <span className="text-xs font-medium text-dark-muted uppercase tracking-wide">Type</span>
        <Badge type={module.moduleType} />
      </div>
      <Field label="Credits (ECTS)" value={module.credits} />
      <Field label="Lecturer" value={module.lecturerName} />
      <Field label="Lecturer Email" value={module.lecturerEmail} />
      <Field label="Language" value={module.language} />
      <div className="sm:col-span-2">
        <Field label="Description" value={module.description} />
      </div>
      <Field label="Schedule" value={module.schedule} />
      <Field label="Location" value={module.location} />
    </div>
  );
}
