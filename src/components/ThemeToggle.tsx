"use client";

import { useTheme } from "./ThemeProvider";
import clsx from "clsx";

const OPTIONS = [
  { value: "system" as const, label: "Sys" },
  { value: "light" as const, label: "Light" },
  { value: "dark" as const, label: "Dark" },
];

export default function ThemeToggle() {
  const { theme, setTheme } = useTheme();

  return (
    <div className="flex items-center gap-0.5 p-0.5 rounded-lg bg-zinc-200 dark:bg-zinc-700">
      {OPTIONS.map((opt) => (
        <button
          key={opt.value}
          onClick={() => setTheme(opt.value)}
          className={clsx(
            "px-2 py-1 rounded-md text-xs font-medium transition-colors",
            theme === opt.value
              ? "bg-white dark:bg-zinc-500 text-zinc-900 dark:text-zinc-100 shadow-sm"
              : "text-zinc-500 dark:text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200"
          )}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
}
