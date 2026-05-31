#!/bin/bash

# Start frontend in background after 30s delay
nohup bash -c "sleep 30 && cd /workspaces/bit-semester-planner/frontend && npm run dev" > /tmp/frontend.log 2>&1 &

# Run backend in foreground — logs visible in terminal
cd /workspaces/bit-semester-planner && ./mvnw spring-boot:run -DskipTests
