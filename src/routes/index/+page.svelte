<script lang="ts">
  import { goto } from '$app/navigation';
  import { onMount } from 'svelte';
  
  onMount(() => {
    // Check if we are coming from the entry page
    const hasConfig = localStorage.getItem('code-editor-config');
    if (!hasConfig) {
      // If not coming from entry page, redirect to it
      goto('/entry');
    }
  });
</script>

<svelte:head>
  <title>Code Editor</title>
</svelte:head>

<div class="landing">
  <h1>Code Editor</h1>
  <p>Please use our <a href="/entry">entry page</a> to launch the editor with your preferred settings.</p>
  
  <div class="buttons">
    <a href="/editor" class="button primary">Launch Editor Now</a>
    <a href="/entry" class="button secondary">Configure and Launch</a>
  </div>
</div>

<style>
  .landing {
    max-width: 800px;
    margin: 100px auto;
    text-align: center;
    font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  }
  
  h1 {
    font-size: 3rem;
    margin-bottom: 1rem;
  }
  
  p {
    font-size: 1.2rem;
    margin-bottom: 2rem;
  }
  
  .buttons {
    display: flex;
    gap: 1rem;
    justify-content: center;
  }
  
  .button {
    padding: 0.75rem 1.5rem;
    border-radius: 4px;
    text-decoration: none;
    font-weight: bold;
  }
  
  .primary {
    background: #0078d7;
    color: white;
  }
  
  .secondary {
    background: #f0f0f0;
    color: #333;
    border: 1px solid #ccc;
  }
</style> 