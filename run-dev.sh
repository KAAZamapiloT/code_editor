#!/bin/bash

# Exit on error
set -e

echo "Starting Code Editor in development mode..."

# Install dependencies if needed
if [ ! -d "node_modules" ]; then
    echo "Installing dependencies..."
    npm install
fi

# Run in development mode
echo "Starting development server..."
npm run electron:dev 