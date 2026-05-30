#!/bin/bash
cd /workspaces/bit-semester-planner
nohup ./mvnw spring-boot:run -DskipTests > /tmp/backend.log 2>&1 &
sleep 40
cd /workspaces/bit-semester-planner/frontend
nohup npm run dev > /tmp/frontend.log 2>&1 &
