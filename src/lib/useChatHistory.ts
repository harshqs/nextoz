"use client";
import * as React from "react";

export interface ChatMessage {
  role: "user" | "assistant";
  content: string;
  timestamp: number;
}

export interface ChatSession {
  id: string;
  title: string;
  messages: ChatMessage[];
  createdAt: number;
  updatedAt: number;
}

const DB_NAME = "nextoz_db";
const DB_VERSION = 1;
const STORE = "sessions";

function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VERSION);
    req.onupgradeneeded = () => {
      const db = req.result;
      if (!db.objectStoreNames.contains(STORE)) {
        const store = db.createObjectStore(STORE, { keyPath: "id" });
        store.createIndex("updatedAt", "updatedAt");
      }
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

async function getAllSessions(): Promise<ChatSession[]> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE, "readonly");
    const req = tx.objectStore(STORE).index("updatedAt").getAll();
    req.onsuccess = () => resolve((req.result as ChatSession[]).reverse());
    req.onerror = () => reject(req.error);
  });
}

async function saveSession(session: ChatSession): Promise<void> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE, "readwrite");
    const req = tx.objectStore(STORE).put(session);
    req.onsuccess = () => resolve();
    req.onerror = () => reject(req.error);
  });
}

async function deleteSession(id: string): Promise<void> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE, "readwrite");
    const req = tx.objectStore(STORE).delete(id);
    req.onsuccess = () => resolve();
    req.onerror = () => reject(req.error);
  });
}

function generateId() {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

function generateTitle(firstMessage: string): string {
  return firstMessage.slice(0, 50).trim() + (firstMessage.length > 50 ? "…" : "");
}

export function useChatHistory() {
  const [sessions, setSessions] = React.useState<ChatSession[]>([]);
  const [activeId, setActiveId] = React.useState<string | null>(null);
  const [loaded, setLoaded] = React.useState(false);

  // Keep a ref in sync with activeId so callbacks always see the latest value
  const activeIdRef = React.useRef<string | null>(null);
  React.useEffect(() => {
    activeIdRef.current = activeId;
  }, [activeId]);

  React.useEffect(() => {
    getAllSessions()
      .then((s) => { setSessions(s); setLoaded(true); })
      .catch(() => setLoaded(true));
  }, []);

  const activeSession = sessions.find((s) => s.id === activeId) ?? null;

  const newChat = React.useCallback(() => {
    setActiveId(null);
    activeIdRef.current = null;
  }, []);

  const loadSession = React.useCallback((id: string) => {
    setActiveId(id);
    activeIdRef.current = id;
  }, []);

  /**
   * Add a user message — creates a new session if none is active,
   * returns the session ID so the caller can pin subsequent messages to it.
   */
  const addUserMessage = React.useCallback((msg: ChatMessage): string => {
    const now = Date.now();
    const currentId = activeIdRef.current;

    if (!currentId) {
      // Start a brand-new session
      const newId = generateId();
      const newSession: ChatSession = {
        id: newId,
        title: generateTitle(msg.content),
        messages: [msg],
        createdAt: now,
        updatedAt: now,
      };
      // Update ref immediately — before any re-render
      activeIdRef.current = newId;
      setActiveId(newId);
      setSessions((prev) => [newSession, ...prev]);
      saveSession(newSession).catch(console.error);
      return newId;
    }

    // Append to existing session
    setSessions((prev) => {
      const updated = prev.map((s) => {
        if (s.id !== currentId) return s;
        const updatedSession = { ...s, messages: [...s.messages, msg], updatedAt: now };
        saveSession(updatedSession).catch(console.error);
        return updatedSession;
      });
      return [...updated].sort((a, b) => b.updatedAt - a.updatedAt);
    });
    return currentId;
  }, []); // no deps — uses ref

  /**
   * Add the assistant reply to a specific session by ID.
   * This avoids any stale-closure issue entirely.
   */
  const addAssistantMessage = React.useCallback((sessionId: string, msg: ChatMessage) => {
    const now = Date.now();
    setSessions((prev) => {
      const updated = prev.map((s) => {
        if (s.id !== sessionId) return s;
        const updatedSession = { ...s, messages: [...s.messages, msg], updatedAt: now };
        saveSession(updatedSession).catch(console.error);
        return updatedSession;
      });
      return [...updated].sort((a, b) => b.updatedAt - a.updatedAt);
    });
  }, []);

  const removeSession = React.useCallback(async (id: string) => {
    await deleteSession(id);
    setSessions((prev) => prev.filter((s) => s.id !== id));
    setActiveId((cur) => {
      const next = cur === id ? null : cur;
      activeIdRef.current = next;
      return next;
    });
  }, []);

  return {
    sessions,
    activeSession,
    activeId,
    loaded,
    newChat,
    loadSession,
    addUserMessage,
    addAssistantMessage,
    removeSession,
  };
}
