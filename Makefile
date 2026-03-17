.PHONY: build install

build:
	@command -v go >/dev/null 2>&1 || { echo "Error: go is not installed. Install it from https://go.dev/"; exit 1; }
	@command -v node >/dev/null 2>&1 || { echo "Error: node is not installed. Install it from https://nodejs.org/"; exit 1; }
	@command -v npm >/dev/null 2>&1 || { echo "Error: npm is not installed. Install it from https://nodejs.org/"; exit 1; }
	@command -v wails >/dev/null 2>&1 || { echo "wails CLI not found, installing..."; go install github.com/wailsapp/wails/v2/cmd/wails@latest; }
	cd frontend && npm install
	wails build

install: build
	@mkdir -p ~/Applications
	cp -r build/bin/claude-task-viewer.app ~/Applications/
	@echo "Installed claude-task-viewer.app to ~/Applications/"
