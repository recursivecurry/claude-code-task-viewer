import { NextResponse } from "next/server";
import fs from "fs/promises";
import path from "path";
import os from "os";
import type { Project } from "@/lib/types";

const PROJECTS_DIR = path.join(os.homedir(), ".claude", "projects");

function unescapePath(escaped: string): string {
  // Convert -Users-curry-es-... back to /Users/curry/es/...
  return escaped.replace(/^-/, "/").replace(/-/g, "/");
}

export async function GET() {
  try {
    const entries = await fs.readdir(PROJECTS_DIR, { withFileTypes: true });
    const projects: Project[] = entries
      .filter((e) => e.isDirectory() && !e.name.startsWith("."))
      .map((e) => ({
        name: path.basename(unescapePath(e.name)),
        escapedPath: e.name,
        fullPath: unescapePath(e.name),
      }));

    projects.sort((a, b) => a.name.localeCompare(b.name));
    return NextResponse.json(projects);
  } catch {
    return NextResponse.json([]);
  }
}
