import { useState, useEffect, useRef } from "react";
import { useAuth } from "../../context/AuthContext";

export function useChatBot() {
  const { user } = useAuth();
  const [messages, setMessages] = useState(() => {
    try {
      const saved = sessionStorage.getItem("chatMessages");
      return saved ? JSON.parse(saved) : [];
    } catch { return []; }
  });
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [moduleMatchResult, setModuleMatchResult] = useState(null);

  // Always tracks the latest user object so sendMessage never reads a stale closure value
  const userRef = useRef(user);
  userRef.current = user;

  const loadUploadedFiles = async () => {
    const headers = {};
    const stored = localStorage.getItem("auth_credentials");
    if (!stored) { setUploadedFiles([]); return; }
    try {
      const { email, password } = JSON.parse(atob(stored));
      headers["Authorization"] = "Basic " + btoa(`${email}:${password}`);
    } catch {
      setUploadedFiles([]);
      return;
    }
    try {
      const res = await fetch("/api/rag/uploads", { headers });
      if (res.ok) {
        setUploadedFiles(await res.json());
      } else {
        setUploadedFiles([]);
      }
    } catch {
      setUploadedFiles([]);
    }
  };

  useEffect(() => { loadUploadedFiles(); }, []);

  useEffect(() => {
    if (user?.userID) {
      loadUploadedFiles();
    } else {
      setUploadedFiles([]);
    }
  }, [user]);

  useEffect(() => {
    sessionStorage.setItem("chatMessages", JSON.stringify(messages));
  }, [messages]);

  const sendMessage = async () => {
    const question = inputValue.trim();
    if (!question) return;
    const now = Date.now();
    setInputValue("");
    setMessages((prev) => [
      ...prev,
      { id: now, role: "user", text: question },
    ]);
    setIsLoading(true);

    const authHeaders = {};
    const stored = localStorage.getItem("auth_credentials");
    if (stored) {
      try {
        const { email, password } = JSON.parse(atob(stored));
        authHeaders["Authorization"] = "Basic " + btoa(`${email}:${password}`);
      } catch {}
    }

    const assistantId = now + 1;
    let firstChunk = true;

    try {
      const body = { question };
      const userId = userRef.current?.userID ?? null;
      if (userId) body.userId = userId;

      const res = await fetch("/api/chat/stream", {
        method: "POST",
        headers: { ...authHeaders, "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (!res.ok) throw new Error("Stream request failed");

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split(/\r?\n/);
        buffer = lines.pop() ?? "";

        for (const line of lines) {
          if (!line.startsWith("data:")) continue;
          const text = line.slice(5).replace(/\\n/g, "\n");
          if (text === "") continue;

          if (firstChunk) {
            firstChunk = false;
            setIsLoading(false);
            setMessages((prev) => [
              ...prev,
              { id: assistantId, role: "assistant", text },
            ]);
          } else {
            setMessages((prev) =>
              prev.map((m) =>
                m.id === assistantId ? { ...m, text: m.text + text } : m
              )
            );
          }
        }
      }

      if (!firstChunk) {
        setMessages((prev) => {
          const next = prev.map((m) =>
            m.id === assistantId
              ? { ...m, text: m.text.replace(/\n-/g, "\n\n-") }
              : m
          );
          console.log("FINAL TEXT:", JSON.stringify(next[next.length - 1]?.text));
          return next;
        });
      }

      if (firstChunk) {
        setMessages((prev) => [
          ...prev,
          { id: assistantId, role: "assistant", text: "I could not get a response. Please try again." },
        ]);
      }
    } catch (err) {
      console.error("Chat stream error:", err);
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now() + 1,
          role: "assistant",
          text: "Sorry, I couldn't get a response. Please try again.",
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  // Uses native fetch so the browser sets the multipart boundary automatically.
  const uploadFile = async (file) => {
    const headers = {};
    const stored = localStorage.getItem("auth_credentials");
    if (stored) {
      try {
        const { email, password } = JSON.parse(atob(stored));
        headers["Authorization"] = "Basic " + btoa(`${email}:${password}`);
      } catch {
        // no stored credentials — request will be rejected by the server
      }
    }

    const formData = new FormData();
    formData.append("file", file);

    const res = await fetch(`/api/rag/upload`, {
      method: "POST",
      headers,
      body: formData,
    });

    if (!res.ok) {
      const errorText = await res.text();
      console.error("Upload failed:", res.status, errorText);
      throw new Error(errorText || "Upload failed");
    }

    const data = await res.json();

    if (data.userRole === "ADMIN") {
      const titleGuess = file.name.replace(/\.[^.]+$/, "").replace(/[-_]/g, " ");
      try {
        const matchRes = await fetch(
          `/api/rag/match-module?title=${encodeURIComponent(titleGuess)}`,
          { headers }
        );
        if (matchRes.ok) {
          const matchData = await matchRes.json();
          setModuleMatchResult({
            matched: matchData.matched,
            module: matchData.module,
            matchScore: matchData.matchScore,
            suggestions: data.suggestions,
            fileName: file.name,
          });
        } else {
          setModuleMatchResult({ matched: false, module: null, matchScore: 0, suggestions: data.suggestions, fileName: file.name });
        }
      } catch {
        setModuleMatchResult({ matched: false, module: null, matchScore: 0, suggestions: data.suggestions, fileName: file.name });
      }
    }

    await loadUploadedFiles();
    return data;
  };

  const deleteFile = async (id) => {
    const headers = {};
    const stored = localStorage.getItem("auth_credentials");
    if (stored) {
      try {
        const { email, password } = JSON.parse(atob(stored));
        headers["Authorization"] = "Basic " + btoa(`${email}:${password}`);
      } catch {}
    }
    const res = await fetch(`/api/rag/uploads/${id}`, { method: "DELETE", headers });
    if (!res.ok) throw new Error("Delete failed");
    setUploadedFiles((prev) => prev.filter((f) => f.id !== id));
  };

  const clearMessages = () => {
    setMessages([]);
    sessionStorage.removeItem("chatMessages");
  };

  return { messages, inputValue, setInputValue, sendMessage, uploadFile, deleteFile, clearMessages, isLoading, uploadedFiles, moduleMatchResult, setModuleMatchResult };
}
