const CAMPUS_OPTIONS = ["Basel", "Olten", "Brugg-Windisch"];
const SEMESTER_OPTIONS = [1, 2, 3, 4, 5, 6];

const INPUT_BASE = "w-full px-3 py-2 rounded-input border border-surface-border text-sm text-dark focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/30 transition-colors";
const SELECT_BASE = `${INPUT_BASE} bg-white`;

function FieldCard({ label, error, children }) {
  return (
    <div className="bg-white border border-surface-border rounded-card px-4 py-4">
      <span className="text-xs font-medium text-dark-muted uppercase tracking-wide block mb-2">
        {label}
      </span>
      {children}
      {error && <p className="text-xs text-danger mt-1.5">{error}</p>}
    </div>
  );
}

export default function ModuleFormCard({ values, onChange, errors = {} }) {
  return (
    <div className="flex flex-col gap-3">
      <FieldCard label="Module Name" error={errors.title}>
        <input
          type="text"
          value={values.title || ""}
          onChange={(e) => onChange("title", e.target.value)}
          placeholder="e.g. Introduction to Programming"
          className={INPUT_BASE}
        />
      </FieldCard>

      <FieldCard label="Module Type" error={errors.moduleType}>
        <select
          value={values.moduleType || ""}
          onChange={(e) => onChange("moduleType", e.target.value)}
          className={SELECT_BASE}
        >
          <option value="">Select type</option>
          <option value="COMPULSORY">Compulsory</option>
          <option value="ELECTIVE">Elective</option>
        </select>
      </FieldCard>

      <FieldCard label="Credits (ECTS)" error={errors.credits}>
        <input
          type="text"
          inputMode="numeric"
          value={values.credits !== undefined && values.credits !== "" ? String(values.credits) : ""}
          onChange={(e) => {
            const raw = e.target.value.replace(/[^0-9]/g, "");
            onChange("credits", raw !== "" ? Number(raw) : "");
          }}
          placeholder="e.g. 3"
          className={INPUT_BASE}
        />
      </FieldCard>

      <FieldCard label="Campus" error={errors.campus}>
        <select
          value={values.campus || ""}
          onChange={(e) => onChange("campus", e.target.value)}
          className={SELECT_BASE}
        >
          <option value="">Select campus</option>
          {CAMPUS_OPTIONS.map((c) => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>
      </FieldCard>

      <FieldCard label="Semester" error={errors.semester}>
        <select
          value={values.semester !== undefined && values.semester !== "" ? values.semester : ""}
          onChange={(e) => onChange("semester", e.target.value ? Number(e.target.value) : "")}
          className={SELECT_BASE}
        >
          <option value="">Select semester</option>
          {SEMESTER_OPTIONS.map((s) => (
            <option key={s} value={s}>Semester {s}</option>
          ))}
        </select>
      </FieldCard>

      <FieldCard label="Lecturer" error={errors.lecturerName}>
        <input
          type="text"
          value={values.lecturerName || ""}
          onChange={(e) => onChange("lecturerName", e.target.value)}
          placeholder="e.g. Dr. Jane Smith"
          className={INPUT_BASE}
        />
      </FieldCard>

      <FieldCard label="Lecturer Email" error={errors.lecturerEmail}>
        <input
          type="email"
          value={values.lecturerEmail || ""}
          onChange={(e) => onChange("lecturerEmail", e.target.value)}
          placeholder="e.g. jane.smith@fhnw.ch"
          className={INPUT_BASE}
        />
      </FieldCard>

      <FieldCard label="Description" error={errors.description}>
        <textarea
          rows={4}
          value={values.description || ""}
          onChange={(e) => onChange("description", e.target.value)}
          placeholder="Module description..."
          className={`${INPUT_BASE} resize-none`}
        />
      </FieldCard>
    </div>
  );
}
