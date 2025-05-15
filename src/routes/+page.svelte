<script lang="ts">
  import FileTree from '$lib/components/FileTree.svelte';
  import Tabs from '$lib/components/Tabs.svelte';
  import Editor from '$lib/components/Editor.svelte';
  import Terminal from '$lib/components/Terminal.svelte';
  import CommandPalette from '$lib/components/CommandPalette.svelte';
  import { showCommandPalette } from '$lib/stores/editorStore';
  import { onMount } from 'svelte';

  // Config options with defaults
  let config = {
    theme: 'dark',
    startupFile: '',
    showTerminal: true,
    showFileExplorer: true
  };
  
  let showTerminalPanel = true;
  let showExplorer = true;

  onMount(() => {
    // Get configuration from localStorage if it exists
    const savedConfig = localStorage.getItem('code-editor-config');
    if (savedConfig) {
      try {
        config = {...config, ...JSON.parse(savedConfig)};
        showTerminalPanel = config.showTerminal;
        showExplorer = config.showFileExplorer;
        
        // Apply theme
        document.documentElement.setAttribute('data-theme', config.theme);
        
        // Open startup file if specified
        if (config.startupFile) {
          // Logic to open the specified file would go here
        }
      } catch (e) {
        console.error('Failed to parse code editor config', e);
      }
    }
    
    window.addEventListener('keydown', (e) => {
      if (e.ctrlKey && e.shiftKey && e.key === 'P') {
        showCommandPalette.set(true);
        e.preventDefault();
      }
    });
  });
</script>

<div class="layout">
  {#if showExplorer}
    <aside aria-label="File Explorer" tabindex="0">
      <FileTree />
    </aside>
  {/if}
  <main class:full-width={!showExplorer}>
    <Tabs />
    <Editor />
  </main>
  {#if showTerminalPanel}
    <section class="bottom-panel" aria-label="Bottom Panel">
      <Terminal />
      <!-- Problems and Search panels can be added here -->
    </section>
  {/if}
  {#if $showCommandPalette}
    <CommandPalette />
  {/if}
</div>

<style>
.layout {
  display: grid;
  grid-template-columns: 250px 1fr;
  grid-template-rows: 1fr 200px;
  height: 100vh;
}
aside {
  grid-row: 1 / span 2;
  background: var(--sidebar-bg);
}
main {
  grid-column: 2;
  grid-row: 1;
  display: flex;
  flex-direction: column;
}
main.full-width {
  grid-column: 1 / span 2;
}
.bottom-panel {
  grid-column: 2;
  grid-row: 2;
  background: var(--panel-bg);
}
</style> 