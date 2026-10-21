import type BuJoLineagePlugin from './index';
import { App, PluginSettingTab, Setting } from 'obsidian';

export interface BuJoPluginSettings {
  dailyFolder: string;
  dailyFormat: string;
  futureLog: string;
}

export const DEFAULT_SETTINGS: BuJoPluginSettings = {
  dailyFolder: '',
  dailyFormat: 'YYYY-MM-DD',
  futureLog: 'Future Log.md',
};

export class BuJoPluginSettingTab extends PluginSettingTab {
  constructor(app: App, private plugin: BuJoLineagePlugin) { super(app, plugin); }

  display(): void {
    this.containerEl.empty();
    for (const [key, label] of [['dailyFolder', 'Daily note folder'], ['dailyFormat', 'Daily filename format'], ['futureLog', 'Future Log path']] as const) {
      new Setting(this.containerEl).setName(label).addText(t => t.setValue(this.plugin.settings[key]).onChange(async value => {
        this.plugin.settings[key] = value;
        await this.plugin.saveSettings();
      }));
    }
    new Setting(this.containerEl).setDesc('Set these to match your core Daily Notes settings. Folders must already exist; no templates are executed.');
    new Setting(this.containerEl).setDesc('BuJo Lineage adds task transfers and history. Keep BuJo Bullets enabled for checkbox styles, signifiers, and manual status commands. Configure those in BuJo Bullets.');
  }
}
