"use client";
import * as React from "react";
import katex from "katex";

// Render LaTeX math string safely
function renderMath(latex: string, display: boolean): string {
  try {
    return katex.renderToString(latex, {
      displayMode: display,
      throwOnError: false,
      strict: false,
    });
  } catch {
    return latex;
  }
}

// Split text into math and non-math segments
// Handles: $$...$$, $...$, \(...\), \[...\], ^2, x^{...}
function parseMathSegments(text: string): Array<{ type: "text" | "math-inline" | "math-block"; content: string }> {
  const segments: Array<{ type: "text" | "math-inline" | "math-block"; content: string }> = [];
  // Match $$...$$ first (block), then $...$ (inline), then \[...\] and \(...\)
  const re = /\$\$[\s\S]+?\$\$|\$[^$\n]+?\$|\\\[[\s\S]+?\\\]|\\\([^)]+?\\\)/g;
  let last = 0;
  let match: RegExpExecArray | null;

  while ((match = re.exec(text)) !== null) {
    if (match.index > last) {
      segments.push({ type: "text", content: text.slice(last, match.index) });
    }
    const m = match[0];
    if (m.startsWith("$$") || m.startsWith("\\[")) {
      const inner = m.startsWith("$$") ? m.slice(2, -2) : m.slice(2, -2);
      segments.push({ type: "math-block", content: inner.trim() });
    } else {
      const inner = m.startsWith("$") ? m.slice(1, -1) : m.slice(2, -2);
      segments.push({ type: "math-inline", content: inner.trim() });
    }
    last = match.index + m.length;
  }

  if (last < text.length) {
    segments.push({ type: "text", content: text.slice(last) });
  }

  return segments;
}

// Upgrade plain text superscripts like x^2 or x^{n+1} to LaTeX inline math
function upgradeCarets(text: string): string {
  // x^2 → $x^2$, x^{...} → $x^{...}$
  return text.replace(/([A-Za-z0-9])\^(\{[^}]+\}|\d+)/g, "$$$1^$2$$");
}

/** Render a string that may contain math, bold, italic, code */
function InlineContent({ text }: { text: string }) {
  const upgraded = upgradeCarets(text);
  const segments = parseMathSegments(upgraded);

  return (
    <>
      {segments.map((seg, i) => {
        if (seg.type === "math-block") {
          return (
            <span
              key={i}
              className="block my-3 overflow-x-auto"
              dangerouslySetInnerHTML={{ __html: renderMath(seg.content, true) }}
            />
          );
        }
        if (seg.type === "math-inline") {
          return (
            <span
              key={i}
              dangerouslySetInnerHTML={{ __html: renderMath(seg.content, false) }}
            />
          );
        }
        // Plain text with bold/italic/code
        return <InlineMd key={i} text={seg.content} />;
      })}
    </>
  );
}

