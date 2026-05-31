#!/bin/bash

# Start backend in background
nohup bash -c "cd /workspaces/bit-semester-planner && ./mvnw spring-boot:run -DskipTests" > /tmp/backend.log 2>&1 &

# Start frontend after backend is healthy
nohup bash -c "until curl -sf http://localhost:8080/actuator/health > /dev/null; do sleep 2; done && cd /workspaces/bit-semester-planner/frontend && npm run dev" > /tmp/frontend.log 2>&1 &
