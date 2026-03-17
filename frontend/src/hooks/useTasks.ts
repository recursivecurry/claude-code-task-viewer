import { useEffect, useState } from "react";
import type { Task } from "../types";
import { GetTasks } from "../../wailsjs/go/main/App";

export function useTasks(workspaceId: string, refreshKey?: number) {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    setTasks([]);
    GetTasks(workspaceId)
      .then((result) => setTasks((result || []) as unknown as Task[]))
      .finally(() => setLoading(false));
  }, [workspaceId]);

  useEffect(() => {
    if (refreshKey === undefined || refreshKey === 0) return;
    GetTasks(workspaceId).then((result) =>
      setTasks((result || []) as unknown as Task[])
    );
  }, [refreshKey, workspaceId]);

  return { tasks, loading };
}
