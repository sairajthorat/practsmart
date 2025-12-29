#!/bin/bash

echo "Checking deployment rules..."
echo "Current branch: $VERCEL_GIT_COMMIT_REF"

if [ "$VERCEL_GIT_COMMIT_REF" == "main" ]; then
  echo "✅ Branch is main. Proceeding with build."
  exit 1
else
  echo "🛑 Branch is $VERCEL_GIT_COMMIT_REF (not main). Ignoring build."
  exit 0
fi
