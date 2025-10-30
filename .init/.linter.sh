#!/bin/bash
cd /home/kavia/workspace/code-generation/teamsync-engage-182304-182313/team_sync_frontend
npm run build
EXIT_CODE=$?
if [ $EXIT_CODE -ne 0 ]; then
   exit 1
fi

