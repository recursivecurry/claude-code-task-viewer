import { NextResponse } from "next/server";
import fs from "fs/promises";
import path from "path";
import os from "os";
import type { TaskStatusCounts } from "@/lib/types";

const TASKS_DIR = path.join(os.homedir(), ".claude", "tasks");
const PROJECTS_DIR = path.join(os.homedir(), ".claude", "projects");

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

interface SessionEntry {
  sessionId: string;
  firstPrompt?: string;
  summary?: string;
  messageCount?: number;
  created?: string;
  modified?: string;
  gitBranch?: string;
  projectPath?: string;
}

async function readTaskCounts(
  uuid: string
): Promise<{ taskCount: number; statusCounts: TaskStatusCounts }> {
  const dir = path.join(TASKS_DIR, uuid);
  const statusCounts: TaskStatusCounts = {
    pending: 0,
    in_progress: 0,
    completed: 0,
  };
  try {
    const files = await fs.readdir(dir);
    const taskFiles = files.filter(
      (f) => f.endsWith(".json") && !f.startsWith(".")
    );
    for (const f of taskFiles) {
      try {
        const raw = await fs.readFile(path.join(dir, f), "utf-8");
        const task = JSON.parse(raw);
        if (task.status in statusCounts) {
          statusCounts[task.status as keyof TaskStatusCounts]++;
        }
      } catch {
        // skip
      }
    }
    return { taskCount: taskFiles.length, statusCounts };
  } catch {
    return { taskCount: 0, statusCounts };
  }
}

async function getAllSessions(): Promise<Map<string, SessionEntry>> {
  const map = new Map<string, SessionEntry>();
  try {
    const projectDirs = await fs.readdir(PROJECTS_DIR);
    await Promise.all(
      projectDirs.map(async (dir) => {
        const indexPath = path.join(PROJECTS_DIR, dir, "sessions-index.json");
        try {
          const raw = await fs.readFile(indexPath, "utf-8");
          const index = JSON.parse(raw);
          for (const entry of index.entries || []) {
            if (entry.sessionId) {
              map.set(entry.sessionId, entry);
            }
          }
        } catch {
          // no index
        }
      })
    );
  } catch {
    // no projects dir
  }

  // Also scan for JSONL files not in any index (fallback)
  try {
    const projectDirs = await fs.readdir(PROJECTS_DIR);
    await Promise.all(
      projectDirs.map(async (dir) => {
        const projDir = path.join(PROJECTS_DIR, dir);
        try {
          const files = await fs.readdir(projDir);
          for (const f of files) {
            if (!f.endsWith(".jsonl")) continue;
            const uuid = f.replace(".jsonl", "");
            if (!UUID_RE.test(uuid) || map.has(uuid)) continue;

            // Extract minimal info from first user message
            try {
              const fullPath = path.join(projDir, f);
              const stat = await fs.stat(fullPath);
              const raw = await fs.readFile(fullPath, "utf-8");
              const lines = raw.split("\n").filter(Boolean);
              let firstPrompt = "";
              let gitBranch = "";
              for (const line of lines.slice(0, 20)) {
                try {
                  const obj = JSON.parse(line);
                  if (
                    obj.type === "user" &&
                    obj.message?.content &&
                    !firstPrompt
                  ) {
                    firstPrompt =
                      typeof obj.message.content === "string"
                        ? obj.message.content.slice(0, 200)
                        : "";
                  }
                  if (obj.gitBranch && !gitBranch) {
                    gitBranch = obj.gitBranch;
                  }
                } catch {
                  // skip
                }
              }
              // Reconstruct projectPath from dir name
              const projectPath = dir
                .replace(/^-/, "/")
                .replace(/-/g, "/");

              map.set(uuid, {
                sessionId: uuid,
                firstPrompt,
                gitBranch,
                projectPath,
                created: stat.birthtime.toISOString(),
                modified: stat.mtime.toISOString(),
                messageCount: lines.length,
              });
            } catch {
              // skip
            }
          }
        } catch {
          // skip
        }
      })
    );
  } catch {
    // skip
  }
  return map;
}

export async function GET() {
  try {
    const sessionsMap = await getAllSessions();

    // Get all task workspace UUIDs
    const taskDirEntries = await fs
      .readdir(TASKS_DIR, { withFileTypes: true })
      .catch(() => []);
    const taskUuids = new Set(
      taskDirEntries
        .filter((e) => e.isDirectory() && UUID_RE.test(e.name))
        .map((e) => e.name)
    );

    // Collect all relevant UUIDs: sessions with tasks + task-only workspaces
    const allUuids = new Set([...sessionsMap.keys(), ...taskUuids]);

    const workspaces = await Promise.all(
      Array.from(allUuids).map(async (uuid) => {
        const { taskCount, statusCounts } = await readTaskCounts(uuid);
        const session = sessionsMap.get(uuid);
        return {
          id: uuid,
          taskCount,
          statusCounts,
          hasTasks: taskUuids.has(uuid),
          session: session || undefined,
        };
      })
    );

    // Only show workspaces that have tasks
    const filtered = workspaces.filter((ws) => ws.hasTasks);

    filtered.sort(
      (a, b) =>
        new Date(b.session?.modified || 0).getTime() -
        new Date(a.session?.modified || 0).getTime()
    );

    return NextResponse.json(filtered);
  } catch {
    return NextResponse.json([]);
  }
}
