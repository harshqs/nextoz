"use client";

import { PromptBox } from "@/components/ui/chatgpt-prompt-input";
import { ThemeToggle } from "@/components/ui/theme-toggle";

export function PromptBoxDemo() {
  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
  };

  return (
    <div className="relative flex min-h-screen w-full flex-col items-center justify-center bg-background dark:bg-[#212121] p-4 transition-colors duration-300">
      {/* Theme toggle — fixed top-right */}
      <div className="fixed top-4 right-4 z-50">
        <ThemeToggle />
      </div>

      <div className="w-full max-w-xl flex flex-col gap-10">
        <p className="text-center text-3xl font-semibold text-foreground dark:text-white">
          Welcome to App name
        </p>
        <form onSubmit={handleSubmit}>
          <PromptBox />
        </form>
      </div>
    </div>
  );
}