function InlineMd({ text }: { text: string }) {
  const parts = text.split(/(\*\*[^*]+\*\*|\*[^*]+\*|`[^`]+`)/g);
  return (
    <>
      {parts.map((part, i) => {
        if (part.startsWith("**") && part.endsWith("**"))
          return <strong key={i} className="font-semibold text-foreground">{part.slice(2, -2)}</strong>;
        if (part.startsWith("*") && part.endsWith("*"))
          return <em key={i} className="italic">{part.slice(1, -1)}</em>;
        if (part.startsWith("`") && part.endsWith("`"))
          return <code key={i} className="px-1.5 py-0.5 rounded bg-muted dark:bg-[#1a1a1a] text-emerald-600 dark:text-emerald-300 text-xs font-mono border border-border">{part.slice(1, -1)}</code>;
        return <React.Fragment key={i}>{part}</React.Fragment>;
      })}
    </>
  );
}

export function MessageRenderer({ content, isStreaming }: { content: string; isStreaming?: boolean }) {
  const lines = content.split("\n");
  const elements: React.ReactNode[] = [];
  let i = 0;

  while (i < lines.length) {
    const line = lines[i];

    // H2
    if (line.startsWith("## ")) {
      elements.push(
        <h2 key={i} className="text-base font-bold text-foreground mt-4 mb-2 first:mt-0">
          <InlineContent text={line.slice(3)} />
        </h2>
      );
      i++; continue;
    }
    // H3
    if (line.startsWith("### ")) {
      elements.push(
        <h3 key={i} className="text-sm font-semibold text-foreground mt-3 mb-1.5 first:mt-0">
          <InlineContent text={line.slice(4)} />
        </h3>
      );
      i++; continue;
    }
    // Block math $$
    if (line.trimStart().startsWith("$$")) {
      const mathLines: string[] = [];
      const opening = line.trimStart();
      if (opening === "$$") {
        i++;
        while (i < lines.length && lines[i].trim() !== "$$") {
          mathLines.push(lines[i]);
          i++;
        }
        i++;
      } else {
        mathLines.push(opening.slice(2, opening.endsWith("$$") ? -2 : undefined));
        i++;
      }
      elements.push(
        <div
          key={`bm-${i}`}
          className="my-3 overflow-x-auto rounded-xl bg-muted/50 dark:bg-[#111] p-3 border border-border"
          dangerouslySetInnerHTML={{ __html: renderMath(mathLines.join("\n"), true) }}
        />
      );
      continue;
    }
    // Bullet list
    if (line.startsWith("- ") || line.startsWith("* ")) {
      const items: string[] = [];
      while (i < lines.length && (lines[i].startsWith("- ") || lines[i].startsWith("* "))) {
        items.push(lines[i].slice(2)); i++;
      }
      elements.push(
        <ul key={`ul-${i}`} className="my-2 space-y-1.5 pl-2">
          {items.map((item, j) => (
            <li key={j} className="flex gap-2 text-sm text-foreground leading-relaxed">
              <span className="mt-2 h-1.5 w-1.5 rounded-full bg-blue-500 shrink-0" />
              <span><InlineContent text={item} /></span>
            </li>
          ))}
        </ul>
      );
      continue;
    }
    // Numbered list
    if (/^\d+\.\s/.test(line)) {
      const items: string[] = [];
      while (i < lines.length && /^\d+\.\s/.test(lines[i])) {
        items.push(lines[i].replace(/^\d+\.\s/, "")); i++;
      }
      elements.push(
        <ol key={`ol-${i}`} className="my-2 space-y-1.5 pl-2">
          {items.map((item, j) => (
            <li key={j} className="flex gap-2.5 text-sm text-foreground leading-relaxed">
              <span className="shrink-0 text-blue-500 font-semibold text-xs mt-0.5 w-4">{j + 1}.</span>
              <span><InlineContent text={item} /></span>
            </li>
          ))}
        </ol>
      );
      continue;
    }
    // Code block
    if (line.startsWith("```")) {
      const codeLines: string[] = [];
      i++;
      while (i < lines.length && !lines[i].startsWith("```")) { codeLines.push(lines[i]); i++; }
      i++;
      elements.push(
        <pre key={`code-${i}`} className="my-3 rounded-xl bg-muted dark:bg-[#0d0d0d] border border-border p-4 overflow-x-auto custom-scrollbar">
          <code className="text-xs text-emerald-600 dark:text-emerald-300 font-mono leading-relaxed">
            {codeLines.join("\n")}
          </code>
        </pre>
      );
      continue;
    }
    // HR
    if (line === "---" || line === "***") {
      elements.push(<hr key={i} className="my-3 border-border" />);
      i++; continue;
    }
    // Empty
    if (!line.trim()) {
      elements.push(<div key={i} className="h-2" />);
      i++; continue;
    }
    // Paragraph
    elements.push(
      <p key={i} className="text-sm text-foreground leading-7">
        <InlineContent text={line} />
      </p>
    );
    i++;
  }

  return (
    <div className="space-y-0.5">
      {elements}
      {isStreaming && (
        <span className="inline-block w-1.5 h-4 ml-0.5 bg-blue-500 rounded-sm animate-pulse" />
      )}
    </div>
  );
}
