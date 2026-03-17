import { NextResponse } from "next/server";
import fs from "fs/promises";
import path from "path";
import os from "os";

const PROJECTS_DIR = path.join(os.homedir(), ".claude", "projects");
const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ sessionId: string }> }
) {
  const { sessionId } = await params;

  if (!UUID_RE.test(sessionId)) {
    return NextResponse.json({ error: "Invalid session ID" }, { status: 400 });
  }

  try {
    const projectDirs = await fs.readdir(PROJECTS_DIR);
    for (const dir of projectDirs) {
      const indexPath = path.join(PROJECTS_DIR, dir, "sessions-index.json");
      try {
        const raw = await fs.readFile(indexPath, "utf-8");
        const index = JSON.parse(raw);
        const entries = index.entries || [];
        const match = entries.find(
          (e: { sessionId: string }) => e.sessionId === sessionId
        );
        if (match) {
          return NextResponse.json(match);
        }
      } catch {
        // no index
      }
    }
  } catch {
    // no projects dir
  }

  return NextResponse.json(null);
}
