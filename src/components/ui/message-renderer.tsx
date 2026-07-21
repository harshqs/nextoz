"use client";
import * as React from "react";

/** Renders markdown-like text with proper styling */
export function MessageRenderer({ content, isStreaming }: { content: string; isStreaming?: boolean }) {
  const lines = content.split("\n");
  const elements: React.ReactNode[] = [];
  let i = 0;

  while (i < lines.length) {
    const line = lines[i];

    // H2 heading
    if (line.startsWith("## ")) {
      elements.push(
        <h2 key={i} className="text-base font-bold text-white mt-4 mb-2 first:mt-0">
          {renderInline(line.slice(3))}
        </h2>
      );
      i++; continue;
    }

    // H3 heading
    if (line.startsWith("### ")) {
      elements.push(
        <h3 key={i} className="text-sm font-semibold text-gray-200 mt-3 mb-1.5 first:mt-0">
          {renderInline(line.slice(4))}
        </h3>
      );
      i++; continue;
    }

    // Bullet list
    if (line.startsWith("- ") || line.startsWith("* ")) {
      const items: string[] = [];
      while (i < lines.length && (lines[i].startsWith("- ") || lines[i].startsWith("* "))) {
        items.push(lines[i].slice(2));
        i++;
      }
      elements.push(
        <ul key={`ul-${i}`} className="my-2 space-y-1.5 pl-4">
          {items.map((item, j) => (
            <li key={j} className="flex gap-2 text-sm text-gray-200 leading-relaxed">
              <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-blue-400 shrink-0" />
              <span>{renderInline(item)}</span>
            </li>
          ))}
        </ul>
      );
      continue;
    }

    // Numbered list
    if (/^\d+\.\s/.test(line)) {
      const items: string[] = [];
      let num = 1;
      while (i < lines.length && /^\d+\.\s/.test(lines[i])) {
        items.push(lines[i].replace(/^\d+\.\s/, ""));
        i++;
      }
      elements.push(
        <ol key={`ol-${i}`} className="my-2 space-y-1.5 pl-4">
          {items.map((item, j) => (
            <li key={j} className="flex gap-2.5 text-sm text-gray-200 leading-relaxed">
              <span className="shrink-0 text-blue-400 font-medium text-xs mt-0.5">{j + 1}.</span>
              <span>{renderInline(item)}</span>
            </li>
          ))}
        </ol>
      );
      num; continue;
    }

    // Code block
    if (line.startsWith("```")) {
      const codeLines: string[] = [];
      i++;
      while (i < lines.length && !lines[i].startsWith("```")) {
        codeLines.push(lines[i]);
        i++;
      }
      i++;
      elements.push(
        <pre key={`code-${i}`} className="my-3 rounded-xl bg-[#0d0d0d] border border-[#2a2a2a] p-4 overflow-x-auto custom-scrollbar">
          <code className="text-xs text-emerald-300 font-mono leading-relaxed">
            {codeLines.join("\n")}
          </code>
        </pre>
      );
      continue;
    }

    // Horizontal rule
    if (line === "---" || line === "***") {
      elements.push(<hr key={i} className="my-3 border-[#2a2a2a]" />);
      i++; continue;
    }

    // Empty line → spacer
    if (!line.trim()) {
      elements.push(<div key={i} className="h-2" />);
      i++; continue;
    }

    // Normal paragraph
    elements.push(
      <p key={i} className="text-sm text-gray-200 leading-7">
        {renderInline(line)}
      </p>
    );
    i++;
  }

  return (
    <div className="space-y-0.5">
      {elements}
      {isStreaming && (
        <span className="inline-block w-1.5 h-4 ml-0.5 bg-blue-400 rounded-sm animate-pulse" />
      )}
    </div>
  );
}

/** Renders inline markdown: **bold**, *italic*, `code`, and plain text */
function renderInline(text: string): React.ReactNode[] {
  const parts = text.split(/(\*\*[^*]+\*\*|\*[^*]+\*|`[^`]+`)/g);
  return parts.map((part, i) => {
    if (part.startsWith("**") && part.endsWith("**")) {
      return <strong key={i} className="font-semibold text-white">{part.slice(2, -2)}</strong>;
    }
    if (part.startsWith("*") && part.endsWith("*")) {
      return <em key={i} className="italic text-gray-300">{part.slice(1, -1)}</em>;
    }
    if (part.startsWith("`") && part.endsWith("`")) {
      return <code key={i} className="px-1.5 py-0.5 rounded bg-[#1a1a1a] text-emerald-300 text-xs font-mono">{part.slice(1, -1)}</code>;
    }
    return part;
  });
}
