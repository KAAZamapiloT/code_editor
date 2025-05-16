#!/bin/bash

# GLITCH.CRT_EDITOR build and run script for Linux
# Usage: ./build-run.sh [build|run|dev]

YELLOW='\033[1;33m'
GREEN='\033[1;32m'
CYAN='\033[1;36m'
NC='\033[0m' # No Color

echo -e "${CYAN}┌─────────────────────────────────────┐${NC}"
echo -e "${CYAN}│  GLITCH.CRT_EDITOR - Terminal Style  │${NC}"
echo -e "${CYAN}└─────────────────────────────────────┘${NC}"

# Function to install dependencies
install_deps() {
    echo -e "${YELLOW}Installing dependencies...${NC}"
    npm install
    echo -e "${GREEN}Dependencies installed!${NC}"
}

# Function to build the application
build_app() {
    echo -e "${YELLOW}Building application...${NC}"
    
    # Run the React build
    npm run build
    
    # Ensure the build directory exists
    if [ ! -d "./build" ]; then
        echo -e "${YELLOW}Build directory not found, creating it...${NC}"
        mkdir -p "./build"
    fi
    
    # Copy HTML files from public to build
    echo -e "${YELLOW}Copying HTML files to build directory...${NC}"
    cp -f public/*.html build/
    
    # Create electron build
    echo -e "${YELLOW}Building Electron application...${NC}"
    npm run electron:build:linux
    
    echo -e "${GREEN}Build completed! Check the 'dist' folder for the executable.${NC}"
}

# Function to run development mode
run_dev() {
    echo -e "${YELLOW}Starting in development mode...${NC}"
    npm run electron:dev
}

# Function to run the built application
run_app() {
    if [ -d "./dist" ]; then
        echo -e "${YELLOW}Searching for AppImage...${NC}"
        APPIMAGE=$(find ./dist -name "*.AppImage" | head -n 1)
        if [ -n "$APPIMAGE" ]; then
            echo -e "${GREEN}Running $APPIMAGE${NC}"
            chmod +x "$APPIMAGE"
            "$APPIMAGE"
        else
            echo -e "${YELLOW}AppImage not found. Running from source...${NC}"
            npm start
        fi
    else
        echo -e "${YELLOW}Dist folder not found. Running from source...${NC}"
        npm start
    fi
}

# Process command line argument
case "$1" in
    install)
        install_deps
        ;;
    build)
        build_app
        ;;
    dev)
        run_dev
        ;;
    run)
        run_app
        ;;
    *)
        # If no argument provided, show help
        echo -e "Usage: $0 [install|build|dev|run]"
        echo -e "  ${CYAN}install${NC} - Install dependencies"
        echo -e "  ${CYAN}build${NC}   - Build the application"
        echo -e "  ${CYAN}dev${NC}     - Run in development mode"
        echo -e "  ${CYAN}run${NC}     - Run the built application"
        ;;
esac

exit 0 