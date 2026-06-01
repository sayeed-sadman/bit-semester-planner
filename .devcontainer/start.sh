#!/bin/bash
# Runs on every container start (create and restart) via postStartCommand.
# Starts backend and frontend in the background if not already running.

WORKSPACE=/workspaces/bit-semester-planner

if lsof -i:8080 > /dev/null 2>&1; then
    echo "[start.sh] Backend already running on port 8080."
else
    echo "[start.sh] Starting backend..."
    nohup bash -c "cd $WORKSPACE && ./mvnw spring-boot:run -DskipTests" > /tmp/backend.log 2>&1 &
fi

(
    until (echo > /dev/tcp/localhost/8080) 2>/dev/null; do sleep 2; done
    echo "[start.sh] Backend is up."
    if lsof -i:5173 > /dev/null 2>&1; then
        echo "[start.sh] Frontend already running on port 5173."
    else
        echo "[start.sh] Starting frontend..."
        nohup bash -c "cd $WORKSPACE/frontend && npm run dev" > /tmp/frontend.log 2>&1 &
    fi
) &
