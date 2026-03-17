import { useState, useCallback } from "react";
import Sidebar from "./components/layout/Sidebar";
import SplitView from "./components/layout/SplitView";
import TaskTable from "./components/tasks/TaskTable";
import DependencyGraph from "./components/graph/DependencyGraph";
import SessionInfo from "./components/sessions/SessionInfo";

export default function App() {
  const [workspaceId, setWorkspaceId] = useState<string | null>(null);
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  const handleSelectTask = useCallback((taskId: string | null) => {
    setSelectedTaskId(taskId);
  }, []);

  const handleSelectWorkspace = useCallback((id: string | null) => {
    setWorkspaceId(id);
    setSelectedTaskId(null);
  }, []);

  const handleRefresh = useCallback(() => {
    setRefreshKey((k) => k + 1);
  }, []);

  return (
    <div className="flex h-screen">
      <Sidebar
        selectedWorkspace={workspaceId}
        onSelectWorkspace={handleSelectWorkspace}
        onRefresh={handleRefresh}
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
                  refreshKey={refreshKey}
                />
              }
              right={
                <DependencyGraph
                  workspaceId={workspaceId}
                  selectedTaskId={selectedTaskId}
                  onSelectTask={handleSelectTask}
                  refreshKey={refreshKey}
                />
              }
            />
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-zinc-400">
            <p>Select a session from the sidebar</p>
          </div>
        )}
      </main>
    </div>
  );
}
