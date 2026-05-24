import { useState, useEffect } from "react";
import { getPlanner, removeModule } from "../services/plannerService";
import MyModulesSection from "../components/dashboard/MyModulesSection";
import MyCalendarSection from "../components/dashboard/MyCalendarSection";
import NotesModal from "../components/dashboard/NotesModal";
import ConfirmModal from "../components/common/ConfirmModal";

export default function StudentDashboardPage() {
  const [modules, setModules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [notesModule, setNotesModule] = useState(null);
  const [removeTarget, setRemoveTarget] = useState(null);
  const [removing, setRemoving] = useState(false);

  const loadPlanner = () => {
    setLoading(true);
    getPlanner()
      .then((data) => {
        const normalized = data.map((sm) => ({ ...sm.module, id: sm.module.moduleID }));
        normalized.sort((a, b) => {
          if (a.moduleType !== b.moduleType) return a.moduleType === "COMPULSORY" ? -1 : 1;
          return a.semester - b.semester;
        });
        setModules(normalized);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => { loadPlanner(); }, []);

  const handleRemoveConfirm = async () => {
    setRemoving(true);
    try {
      await removeModule(removeTarget.id);
      setModules((prev) => prev.filter((m) => m.id !== removeTarget.id));
      setRemoveTarget(null);
    } finally {
      setRemoving(false);
    }
  };

  if (loading) return <div className="text-center py-20 text-dark-muted">Loading your planner…</div>;

  return (
    <div className="max-w-screen-xl mx-auto px-6 py-8">
      <h1 className="text-2xl font-bold text-dark mb-6">My Semester Planner</h1>

      <div className="flex flex-col md:flex-row gap-6 h-[520px]">
        <div className="flex-1 min-w-0 overflow-hidden">
          <MyModulesSection
            modules={modules}
            onNotes={setNotesModule}
            onRemove={setRemoveTarget}
          />
        </div>
        <div className="flex-1 min-w-0 overflow-hidden">
          <MyCalendarSection />
        </div>
      </div>

      {notesModule && (
        <NotesModal
          module={notesModule}
          onClose={() => setNotesModule(null)}
        />
      )}

      <ConfirmModal
        isOpen={!!removeTarget}
        onClose={() => setRemoveTarget(null)}
        onConfirm={handleRemoveConfirm}
        title="Remove this module?"
        message={`"${removeTarget?.title}" will be removed from your semester plan.`}
        confirmText={removing ? "Removing…" : "Yes, Remove"}
        confirmVariant="danger"
      />
    </div>
  );
}
