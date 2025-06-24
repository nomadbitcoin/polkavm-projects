#!/bin/bash

# Script to run the oracle client and ensure it's properly closed
# This script is designed to be run by cron every 4 hours

# Source the user's shell environment to get proper PATH
source ~/.zshrc 2>/dev/null || source ~/.bash_profile 2>/dev/null || true

# Set the working directory to the node-oracle-client
cd "$(dirname "$0")"

# Log file for tracking executions
LOG_FILE="./cron.log"

# Function to log messages with timestamp
log_message() {
    echo "$(date '+%Y-%m-%d %H:%M:%S') - $1" >> "$LOG_FILE"
}

# Start logging
log_message "Starting oracle client execution"

# Use full path to npm or fallback to npx
NPM_CMD="/Users/nomadbitcoin/.asdf/shims/npm"
if [ ! -f "$NPM_CMD" ]; then
    NPM_CMD="npx"
fi

log_message "Using npm command: $NPM_CMD"

# Run npm start in background and capture its PID
$NPM_CMD start >> "$LOG_FILE" 2>&1 &
NPM_PID=$!

# Wait for 3.5 hours (12600 seconds) then kill the process
# This ensures it completes before the next 4-hour run
sleep 12600
kill $NPM_PID 2>/dev/null || true

# Wait a bit more to ensure it's killed
sleep 10
kill -9 $NPM_PID 2>/dev/null || true

# Check if the process is still running
if kill -0 $NPM_PID 2>/dev/null; then
    log_message "Oracle client was terminated due to timeout (3.5 hours)"
else
    log_message "Oracle client completed successfully"
fi

# Ensure any remaining processes are killed
pkill -f "ts-node src/cloud-function.ts" 2>/dev/null || true

log_message "Execution finished" 