"use client";

import { useEffect, useState, useMemo, useCallback } from "react";
import type { Workspace, SessionInfo } from "@/lib/types";
import { fetchWorkspaces } from "@/lib/api";
import ThemeToggle from "@/components/ThemeToggle";
import clsx from "clsx";

type SortKey = "project" | "created" | "modified";
type SortDir = "asc" | "desc";

function formatDate(iso: string) {
  const d = new Date(iso);
  return d.toLocaleDateString("ko-KR", { year: "numeric", month: "2-digit", day: "2-digit" });
}

function formatTime(iso: string) {
  const d = new Date(iso);
  return d.toLocaleTimeString("ko-KR", { hour: "2-digit", minute: "2-digit" });
}

function projectName(fullPath: string) {
  const parts = fullPath.split("/");
  return parts.slice(-2).join("/");
}

// --- Detail Popup ---
function SessionDetailPopup({
  session,
  workspaceId,
  onClose,
}: {
  session: SessionInfo | undefined;
  workspaceId: string;
  onClose: () => void;
}) {
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const handleCopy = useCallback((key: string, value: string) => {
    navigator.clipboard.writeText(value).then(() => {
      setCopiedKey(key);
      setTimeout(() => setCopiedKey(null), 1200);
    });
  }, []);

  const rows: [string, string][] = [["Workspace ID", workspaceId]];
  if (session) {
    const ordered: [string, string][] = [
      ["Session ID", session.sessionId || ""],
      ["Project Path", session.projectPath || ""],
      ["Git Branch", session.gitBranch || ""],
      ["First Prompt", session.firstPrompt || ""],
      ["Summary", session.summary || ""],
      ["Message Count", String(session.messageCount ?? "")],
      ["Created", session.created || ""],
      ["Modified", session.modified || ""],
      ["Full Path", session.fullPath || ""],
      ["File Mtime", session.fileMtime ? String(session.fileMtime) : ""],
      ["Is Sidechain", String(session.isSidechain ?? "")],
    ];
    rows.push(...ordered);

    const knownKeys = new Set([
      "sessionId", "projectPath", "gitBranch", "firstPrompt", "summary",
      "messageCount", "created", "modified", "fullPath", "fileMtime", "isSidechain",
    ]);
    for (const [k, v] of Object.entries(session)) {
      if (!knownKeys.has(k) && v !== undefined && v !== null) {
        rows.push([k, String(v)]);
      }
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40" onClick={onClose}>
      <div
        className="bg-white dark:bg-zinc-800 rounded-xl shadow-2xl max-w-2xl w-full mx-4 max-h-[80vh] overflow-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-5 py-3 border-b border-zinc-200 dark:border-zinc-700">
          <h2 className="text-base font-semibold text-zinc-900 dark:text-zinc-100">Session Detail</h2>
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
                      <span className={clsx("flex-1", !displayValue && "text-zinc-300 dark:text-zinc-600")}>{displayValue || "-"}</span>
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

// --- Sort Arrow ---
function SortArrow({ active, dir }: { active: boolean; dir: SortDir }) {
  if (!active) return <span className="text-zinc-300 dark:text-zinc-600 ml-0.5">&#8597;</span>;
  return <span className="ml-0.5">{dir === "asc" ? "\u25B2" : "\u25BC"}</span>;
}

// --- Main Sidebar ---
interface SidebarProps {
  selectedWorkspace: string | null;
  onSelectWorkspace: (id: string) => void;
}

export default function Sidebar({
  selectedWorkspace,
  onSelectWorkspace,
}: SidebarProps) {
  const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
  const [loading, setLoading] = useState(true);
  const [sortKey, setSortKey] = useState<SortKey>("modified");
  const [sortDir, setSortDir] = useState<SortDir>("desc");
  const [detailWs, setDetailWs] = useState<Workspace | null>(null);

  useEffect(() => {
    fetchWorkspaces()
      .then(setWorkspaces)
      .finally(() => setLoading(false));
  }, []);

  const handleOpenDetail = useCallback((e: React.MouseEvent, ws: Workspace) => {
    e.stopPropagation();
    setDetailWs(ws);
  }, []);

  const handleSort = useCallback((key: SortKey) => {
    setSortKey((prevKey) => {
      if (prevKey === key) {
        setSortDir((prevDir) => (prevDir === "asc" ? "desc" : "asc"));
      } else {
        setSortDir("desc");
      }
      return key;
    });
  }, []);

  const sortedWorkspaces = useMemo(() => {
    const sorted = [...workspaces];
    const dir = sortDir === "asc" ? 1 : -1;
    switch (sortKey) {
      case "modified":
        sorted.sort(
          (a, b) =>
            dir * (new Date(a.session?.modified || 0).getTime() - new Date(b.session?.modified || 0).getTime())
        );
        break;
      case "created":
        sorted.sort(
          (a, b) =>
            dir * (new Date(a.session?.created || 0).getTime() - new Date(b.session?.created || 0).getTime())
        );
        break;
      case "project":
        sorted.sort((a, b) => {
          const nameA = a.session?.projectPath || a.id;
          const nameB = b.session?.projectPath || b.id;
          return dir * nameA.localeCompare(nameB);
        });
        break;
    }
    return sorted;
  }, [workspaces, sortKey, sortDir]);

  return (
    <>
      <aside className="w-[540px] border-r border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-900 flex flex-col h-full overflow-hidden">
        <div className="p-4 border-b border-zinc-200 dark:border-zinc-700">
          <div className="flex items-center justify-between">
            <h1 className="text-xl font-semibold text-zinc-900 dark:text-zinc-100">
              Claude Tasks
            </h1>
            <ThemeToggle />
          </div>
          <p className="text-sm text-zinc-500 mt-1">
            {workspaces.length} session{workspaces.length !== 1 && "s"}
          </p>
        </div>

        {/* Header row — clickable for sorting */}
        <div className="flex items-center gap-3 px-5 py-2 border-b border-zinc-200 dark:border-zinc-700 bg-zinc-100 dark:bg-zinc-800/60">
          <div
            className="flex-[2] min-w-0 cursor-pointer select-none text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 hover:text-zinc-800 dark:hover:text-zinc-200"
            onClick={() => handleSort("project")}
          >
            Project / Summary
            <SortArrow active={sortKey === "project"} dir={sortDir} />
          </div>
          <div
            className="shrink-0 w-[84px] text-center cursor-pointer select-none text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 hover:text-zinc-800 dark:hover:text-zinc-200"
            onClick={() => handleSort("created")}
          >
            Created
            <SortArrow active={sortKey === "created"} dir={sortDir} />
          </div>
          <div
            className="shrink-0 w-[84px] text-center cursor-pointer select-none text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 hover:text-zinc-800 dark:hover:text-zinc-200"
            onClick={() => handleSort("modified")}
          >
            Modified
            <SortArrow active={sortKey === "modified"} dir={sortDir} />
          </div>
          <div className="shrink-0 w-[32px]" />
        </div>

        <nav className="flex-1 overflow-y-auto p-2">
          {loading ? (
            <div className="space-y-2 p-2">
              {[...Array(3)].map((_, i) => (
                <div
                  key={i}
                  className="h-20 rounded-lg bg-zinc-200 dark:bg-zinc-800 animate-pulse"
                />
              ))}
            </div>
          ) : (
            sortedWorkspaces.map((ws) => (
              <button
                key={ws.id}
                onClick={() => onSelectWorkspace(ws.id)}
                className={clsx(
                  "group relative w-full text-left p-3 rounded-lg mb-1 transition-colors",
                  selectedWorkspace === ws.id
                    ? "bg-blue-100 dark:bg-blue-900/40 border border-blue-300 dark:border-blue-700"
                    : "hover:bg-zinc-100 dark:hover:bg-zinc-800"
                )}
              >
                <div className="flex items-start gap-3">
                  {/* Col 1: Project + branch, summary, status counts */}
                  <div className="flex-[2] min-w-0">
                    {/* Custom tooltip with bold firstPrompt + normal summary */}
                    {(ws.session?.firstPrompt || ws.session?.summary) && (
                      <div className="absolute left-0 top-full mt-1 hidden group-hover:block z-20 pointer-events-none max-w-[400px]">
                        <div className="px-3 py-2 rounded-lg bg-zinc-800 dark:bg-zinc-200 text-sm text-white dark:text-zinc-900 shadow-lg whitespace-pre-wrap">
                          {ws.session?.firstPrompt && (
                            <span className="font-bold">{ws.session.firstPrompt}</span>
                          )}
                          {ws.session?.firstPrompt && ws.session?.summary && <br />}
                          {ws.session?.summary && (
                            <span className="font-normal">{ws.session.summary}</span>
                          )}
                        </div>
                      </div>
                    )}

                    <div className="flex items-center gap-1.5">
                      {ws.session?.projectPath ? (
                        <span className="text-sm font-medium text-zinc-900 dark:text-zinc-100 truncate">
                          {projectName(ws.session.projectPath)}
                        </span>
                      ) : (
                        <span className="text-sm font-medium text-zinc-400 truncate">
                          {ws.id.slice(0, 8)}
                        </span>
                      )}
                      {ws.session?.gitBranch && (
                        <span className="shrink-0 px-1.5 py-0.5 rounded bg-zinc-200 dark:bg-zinc-700 text-xs font-mono text-zinc-600 dark:text-zinc-300 max-w-[140px] truncate">
                          {ws.session.gitBranch}
                        </span>
                      )}
                    </div>
                    <div className="text-xs text-zinc-500 dark:text-zinc-400 truncate mt-0.5">
                      {ws.session?.summary || ws.session?.firstPrompt || "-"}
                    </div>

                    {/* Status counts */}
                    <div className="flex items-center gap-1.5 mt-1.5">
                      {ws.statusCounts.completed > 0 && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300">
                          <span className="w-2 h-2 rounded-full bg-green-500" />
                          {ws.statusCounts.completed}
                        </span>
                      )}
                      {ws.statusCounts.in_progress > 0 && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300">
                          <span className="w-2 h-2 rounded-full bg-blue-500" />
                          {ws.statusCounts.in_progress}
                        </span>
                      )}
                      {ws.statusCounts.pending > 0 && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium bg-yellow-100 text-yellow-700 dark:bg-yellow-900/40 dark:text-yellow-300">
                          <span className="w-2 h-2 rounded-full bg-yellow-500" />
                          {ws.statusCounts.pending}
                        </span>
                      )}
                      {ws.taskCount === 0 && (
                        <span className="text-xs text-zinc-400">No tasks</span>
                      )}
                    </div>
                  </div>

                  {/* Col 2: Created — date + time, center-aligned, same font size */}
                  <div className="shrink-0 text-center w-[84px]">
                    {ws.session?.created ? (
                      <>
                        <div className="text-xs text-zinc-900 dark:text-zinc-100 whitespace-nowrap">
                          {formatDate(ws.session.created)}
                        </div>
                        <div className="text-xs text-zinc-900 dark:text-zinc-100 whitespace-nowrap">
                          {formatTime(ws.session.created)}
                        </div>
                      </>
                    ) : (
                      <div className="text-xs text-zinc-400">-</div>
                    )}
                  </div>

                  {/* Col 3: Modified — date + time, center-aligned, same font size */}
                  <div className="shrink-0 text-center w-[84px]">
                    {ws.session?.modified ? (
                      <>
                        <div className="text-xs text-zinc-900 dark:text-zinc-100 whitespace-nowrap">
                          {formatDate(ws.session.modified)}
                        </div>
                        <div className="text-xs text-zinc-900 dark:text-zinc-100 whitespace-nowrap">
                          {formatTime(ws.session.modified)}
                        </div>
                      </>
                    ) : (
                      <div className="text-xs text-zinc-400">-</div>
                    )}
                  </div>

                  {/* Col 4: Detail button */}
                  <div className="shrink-0 flex items-center w-[32px]">
                    <div
                      onClick={(e) => handleOpenDetail(e, ws)}
                      className="p-1.5 rounded hover:bg-zinc-200 dark:hover:bg-zinc-600 cursor-pointer transition-colors"
                      title="View details"
                    >
                      <svg className="w-5 h-5 text-zinc-400 group-hover:text-zinc-600 dark:group-hover:text-zinc-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                  </div>
                </div>
              </button>
            ))
          )}
        </nav>
      </aside>

      {/* Detail popup */}
      {detailWs && (
        <SessionDetailPopup
          session={detailWs.session}
          workspaceId={detailWs.id}
          onClose={() => setDetailWs(null)}
        />
      )}
    </>
  );
}
