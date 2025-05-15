<script lang="ts">
  import { goto } from '$app/navigation';
  import { onMount } from 'svelte';
  
  // Import the main page component
  import EditorLayout from '../+page.svelte';
  
  onMount(() => {
    // Check if we have config from the entry page
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

<EditorLayout /> 