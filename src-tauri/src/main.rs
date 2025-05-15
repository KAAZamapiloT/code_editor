#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use tauri_plugin_pty::PtyPluginBuilder;

fn main() {
    tauri::Builder::default()
        .plugin(PtyPluginBuilder::new())
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
} 