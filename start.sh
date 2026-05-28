#!/bin/bash
echo "Starting backend..."
cd /workspaces/bit-semester-planner
./mvnw spring-boot:run -DskipTests > /tmp/backend.log 2>&1 &
echo "Waiting 40 seconds for backend..."
sleep 40
echo "Starting frontend..."
cd /workspaces/bit-semester-planner/frontend
npm install --silent
npm run dev > /tmp/frontend.log 2>&1 &
echo "Both services started."
