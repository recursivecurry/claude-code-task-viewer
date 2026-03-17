import type { Task, Workspace, SessionInfo, Project } from "./types";

export async function fetchWorkspaces(): Promise<Workspace[]> {
  const res = await fetch("/api/workspaces");
  return res.json();
}

export async function fetchTasks(workspaceId: string): Promise<Task[]> {
  const res = await fetch(`/api/tasks/${workspaceId}`);
  return res.json();
}

export async function fetchSession(
  sessionId: string
): Promise<SessionInfo | null> {
  const res = await fetch(`/api/sessions/${sessionId}`);
  return res.json();
}

export async function fetchProjects(): Promise<Project[]> {
  const res = await fetch("/api/projects");
  return res.json();
}
