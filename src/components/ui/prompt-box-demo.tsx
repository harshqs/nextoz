"use client";

import * as React from "react";
import { PromptBox, ToolId, UploadedDoc } from "@/components/ui/chatgpt-prompt-input";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { Sidebar } from "@/components/ui/sidebar";
import { MessageRenderer } from "@/components/ui/message-renderer";
import { useChatHistory, ChatMessage } from "@/lib/useChatHistory";

const modeInfo: Record<ToolId, { label: string; color: string; bg: string }> = {
  termsDoc:   { label: "⚖️ Legal Mode",   color: "text-amber-400",   bg: "bg-amber-500/10 border-amber-500/20"   },
  studyDoc:   { label: "📚 Study Mode",   color: "text-emerald-400", bg: "bg-emerald-500/10 border-emerald-500/20" },
  generalDoc: { label: "📁 General Mode", color: "text-blue-400",    bg: "bg-blue-500/10 border-blue-500/20"     },
};

export function PromptBoxDemo() {
  const {
    sessions, activeSession, activeId,
    newChat, loadSession, addMessage, updateLastAssistantMessage, removeSession,
  } = useChatHistory();

  const [streamingContent, setStreamingContent] = React.useState<string | null>(null);
  const [isLoading, setIsLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [lastMode, setLastMode] = React.useState<ToolId>("generalDoc");
  const [sidebarOpen, setSidebarOpen] = React.useState(false);
  const messagesEndRef = React.useRef<HTMLDivElement>(null);

  const messages = activeSession?.messages ?? [];
  const hasMessages = messages.length > 0;

  React.useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, streamingContent]);

  const handleSend = async (question: string, tool: ToolId, doc: UploadedDoc | null) => {
    setError(null);
    setLastMode(tool);

    const userMsg: ChatMessage = { role: "user", content: question, timestamp: Date.now() };
    await addMessage(userMsg);
    setIsLoading(true);
    setStreamingContent("");

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question, docText: doc?.text ?? "", mode: tool }),
      });

      if (!res.ok || !res.body) {
        const err = await res.json().catch(() => ({ error: "Request failed" }));
        throw new Error(err.error ?? "Request failed");
      }

      // Stream tokens
      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";
      let accumulated = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop() ?? "";

        for (const line of lines) {
          if (!line.startsWith("data: ")) continue;
          const json = line.slice(6).trim();
          if (!json) continue;
          try {
            const evt = JSON.parse(json);
            if (evt.error) throw new Error(evt.error);
            if (evt.token) {
              accumulated += evt.token;
              setStreamingContent(accumulated);
            }
            if (evt.done) break;
          } catch (e) {
            if (e instanceof Error && e.message !== "Unexpected end of JSON input") throw e;
          }
        }
      }

      // Save final message to history
      const assistantMsg: ChatMessage = {
        role: "assistant",
        content: accumulated,
        timestamp: Date.now(),
      };
      await addMessage(assistantMsg);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setIsLoading(false);
      setStreamingContent(null);
    }
  };

  return (
    <div className="flex h-screen w-full overflow-hidden bg-[#0a0a0a]">
      {/* Sidebar */}
      <Sidebar
        sessions={sessions}
        activeId={activeId}
        onNewChat={() => { newChat(); setSidebarOpen(false); }}
        onLoad={(id) => { loadSession(id); setSidebarOpen(false); }}
        onDelete={removeSession}
        isOpen={sidebarOpen}
        onToggle={() => setSidebarOpen(p => !p)}
      />

      {/* Main area */}
      <div className="flex flex-1 flex-col min-w-0 h-full">

        {/* Top bar */}
        <header className="flex items-center justify-between px-4 py-3 border-b border-[#1a1a1a] shrink-0">
          <div className="w-9" /> {/* spacer for hamburger */}
          {hasMessages && lastMode && (
            <span className={`text-xs font-medium px-3 py-1 rounded-full border ${modeInfo[lastMode].bg} ${modeInfo[lastMode].color}`}>
              {modeInfo[lastMode].label}
            </span>
          )}
          {!hasMessages && (
            <span className="text-sm font-semibold text-white/60 tracking-wide">NextOz</span>
          )}
          <ThemeToggle />
        </header>

        {/* Chat / Hero area */}
        <div className="flex-1 overflow-y-auto custom-scrollbar">
          {!hasMessages ? (
            /* ── Hero ── */
            <div className="flex flex-col items-center justify-center min-h-full px-4 gap-6">
              <div className="text-center space-y-3">
                <h1 className="text-5xl font-bold text-white tracking-tight">
                  Welcome to{" "}
                  <span className="inline-block cursor-default select-none transition-all duration-300
                    text-white hover:text-transparent hover:bg-clip-text
                    hover:bg-gradient-to-r hover:from-blue-400 hover:via-violet-400 hover:to-blue-400
                    hover:scale-105 hover:drop-shadow-[0_0_24px_rgba(139,92,246,0.6)]">
                    NextOz
                  </span>
                </h1>
                <p className="text-gray-500 text-sm max-w-sm">
                  Upload a PDF or TXT, pick a document mode, and ask anything.
                </p>
              </div>

              {/* Mode hint cards */}
              <div className="flex gap-3 flex-wrap justify-center mt-2">
                {[
                  { icon: "⚖️", label: "Terms & Conditions", desc: "Legal tone" },
                  { icon: "📚", label: "Study Material", desc: "Teacher tone" },
                  { icon: "📁", label: "General Doc", desc: "Adaptive tone" },
                ].map(card => (
                  <div key={card.label} className="flex items-center gap-2.5 px-4 py-2.5 rounded-xl
                    bg-[#111] border border-[#1e1e1e] text-sm text-gray-400 hover:border-[#333] transition-colors">
                    <span className="text-base">{card.icon}</span>
                    <div>
                      <p className="text-xs font-medium text-gray-300">{card.label}</p>
                      <p className="text-[10px] text-gray-600">{card.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            /* ── Messages ── */
            <div className="max-w-3xl mx-auto w-full px-4 py-6 space-y-6 pb-4">
              {messages.map((msg, i) => (
                <MessageBubble key={i} msg={msg} />
              ))}

              {/* Streaming bubble */}
              {streamingContent !== null && (
                <div className="flex gap-3 items-start">
                  <Avatar type="assistant" />
                  <div className="flex-1 min-w-0">
                    <div className="rounded-2xl rounded-tl-sm px-5 py-4 bg-[#111] border border-[#1e1e1e]">
                      <MessageRenderer content={streamingContent} isStreaming={isLoading} />
                    </div>
                  </div>
                </div>
              )}

              {/* Thinking dots (before first token) */}
              {isLoading && streamingContent === "" && (
                <div className="flex gap-3 items-start">
                  <Avatar type="assistant" />
                  <div className="rounded-2xl rounded-tl-sm px-5 py-4 bg-[#111] border border-[#1e1e1e]">
                    <div className="flex gap-1.5 items-center py-1">
                      {[0,1,2].map(j => (
                        <span key={j} className="h-2 w-2 rounded-full bg-gray-500 animate-bounce"
                          style={{ animationDelay: `${j * 0.15}s` }} />
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {error && (
                <div className="rounded-xl bg-red-500/10 border border-red-500/20 px-4 py-3 text-sm text-red-400">
                  ⚠️ {error}
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>
          )}
        </div>

        {/* Input */}
        <div className="shrink-0 px-4 pb-4 pt-2 bg-gradient-to-t from-[#0a0a0a] via-[#0a0a0a]/95 to-transparent">
          <div className="max-w-3xl mx-auto">
            <PromptBox
              messages={messages}
              onSend={handleSend}
              isLoading={isLoading}
            />
            <p className="text-center text-[11px] text-gray-700 mt-2">
              NextOz · Powered by Groq · Responses may be inaccurate
            </p>
          </div>
        </div>

      </div>
    </div>
  );
}

function Avatar({ type }: { type: "user" | "assistant" }) {
  if (type === "assistant") {
    return (
      <div className="h-8 w-8 rounded-full bg-gradient-to-br from-blue-500 to-violet-600
        flex items-center justify-center shrink-0 text-white text-xs font-bold mt-0.5 shadow-lg">
        N
      </div>
    );
  }
  return (
    <div className="h-8 w-8 rounded-full bg-[#1e1e1e] border border-[#2a2a2a]
      flex items-center justify-center shrink-0 text-gray-400 text-xs font-bold mt-0.5">
      U
    </div>
  );
}

function MessageBubble({ msg }: { msg: ChatMessage }) {
  const isUser = msg.role === "user";
  return (
    <div className={`flex gap-3 items-start ${isUser ? "flex-row-reverse" : ""}`}>
      <Avatar type={msg.role} />
      <div className={`max-w-[78%] min-w-0 ${isUser ? "items-end flex flex-col" : ""}`}>
        {isUser ? (
          <div className="rounded-2xl rounded-tr-sm px-4 py-3
            bg-white text-black dark:bg-white dark:text-black text-sm leading-relaxed font-medium shadow-sm">
            {msg.content}
          </div>
        ) : (
          <div className="rounded-2xl rounded-tl-sm px-5 py-4 bg-[#111] border border-[#1e1e1e] shadow-sm">
            <MessageRenderer content={msg.content} />
          </div>
        )}
        <span className="text-[10px] text-gray-700 mt-1 px-1">
          {new Date(msg.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
        </span>
      </div>
    </div>
  );
}
