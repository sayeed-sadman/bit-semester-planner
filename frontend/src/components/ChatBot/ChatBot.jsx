import { useState, useRef, useEffect, useCallback } from "react";
import { useAuth } from "../../context/AuthContext";
import { useChatBot } from "./useChatBot";

function getAuthHeaders() {
  const headers = {};
  const stored = localStorage.getItem("auth_credentials");
  if (stored) {
    try {
      const { email, password } = JSON.parse(atob(stored));
      headers["Authorization"] = "Basic " + btoa(`${email}:${password}`);
    } catch {
      // credentials missing or malformed
    }
  }
  return headers;
}

const truncate = (name, max = 30) => (name.length > max ? name.slice(0, max) + "…" : name);

function renderInline(text) {
  const boldRegex = /\*\*(.+?)\*\*/g;
  const parts = [];
  let last = 0;
  let match;
  while ((match = boldRegex.exec(text)) !== null) {
    if (match.index > last) parts.push(text.slice(last, match.index));
    parts.push(<strong key={match.index} style={{ fontWeight: 600 }}>{match[1]}</strong>);
    last = match.index + match[0].length;
  }
  if (last < text.length) parts.push(text.slice(last));
  return parts.length > 0 ? parts : text;
}

function renderMessage(text) {
  const lines = text.split("\n");
  const output = [];
  let bulletGroup = [];
  let key = 0;

  const flushBullets = () => {
    if (bulletGroup.length === 0) return;
    output.push(
      <ul key={key++} style={{ margin: "4px 0", paddingLeft: 0, listStyle: "none" }}>
        {bulletGroup.map((item, i) => (
          <li key={i} style={{ display: "flex", gap: "6px", margin: "2px 0", paddingLeft: "12px" }}>
            <span style={{ flexShrink: 0 }}>•</span>
            <span>{renderInline(item)}</span>
          </li>
        ))}
      </ul>
    );
    bulletGroup = [];
  };

  for (const line of lines) {
    if (line.startsWith("- ") || line.startsWith("* ")) {
      bulletGroup.push(line.slice(2));
    } else {
      flushBullets();
      if (line.startsWith("## ") || line.startsWith("# ")) {
        const content = line.replace(/^#{1,2} /, "");
        output.push(<p key={key++} style={{ margin: "4px 0", fontWeight: 600 }}>{content}</p>);
      } else if (line.trim() === "") {
        output.push(<div key={key++} style={{ height: "4px" }} />);
      } else {
        output.push(<p key={key++} style={{ margin: "2px 0" }}>{renderInline(line)}</p>);
      }
    }
  }
  flushBullets();
  return output;
}

export default function ChatBot({ onSuggestNote }) {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploadStatus, setUploadStatus] = useState(null); // null | "uploading" | "done" | "error"
  const [suggestedText, setSuggestedText] = useState(null);

  // Note-panel state (student)
  const [showNotePanel, setShowNotePanel] = useState(false);
  const [noteText, setNoteText] = useState("");
  const [modules, setModules] = useState([]);
  const [selectedModuleId, setSelectedModuleId] = useState("");
  const [loadingModules, setLoadingModules] = useState(false);
  const [noteStatus, setNoteStatus] = useState(null); // null | "saving" | "saved" | "error"
  const [existingNoteWarning, setExistingNoteWarning] = useState(false);

  // Admin module panel state
  const [adminFormTitle, setAdminFormTitle] = useState("");
  const [adminFormDescription, setAdminFormDescription] = useState("");
  const [adminFormCredits, setAdminFormCredits] = useState("");
  const [adminFormSemester, setAdminFormSemester] = useState("1");
  const [adminFormModuleType, setAdminFormModuleType] = useState("COMPULSORY");
  const [adminFormCampus, setAdminFormCampus] = useState("Basel");
  const [adminFormLecturer, setAdminFormLecturer] = useState("");
  const [adminFormLecturerEmail, setAdminFormLecturerEmail] = useState("");
  const [adminModuleStatus, setAdminModuleStatus] = useState(null); // null | "saving" | "saved" | "error"
  const [createdModuleId, setCreatedModuleId] = useState(null);

  // Documents panel state
  const [docsExpanded, setDocsExpanded] = useState(false);
  const [deleteErrors, setDeleteErrors] = useState({});
  const [confirmingId, setConfirmingId] = useState(null);

  // Responsive breakpoint
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);

  const { isStudent, isAdmin, isAuthenticated, user } = useAuth();
  const canUpload = isStudent || isAdmin;

  const { messages, inputValue, setInputValue, sendMessage, uploadFile, deleteFile, clearMessages, addAssistantMessage, isLoading, uploadedFiles, moduleMatchResult, setModuleMatchResult } = useChatBot();
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  const prevAuthRef = useRef(isAuthenticated);

  useEffect(() => {
    const onResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  // Clear chat history on login
  useEffect(() => {
    if (!prevAuthRef.current && isAuthenticated) {
      clearMessages();
    }
    prevAuthRef.current = isAuthenticated;
  }, [isAuthenticated]);

  // Auto-focus input when chat opens
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isOpen]);

  // Collapse docs panel when no files remain
  useEffect(() => {
    if (uploadedFiles.length === 0) setDocsExpanded(false);
  }, [uploadedFiles.length]);

  const isDesktop = windowWidth >= 768;

  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isLoading, isOpen]);

  // Pre-fill create form when no match found
  useEffect(() => {
    if (moduleMatchResult && !moduleMatchResult.matched) {
      const facts = moduleMatchResult.suggestions?.detectedFacts || [];
      const get = (prefix) => {
        const fact = facts.find((f) => f.startsWith(prefix + ": "));
        return fact ? fact.slice(prefix.length + 2) : "";
      };
      const titleFromFile = (moduleMatchResult.fileName || "")
        .replace(/\.[^.]+$/, "")
        .replace(/[-_]/g, " ");
      setAdminFormTitle(get("Module Title") || titleFromFile);
      setAdminFormDescription(get("Short Description"));
      setAdminFormCredits(get("Credits"));
      setAdminFormSemester("1");
      setAdminFormModuleType("COMPULSORY");
      setAdminFormCampus("Basel");
      setAdminFormLecturer(get("Lecturer"));
      setAdminFormLecturerEmail(get("Lecturer Email"));
      setAdminModuleStatus(null);
    }
  }, [moduleMatchResult]);

  // ── Note panel helpers (student) ────────────────────────────────────────────

  const fetchModules = useCallback(async () => {
    setLoadingModules(true);
    try {
      const res = await fetch("/api/planner", {
        headers: { ...getAuthHeaders(), "Content-Type": "application/json" },
      });
      if (res.ok) {
        const data = await res.json();
        setModules(data);
        if (data.length > 0) setSelectedModuleId(String(data[0].module.moduleID));
      }
    } catch {
      // leave modules empty
    } finally {
      setLoadingModules(false);
    }
  }, []);

  const handleAddToNotes = async (text, fileNameHint = null) => {
    const noteContent = text ?? suggestedText;
    setNoteStatus(null);
    setExistingNoteWarning(false);
    setShowNotePanel(true);
    setLoadingModules(true);
    try {
      const res = await fetch("/api/planner", {
        headers: { ...getAuthHeaders(), "Content-Type": "application/json" },
      });
      let moduleId = "";
      if (res.ok) {
        const data = await res.json();
        setModules(data);
        if (data.length > 0) {
          // Try to auto-select by matching filename words against module titles
          if (fileNameHint) {
            const words = fileNameHint
              .replace(/\.[^.]+$/, "")
              .toLowerCase()
              .split(/[\s\-_.,()]+/)
              .filter((w) => w.length > 3);
            let bestScore = 0;
            let bestMatch = null;
            for (const entry of data) {
              const titleLower = entry.module.title.toLowerCase();
              const score = words.filter((w) => titleLower.includes(w)).length;
              if (score > bestScore) {
                bestScore = score;
                bestMatch = entry;
              }
            }
            if (bestMatch && bestScore > 0) {
              moduleId = String(bestMatch.module.moduleID);
            }
          }
          setSelectedModuleId(moduleId);
        }
      }
      if (moduleId) {
        try {
          const noteRes = await fetch(`/api/notes/${moduleId}`, {
            headers: { ...getAuthHeaders(), "Content-Type": "application/json" },
          });
          if (noteRes.ok) {
            const noteData = await noteRes.json();
            const existingContent = noteData.content || "";
            const today = new Date().toLocaleDateString();
            const separator = `\n\n---\nAdded from upload on ${today}\n---\n`;
            setNoteText(existingContent + separator + (noteContent || ""));
            setExistingNoteWarning(true);
          } else {
            setNoteText(noteContent || "");
          }
        } catch {
          setNoteText(noteContent || "");
        }
      } else {
        setNoteText(noteContent || "");
      }
    } catch {
      setNoteText(noteContent || "");
    } finally {
      setLoadingModules(false);
    }
  };

  const handleSaveNote = async () => {
    if (!selectedModuleId) return;
    setNoteStatus("saving");
    try {
      const res = await fetch(`/api/notes/${selectedModuleId}`, {
        method: "POST",
        headers: { ...getAuthHeaders(), "Content-Type": "application/json" },
        body: JSON.stringify({ content: noteText }),
      });
      if (res.ok) {
        setNoteStatus("saved");
        setTimeout(() => {
          setShowNotePanel(false);
          setSuggestedText(null);
          setNoteStatus(null);
        }, 1500);
      } else {
        setNoteStatus("error");
      }
    } catch {
      setNoteStatus("error");
    }
  };

  const handleCancelNote = () => {
    setShowNotePanel(false);
    setSuggestedText(null);
    setNoteStatus(null);
    setExistingNoteWarning(false);
  };

  // ── Admin module panel helpers ───────────────────────────────────────────────

  const handleApplyUpdates = async () => {
    if (!moduleMatchResult?.module) return;
    setAdminModuleStatus("saving");
    const mod = moduleMatchResult.module;
    const facts = moduleMatchResult.suggestions?.detectedFacts || [];
    const extractedSection =
      facts.length > 0 ? "\n\n--- Extracted Info ---\n" + facts.join("\n") : "";
    const updatedModule = { ...mod, description: mod.description + extractedSection };
    try {
      const res = await fetch(`/api/modules/${mod.moduleID}`, {
        method: "PUT",
        headers: { ...getAuthHeaders(), "Content-Type": "application/json" },
        body: JSON.stringify(updatedModule),
      });
      if (res.ok) {
        if (moduleMatchResult.uploadId) {
          try {
            await fetch(`/api/modules/${mod.moduleID}/pdf/from-upload/${moduleMatchResult.uploadId}`, {
              method: "POST",
              headers: getAuthHeaders(),
            });
          } catch { /* non-critical */ }
        }
        setAdminModuleStatus("saved");
        setTimeout(() => { setModuleMatchResult(null); setAdminModuleStatus(null); }, 2000);
      } else {
        setAdminModuleStatus("error");
      }
    } catch {
      setAdminModuleStatus("error");
    }
  };

  const handleCreateModule = async () => {
    if (!adminFormTitle || !adminFormCredits) return;
    setAdminModuleStatus("saving");
    const newModule = {
      title: adminFormTitle,
      description: adminFormDescription || "No description provided.",
      credits: parseInt(adminFormCredits),
      lecturerName: adminFormLecturer || "TBD",
      lecturerEmail: adminFormLecturerEmail || "tbd@fhnw.ch",
      semester: parseInt(adminFormSemester),
      campus: adminFormCampus,
      moduleType: adminFormModuleType,
    };
    try {
      const res = await fetch("/api/modules", {
        method: "POST",
        headers: { ...getAuthHeaders(), "Content-Type": "application/json" },
        body: JSON.stringify(newModule),
      });
      if (res.ok) {
        const created = await res.json();
        if (moduleMatchResult?.uploadId && created?.moduleID) {
          try {
            await fetch(`/api/modules/${created.moduleID}/pdf/from-upload/${moduleMatchResult.uploadId}`, {
              method: "POST",
              headers: getAuthHeaders(),
            });
          } catch { /* non-critical */ }
        }
        setCreatedModuleId(created?.moduleID ?? null);
        setAdminModuleStatus("saved");
      } else {
        setAdminModuleStatus("error");
      }
    } catch {
      setAdminModuleStatus("error");
    }
  };

  const handleDismissAdminPanel = () => {
    if (moduleMatchResult?.matched && moduleMatchResult?.module) {
      addAssistantMessage(
        `${moduleMatchResult.module.title} is already in the module catalog. Your document has been uploaded and indexed. Feel free to ask me any questions about it.`
      );
    }
    setModuleMatchResult(null);
    setAdminModuleStatus(null);
    setCreatedModuleId(null);
  };

  // ── Chat helpers ─────────────────────────────────────────────────────────────

  const handleClearChat = () => clearMessages();

  const handleSend = () => sendMessage();

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) return;
    const fileName = selectedFile.name;
    setUploadStatus("uploading");
    setSuggestedText(null);
    setModuleMatchResult(null);
    try {
      const result = await uploadFile(selectedFile);
      setUploadStatus("done");
      setSelectedFile(null);
      setTimeout(() => setUploadStatus(null), 3000);
      // STUDENT flow — open note panel immediately with pre-filled content
      if (result.userRole !== "ADMIN" && result.suggestions?.suggestedNoteText) {
        setSuggestedText(result.suggestions.suggestedNoteText);
        handleAddToNotes(result.suggestions.suggestedNoteText, fileName);
      } else if (result.userRole !== "ADMIN") {
        addAssistantMessage(
          "Your document has been uploaded and indexed. No exam or assessment info was found in it, so there is nothing to save as a note. Feel free to ask me any questions about the document."
        );
      }
    } catch {
      setUploadStatus("error");
    }
  };

  const handleFileChange = (e) => {
    setSelectedFile(e.target.files[0] || null);
    setUploadStatus(null);
    setSuggestedText(null);
    e.target.value = "";
  };

  // ── Documents panel helpers ──────────────────────────────────────────────────

  const handleDeleteFile = async (id) => {
    setConfirmingId(null);
    setDeleteErrors((prev) => { const n = { ...prev }; delete n[id]; return n; });
    try {
      await deleteFile(id);
    } catch {
      setDeleteErrors((prev) => ({ ...prev, [id]: true }));
    }
  };

  // ── Shared input class ───────────────────────────────────────────────────────
  const inputCls = "w-full px-3 py-2 text-sm border border-surface-border rounded-input text-dark focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 bg-white";

  // ── Render ───────────────────────────────────────────────────────────────────

  // Determine which panel is active (priority: note > admin > chat)
  const activePanel = showNotePanel ? "note" : moduleMatchResult ? "admin" : "chat";

  return (
    <>
      {/* Floating toggle button */}
      <button
        onClick={() => setIsOpen((prev) => !prev)}
        className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full bg-primary hover:bg-primary-dark text-white shadow-modal transition-colors flex items-center justify-center"
        aria-label={isOpen ? "Close study assistant" : "Open study assistant"}
      >
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M20 2H4C2.9 2 2 2.9 2 4V22L6 18H20C21.1 18 22 17.1 22 16V4C22 2.9 21.1 2 20 2Z" fill="white"/>
        </svg>
      </button>

      {/* Panel stack — responsive: side-by-side on desktop, stacked on mobile */}
      {isOpen && (
        <div
          className="fixed z-40"
          style={
            isDesktop
              ? { bottom: "88px", right: "24px", display: "flex", flexDirection: "row-reverse", alignItems: "flex-end", gap: "8px" }
              : { bottom: "88px", left: 0, right: 0, display: "flex", flexDirection: "column", gap: "4px" }
          }
        >
          {/* Chat panel */}
          <div
            className="bg-white rounded-modal flex flex-col overflow-hidden flex-shrink-0"
            style={{
              height: "500px",
              ...(isDesktop ? { width: "400px" } : {}),
              boxShadow: "0 12px 40px rgba(12, 18, 41, 0.2)",
            }}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 bg-primary flex-shrink-0">
              <div className="flex items-center gap-2">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                  <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                <span className="text-white font-semibold text-sm">
                  {activePanel === "note"
                    ? "Save to Module Notes"
                    : activePanel === "admin"
                    ? moduleMatchResult?.matched ? "Update Module" : "Create New Module"
                    : "BIT Study Assistant"}
                </span>
              </div>
              <div className="flex items-center gap-1">
                {activePanel === "chat" && (
                  <button
                    onClick={handleClearChat}
                    className="text-white/70 hover:text-white transition-colors p-0.5"
                    aria-label="Clear chat"
                  >
                    <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
                      <path d="M2 4h12M5 4V2h6v2M3 4l1 9a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1l1-9M6 7v4M10 7v4" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </button>
                )}
                <button
                  onClick={() => setIsOpen(false)}
                  className="text-white/70 hover:text-white transition-colors p-0.5"
                  aria-label="Minimize"
                >
                  <span style={{ fontSize: "1.4rem", lineHeight: 1, fontWeight: 300 }}>−</span>
                </button>
              </div>
            </div>

            {/* ── Student note panel ── */}
            {activePanel === "note" && (
              <div className="flex-1 flex flex-col overflow-hidden">
                <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-3">
                  {suggestedText && (
                    <div className="px-3 py-2 rounded-input text-xs" style={{ background: "#FEF3E1", border: "1px solid #F5C460", color: "#AA6D0D" }}>
                      Study info was found in your document. Review and save it as a note.
                    </div>
                  )}
                  {loadingModules ? (
                    <p className="text-sm text-dark-muted">Loading your modules…</p>
                  ) : modules.length === 0 ? (
                    <p className="text-sm text-dark-muted">
                      No modules in your planner yet. Add modules to your planner first.
                    </p>
                  ) : (
                    <div className="flex flex-col gap-1">
                      <label className="text-xs font-medium text-dark-muted">Module</label>
                      <select
                        value={selectedModuleId}
                        onChange={(e) => setSelectedModuleId(e.target.value)}
                        className={inputCls}
                      >
                        <option value="">Select a module...</option>
                        {modules.map((entry) => (
                          <option key={entry.module.moduleID} value={String(entry.module.moduleID)}>
                            {entry.module.title}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}
                  {existingNoteWarning && (
                    <p
                      className="text-xs font-medium rounded px-3 py-2"
                      style={{ background: "#EEF2FF", border: "1px solid #C7D2FE", color: "#3730A3" }}
                    >
                      A note already exists for this module. The new information has been appended below your existing note.
                    </p>
                  )}
                  <div className="flex flex-col gap-1">
                    <label className="text-xs font-medium text-dark-muted">Note content (editable)</label>
                    <textarea
                      value={noteText}
                      onChange={(e) => setNoteText(e.target.value)}
                      rows={8}
                      placeholder="Note content…"
                      className={`${inputCls} resize-none`}
                    />
                  </div>
                  {noteStatus === "saved" && <p className="text-xs font-medium text-success">Note saved!</p>}
                  {noteStatus === "error" && <p className="text-xs font-medium text-danger">Failed to save note. Please try again.</p>}
                </div>
                <div className="px-4 py-3 border-t border-surface-divider flex gap-2 flex-shrink-0">
                  <button onClick={handleCancelNote} className="flex-1 px-3 py-2 text-sm border border-surface-border rounded-input text-dark-muted hover:border-dark-muted hover:text-dark transition-colors">
                    Cancel
                  </button>
                  <button
                    onClick={handleSaveNote}
                    disabled={!selectedModuleId || modules.length === 0 || noteStatus === "saving" || noteStatus === "saved"}
                    className="flex-1 px-3 py-2 bg-primary text-white text-sm font-semibold rounded-input hover:bg-primary-dark transition-colors disabled:opacity-50"
                  >
                    {noteStatus === "saving" ? "Saving…" : "Save Note"}
                  </button>
                </div>
              </div>
            )}

            {/* ── Admin module panel ── */}
            {activePanel === "admin" && moduleMatchResult?.matched && (
              <div className="flex-1 flex flex-col overflow-hidden">
                <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-3">
                  <div className="p-3 rounded-input bg-blue-50 border border-blue-200">
                    <p className="text-xs font-semibold text-blue-700 mb-0.5">Module already in catalog</p>
                    <p className="text-sm font-medium text-primary">{moduleMatchResult.module.title}</p>
                    <p className="text-xs text-blue-600 mt-1">
                      Your document has been uploaded and indexed. Dismiss to ask me questions about it.
                    </p>
                  </div>
                </div>
                <div className="px-4 py-3 border-t border-surface-divider flex gap-2 flex-shrink-0">
                  <button onClick={handleDismissAdminPanel} className="flex-1 px-3 py-2 text-sm border border-surface-border rounded-input text-dark-muted hover:border-dark-muted hover:text-dark transition-colors">
                    Dismiss
                  </button>
                  <a
                    href={`/admin/modules/${moduleMatchResult.module.moduleID}`}
                    className="flex-1 px-3 py-2 bg-primary text-white text-sm font-semibold rounded-input hover:bg-primary-dark transition-colors text-center"
                  >
                    View Module →
                  </a>
                </div>
              </div>
            )}

            {activePanel === "admin" && !moduleMatchResult?.matched && (
              <div className="flex-1 flex flex-col overflow-hidden">
                <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-3">
                  <p className="text-sm text-dark-secondary">No existing module found for this document.</p>
                  <p className="text-xs font-medium text-dark-muted">Draft new module:</p>

                  <div className="flex flex-col gap-1">
                    <label className="text-xs font-medium text-dark-muted">Title</label>
                    <input value={adminFormTitle} onChange={(e) => setAdminFormTitle(e.target.value)} placeholder="Module title" className={inputCls} />
                  </div>

                  <div className="flex flex-col gap-1">
                    <label className="text-xs font-medium text-dark-muted">Description</label>
                    <textarea value={adminFormDescription} onChange={(e) => setAdminFormDescription(e.target.value)} rows={3} placeholder="Short description…" className={`${inputCls} resize-none`} />
                  </div>

                  <div className="flex gap-2">
                    <div className="flex flex-col gap-1 flex-1">
                      <label className="text-xs font-medium text-dark-muted">Credits</label>
                      <input type="number" value={adminFormCredits} onChange={(e) => setAdminFormCredits(e.target.value)} min={1} max={10} placeholder="e.g. 3" className={inputCls} />
                    </div>
                    <div className="flex flex-col gap-1 flex-1">
                      <label className="text-xs font-medium text-dark-muted">Semester</label>
                      <select value={adminFormSemester} onChange={(e) => setAdminFormSemester(e.target.value)} className={inputCls}>
                        {[1, 2, 3, 4, 5, 6].map((s) => (
                          <option key={s} value={s}>{s}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <div className="flex flex-col gap-1 flex-1">
                      <label className="text-xs font-medium text-dark-muted">Campus</label>
                      <select value={adminFormCampus} onChange={(e) => setAdminFormCampus(e.target.value)} className={inputCls}>
                        <option value="Basel">Basel</option>
                        <option value="Brugg-Windisch">Brugg-Windisch</option>
                        <option value="Olten">Olten</option>
                        <option value="Muttenz">Muttenz</option>
                      </select>
                    </div>
                    <div className="flex flex-col gap-1 flex-1">
                      <label className="text-xs font-medium text-dark-muted">Module Type</label>
                      <select value={adminFormModuleType} onChange={(e) => setAdminFormModuleType(e.target.value)} className={inputCls}>
                        <option value="COMPULSORY">COMPULSORY</option>
                        <option value="ELECTIVE">ELECTIVE</option>
                      </select>
                    </div>
                  </div>

                  <div className="flex flex-col gap-1">
                    <label className="text-xs font-medium text-dark-muted">Lecturer</label>
                    <input value={adminFormLecturer} onChange={(e) => setAdminFormLecturer(e.target.value)} placeholder="Lecturer name" className={inputCls} />
                  </div>

                  <div className="flex flex-col gap-1">
                    <label className="text-xs font-medium text-dark-muted">Lecturer Email</label>
                    <input type="email" value={adminFormLecturerEmail} onChange={(e) => setAdminFormLecturerEmail(e.target.value)} placeholder="e.g. lecturer@fhnw.ch" className={inputCls} />
                  </div>

                  {adminModuleStatus === "error" && <p className="text-xs font-medium text-danger">Create failed. Please try again.</p>}
                </div>
                <div className="px-4 py-3 border-t border-surface-divider flex-shrink-0">
                  {adminModuleStatus === "saved" && createdModuleId ? (
                    <div className="flex flex-col gap-2 p-3 rounded-input bg-green-50 border border-green-200">
                      <p className="text-xs font-semibold text-success">Module created successfully!</p>
                      <div className="flex gap-2">
                        <button onClick={handleDismissAdminPanel} className="flex-1 px-3 py-1.5 text-xs border border-surface-border rounded-input text-dark-muted hover:text-dark transition-colors">
                          Dismiss
                        </button>
                        <a
                          href={`/admin/modules/${createdModuleId}?created=true`}
                          className="flex-1 text-xs font-semibold text-white bg-primary hover:bg-primary-dark px-3 py-1.5 rounded-input transition-colors text-center"
                        >
                          View Module →
                        </a>
                      </div>
                    </div>
                  ) : (
                    <div className="flex gap-2">
                      <button onClick={handleDismissAdminPanel} className="flex-1 px-3 py-2 text-sm border border-surface-border rounded-input text-dark-muted hover:border-dark-muted hover:text-dark transition-colors">
                        Dismiss
                      </button>
                      <button
                        onClick={handleCreateModule}
                        disabled={!adminFormTitle || !adminFormCredits || adminModuleStatus === "saving"}
                        className="flex-1 px-3 py-2 bg-primary text-white text-sm font-semibold rounded-input hover:bg-primary-dark transition-colors disabled:opacity-50"
                      >
                        {adminModuleStatus === "saving" ? "Creating…" : "Create Module"}
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* ── Normal chat UI ── */}
            {activePanel === "chat" && (
              <>
                {/* Message list */}
                <div className="flex-1 overflow-y-auto px-4 py-3 flex flex-col gap-2">
                  {messages.length === 0 && (
                    <p className="text-center text-dark-muted text-sm mt-6 leading-relaxed">
                      {isAdmin
                        ? `Hi ${user?.firstName}! Upload module documents, manage the catalog, or ask anything about the BIT programme.`
                        : isStudent
                        ? `Hi ${user?.firstName}! Ask me anything about your modules, uploaded documents, or your schedule.`
                        : "Ask me anything about FHNW or the BIT programme. Log in for personalised assistance."}
                    </p>
                  )}

                  {messages.map((msg) => (
                    <div
                      key={msg.id}
                      className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                    >
                      <div
                        className={`max-w-[85%] rounded-input px-3 py-2 text-sm leading-relaxed ${
                          msg.role === "user"
                            ? "bg-primary text-white whitespace-pre-wrap"
                            : "bg-surface-section text-dark-secondary border border-surface-border"
                        }`}
                      >
                        {msg.role === "user" ? (
                          msg.text
                        ) : (
                          <div style={{ lineHeight: "1.6" }}>
                            {renderMessage(msg.text)}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}

                  {isLoading && (
                    <div className="flex justify-start">
                      <div className="bg-surface-section border border-surface-border text-dark-muted text-sm px-3 py-2 rounded-input italic">
                        Thinking…
                      </div>
                    </div>
                  )}

                  <div ref={messagesEndRef} />
                </div>

                {/* Input row */}
                <div className="px-3 py-2 border-t border-surface-divider flex gap-2 flex-shrink-0">
                  <input
                    ref={inputRef}
                    type="text"
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Ask a question…"
                    disabled={isLoading}
                    className="flex-1 px-3 py-2 text-sm border border-surface-border rounded-input text-dark placeholder-dark-subtle focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 disabled:opacity-60 bg-white"
                  />
                  <button
                    onClick={handleSend}
                    disabled={isLoading || !inputValue.trim()}
                    className="px-3 py-2 bg-primary text-white text-sm font-semibold rounded-input hover:bg-primary-dark transition-colors disabled:opacity-50"
                  >
                    Send
                  </button>
                </div>

                {/* Upload section — students and admins */}
                {canUpload && (
                  <div className="px-3 pb-3 flex flex-col gap-1.5 flex-shrink-0 border-t border-surface-divider pt-2">
                    <p className="text-xs font-medium text-dark-muted">
                      Upload a document (PDF or DOCX)
                    </p>
                    <div className="flex gap-2">
                      <label className="flex-1 min-w-0 cursor-pointer">
                        <input
                          type="file"
                          accept=".pdf,.docx,.doc"
                          className="hidden"
                          onChange={handleFileChange}
                        />
                        <span className="block px-3 py-1.5 text-xs border border-surface-border rounded-input text-dark-muted hover:border-primary hover:text-primary transition-colors truncate">
                          {selectedFile ? selectedFile.name : "Choose file…"}
                        </span>
                      </label>
                      <button
                        onClick={handleUpload}
                        disabled={!selectedFile || uploadStatus === "uploading"}
                        className="px-3 py-1.5 bg-primary text-white text-xs font-semibold rounded-input hover:bg-primary-dark transition-colors disabled:opacity-50 flex-shrink-0"
                      >
                        {uploadStatus === "uploading" ? "Uploading…" : "Upload"}
                      </button>
                    </div>
                    {uploadStatus === "done" && !suggestedText && !moduleMatchResult && (
                      <p className="text-xs text-success font-medium">Document uploaded and processed!</p>
                    )}
                    {uploadStatus === "error" && (
                      <p className="text-xs text-danger font-medium">Upload failed. Please try again.</p>
                    )}
                    {isStudent && (uploadedFiles.length > 0 ? (
                      <button
                        onClick={() => setDocsExpanded((p) => !p)}
                        className="text-xs text-primary/70 hover:text-primary transition-colors text-left"
                      >
                        <span style={{ fontSize: "1.2em", marginRight: "4px" }}>
                          {docsExpanded ? "›" : "‹"}
                        </span>
                        My Documents ({uploadedFiles.length})
                      </button>
                    ) : (
                      <p className="text-xs text-dark-subtle">No documents uploaded yet</p>
                    ))}
                  </div>
                )}
              </>
            )}
          </div>

          {/* Documents panel — students only */}
          {isStudent && docsExpanded && (
            <div
              className="bg-white rounded-modal overflow-hidden flex-shrink-0"
              style={{
                ...(isDesktop ? { width: "250px", maxHeight: "500px" } : {}),
                boxShadow: "0 4px 16px rgba(12, 18, 41, 0.12)",
                overflowY: "auto",
              }}
            >
              {uploadedFiles.length === 0 ? (
                <p className="text-xs text-dark-muted px-3 py-2">No documents uploaded yet.</p>
              ) : (
                uploadedFiles.map((f) =>
                  f.id === confirmingId ? (
                    <div
                      key={f.id}
                      className="flex items-center gap-2 px-3 py-2 border-b border-surface-border last:border-b-0 bg-surface-section"
                    >
                      <span className="text-xs text-dark-secondary flex-1 min-w-0 truncate">
                        {truncate(f.fileName)} — Delete?
                      </span>
                      <button
                        onClick={() => handleDeleteFile(f.id)}
                        className="flex-shrink-0 px-2 py-0.5 bg-danger text-white text-xs font-semibold rounded hover:bg-danger/80 transition-colors"
                      >
                        Yes
                      </button>
                      <button
                        onClick={() => setConfirmingId(null)}
                        className="flex-shrink-0 px-2 py-0.5 border border-surface-border text-dark-muted text-xs rounded hover:border-dark-muted hover:text-dark transition-colors"
                      >
                        Cancel
                      </button>
                    </div>
                  ) : (
                    <div
                      key={f.id}
                      className="flex items-center gap-2 px-3 py-2 border-b border-surface-border last:border-b-0"
                    >
                      <svg width="12" height="12" viewBox="0 0 16 16" fill="none" className="flex-shrink-0 text-dark-muted">
                        <path d="M4 2h6l4 4v8a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1V3a1 1 0 0 1 1-1h1z" stroke="currentColor" strokeWidth="1.2" strokeLinejoin="round" />
                        <path d="M9 2v4h4" stroke="currentColor" strokeWidth="1.2" strokeLinejoin="round" />
                      </svg>
                      <span className="text-xs text-dark-secondary flex-1 min-w-0 truncate">{truncate(f.fileName)}</span>
                      {deleteErrors[f.id] && (
                        <span className="text-xs text-danger leading-none flex-shrink-0">Failed</span>
                      )}
                      <button
                        onClick={() => setConfirmingId(f.id)}
                        className="flex-shrink-0 text-danger/50 hover:text-danger transition-colors"
                        aria-label={`Delete ${f.fileName}`}
                      >
                        <svg width="13" height="13" viewBox="0 0 16 16" fill="none">
                          <path
                            d="M2 4h12M5 4V2h6v2M3 4l1 9a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1l1-9M6 7v4M10 7v4"
                            stroke="currentColor"
                            strokeWidth="1.2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                      </button>
                    </div>
                  )
                )
              )}
            </div>
          )}
        </div>
      )}
    </>
  );
}
