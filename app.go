package main

import (
	"context"
	"encoding/json"
	"os"
	"path/filepath"
	"regexp"
	"sort"
	"strings"
)

var uuidRE = regexp.MustCompile(`^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$`)

// --- Data types ---

type TaskStatusCounts struct {
	Pending    int `json:"pending"`
	InProgress int `json:"in_progress"`
	Completed  int `json:"completed"`
}

type SessionInfo struct {
	SessionID    string `json:"sessionId"`
	FullPath     string `json:"fullPath"`
	FileMtime    int64  `json:"fileMtime"`
	FirstPrompt  string `json:"firstPrompt"`
	Summary      string `json:"summary"`
	MessageCount int    `json:"messageCount"`
	Created      string `json:"created"`
	Modified     string `json:"modified"`
	GitBranch    string `json:"gitBranch"`
	ProjectPath  string `json:"projectPath"`
	IsSidechain  bool   `json:"isSidechain"`
}

type Workspace struct {
	ID           string            `json:"id"`
	TaskCount    int               `json:"taskCount"`
	StatusCounts TaskStatusCounts  `json:"statusCounts"`
	HasTasks     bool              `json:"hasTasks"`
	Session      *SessionInfo      `json:"session,omitempty"`
}

type Task struct {
	ID          string   `json:"id"`
	Subject     string   `json:"subject"`
	Description string   `json:"description"`
	ActiveForm  string   `json:"activeForm"`
	Status      string   `json:"status"`
	Blocks      []string `json:"blocks"`
	BlockedBy   []string `json:"blockedBy"`
}

// --- App ---

type App struct {
	ctx context.Context
}

func NewApp() *App {
	return &App{}
}

func (a *App) startup(ctx context.Context) {
	a.ctx = ctx
}

func claudeDir() string {
	home, _ := os.UserHomeDir()
	return filepath.Join(home, ".claude")
}

// --- Session scanning ---

func getAllSessions() map[string]*SessionInfo {
	sessions := make(map[string]*SessionInfo)
	projectsDir := filepath.Join(claudeDir(), "projects")

	dirs, err := os.ReadDir(projectsDir)
	if err != nil {
		return sessions
	}

	for _, d := range dirs {
		if !d.IsDir() || strings.HasPrefix(d.Name(), ".") {
			continue
		}
		indexPath := filepath.Join(projectsDir, d.Name(), "sessions-index.json")
		data, err := os.ReadFile(indexPath)
		if err != nil {
			continue
		}
		var index struct {
			Entries []json.RawMessage `json:"entries"`
		}
		if json.Unmarshal(data, &index) != nil {
			continue
		}
		for _, raw := range index.Entries {
			var entry SessionInfo
			if json.Unmarshal(raw, &entry) == nil && entry.SessionID != "" {
				e := entry
				sessions[entry.SessionID] = &e
			}
		}
	}

	// Fallback: scan JSONL files not in any index
	for _, d := range dirs {
		if !d.IsDir() {
			continue
		}
		projDir := filepath.Join(projectsDir, d.Name())
		files, err := os.ReadDir(projDir)
		if err != nil {
			continue
		}
		for _, f := range files {
			if !strings.HasSuffix(f.Name(), ".jsonl") {
				continue
			}
			uuid := strings.TrimSuffix(f.Name(), ".jsonl")
			if !uuidRE.MatchString(uuid) || sessions[uuid] != nil {
				continue
			}
			fullPath := filepath.Join(projDir, f.Name())
			info, err := os.Stat(fullPath)
			if err != nil {
				continue
			}
			data, err := os.ReadFile(fullPath)
			if err != nil {
				continue
			}
			lines := strings.Split(strings.TrimSpace(string(data)), "\n")
			firstPrompt := ""
			gitBranch := ""
			limit := 20
			if len(lines) < limit {
				limit = len(lines)
			}
			for _, line := range lines[:limit] {
				var obj map[string]interface{}
				if json.Unmarshal([]byte(line), &obj) != nil {
					continue
				}
				if obj["type"] == "user" && firstPrompt == "" {
					if msg, ok := obj["message"].(map[string]interface{}); ok {
						if content, ok := msg["content"].(string); ok {
							if len(content) > 200 {
								content = content[:200]
							}
							firstPrompt = content
						}
					}
				}
				if b, ok := obj["gitBranch"].(string); ok && gitBranch == "" {
					gitBranch = b
				}
			}
			projectPath := strings.Replace(d.Name(), "-", "/", -1)
			if strings.HasPrefix(projectPath, "/") {
				// already correct
			} else {
				projectPath = "/" + projectPath
			}

			sessions[uuid] = &SessionInfo{
				SessionID:    uuid,
				FirstPrompt:  firstPrompt,
				GitBranch:    gitBranch,
				ProjectPath:  projectPath,
				Created:      info.ModTime().UTC().Format("2006-01-02T15:04:05.000Z"),
				Modified:     info.ModTime().UTC().Format("2006-01-02T15:04:05.000Z"),
				MessageCount: len(lines),
			}
		}
	}

	return sessions
}

