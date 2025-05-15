<script lang="ts">
  import { onMount } from 'svelte';
  import { showCommandPalette } from '../stores/editorStore';
  import { invoke } from '@tauri-apps/api/tauri';

  let commands = [
    { label: 'Open File', action: () => invoke('open_file') },
    { label: 'Save File', action: () => invoke('save_file') },
    // Add more commands here
  ];
  let query = '';
  let filtered = commands;

  $: filtered = commands.filter(c => c.label.toLowerCase().includes(query.toLowerCase()));

  function execute(cmd) {
    cmd.action();
    showCommandPalette.set(false);
  }
</script>

<div class="palette" role="dialog" aria-modal="true" aria-label="Command Palette">
  <input
    type="text"
    bind:value={query}
    placeholder="Type a command..."
    aria-label="Command search"
    autofocus
    on:keydown={(e) => e.key === 'Escape' && showCommandPalette.set(false)}
  />
  <ul>
    {#each filtered as cmd}
      <li tabindex="0" on:click={() => execute(cmd)}>{cmd.label}</li>
    {/each}
  </ul>
</div>

<style>
.palette {
  position: fixed;
  top: 20%;
  left: 50%;
  transform: translate(-50%, 0);
  background: var(--panel-bg);
  border-radius: 8px;
  box-shadow: 0 4px 32px #0008;
  width: 400px;
  z-index: 1000;
}
input {
  width: 100%;
  padding: 1em;
  font-size: 1.1em;
  border: none;
  outline: none;
  background: transparent;
  color: inherit;
}
ul {
  list-style: none;
  margin: 0;
  padding: 0;
}
li {
  padding: 0.75em 1em;
  cursor: pointer;
}
li:focus, li:hover {
  background: var(--sidebar-bg);
}
</style> 