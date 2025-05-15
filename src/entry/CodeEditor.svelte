<script lang="ts">
  import { onMount } from 'svelte';
  
  // Props to allow configuration
  export let theme = 'dark'; // 'dark' or 'light'
  export let startupFile = ''; // Optional file to open on startup
  export let showTerminal = true;
  export let showFileExplorer = true;
  
  // Forward the configuration to the main app via localStorage
  onMount(() => {
    localStorage.setItem('code-editor-config', JSON.stringify({
      theme,
      startupFile,
      showTerminal,
      showFileExplorer
    }));
    
    // Add keyboard shortcut listener
    window.addEventListener('keydown', handleKeyDown);
    
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  });
  
  function handleKeyDown(e: KeyboardEvent) {
    // Add any entry-level keyboard shortcuts here
  }
  
  function launchEditor() {
    window.location.href = '/editor';
  }
</script>

<div class="code-editor-entry">
  <header>
    <h1>Code Editor</h1>
    <div class="options">
      <label>
        Theme:
        <select bind:value={theme}>
          <option value="dark">Dark</option>
          <option value="light">Light</option>
        </select>
      </label>
      
      <label>
        <input type="checkbox" bind:checked={showTerminal} />
        Show Terminal
      </label>
      
      <label>
        <input type="checkbox" bind:checked={showFileExplorer} />
        Show File Explorer
      </label>
      
      <button on:click={launchEditor} class="launch-btn">Launch Editor</button>
    </div>
  </header>
  
  <div class="preview">
    <!-- Editor preview/screenshot could go here -->
    <div class="editor-preview">
      <div class="preview-sidebar"></div>
      <div class="preview-main">
        <div class="preview-tabs"></div>
        <div class="preview-editor"></div>
      </div>
    </div>
  </div>
</div>

<style>
  .code-editor-entry {
    max-width: 1200px;
    margin: 0 auto;
    padding: 2rem;
    font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  }
  
  header {
    margin-bottom: 2rem;
  }
  
  h1 {
    font-size: 2.5rem;
    margin-bottom: 1rem;
  }
  
  .options {
    display: flex;
    flex-wrap: wrap;
    gap: 1rem;
    align-items: center;
    margin-bottom: 2rem;
  }
  
  label {
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }
  
  select {
    padding: 0.5rem;
    border-radius: 4px;
    border: 1px solid #ccc;
  }
  
  .launch-btn {
    background: #0078d7;
    color: white;
    border: none;
    padding: 0.5rem 1rem;
    border-radius: 4px;
    cursor: pointer;
    font-weight: bold;
  }
  
  .launch-btn:hover {
    background: #005a9e;
  }
  
  .preview {
    border: 1px solid #ccc;
    border-radius: 8px;
    height: 500px;
    overflow: hidden;
  }
  
  .editor-preview {
    display: grid;
    grid-template-columns: 250px 1fr;
    height: 100%;
  }
  
  .preview-sidebar {
    background: var(--sidebar-bg, #252526);
    height: 100%;
  }
  
  .preview-main {
    display: flex;
    flex-direction: column;
    height: 100%;
  }
  
  .preview-tabs {
    height: 35px;
    background: var(--tabs-bg, #2d2d2d);
  }
  
  .preview-editor {
    flex: 1;
    background: var(--editor-bg, #1e1e1e);
  }
</style> 