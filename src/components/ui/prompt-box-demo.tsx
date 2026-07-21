"use client";

import * as React from "react";
import { PromptBox, ChatMessage, ToolId, UploadedDoc } from "@/components/ui/chatgpt-prompt-input";
import { ThemeToggle } from "@/components/ui/theme-toggle";

// Simple markdown renderer
function RenderMessage({ content }: { content: string }) {
  const lines = content.split("\n");
  return (
    <div className="space-y-1 leading-relaxed">
      {lines.map((line, i) => {
        if (!line.trim()) return <br key={i} />;
        const parts = line.split(/(\*\*[^*]+\*\*)/g);
        return (
          <p key={i}>
            {parts.map((part, j) =>
              part.startsWith("**") && part.endsWith("**")
                ? <strong key={j}>{part.slice(2, -2)}</strong>
                : part
            )}
          </p>
        );
      })}
    </div>
  );
}

const modeInfo: Record<ToolId, { label: string; color: string; bg: string }> = {
  termsDoc:   { label: "⚖️ Legal Mode",   color: "text-amber-700 dark:text-amber-300",     bg: "bg-amber-50 dark:bg-amber-900/20"    },
  studyDoc:   { label: "📚 Study Mode",   color: "text-emerald-700 dark:text-emerald-300", bg: "bg-emerald-50 dark:bg-emerald-900/20" },
  generalDoc: { label: "📁 General Mode", color: "text-blue-700 dark:text-blue-300",       bg: "bg-blue-50 dark:bg-blue-900/20"      },
};

export function PromptBoxDemo() {
  const [messages, setMessages] = React.useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [lastMode, setLastMode] = React.useState<ToolId | null>(null);
  const messagesEndRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  const handleSend = async (question: string, tool: ToolId, doc: UploadedDoc | null) => {
    setError(null);
    setLastMode(tool);
    const userMsg: ChatMessage = { role: "user", content: question };
    setMessages(prev => [...prev, userMsg]);
    setIsLoading(true);
    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question, docText: doc?.text ?? "", mode: tool }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Request failed");
      setMessages(prev => [...prev, { role: "assistant", content: data.answer }]);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Something went wrong");
      setMessages(prev => prev.slice(0, -1));
    } finally {
      setIsLoading(false);
    }
  };

  const hasMessages = messages.length > 0;

  return (
    <div className="min-h-screen w-full flex flex-col bg-background dark:bg-[#212121] transition-colors duration-300">

      {/* Theme toggle — top right */}
      <div className="fixed top-4 right-4 z-50">
        <ThemeToggle />
      </div>

      {/* ── No messages: fully centered hero layout ── */}
      {!hasMessages && (
        <div className="flex flex-1 flex-col items-center justify-center px-4 gap-8 min-h-screen">
          <h1 className="text-4xl md:text-5xl font-bold text-foreground dark:text-white tracking-tight">
            Welcome to{" "}
            <span className="inline-block cursor-default select-none
              text-transparent bg-clip-text bg-gradient-to-r from-blue-500 via-violet-500 to-blue-500
              transition-all duration-300
              hover:scale-105 hover:drop-shadow-[0_0_24px_rgba(139,92,246,0.6)]">
              NextOz
            </span>
          </h1>

          <div className="w-full max-w-xl">
            <PromptBox messages={messages} onSend={handleSend} isLoading={isLoading} />
          </div>
        </div>
      )}

      {/* ── Has messages: chat view ── */}
      {hasMessages && (
        <>
          {/* Scrollable messages */}
          <div className="flex-1 overflow-y-auto">
            <div className="max-w-2xl mx-auto w-full px-4 py-8 pt-16 space-y-6 pb-36">

              {messages.map((msg, i) => (
                <div key={i} className={`flex gap-3 ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                  {msg.role === "assistant" && (
                    <div className="h-8 w-8 rounded-full bg-gradient-to-br from-blue-500 to-violet-500 flex items-center justify-center shrink-0 text-white text-xs font-bold mt-1">
                      N
                    </div>
                  )}
                  <div className={`max-w-[80%] rounded-2xl px-4 py-3 text-sm ${
                    msg.role === "user"
                      ? "bg-black text-white dark:bg-white dark:text-black rounded-br-sm"
                      : "bg-muted dark:bg-[#3a3a3a] text-foreground dark:text-white rounded-bl-sm"
                  }`}>
                    {msg.role === "assistant"
                      ? <RenderMessage content={msg.content} />
                      : msg.content}
                  </div>
                  {msg.role === "user" && (
                    <div className="h-8 w-8 rounded-full bg-gradient-to-br from-gray-600 to-gray-800 dark:from-gray-300 dark:to-gray-500 flex items-center justify-center shrink-0 text-white dark:text-black text-xs font-bold mt-1">
                      U
                    </div>
                  )}
                </div>
              ))}

              {/* Thinking indicator */}
              {isLoading && lastMode && (
                <div className="flex gap-3 justify-start">
                  <div className="h-8 w-8 rounded-full bg-gradient-to-br from-blue-500 to-violet-500 flex items-center justify-center shrink-0 text-white text-xs font-bold mt-1">N</div>
                  <div className={`rounded-2xl rounded-bl-sm px-4 py-3 text-xs font-medium flex items-center gap-2 ${modeInfo[lastMode].bg} ${modeInfo[lastMode].color}`}>
                    <span className="animate-pulse">●●●</span>
                    <span>{modeInfo[lastMode].label} is thinking…</span>
                  </div>
                </div>
              )}

              {/* Error */}
              {error && (
                <div className="rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 px-4 py-3 text-sm text-red-600 dark:text-red-400">
                  ⚠️ {error}
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>
          </div>

          {/* Sticky bottom input */}
          <div className="sticky bottom-0 w-full bg-gradient-to-t from-background dark:from-[#212121] via-background/90 dark:via-[#212121]/90 to-transparent pt-8 pb-4 px-4">
            {lastMode && (
              <div className="max-w-2xl mx-auto mb-2">
                <span className={`text-xs font-medium px-2 py-1 rounded-full ${modeInfo[lastMode].bg} ${modeInfo[lastMode].color}`}>
                  {modeInfo[lastMode].label}
                </span>
              </div>
            )}
            <div className="max-w-2xl mx-auto">
              <PromptBox messages={messages} onSend={handleSend} isLoading={isLoading} />
              <p className="text-center text-xs text-muted-foreground dark:text-gray-600 mt-2">
                NextOz · Powered by Ollama · Runs locally
              </p>
            </div>
          </div>
        </>
      )}

    </div>
  );
}
