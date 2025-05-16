#!/bin/bash

# Exit on error
set -e

# Detect platform
is_windows() {
    case "$(uname -s)" in
        CYGWIN*|MINGW*|MSYS*) return 0 ;;
        *) return 1 ;;
    esac
}

show_help() {
    echo "Code Editor Development Helper"
    echo ""
    echo "Usage: ./dev-setup.sh [command]"
    echo ""
    echo "Commands:"
    echo "  install    - Install dependencies"
    echo "  dev        - Run in development mode"
    echo "  build      - Build for current platform"
    echo "  run        - Run the built application"
    echo "  clean      - Clean build artifacts"
    echo "  help       - Show this help message"
    echo ""
}

install_deps() {
    echo "Installing dependencies..."
    npm install
    
    # Check for native dependencies for Fedora
    if [ -f /etc/fedora-release ]; then
        echo "Fedora detected. Checking for required system packages..."
        
        PACKAGES="gcc-c++ make python3"
        MISSING=""
        
        for pkg in $PACKAGES; do
            if ! rpm -q $pkg > /dev/null; then
                MISSING="$MISSING $pkg"
            fi
        done
        
        if [ ! -z "$MISSING" ]; then
            echo "Missing required packages:$MISSING"
            echo "Install them with: sudo dnf install -y$MISSING"
            
            read -p "Do you want to install them now? (y/n) " -n 1 -r
            echo
            if [[ $REPLY =~ ^[Yy]$ ]]; then
                sudo dnf install -y $MISSING
            fi
        else
            echo "All required system packages are installed."
        fi
    fi
    
    echo "Dependencies installed successfully!"
}

run_dev() {
    echo "Starting development mode..."
    if is_windows; then
        cmd //c run-dev.bat
    else
        npm run electron:dev
    fi
}

build_app() {
    if is_windows; then
        echo "Building application for Windows..."
        cmd //c build-windows.bat
    else
        echo "Building application for Linux..."
        npm run build
        npm run electron:build:linux
    fi
    echo "Build completed! You can find the output in the dist/ directory."
}

run_app() {
    if is_windows; then
        if [ ! -d "dist/win-unpacked" ]; then
            echo "Application not built yet. Building first..."
            build_app
        fi
        
        echo "Running application..."
        cmd //c run-app.bat
    else
        if [ ! -d "dist" ] || [ ! -d "dist/linux-unpacked" ]; then
            echo "Application not built yet. Building first..."
            build_app
        fi
        
        echo "Running application..."
        if [ -f "dist/linux-unpacked/react-electron-editor" ]; then
            ./dist/linux-unpacked/react-electron-editor
        else
            echo "Error: Application executable not found!"
            echo "Check the dist/linux-unpacked directory for the correct executable name."
            ls -la dist/linux-unpacked/
        fi
    fi
}

clean_build() {
    echo "Cleaning build artifacts..."
    rm -rf build/ dist/
    echo "Clean completed!"
}

# Main script logic
case "$1" in
    install)
        install_deps
        ;;
    dev)
        run_dev
        ;;
    build)
        build_app
        ;;
    run)
        run_app
        ;;
    clean)
        clean_build
        ;;
    help|*)
        show_help
        ;;
esac 