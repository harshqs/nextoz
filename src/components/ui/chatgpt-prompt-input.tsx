"use client";
import * as React from "react";
import * as TooltipPrimitive from "@radix-ui/react-tooltip";
import * as PopoverPrimitive from "@radix-ui/react-popover";

// --- Utility ---
type ClassValue = string | number | boolean | null | undefined;
function cn(...inputs: ClassValue[]): string {
  return inputs.filter(Boolean).join(" ");
}

// --- Tooltip primitives ---
const TooltipProvider = TooltipPrimitive.Provider;
const Tooltip = TooltipPrimitive.Root;
const TooltipTrigger = TooltipPrimitive.Trigger;
const TooltipContent = React.forwardRef<
  React.ElementRef<typeof TooltipPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof TooltipPrimitive.Content> & { showArrow?: boolean }
>(({ className, sideOffset = 4, showArrow = false, ...props }, ref) => (
  <TooltipPrimitive.Portal>
    <TooltipPrimitive.Content
      ref={ref}
      sideOffset={sideOffset}
      className={cn(
        "relative z-50 max-w-[280px] rounded-md bg-popover text-popover-foreground px-1.5 py-1 text-xs animate-in fade-in-0 zoom-in-95 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2",
        className
      )}
      {...props}
    >
      {props.children}
      {showArrow && <TooltipPrimitive.Arrow className="-my-px fill-popover" />}
    </TooltipPrimitive.Content>
  </TooltipPrimitive.Portal>
));
TooltipContent.displayName = TooltipPrimitive.Content.displayName;

// --- Popover primitives ---
const Popover = PopoverPrimitive.Root;
const PopoverTrigger = PopoverPrimitive.Trigger;
const PopoverContent = React.forwardRef<
  React.ElementRef<typeof PopoverPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof PopoverPrimitive.Content>
>(({ className, align = "center", sideOffset = 4, ...props }, ref) => (
  <PopoverPrimitive.Portal>
    <PopoverPrimitive.Content
      ref={ref}
      align={align}
      sideOffset={sideOffset}
      className={cn(
        "z-50 w-64 rounded-xl bg-popover dark:bg-[#1a1a1a] p-2 text-popover-foreground dark:text-white shadow-md outline-none animate-in data-[state=open]:fade-in-0 data-[state=closed]:fade-out-0 data-[state=open]:zoom-in-95 data-[state=closed]:zoom-out-95 data-[side=bottom]:slide-in-from-top-2 data-[side=top]:slide-in-from-bottom-2",
        className
      )}
      {...props}
    />
  </PopoverPrimitive.Portal>
));
PopoverContent.displayName = PopoverPrimitive.Content.displayName;

// --- Icons ---
const PlusIcon = (p: React.SVGProps<SVGSVGElement>) => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" {...p}>
    <path d="M12 5V19" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M5 12H19" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);
const Settings2Icon = (p: React.SVGProps<SVGSVGElement>) => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" {...p}>
    <path d="M20 7h-9"/><path d="M14 17H5"/>
    <circle cx="17" cy="17" r="3"/><circle cx="7" cy="7" r="3"/>
  </svg>
);
const SendIcon = (p: React.SVGProps<SVGSVGElement>) => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" {...p}>
    <path d="M12 5.25L12 18.75" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M18.75 12L12 5.25L5.25 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);
const XIcon = (p: React.SVGProps<SVGSVGElement>) => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}>
    <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
  </svg>
);
const MicIcon = (p: React.SVGProps<SVGSVGElement>) => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" {...p}>
    <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"/>
    <path d="M19 10v2a7 7 0 0 1-14 0v-2"/>
    <line x1="12" y1="19" x2="12" y2="23"/>
  </svg>
);
const FileTextIcon = (p: React.SVGProps<SVGSVGElement>) => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" {...p}>
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
    <polyline points="14 2 14 8 20 8"/>
    <line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/>
  </svg>
);
const BookOpenIcon = (p: React.SVGProps<SVGSVGElement>) => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" {...p}>
    <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/>
    <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/>
  </svg>
);
const FolderIcon = (p: React.SVGProps<SVGSVGElement>) => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" {...p}>
    <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/>
  </svg>
);
const FileIcon = (p: React.SVGProps<SVGSVGElement>) => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" {...p}>
    <path d="M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z"/>
    <polyline points="13 2 13 9 20 9"/>
  </svg>
);
const LoaderIcon = (p: React.SVGProps<SVGSVGElement>) => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="animate-spin" {...p}>
    <path d="M21 12a9 9 0 1 1-6.219-8.56"/>
  </svg>
);

// --- Types ---
export type ToolId = "termsDoc" | "studyDoc" | "generalDoc";

export interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

