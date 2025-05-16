# GLITCH.CRT_EDITOR

A terminal-style code editor with CRT display effects built with Electron and React.

## Features

- Retro CRT display with realistic visual effects:
  - Advanced lens distortion with curved screen simulation
  - Dynamic scanlines and RGB color shifting
  - Screen flicker and static noise effects
  - VHS-style interference and glitch animations
- Dark Terminal theme for a pure command-line experience
- Terminal integration with real shell access (via xterm.js)
- Vibrant multicolor syntax highlighting for multiple languages:
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
- Intelligent code autocomplete
- VIM keybinding support
- Focus mode for distraction-free coding
- File operations (open, save)
- Cross-platform support (Windows, Linux)
- Robust offline mode with fallback editor system
- Seamless switching between online and offline modes

## Keyboard Shortcuts

- `Ctrl+S` - Save file
- `Ctrl+Shift+P` - Open command palette
- `Ctrl+Shift+T` - Cycle through themes
- `Ctrl+B` - Toggle sidebar
- `Ctrl+`` - Toggle terminal
- `F11` - Toggle focus mode
- `Ctrl+Space` - Show autocomplete suggestions

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

Run the offline editor:
```bash
./run-offline-editor.sh
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

Run the offline editor:
```cmd
run-offline-editor.bat
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

## Offline vs Online Mode

### Online Mode
The full-featured React-based editor with all capabilities including:
- Full syntax highlighting
- Smart autocomplete with language-specific suggestions
- All editor features and extensions
- Terminal with shell access
- Github integration

### Offline Mode
A lightweight fallback editor that works even when the React app fails to load:
- Vibrant multicolor syntax highlighting using CodeMirror
- Advanced CRT display effects with lens distortion
- Realistic monitor curvature and screen reflection
- Smart autocomplete support for common languages
- File operations (open, save, create)
- File tree browser
- JavaScript and HTML execution
- CRT display effects
- Ability to switch to online mode when network becomes available

## Themes

### Glitch CRT
A retro-style theme with green text on black background, scan lines, and glitch animations to mimic old CRT monitors. Features multicolor syntax highlighting with bright neon colors.

### Dark Terminal
A pure dark terminal theme with minimal styling for distraction-free coding.

### Synthwave
Purple gradient with pink text and glow effects for a 1980s retro vibe. Features bright neon colors with subtle text glow effects for a true retro coding experience.

### Cyberpunk
Dark blue with cyan text and magenta accents inspired by cyberpunk aesthetics. Features contrasting bright colors and subtle text shadow effects.

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