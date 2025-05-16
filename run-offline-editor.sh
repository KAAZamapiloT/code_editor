#!/bin/bash

# GLITCH.CRT_EDITOR - Run Offline Editor
# This script launches the offline editor mode directly

echo -e "\e[32m"
echo " ___________.____     __________  _____________________________    ___________ ___________________ "
echo " \\__    ___/|    |    \\______   \\/   _____/\\      \\__    ___/     \\_   _____/ \\_   ___ \\__    ___/ "
echo "   |    |   |    |     |    |  _/\\_____  \\ /   |   \\|    |        |    __)_  /    \\  \\/ |    |   "
echo "   |    |   |    |___  |    |   \\/        /    |    |    |        |        \\ \\     \\____|    |   "
echo "   |____|   |_______ \\ |______  /_______  /\\____|__  /____|       /_______  / \\______  /|____|   "
echo "                    \\/        \\/        \\/         \\/                     \\/         \\/         "
echo -e "\e[0m"
echo ""
echo "================================ GLITCH.CRT_EDITOR OFFLINE =============================="
echo ""

echo "Starting GLITCH.CRT_EDITOR in offline mode..."
echo ""

# Check if app is built
if [ ! -d "dist/linux-unpacked" ]; then
    echo "Application not built. Building now..."
    ./build-linux.sh
fi

echo ""
echo "Features available in offline mode:"
echo " * Advanced multicolor syntax highlighting"
echo " * Multiple CRT-style themes with lens distortion effects"
echo " * File tree navigation panel"
echo " * Vim mode support"
echo " * Code execution capabilities"
echo " * Copy and paste functionality"
echo " * Terminal with basic commands"
echo ""

echo "Launching application..."
./dist/linux-unpacked/GLITCH.CRT_EDITOR --offline

echo ""
echo "Application started. You can close this window." 