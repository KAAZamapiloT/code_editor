# GLITCH.CRT_EDITOR

A terminal-style code editor with CRT display effects built with Electron and React.

## Features

- Retro CRT display with scan lines and glitch effects
- Dark Terminal theme for a pure command-line experience
- Terminal integration with real shell access (via xterm.js)
- Syntax highlighting for multiple languages:
  - JavaScript/TypeScript
  - Python
  - HTML/CSS
  - C/C++
  - Java
  - Rust
  - PHP
  - SQL
  - XML/SVG
  - Markdown
  - JSON
- VIM keybinding support
- Focus mode for distraction-free coding
- File operations (open, save)
- Cross-platform support (Windows, Linux)
- Robust offline mode with fallback editor system

## Keyboard Shortcuts

- `Ctrl+S` - Save file
- `Ctrl+Shift+P` - Open command palette
- `Ctrl+Shift+T` - Cycle through themes
- `Ctrl+B` - Toggle sidebar
- `Ctrl+`` - Toggle terminal
- `F11` - Toggle focus mode

## Prerequisites

- Node.js (v14 or higher)
- npm (v6 or higher)
- For Linux: gcc-c++, make, python3
- For Fedora Linux: libxcrypt-compat

## Getting Started

### Clone the Repository

```bash
git clone https://github.com/yourusername/code-editor.git
cd code-editor
```

### Setup and Development

The project includes helper scripts for both Linux and Windows to simplify development.

#### Linux

Install dependencies:
```bash
./dev-setup.sh install
```

Run in development mode:
```bash
./run-dev.sh
```

Build the application:
```bash
./build-linux.sh
```

Run the built application:
```bash
./run-app.sh
```

#### Windows

Install dependencies:
```cmd
dev-setup.bat install
```

Run in development mode:
```cmd
run-dev.bat
```

Build the application:
```cmd
build-windows.bat
```

Run the built application:
```cmd
run-app.bat
```

## Project Structure

- `src/` - React frontend code
  - `components/` - UI components (Editor, FileExplorer, StatusBar)
  - `pages/` - Application pages (EditorPage)
- `electron/` - Electron main process code
- `public/` - Static assets
  - `offline.html` - Offline mode landing page
  - `standalone.html` - Fallback editor for when React app fails to load
- `build/` - Built React application
- `dist/` - Built Electron application

## Themes

### Glitch CRT
A retro-style theme with green text on black background, scan lines, and glitch animations to mimic old CRT monitors.

### Dark Terminal
A pure dark terminal theme with minimal styling for distraction-free coding.

### Light & Dark
Standard light and dark themes for modern coding.

## Creating a Release

To create a release build:

1. For Linux: `./build-linux.sh`
2. For Windows: `build-windows.bat`

The output will be in the `dist/` directory.

## Testing Offline Mode

The application includes a robust offline fallback mechanism that activates when the React app fails to load.

### Testing on Linux:

```bash
./test-offline.sh
```

### Testing on Windows:

```cmd
test-offline.bat
```

The offline mode includes:
- Basic text editing capabilities
- File open/save functionality
- CRT styling and animations
- Terminal-style interface

## Troubleshooting

### Blank Window Issues

If you encounter a blank window when running the application:

1. Try running the offline test script to verify the fallback system works:
   - Linux: `./test-offline.sh`
   - Windows: `test-offline.bat`

2. Rebuild the application with explicit HTML file copying:
   - Linux: `./build-run.sh build`
   - Windows: `build-run.bat build`

3. Make sure the `standalone.html` file exists in the build directory.

### Linux Issues

If you encounter errors related to native modules (like `node-pty`), try rebuilding them:

```bash
npm rebuild
```

For Fedora users, you may need to install additional dependencies:

```bash
sudo dnf install -y libxcrypt-compat
```

### Build Issues

If you encounter "Unexpected end of JSON input" errors during build, try cleaning your npm cache:

```bash
rm -rf node_modules package-lock.json
npm cache clean --force
npm install
```

## License

MIT 