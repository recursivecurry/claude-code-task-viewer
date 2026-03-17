export interface Task {
  id: string;
  subject: string;
  description: string;
  activeForm: string;
  status: string;
  blocks: string[];
  blockedBy: string[];
}

export interface TaskStatusCounts {
  pending: number;
  in_progress: number;
  completed: number;
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
}

export interface Workspace {
  id: string;
  taskCount: number;
  statusCounts: TaskStatusCounts;
  hasTasks: boolean;
  session?: SessionInfo;
}
