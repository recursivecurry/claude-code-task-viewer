"use client";

import { useState, useCallback } from "react";
import Sidebar from "@/components/layout/Sidebar";
import SplitView from "@/components/layout/SplitView";
import TaskTable from "@/components/tasks/TaskTable";
import DependencyGraph from "@/components/graph/DependencyGraph";
import SessionInfo from "@/components/sessions/SessionInfo";

export default function Home() {
  const [workspaceId, setWorkspaceId] = useState<string | null>(null);
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);

  const handleSelectTask = useCallback((taskId: string | null) => {
    setSelectedTaskId(taskId);
  }, []);

  return (
    <div className="flex h-screen">
      <Sidebar
        selectedWorkspace={workspaceId}
        onSelectWorkspace={setWorkspaceId}
      />
      <main className="flex-1 flex flex-col overflow-hidden">
        {workspaceId ? (
          <>
            <SessionInfo sessionId={workspaceId} />
            <SplitView
              left={
                <TaskTable
                  workspaceId={workspaceId}
                  selectedTaskId={selectedTaskId}
                  onSelectTask={handleSelectTask}
                />
              }
              right={
                <DependencyGraph
                  workspaceId={workspaceId}
                  selectedTaskId={selectedTaskId}
                  onSelectTask={handleSelectTask}
                />
              }
            />
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-zinc-400">
            <p>Select a workspace from the sidebar</p>
          </div>
        )}
      </main>
    </div>
  );
}
