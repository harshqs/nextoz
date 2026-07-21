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

  // Load all sessions from IndexedDB on mount
  React.useEffect(() => {
    getAllSessions()
      .then((s) => { setSessions(s); setLoaded(true); })
      .catch(() => setLoaded(true));
  }, []);

  const activeSession = sessions.find((s) => s.id === activeId) ?? null;

  const newChat = React.useCallback(() => {
    setActiveId(null);
  }, []);

  const loadSession = React.useCallback((id: string) => {
    setActiveId(id);
  }, []);

  const addMessage = React.useCallback(
    async (msg: ChatMessage) => {
      const now = Date.now();
      setSessions((prev) => {
        let updated: ChatSession[];
        if (!activeId) {
          // Create new session
          const newSession: ChatSession = {
            id: generateId(),
            title: msg.role === "user" ? generateTitle(msg.content) : "New Chat",
            messages: [msg],
            createdAt: now,
            updatedAt: now,
          };
          setActiveId(newSession.id);
          updated = [newSession, ...prev];
          saveSession(newSession).catch(console.error);
        } else {
          updated = prev.map((s) => {
            if (s.id !== activeId) return s;
            const newMsgs = [...s.messages, msg];
            const updatedSession = { ...s, messages: newMsgs, updatedAt: now };
            saveSession(updatedSession).catch(console.error);
            return updatedSession;
          });
          // Re-sort by updatedAt
          updated = [...updated].sort((a, b) => b.updatedAt - a.updatedAt);
        }
        return updated;
      });
    },
    [activeId]
  );

  const updateLastAssistantMessage = React.useCallback(
    async (content: string) => {
      if (!activeId) return;
      setSessions((prev) => {
        const updated = prev.map((s) => {
          if (s.id !== activeId) return s;
          const msgs = [...s.messages];
          // Update last assistant message in place
          for (let i = msgs.length - 1; i >= 0; i--) {
            if (msgs[i].role === "assistant") {
              msgs[i] = { ...msgs[i], content };
              break;
            }
          }
          const updatedSession = { ...s, messages: msgs, updatedAt: Date.now() };
          saveSession(updatedSession).catch(console.error);
          return updatedSession;
        });
        return updated;
      });
    },
    [activeId]
  );

  const removeSession = React.useCallback(async (id: string) => {
    await deleteSession(id);
    setSessions((prev) => prev.filter((s) => s.id !== id));
    setActiveId((cur) => (cur === id ? null : cur));
  }, []);

  return {
    sessions,
    activeSession,
    activeId,
    loaded,
    newChat,
    loadSession,
    addMessage,
    updateLastAssistantMessage,
    removeSession,
  };
}
