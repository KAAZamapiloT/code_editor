import { writable } from 'svelte/store';

export const currentFile = writable<string | null>(null);
export const editorContent = writable<string>('');
export const showCommandPalette = writable<boolean>(false); 