#!/bin/bash
cd /workspaces/bit-semester-planner

nohup ./mvnw spring-boot:run -DskipTests > /tmp/backend.log 2>&1 &

# Run the frontend startup in a fully detached subshell so this script exits
# immediately. Without this, the 40-second sleep blocks the Codespaces lifecycle
# shell, which is killed before the frontend launch line is ever reached.
nohup bash -c 'sleep 40 && cd /workspaces/bit-semester-planner/frontend && npm run dev >> /tmp/frontend.log 2>&1' > /dev/null 2>&1 &
