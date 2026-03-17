import clsx from "clsx";

const STATUSES = [
  { value: "all", label: "All" },
  { value: "pending", label: "Pending", color: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/40 dark:text-yellow-300" },
  { value: "in_progress", label: "In Progress", color: "bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300" },
  { value: "completed", label: "Completed", color: "bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300" },
] as const;

interface StatusFilterProps {
  value: string;
  onChange: (value: string) => void;
  counts: Record<string, number>;
}

export default function StatusFilter({ value, onChange, counts }: StatusFilterProps) {
  return (
    <div className="flex gap-1.5 p-3 border-b border-zinc-200 dark:border-zinc-700">
      {STATUSES.map((s) => (
        <button
          key={s.value}
          onClick={() => onChange(s.value)}
          className={clsx(
            "px-3 py-1 rounded-full text-xs font-medium transition-colors",
            value === s.value
              ? s.value === "all"
                ? "bg-zinc-800 text-white dark:bg-zinc-200 dark:text-zinc-900"
                : s.color
              : "bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-700"
          )}
        >
          {s.label}
          {counts[s.value] !== undefined && (
            <span className="ml-1.5 opacity-70">{counts[s.value]}</span>
          )}
        </button>
      ))}
    </div>
  );
}
