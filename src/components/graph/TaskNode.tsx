"use client";

import { Handle, Position, type NodeProps } from "@xyflow/react";
import type { Task } from "@/lib/types";
import clsx from "clsx";

const STATUS_BORDER: Record<string, string> = {
  pending: "border-yellow-400",
  in_progress: "border-blue-400",
  completed: "border-green-400",
};

const STATUS_DOT: Record<string, string> = {
  pending: "bg-yellow-400",
  in_progress: "bg-blue-400",
  completed: "bg-green-400",
};

export default function TaskNode({ data, selected }: NodeProps) {
  const task = data as unknown as Task;
  return (
    <div
      className={clsx(
        "px-3 py-2 rounded-lg border-2 bg-white dark:bg-zinc-800 shadow-sm min-w-[200px]",
        STATUS_BORDER[task.status],
        selected && "ring-2 ring-blue-500"
      )}
    >
      <Handle type="target" position={Position.Left} className="!bg-zinc-400" />
      <div className="flex items-center gap-2">
        <div className={clsx("w-2 h-2 rounded-full", STATUS_DOT[task.status])} />
        <span className="text-xs font-mono text-zinc-400">#{task.id}</span>
      </div>
      <div className="text-sm font-medium text-zinc-900 dark:text-zinc-100 mt-1 truncate">
        {task.subject}
      </div>
      <Handle type="source" position={Position.Right} className="!bg-zinc-400" />
    </div>
  );
}
