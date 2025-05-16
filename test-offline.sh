#!/bin/bash

# Test script for offline functionality
# Tests the offline fallback mechanism in the GLITCH.CRT_EDITOR

YELLOW='\033[1;33m'
GREEN='\033[1;32m'
RED='\033[1;31m'
CYAN='\033[1;36m'
NC='\033[0m' # No Color

echo -e "${CYAN}┌─────────────────────────────────────┐${NC}"
echo -e "${CYAN}│  OFFLINE MODE TEST - GLITCH.CRT      │${NC}"
echo -e "${CYAN}└─────────────────────────────────────┘${NC}"

# Check if build directory exists
if [ ! -d "./build" ]; then
    echo -e "${RED}Build directory does not exist. Please run build-run.sh build first.${NC}"
    exit 1
fi

# Check if standalone.html exists in build
if [ ! -f "./build/standalone.html" ]; then
    echo -e "${YELLOW}standalone.html not found in build directory.${NC}"
    echo -e "${YELLOW}Copying from public directory...${NC}"
    
    if [ -f "./public/standalone.html" ]; then
        cp -f ./public/standalone.html ./build/
        echo -e "${GREEN}Copied standalone.html to build directory.${NC}"
    else
        echo -e "${RED}standalone.html not found in public directory.${NC}"
        echo -e "${YELLOW}Creating standalone.html from scratch...${NC}"
        
        # Create minimal standalone.html
        cat > ./build/standalone.html << 'EOF'
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>GLITCH.CRT_EDITOR | STANDALONE MODE</title>
  <style>
    body, html {
      margin: 0;
      padding: 0;
      height: 100%;
      font-family: 'Consolas', 'Courier New', monospace;
      background-color: #000;
      color: #00FF41;
    }
    
    .container {
      display: flex;
      flex-direction: column;
      height: 100vh;
    }
    
    header {
      background-color: #0D0D0D;
      color: #00FF41;
      padding: 10px 20px;
      border-bottom: 1px solid #00FF41;
    }
    
    main {
      flex: 1;
      padding: 20px;
      display: flex;
      flex-direction: column;
    }
    
    textarea {
      flex: 1;
      background-color: #111;
      color: #00FF41;
      border: 1px solid #00FF41;
      padding: 10px;
      font-family: monospace;
      margin-bottom: 20px;
    }
    
    button {
      background-color: #111;
      color: #00FF41;
      border: 1px solid #00FF41;
      padding: 8px 15px;
      margin-right: 10px;
      cursor: pointer;
    }
    
    footer {
      background-color: #0D0D0D;
      padding: 5px 10px;
      border-top: 1px solid #00FF41;
      display: flex;
      justify-content: space-between;
    }
  </style>
</head>
<body>
  <div class="container">
    <header>GLITCH.CRT_EDITOR - STANDALONE MODE</header>
    <main>
      <textarea id="editor" placeholder="Type your text here..."></textarea>
      <div>
        <button id="openBtn">Open File</button>
        <button id="saveBtn">Save File</button>
      </div>
    </main>
    <footer>
      <div>OFFLINE MODE</div>
      <div id="time"></div>
    </footer>
  </div>
  
  <script>
    // Update time
    function updateTime() {
      document.getElementById('time').textContent = new Date().toLocaleTimeString();
    }
    setInterval(updateTime, 1000);
    updateTime();
    
    // Event listeners
    document.getElementById('openBtn').addEventListener('click', () => {
      window.electron.ipcRenderer.invoke('open-file-dialog').then(result => {
        if (result && result.content) {
          document.getElementById('editor').value = result.content;
        }
      }).catch(err => {
        console.error('Failed to open file:', err);
      });
    });
    
    document.getElementById('saveBtn').addEventListener('click', () => {
      window.electron.ipcRenderer.invoke('save-file-dialog', {
        content: document.getElementById('editor').value
      }).catch(err => {
        console.error('Failed to save file:', err);
      });
    });
  </script>
</body>
</html>
EOF
        echo -e "${GREEN}Created standalone.html in build directory.${NC}"
    fi
fi

# Check if index.html exists
if [ ! -f "./build/index.html" ]; then
    echo -e "${YELLOW}index.html not found in build directory.${NC}"
    echo -e "${YELLOW}Copying from public directory...${NC}"
    
    if [ -f "./public/index.html" ]; then
        cp -f ./public/index.html ./build/
        echo -e "${GREEN}Copied index.html to build directory.${NC}"
    else
        echo -e "${RED}index.html not found in public directory. Cannot continue.${NC}"
        exit 1
    fi
fi

# Run the application with network disabled
echo -e "${YELLOW}Starting the application in offline mode...${NC}"
echo -e "${YELLOW}This will test the fallback mechanism...${NC}"
echo -e "${CYAN}Press Ctrl+C to exit the test${NC}"

# Run electron directly with offline mode flag
NODE_ENV=production OFFLINE_MODE=true electron .

echo -e "${GREEN}Test completed!${NC}"
exit 0 