"use client";
import * as React from "react";
import { ChatSession } from "@/lib/useChatHistory";

interface SidebarProps {
  sessions: ChatSession[];
  activeId: string | null;
  onNewChat: () => void;
  onLoad: (id: string) => void;
  onDelete: (id: string) => void;
  isOpen: boolean;
  onToggle: () => void;
}

const PlusIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 5v14M5 12h14" />
  </svg>
);

const TrashIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="3 6 5 6 21 6" /><path d="M19 6l-1 14H6L5 6" /><path d="M10 11v6M14 11v6" /><path d="M9 6V4h6v2" />
  </svg>
);

const ChatIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
  </svg>
);

const MenuIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="3" y1="6" x2="21" y2="6" /><line x1="3" y1="12" x2="21" y2="12" /><line x1="3" y1="18" x2="21" y2="18" />
  </svg>
);

function timeAgo(ts: number): string {
  const diff = Date.now() - ts;
  const m = Math.floor(diff / 60000);
  if (m < 1) return "just now";
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  const d = Math.floor(h / 24);
  if (d < 7) return `${d}d ago`;
  return new Date(ts).toLocaleDateString();
}

export function Sidebar({ sessions, activeId, onNewChat, onLoad, onDelete, isOpen, onToggle }: SidebarProps) {
  const today = sessions.filter(s => Date.now() - s.updatedAt < 86400000);
  const older = sessions.filter(s => Date.now() - s.updatedAt >= 86400000);

  return (
    <>
      {/* Hamburger toggle — always visible */}
      <button
        onClick={onToggle}
        className="fixed top-4 left-4 z-50 flex h-9 w-9 items-center justify-center rounded-full
          bg-background dark:bg-[#1a1a1a] border border-border dark:border-[#2a2a2a]
          text-foreground dark:text-white hover:bg-accent dark:hover:bg-[#252525] transition-colors"
        aria-label="Toggle sidebar"
      >
        <MenuIcon />
      </button>

      {/* Overlay for mobile */}
      {isOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/40 backdrop-blur-sm md:hidden"
          onClick={onToggle}
        />
      )}

      {/* Sidebar panel */}
      <aside className={`fixed top-0 left-0 z-40 h-full w-64 flex flex-col
        bg-[#0f0f0f] dark:bg-[#0f0f0f] border-r border-[#1e1e1e]
        transition-transform duration-300 ease-in-out
        ${isOpen ? "translate-x-0" : "-translate-x-full"}`}>

        {/* Header */}
        <div className="flex items-center justify-between px-4 pt-4 pb-3 border-b border-[#1e1e1e]">
          <span className="text-sm font-semibold text-white tracking-wide">NextOz</span>
          <button
            onClick={onNewChat}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium
              bg-white/10 hover:bg-white/20 text-white transition-colors"
          >
            <PlusIcon /> New Chat
          </button>
        </div>

        {/* Sessions list */}
        <div className="flex-1 overflow-y-auto py-2 custom-scrollbar">
          {sessions.length === 0 && (
            <p className="text-center text-xs text-gray-600 mt-8 px-4">
              No chats yet. Upload a document and start asking!
            </p>
          )}

          {today.length > 0 && (
            <div className="px-3 py-1.5">
              <p className="text-[10px] font-semibold uppercase tracking-wider text-gray-600 mb-1">Today</p>
              {today.map(s => (
                <SessionItem key={s.id} session={s} isActive={s.id === activeId} onLoad={onLoad} onDelete={onDelete} />
              ))}
            </div>
          )}

          {older.length > 0 && (
            <div className="px-3 py-1.5">
              <p className="text-[10px] font-semibold uppercase tracking-wider text-gray-600 mb-1">Earlier</p>
              {older.map(s => (
                <SessionItem key={s.id} session={s} isActive={s.id === activeId} onLoad={onLoad} onDelete={onDelete} />
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-4 py-3 border-t border-[#1e1e1e]">
          <p className="text-[10px] text-gray-600 text-center">Stored locally in your browser</p>
        </div>
      </aside>
    </>
  );
}

function SessionItem({ session, isActive, onLoad, onDelete }: {
  session: ChatSession;
  isActive: boolean;
  onLoad: (id: string) => void;
  onDelete: (id: string) => void;
}) {
  const [hovered, setHovered] = React.useState(false);

  return (
    <div
      className={`group flex items-center gap-2 w-full rounded-lg px-2 py-2 mb-0.5 cursor-pointer transition-colors
        ${isActive
          ? "bg-white/10 text-white"
          : "text-gray-400 hover:bg-white/5 hover:text-white"}`}
      onClick={() => onLoad(session.id)}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <ChatIcon />
      <div className="flex-1 min-w-0">
        <p className="text-xs truncate leading-snug">{session.title}</p>
        <p className="text-[10px] text-gray-600 mt-0.5">{timeAgo(session.updatedAt)}</p>
      </div>
      {hovered && (
        <button
          onClick={(e) => { e.stopPropagation(); onDelete(session.id); }}
          className="shrink-0 text-gray-600 hover:text-red-400 transition-colors p-0.5 rounded"
          aria-label="Delete chat"
        >
          <TrashIcon />
        </button>
      )}
    </div>
  );
}
