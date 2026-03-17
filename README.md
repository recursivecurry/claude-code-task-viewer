# Claude Code Task Viewer

A native desktop application for visualizing Claude Code's internal task data. Built with Go + [Wails](https://wails.io/), it reads from `~/.claude/tasks` and `~/.claude/projects` to display sessions, tasks, and dependency graphs in a single dashboard.

## Features

### Session Sidebar
- Lists all Claude Code sessions with project name, git branch, and summary
- Sortable by project name, created date, or modified date
- Shows per-session task status counts (pending, in progress, completed)
- Session detail popup with click-to-copy values

### Task Table
- Displays tasks for the selected workspace in a sortable table
- Filter by status: All / Pending / In Progress / Completed
- Column header click to sort

### Dependency Graph
- Visualizes blocking/dependency relationships between tasks as a directed graph
- Color-coded by status (yellow: pending, blue: in progress, green: completed)
- Zoom, pan, and minimap support
- Selection syncs between the table and graph

### Other
- Dark mode / light mode toggle
- Resizable split view (table + graph)

## Tech Stack

- **Go** + **Wails v2** - Native desktop app framework
- **React 18** + **TypeScript** + **Vite** - Frontend
- **TanStack Table** - Task table
- **React Flow** (@xyflow/react) + **dagre** - Dependency graph layout
- **Tailwind CSS 4**

## Prerequisites

- [Go](https://go.dev/) 1.23+
- [Node.js](https://nodejs.org/) 18+
- [Wails CLI](https://wails.io/docs/gettingstarted/installation) v2
- Claude Code installed with task data in `~/.claude/tasks`

## Installation

```bash
git clone https://github.com/recursivecurry/claude-code-task-viewer.git
cd claude-code-task-viewer
```

Install frontend dependencies:

```bash
cd frontend
npm install
cd ..
```

## Usage

### Development Mode

Run with live reload:

```bash
wails dev
```

This opens the app as a native window. Frontend changes hot-reload automatically.

### Production Build

```bash
wails build
```

The built binary is located at `build/bin/claude-task-viewer` (or `build/bin/claude-task-viewer.app` on macOS).

### Workflow

1. Select a Claude Code session from the sidebar.
2. The task table for that session appears on the left panel.
3. The dependency graph renders automatically on the right panel.
4. Click a task in the table to highlight it in the graph, and vice versa.
5. Use the status filter to narrow down tasks by their current state.

## License

MIT License

Copyright (c) 2025 recursivecurry

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
