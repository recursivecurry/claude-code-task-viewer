"use client";

import { ReactNode } from "react";

interface SplitViewProps {
  left: ReactNode;
  right: ReactNode;
}

export default function SplitView({ left, right }: SplitViewProps) {
  return (
    <div className="flex flex-1 h-full overflow-hidden">
      <div className="w-1/2 border-r border-zinc-200 dark:border-zinc-700 overflow-auto">
        {left}
      </div>
      <div className="w-1/2 overflow-hidden">{right}</div>
    </div>
  );
}
