import { useState, useCallback } from "react";
import clsx from "clsx";

interface DetailPopupProps {
  title: string;
  rows: [string, string][];
  onClose: () => void;
}

export default function DetailPopup({ title, rows, onClose }: DetailPopupProps) {
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const handleCopy = useCallback((key: string, value: string) => {
    navigator.clipboard.writeText(value).then(() => {
      setCopiedKey(key);
      setTimeout(() => setCopiedKey(null), 1200);
    });
  }, []);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40" onClick={onClose}>
      <div
        className="bg-white dark:bg-zinc-800 rounded-xl shadow-2xl max-w-2xl w-full mx-4 max-h-[80vh] overflow-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-5 py-3 border-b border-zinc-200 dark:border-zinc-700">
          <h2 className="text-base font-semibold text-zinc-900 dark:text-zinc-100">{title}</h2>
          <button
            onClick={onClose}
            className="p-1.5 rounded hover:bg-zinc-100 dark:hover:bg-zinc-700 text-zinc-500"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <table className="w-full">
          <tbody>
            {rows.map(([key, value]) => {
              const displayValue = value || "";
              const isCopied = copiedKey === key;
              return (
                <tr
                  key={key}
                  className="border-b border-zinc-100 dark:border-zinc-700 last:border-0 cursor-pointer hover:bg-zinc-50 dark:hover:bg-zinc-700/50 transition-colors"
                  onClick={() => displayValue && handleCopy(key, displayValue)}
                  title="Click to copy"
                >
                  <td className="px-5 py-2.5 text-sm font-medium text-zinc-500 dark:text-zinc-400 whitespace-nowrap w-[140px] align-top">
                    {key}
                  </td>
                  <td className="px-5 py-2.5 text-sm text-zinc-900 dark:text-zinc-100 break-all">
                    <div className="flex items-start gap-2">
                      <span className={clsx("flex-1", !displayValue && "text-zinc-300 dark:text-zinc-600")}>
                        {displayValue || "-"}
                      </span>
                      {isCopied && (
                        <span className="shrink-0 text-green-500 text-xs font-medium">Copied!</span>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
