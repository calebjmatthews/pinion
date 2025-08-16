#!/bin/bash

LOG_FILE="server.log"

# Timestamp the log start
echo "=== Starting Bun server at $(date) ===" >> "$LOG_FILE"

# Run Bun in the background, redirecting stdout & stderr to log file
nohup bun run index.ts >> "$LOG_FILE" 2>&1 &

# Save the PID so we can stop it later if needed
echo $! > bun_server.pid

echo "Bun server started with PID $(cat bun_server.pid)"
echo "Logging output to $LOG_FILE"
