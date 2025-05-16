#!/bin/bash

# Exit on error
set -e

echo "Building Code Editor for Linux..."

# Install dependencies if node_modules doesn't exist
if [ ! -d "node_modules" ]; then
    echo "Installing dependencies..."
    npm install
fi

# Build React app
echo "Building React app..."
npm run build

# Build Electron app for Linux
echo "Building Electron app for Linux..."
npm run electron:build:linux

echo "Build completed successfully!" 