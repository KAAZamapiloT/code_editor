<script lang="ts">
  import { onMount } from 'svelte';
  import { Terminal } from 'xterm';
  import { FitAddon } from 'xterm-addon-fit';
  import { invoke } from '@tauri-apps/api/tauri';

  let terminalDiv: HTMLDivElement;
  let term: Terminal;
  let fitAddon: FitAddon;

  onMount(async () => {
    term = new Terminal({ fontSize: 14, theme: { background: '#1e1e1e' } });
    fitAddon = new FitAddon();
    term.loadAddon(fitAddon);
    term.open(terminalDiv);
    fitAddon.fit();

    // Start PTY via Tauri
    const pty = await window.__TAURI__.tauri.invoke('plugin:pty|open', {
      cols: 80,
      rows: 24,
      shell: process.platform === 'win32' ? 'powershell.exe' : 'bash'
    });

    window.__TAURI__.event.listen('plugin:pty|data', (event) => {
      term.write(event.payload);
    });

    term.onData(data => {
      window.__TAURI__.tauri.invoke('plugin:pty|write', { data });
    });
  });
</script>

<div bind:this={terminalDiv} aria-label="Terminal" tabindex="0" style="height:100%;"></div> 