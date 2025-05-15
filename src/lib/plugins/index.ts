type Plugin = {
  name: string;
  activate: () => void;
};

const plugins: Plugin[] = [];

export function registerPlugin(plugin: Plugin) {
  plugins.push(plugin);
  plugin.activate();
}

export function getPlugins() {
  return plugins;
} 