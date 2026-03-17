export interface Task {
  id: string;
  subject: string;
  description: string;
  activeForm: string;
  status: "pending" | "in_progress" | "completed";
  blocks: string[];
  blockedBy: string[];
}

export interface TaskStatusCounts {
  pending: number;
  in_progress: number;
  completed: number;
}

export interface Workspace {
  id: string;
  taskCount: number;
  statusCounts: TaskStatusCounts;
  session?: SessionInfo;
}

export interface SessionInfo {
  sessionId: string;
  fullPath?: string;
  fileMtime?: number;
  firstPrompt: string;
  summary: string;
  messageCount: number;
  created: string;
  modified: string;
  gitBranch: string;
  projectPath: string;
  isSidechain?: boolean;
  [key: string]: unknown;
}

export interface Project {
  name: string;
  escapedPath: string;
  fullPath: string;
}
