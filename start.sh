#!/bin/bash

# Start backend in background
nohup bash -c "cd /workspaces/bit-semester-planner && ./mvnw spring-boot:run -DskipTests" > /tmp/backend.log 2>&1 &

# Start frontend in background after 30s delay
nohup bash -c "sleep 30 && cd /workspaces/bit-semester-planner/frontend && npm run dev" > /tmp/frontend.log 2>&1 &
