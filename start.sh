#!/bin/bash
LOG=/tmp/lifecycle.log

echo "$(date) start.sh: invoked" >> "$LOG"

# Backend: only start if not already launching or running
if ! pgrep -f "spring-boot:run" > /dev/null 2>&1; then
    echo "$(date) start.sh: launching backend" >> "$LOG"
    nohup bash -c "cd /workspaces/bit-semester-planner && ./mvnw spring-boot:run -DskipTests >> /tmp/backend.log 2>&1" > /dev/null 2>&1 &
    echo "$(date) start.sh: backend launcher PID $!" >> "$LOG"
else
    echo "$(date) start.sh: backend already running, skipping" >> "$LOG"
fi

# Frontend: only start if neither vite nor a pending npm run dev is running
if ! pgrep -f "vite" > /dev/null 2>&1 && ! pgrep -f "npm run dev" > /dev/null 2>&1; then
    echo "$(date) start.sh: scheduling frontend (30s delay)" >> "$LOG"
    nohup bash -c "sleep 30 && cd /workspaces/bit-semester-planner/frontend && npm run dev >> /tmp/frontend.log 2>&1" > /dev/null 2>&1 &
    echo "$(date) start.sh: frontend scheduler PID $!" >> "$LOG"
else
    echo "$(date) start.sh: frontend already running or pending, skipping" >> "$LOG"
fi

echo "$(date) start.sh: done" >> "$LOG"
