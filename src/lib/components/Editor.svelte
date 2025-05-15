<script lang="ts">
  import { onMount } from 'svelte';
  import { EditorView, basicSetup } from 'codemirror';
  import { javascript } from '@codemirror/lang-javascript';
  import { python } from '@codemirror/lang-python';
  import { markdown } from '@codemirror/lang-markdown';
  import { oneDark } from '@codemirror/theme-one-dark';
  import { currentFile, editorContent } from '../stores/editorStore';

  let editorDiv: HTMLDivElement;
  let view: EditorView;

  $: if (view && $editorContent !== view.state.doc.toString()) {
    view.dispatch({
      changes: { from: 0, to: view.state.doc.length, insert: $editorContent }
    });
  }

  onMount(() => {
    view = new EditorView({
      doc: $editorContent,
      extensions: [
        basicSetup,
        oneDark,
        javascript(),
        python(),
        markdown(),
        EditorView.updateListener.of(update => {
          if (update.docChanged) {
            editorContent.set(view.state.doc.toString());
          }
        })
      ],
      parent: editorDiv
    });
  });
</script>

<div bind:this={editorDiv} aria-label="Code Editor" tabindex="0" style="height:100%;"></div> 