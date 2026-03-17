import { useState, useMemo, useCallback } from "react";
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  flexRender,
  createColumnHelper,
  type SortingState,
} from "@tanstack/react-table";
import type { Task } from "../../types";
import { useTasks } from "../../hooks/useTasks";
import { STATUS_BADGE } from "../../lib/status-colors";
import StatusFilter from "./StatusFilter";
import DetailPopup from "../DetailPopup";
import clsx from "clsx";

const columnHelper = createColumnHelper<Task>();

const createColumns = (onDetailClick: (task: Task) => void) => [
  columnHelper.accessor("id", {
    header: "ID",
    cell: (info) => (
      <div className="flex flex-col items-start gap-1">
        <span className="font-mono text-xs">{info.getValue()}</span>
        <div
          onClick={(e) => {
            e.stopPropagation();
            onDetailClick(info.row.original);
          }}
          className="p-0.5 rounded hover:bg-zinc-200 dark:hover:bg-zinc-600 cursor-pointer transition-colors"
          title="View details"
        >
          <svg className="w-3.5 h-3.5 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
      </div>
    ),
    size: 60,
  }),
  columnHelper.accessor("subject", {
    header: "Subject",
    cell: (info) => (
      <span className="font-medium">{info.getValue()}</span>
    ),
  }),
  columnHelper.accessor("status", {
    header: "Status",
    cell: (info) => {
      const status = info.getValue();
      return (
        <span
          className={clsx(
            "px-2 py-0.5 rounded-full text-xs font-medium",
            STATUS_BADGE[status]
          )}
        >
          {status.replace("_", " ")}
        </span>
      );
    },
    size: 100,
  }),
  columnHelper.accessor("description", {
    header: "Description",
    cell: (info) => (
      <span className="text-zinc-500 dark:text-zinc-400 text-xs truncate block max-w-[200px]">
        {info.getValue() || "-"}
      </span>
    ),
  }),
];

function taskToRows(task: Task): [string, string][] {
  return [
    ["ID", task.id],
    ["Subject", task.subject],
    ["Status", task.status],
    ["Description", task.description || ""],
    ["Active Form", task.activeForm || ""],
    ["Blocks", (task.blocks || []).join(", ")],
    ["Blocked By", (task.blockedBy || []).join(", ")],
  ];
}

interface TaskTableProps {
  workspaceId: string;
  selectedTaskId: string | null;
  onSelectTask: (id: string | null) => void;
  refreshKey?: number;
}

export default function TaskTable({
  workspaceId,
  selectedTaskId,
  onSelectTask,
  refreshKey,
}: TaskTableProps) {
  const { tasks, loading } = useTasks(workspaceId, refreshKey);
  const [sorting, setSorting] = useState<SortingState>([{ id: "id", desc: false }]);
  const [statusFilter, setStatusFilter] = useState("all");
  const [detailTask, setDetailTask] = useState<Task | null>(null);

  const columns = useMemo(() => createColumns((task) => setDetailTask(task)), []);

  const counts = useMemo(() => {
    const c: Record<string, number> = { all: tasks.length };
    for (const t of tasks) {
      c[t.status] = (c[t.status] || 0) + 1;
    }
    return c;
  }, [tasks]);

  const filteredTasks = useMemo(
    () =>
      statusFilter === "all"
        ? tasks
        : tasks.filter((t) => t.status === statusFilter),
    [tasks, statusFilter]
  );

  const table = useReactTable({
    data: filteredTasks,
    columns,
    state: { sorting },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    enableSortingRemoval: false,
  });

  const handleRowClick = useCallback(
    (taskId: string) => onSelectTask(taskId === selectedTaskId ? null : taskId),
    [onSelectTask, selectedTaskId]
  );

  if (loading) {
    return (
      <div className="p-4 space-y-3">
        {[...Array(5)].map((_, i) => (
          <div
            key={i}
            className="h-10 rounded bg-zinc-200 dark:bg-zinc-800 animate-pulse"
          />
        ))}
      </div>
    );
  }

  if (tasks.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center text-zinc-400 p-8">
        No tasks in this workspace
      </div>
    );
  }

  return (
    <>
      <div className="flex flex-col h-full">
        <StatusFilter value={statusFilter} onChange={setStatusFilter} counts={counts} />
        <div className="flex-1 overflow-auto">
          <table className="w-full text-sm">
            <thead className="sticky top-0 bg-zinc-50 dark:bg-zinc-900 border-b border-zinc-200 dark:border-zinc-700">
              {table.getHeaderGroups().map((hg) => (
                <tr key={hg.id}>
                  {hg.headers.map((header) => (
                    <th
                      key={header.id}
                      className="text-left px-3 py-2 text-xs font-medium text-zinc-500 uppercase tracking-wider cursor-pointer select-none hover:text-zinc-700 dark:hover:text-zinc-300"
                      onClick={header.column.getToggleSortingHandler()}
                      style={{ width: header.getSize() }}
                    >
                      <div className="flex items-center gap-1">
                        {flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                        {header.column.getCanSort() && (
                          header.column.getIsSorted()
                            ? header.column.getIsSorted() === "asc" ? " \u25B2" : " \u25BC"
                            : " \u2195"
                        )}
                      </div>
                    </th>
                  ))}
                </tr>
              ))}
            </thead>
            <tbody>
              {table.getRowModel().rows.map((row) => (
                <tr
                  key={row.id}
                  onClick={() => handleRowClick(row.original.id)}
                  className={clsx(
                    "border-b border-zinc-100 dark:border-zinc-800 cursor-pointer transition-colors",
                    row.original.id === selectedTaskId
                      ? "bg-blue-50 dark:bg-blue-900/20"
                      : "hover:bg-zinc-50 dark:hover:bg-zinc-800/50"
                  )}
                >
                  {row.getVisibleCells().map((cell) => (
                    <td key={cell.id} className="px-3 py-2.5">
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {detailTask && (
        <DetailPopup
          title="Task Detail"
          rows={taskToRows(detailTask)}
          onClose={() => setDetailTask(null)}
        />
      )}
    </>
  );
}