export interface UploadedDoc {
  name: string;
  text: string;
}

const toolsList: { id: ToolId; name: string; shortName: string; icon: React.FC<React.SVGProps<SVGSVGElement>>; description: string }[] = [
  { id: "termsDoc",   name: "Terms and Condition Doc", shortName: "Terms Doc",   icon: FileTextIcon, description: "Legal & T&C documents" },
  { id: "studyDoc",   name: "Study Doc",               shortName: "Study Doc",   icon: BookOpenIcon, description: "Study material & notes"  },
  { id: "generalDoc", name: "General Doc",             shortName: "General Doc", icon: FolderIcon,   description: "Any mixed document"       },
];

const modeLabels: Record<ToolId, { badge: string; color: string }> = {
  termsDoc:   { badge: "⚖️ Legal Mode",   color: "text-amber-600 dark:text-amber-400"  },
  studyDoc:   { badge: "📚 Study Mode",   color: "text-emerald-600 dark:text-emerald-400" },
  generalDoc: { badge: "📁 General Mode", color: "text-blue-600 dark:text-blue-400"    },
};

// --- PromptBox ---
export const PromptBox = React.forwardRef<
  HTMLTextAreaElement,
  {
    className?: string;
    messages: ChatMessage[];
    onSend: (question: string, tool: ToolId, doc: UploadedDoc | null) => void;
    isLoading: boolean;
  }
