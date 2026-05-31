#!/bin/bash

# Ensure tmux is available
if ! command -v tmux &> /dev/null; then
    echo "tmux not found, falling back to background processes"
    nohup bash -c "cd /workspaces/bit-semester-planner && ./mvnw spring-boot:run -DskipTests > /tmp/backend.log 2>&1" > /dev/null 2>&1 &
    nohup bash -c "sleep 30 && cd /workspaces/bit-semester-planner/frontend && npm run dev > /tmp/frontend.log 2>&1" > /dev/null 2>&1 &
    exit 0
fi

# Kill any existing session to start fresh
tmux kill-session -t bitsemesterplanner 2>/dev/null

# Create a new tmux session with the backend pane
tmux new-session -d -s bitsemesterplanner -n Backend -x 220 -y 50

# Start the backend in the Backend window
tmux send-keys -t bitsemesterplanner:Backend \
    "cd /workspaces/bit-semester-planner && ./mvnw spring-boot:run -DskipTests" Enter

# Create a second window for the frontend (starts after 30s delay)
tmux new-window -t bitsemesterplanner -n Frontend
tmux send-keys -t bitsemesterplanner:Frontend \
    "sleep 30 && cd /workspaces/bit-semester-planner/frontend && npm run dev" Enter

# Attach the terminal to the Backend window by default
tmux select-window -t bitsemesterplanner:Backend
