# Tauri CodeMirror Editor

A modern code editor built with SvelteKit and Tauri.

## Requirements

- [Node.js](https://nodejs.org/) (v16 or newer)
- [Rust](https://www.rust-lang.org/tools/install) (for Tauri native capabilities)

## Quick Start

Windows:
```sh
# Run the development server (web only)
run-dev.bat

# Run with Tauri native capabilities
run-dev.bat tauri

# Build the application
build-windows.bat

# Run the built application
run-app.bat
```

Unix/macOS:
```sh
# Install dependencies
npm install --legacy-peer-deps

# Run in development mode (web only)
npm run dev

# Run with Tauri native capabilities
npm run tauri:dev

# Build for production
npm run build
npm run tauri:build
```

## Project Structure

- `/src` - SvelteKit frontend code
- `/src/entry` - Entry point configuration UI
- `/src/lib` - Shared components and utilities
- `/src-tauri` - Tauri native code (Rust)
- `/public` - Static assets

## Features
- CodeMirror 6 editor with language packages
- Tauri PTY + Xterm.js terminal
- File open/save via Tauri FS API
- VS Code theming
- Command Palette (Ctrl+Shift+P)
- Multiple entry points with configurable settings
- Accessibility: keyboard navigation, ARIA, screen-reader support

## Configuration

The editor can be configured via the entry page at `/entry`. Settings include:
- Theme selection (dark/light)
- Terminal visibility
- File explorer visibility
- Startup file selection 