import { open, save, readTextFile, writeFile } from '@tauri-apps/api/fs';
import { dialog } from '@tauri-apps/api';

export async function openFile() {
  const selected = await open({ multiple: false });
  if (selected) {
    const content = await readTextFile(selected as string);
    return { path: selected, content };
  }
  return null;
}

export async function saveFile(path: string, content: string) {
  await writeFile({ path, contents: content });
} 