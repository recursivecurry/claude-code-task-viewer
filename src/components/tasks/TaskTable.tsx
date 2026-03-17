"use client";

import { useEffect, useState, useMemo } from "react";
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  flexRender,
  createColumnHelper,
  type SortingState,
} from "@tanstack/react-table";
import type { Task } from "@/lib/types";
import { fetchTasks } from "@/lib/api";
import StatusFilter from "./StatusFilter";
import clsx from "clsx";

const columnHelper = createColumnHelper<Task>();

const STATUS_COLORS: Record<string, string> = {
  pending: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/40 dark:text-yellow-300",
  in_progress: "bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300",
  completed: "bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300",
};

const columns = [
  columnHelper.accessor("id", {
    header: "ID",
    cell: (info) => (
      <span className="font-mono text-xs">{info.getValue()}</span>
    ),
    size: 50,
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
            STATUS_COLORS[status]
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

interface TaskTableProps {
  workspaceId: string;
  selectedTaskId: string | null;
  onSelectTask: (id: string | null) => void;
}

export default function TaskTable({
  workspaceId,
  selectedTaskId,
  onSelectTask,
}: TaskTableProps) {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [sorting, setSorting] = useState<SortingState>([]);
  const [statusFilter, setStatusFilter] = useState("all");

  useEffect(() => {
    setLoading(true);
    setTasks([]);
    setStatusFilter("all");
    fetchTasks(workspaceId)
      .then(setTasks)
      .finally(() => setLoading(false));
  }, [workspaceId]);

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
    getFilteredRowModel: getFilteredRowModel(),
  });

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
                      {{ asc: " ^", desc: " v" }[
                        header.column.getIsSorted() as string
                      ] ?? ""}
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
                onClick={() =>
                  onSelectTask(
                    row.original.id === selectedTaskId
                      ? null
                      : row.original.id
                  )
                }
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
  );
}