// --- Exported methods (bound to frontend) ---

func (a *App) GetWorkspaces() []Workspace {
	tasksDir := filepath.Join(claudeDir(), "tasks")
	sessionsMap := getAllSessions()

	// Get task workspace UUIDs
	taskDirs, err := os.ReadDir(tasksDir)
	if err != nil {
		return []Workspace{}
	}

	taskUUIDs := make(map[string]bool)
	for _, d := range taskDirs {
		if d.IsDir() && uuidRE.MatchString(d.Name()) {
			taskUUIDs[d.Name()] = true
		}
	}

	var workspaces []Workspace
	for uuid := range taskUUIDs {
		ws := Workspace{
			ID:       uuid,
			HasTasks: true,
		}

		// Read tasks and count statuses
		dir := filepath.Join(tasksDir, uuid)
		files, err := os.ReadDir(dir)
		if err == nil {
			for _, f := range files {
				if strings.HasSuffix(f.Name(), ".json") && !strings.HasPrefix(f.Name(), ".") {
					ws.TaskCount++
					data, err := os.ReadFile(filepath.Join(dir, f.Name()))
					if err != nil {
						continue
					}
					var t struct {
						Status string `json:"status"`
					}
					if json.Unmarshal(data, &t) == nil {
						switch t.Status {
						case "pending":
							ws.StatusCounts.Pending++
						case "in_progress":
							ws.StatusCounts.InProgress++
						case "completed":
							ws.StatusCounts.Completed++
						}
					}
				}
			}
		}

		if s, ok := sessionsMap[uuid]; ok {
			ws.Session = s
		}
		workspaces = append(workspaces, ws)
	}

	// Sort by modified desc by default
	sort.Slice(workspaces, func(i, j int) bool {
		mi, mj := "", ""
		if workspaces[i].Session != nil {
			mi = workspaces[i].Session.Modified
		}
		if workspaces[j].Session != nil {
			mj = workspaces[j].Session.Modified
		}
		return mi > mj
	})

	return workspaces
}

func (a *App) GetTasks(workspaceID string) []Task {
	if !uuidRE.MatchString(workspaceID) {
		return []Task{}
	}
	dir := filepath.Join(claudeDir(), "tasks", workspaceID)
	files, err := os.ReadDir(dir)
	if err != nil {
		return []Task{}
	}

	var tasks []Task
	for _, f := range files {
		if !strings.HasSuffix(f.Name(), ".json") || strings.HasPrefix(f.Name(), ".") {
			continue
		}
		data, err := os.ReadFile(filepath.Join(dir, f.Name()))
		if err != nil {
			continue
		}
		var t Task
		if json.Unmarshal(data, &t) == nil {
			if t.Blocks == nil {
				t.Blocks = []string{}
			}
			if t.BlockedBy == nil {
				t.BlockedBy = []string{}
			}
			tasks = append(tasks, t)
		}
	}

	sort.Slice(tasks, func(i, j int) bool {
		return tasks[i].ID < tasks[j].ID
	})

	return tasks
}

func (a *App) GetSession(sessionID string) *SessionInfo {
	if !uuidRE.MatchString(sessionID) {
		return nil
	}
	sessions := getAllSessions()
	return sessions[sessionID]
}
