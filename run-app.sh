#!/bin/bash

# Exit on error
set -e

echo "Starting Code Editor..."

# Check if the app is built
if [ ! -d "dist" ]; then
    echo "Application not built. Building now..."
    ./build-linux.sh
fi

# Run the app
echo "Launching application..."
if [ -f "dist/linux-unpacked/react-electron-editor" ]; then
    ./dist/linux-unpacked/react-electron-editor
else
    echo "Error: Application executable not found!"
    echo "Check the dist/linux-unpacked directory for the correct executable name."
    ls -la dist/linux-unpacked/
fi 