"use client";

import { useEffect, useState } from "react";
import type { SessionInfo as SessionInfoType } from "@/lib/types";
import { fetchSession } from "@/lib/api";

interface SessionInfoProps {
  sessionId: string;
}

export default function SessionInfo({ sessionId }: SessionInfoProps) {
  const [session, setSession] = useState<SessionInfoType | null>(null);

  useEffect(() => {
    setSession(null);
    fetchSession(sessionId).then(setSession);
  }, [sessionId]);

  if (!session) return null;

  return (
    <div className="px-4 py-3 border-b border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-900/50">
      <div className="flex items-center gap-4 text-sm">
        <div className="flex-1 min-w-0">
          <p className="font-medium text-zinc-900 dark:text-zinc-100 truncate">
            {session.firstPrompt}
          </p>
        </div>
        <div className="flex items-center gap-3 text-xs text-zinc-500 shrink-0">
          {session.gitBranch && (
            <span className="px-2 py-0.5 rounded bg-zinc-200 dark:bg-zinc-700 font-mono">
              {session.gitBranch}
            </span>
          )}
          {session.messageCount > 0 && (
            <span>{session.messageCount} msgs</span>
          )}
          {session.modified && (
            <span>{new Date(session.modified).toLocaleString()}</span>
          )}
        </div>
      </div>
    </div>
  );
}
