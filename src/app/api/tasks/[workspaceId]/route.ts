import { NextResponse } from "next/server";
import fs from "fs/promises";
import path from "path";
import os from "os";
import type { Task } from "@/lib/types";

const TASKS_DIR = path.join(os.homedir(), ".claude", "tasks");
const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ workspaceId: string }> }
) {
  const { workspaceId } = await params;

  if (!UUID_RE.test(workspaceId)) {
    return NextResponse.json({ error: "Invalid workspace ID" }, { status: 400 });
  }

  const dir = path.join(TASKS_DIR, workspaceId);

  try {
    const files = await fs.readdir(dir);
    const taskFiles = files.filter(
      (f) => f.endsWith(".json") && !f.startsWith(".")
    );

    const tasks: Task[] = await Promise.all(
      taskFiles.map(async (f) => {
        const raw = await fs.readFile(path.join(dir, f), "utf-8");
        return JSON.parse(raw) as Task;
      })
    );

    tasks.sort((a, b) => Number(a.id) - Number(b.id));

    return NextResponse.json(tasks);
  } catch {
    return NextResponse.json([]);
  }
}