>(({ className, messages, onSend, isLoading }, ref) => {
  const internalRef = React.useRef<HTMLTextAreaElement>(null);
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const [value, setValue] = React.useState("");
  const [selectedTool, setSelectedTool] = React.useState<ToolId | null>(null);
  const [isPopoverOpen, setIsPopoverOpen] = React.useState(false);
  const [uploadedDoc, setUploadedDoc] = React.useState<UploadedDoc | null>(null);
  const [isExtracting, setIsExtracting] = React.useState(false);
  const [extractError, setExtractError] = React.useState<string | null>(null);

  React.useImperativeHandle(ref, () => internalRef.current!, []);

  React.useLayoutEffect(() => {
    const el = internalRef.current;
    if (el) { el.style.height = "auto"; el.style.height = `${Math.min(el.scrollHeight, 200)}px`; }
  }, [value]);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    setIsExtracting(true);
    setExtractError(null);
    try {
      const fd = new FormData();
      fd.append("file", file);
      const res = await fetch("/api/extract-pdf", { method: "POST", body: fd });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Failed to extract");
      setUploadedDoc({ name: data.name, text: data.text });
      // Auto-select General Doc if no tool chosen
      if (!selectedTool) setSelectedTool("generalDoc");
    } catch (err: unknown) {
      setExtractError(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setIsExtracting(false);
    }
  };

  const handleSubmit = () => {
    const q = value.trim();
    if (!q || isLoading) return;
    const activeTool: ToolId = selectedTool ?? "generalDoc";
    onSend(q, activeTool, uploadedDoc);
    setValue("");
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSubmit(); }
  };

  const activeTool = selectedTool ? toolsList.find(t => t.id === selectedTool) : null;
  const ActiveToolIcon = activeTool?.icon;
  const hasValue = value.trim().length > 0;

  return (
    <div className={cn("flex flex-col rounded-[28px] p-2 shadow-sm transition-colors bg-white border dark:bg-[#1a1a1a] dark:border-[#2a2a2a]", className)}>
      <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" accept=".pdf,.txt,application/pdf,text/plain" />

      {/* Uploaded doc chip */}
      {uploadedDoc && (
        <div className="flex items-center gap-2 mx-2 mt-1 mb-1 px-3 py-1.5 rounded-xl bg-accent dark:bg-[#222222] text-sm max-w-full">
          <FileIcon className="h-4 w-4 shrink-0 text-blue-500" />
          <span className="truncate text-foreground dark:text-white flex-1">{uploadedDoc.name}</span>
          <button onClick={() => { setUploadedDoc(null); setExtractError(null); }} className="shrink-0 text-muted-foreground hover:text-foreground"><XIcon className="h-3.5 w-3.5"/></button>
        </div>
      )}

      {/* Extract error */}
      {extractError && (
        <p className="mx-3 mt-1 text-xs text-red-500">{extractError}</p>
      )}

      <textarea
        ref={internalRef}
        rows={1}
        value={value}
        onChange={e => setValue(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder={uploadedDoc ? "Ask a question about your document…" : "Upload a doc first, then ask a question…"}
        className="custom-scrollbar w-full resize-none border-0 bg-transparent p-3 text-foreground dark:text-white placeholder:text-muted-foreground dark:placeholder:text-gray-300 focus:ring-0 focus-visible:outline-none min-h-12"
      />

      {/* Toolbar */}
      <div className="mt-0.5 p-1 pt-0">
        <TooltipProvider delayDuration={100}>
          <div className="flex items-center gap-2">

            {/* + upload button */}
            <Tooltip>
              <TooltipTrigger asChild>
                <button type="button" onClick={() => fileInputRef.current?.click()}
                  disabled={isExtracting}
                  className="flex h-8 w-8 items-center justify-center rounded-full text-foreground dark:text-white transition-colors hover:bg-accent dark:hover:bg-[#2a2a2a] focus-visible:outline-none disabled:opacity-50">
                  {isExtracting ? <LoaderIcon className="h-5 w-5"/> : <PlusIcon className="h-6 w-6"/>}
                  <span className="sr-only">Upload document</span>
                </button>
              </TooltipTrigger>
              <TooltipContent side="top" showArrow><p>Upload PDF / TXT</p></TooltipContent>
            </Tooltip>

            {/* Tools popover */}
            <Popover open={isPopoverOpen} onOpenChange={setIsPopoverOpen}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <PopoverTrigger asChild>
                    <button type="button"
                      className="flex h-8 items-center gap-2 rounded-full p-2 text-sm text-foreground dark:text-white transition-colors hover:bg-accent dark:hover:bg-[#2a2a2a] focus-visible:outline-none">
                      <Settings2Icon className="h-4 w-4"/>
                      {!selectedTool && "Tools"}
                    </button>
                  </PopoverTrigger>
                </TooltipTrigger>
                <TooltipContent side="top" showArrow><p>Select document mode</p></TooltipContent>
              </Tooltip>
              <PopoverContent side="top" align="start">
                <p className="px-2 py-1 text-xs text-muted-foreground dark:text-gray-400 font-medium uppercase tracking-wider">Document Mode</p>
                <div className="flex flex-col gap-1 mt-1">
                  {toolsList.map(tool => (
                    <button key={tool.id} onClick={() => { setSelectedTool(tool.id); setIsPopoverOpen(false); }}
                      className={cn("flex w-full items-center gap-2 rounded-md p-2 text-left text-sm hover:bg-accent dark:hover:bg-[#2a2a2a] transition-colors",
                        selectedTool === tool.id && "bg-accent dark:bg-[#2a2a2a]")}>
                      <tool.icon className="h-4 w-4 shrink-0"/>
                      <div className="flex flex-col">
                        <span className="font-medium">{tool.name}</span>
                        <span className="text-xs text-muted-foreground dark:text-gray-400">{tool.description}</span>
                      </div>
                    </button>
                  ))}
                </div>
              </PopoverContent>
            </Popover>

            {/* Active tool chip */}
            {activeTool && (
              <>
                <div className="h-4 w-px bg-border dark:bg-gray-600"/>
                <button onClick={() => setSelectedTool(null)}
                  className="flex h-8 items-center gap-2 rounded-full px-2 text-sm hover:bg-accent dark:hover:bg-[#222222] cursor-pointer dark:text-[#99ceff] text-[#2294ff] transition-colors">
                  {ActiveToolIcon && <ActiveToolIcon className="h-4 w-4"/>}
                  {activeTool.shortName}
                  <XIcon className="h-4 w-4"/>
                </button>
              </>
            )}

            {/* Right: mic + send */}
            <div className="ml-auto flex items-center gap-2">
              <Tooltip>
                <TooltipTrigger asChild>
                  <button type="button"
                    className="flex h-8 w-8 items-center justify-center rounded-full text-foreground dark:text-white transition-colors hover:bg-accent dark:hover:bg-[#2a2a2a] focus-visible:outline-none">
                    <MicIcon className="h-5 w-5"/><span className="sr-only">Record voice</span>
                  </button>
                </TooltipTrigger>
                <TooltipContent side="top" showArrow><p>Record voice</p></TooltipContent>
              </Tooltip>
              <Tooltip>
                <TooltipTrigger asChild>
                  <button type="button" onClick={handleSubmit}
                    disabled={!hasValue || isLoading}
                    className="flex h-8 w-8 items-center justify-center rounded-full text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none bg-black text-white hover:bg-black/80 dark:bg-white dark:text-black dark:hover:bg-white/80 disabled:bg-black/40 dark:disabled:bg-[#2a2a2a]">
                    {isLoading ? <LoaderIcon className="h-5 w-5"/> : <SendIcon className="h-6 w-6"/>}
                    <span className="sr-only">Send</span>
                  </button>
                </TooltipTrigger>
                <TooltipContent side="top" showArrow><p>Send message</p></TooltipContent>
              </Tooltip>
            </div>

          </div>
        </TooltipProvider>
      </div>
    </div>
  );
});
PromptBox.displayName = "PromptBox";
