import type BuJoLineagePlugin from './index';
import { App, PluginSettingTab, Setting } from 'obsidian';

export interface BuJoPluginSettings {
  journalStyling: boolean;
  codeHighlighting: boolean;
  dailyFolder: string;
  dailyFormat: string;
  futureLog: string;
}

export const DEFAULT_SETTINGS: BuJoPluginSettings = {
  journalStyling: true,
  codeHighlighting: true,
  dailyFolder: '',
  dailyFormat: 'YYYY-MM-DD',
  futureLog: 'Future Log.md',
};

export class BuJoPluginSettingTab extends PluginSettingTab {
  constructor(app: App, private plugin: BuJoLineagePlugin) { super(app, plugin); }

  display(): void {
    this.containerEl.empty();
    new Setting(this.containerEl).setName('Appearance').setHeading();
    for (const [key, name, description] of [
      ['journalStyling', 'BuJo journal styling', 'Quiet light/dark task colors, dates, signifiers, history links, and larger mobile checkbox controls.'],
      ['codeHighlighting', 'Code highlighting', 'Coordinated syntax colors and scrollable code blocks. Fenced code needs a language label.'],
    ] as const) {
      new Setting(this.containerEl).setName(name).setDesc(description).addToggle(toggle => toggle.setValue(this.plugin.settings[key]).onChange(async value => {
        this.plugin.settings[key] = value;
        await this.plugin.saveSettings();
      }));
    }
    new Setting(this.containerEl).setName('Daily notes and destinations').setHeading();
    for (const [key, label] of [['dailyFolder', 'Daily note folder'], ['dailyFormat', 'Daily filename format'], ['futureLog', 'Future Log path']] as const) {
      new Setting(this.containerEl).setName(label).addText(t => t.setValue(this.plugin.settings[key]).onChange(async value => {
        this.plugin.settings[key] = value;
        await this.plugin.saveSettings();
      }));
    }
    new Setting(this.containerEl).setDesc('Set these to match your core Daily Notes settings. Folders must already exist; no templates are executed.');
    new Setting(this.containerEl).setDesc('BuJo Lineage adds task transfers and history. Keep BuJo Bullets enabled for checkbox styles, signifiers, and manual status commands. Configure symbols and signifiers in BuJo Bullets. Optional Lineage appearance does not change its commands or settings.');
  }
}
