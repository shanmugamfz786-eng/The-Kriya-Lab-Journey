#!/bin/bash

echo "Checking if we should build..."

# If VERCEL_GIT_PREVIOUS_SHA is not set, we should build (e.g. first deployment)
if [[ -z "$VERCEL_GIT_PREVIOUS_SHA" ]]; then
  echo "VERCEL_GIT_PREVIOUS_SHA is not set. Proceeding with build."
  exit 1
fi

# Check for changes in critical files and folders
git diff --quiet $VERCEL_GIT_PREVIOUS_SHA $VERCEL_GIT_COMMIT_SHA \
  ./src \
  ./public \
  ./api \
  ./backend \
  ./package.json \
  ./package-lock.json \
  ./bun.lock \
  ./bunfig.toml \
  ./vite.config.ts \
  ./vercel.json \
  ./tsconfig.json \
  ./components.json

# git diff --quiet exits with 1 if there were differences, 0 if no differences
if [ $? -eq 1 ]; then
  echo "Changes detected in critical files. Proceeding with build."
  exit 1
else
  echo "No changes in critical files. Skipping build."
  exit 0
fi
