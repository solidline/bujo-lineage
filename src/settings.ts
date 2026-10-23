import type BuJoLineagePlugin from './index';
import { App, PluginSettingTab, Setting } from 'obsidian';

export interface BuJoPluginSettings {
  preferJetBrainsMono: boolean;
  journalStyling: boolean;
  codeHighlighting: boolean;
  useDailyNotesSettings: boolean;
  dailyFolder: string;
  dailyFormat: string;
  futureLog: string;
}

export const DEFAULT_SETTINGS: BuJoPluginSettings = {
  preferJetBrainsMono: true,
  journalStyling: true,
  codeHighlighting: false,
  useDailyNotesSettings: true,
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
      ['preferJetBrainsMono', 'Prefer JetBrains Mono', 'Use bundled JetBrains Mono for note text and code, including on iPhone. Turn off to use your theme fonts.'],
      ['journalStyling', 'BuJo journal styling', 'Quiet light/dark task colors, dates, signifiers, history links, and compact mobile controls and consistent spacing.'],
      ['codeHighlighting', 'Code block color styling', 'Optional colors and spacing only. Obsidian already provides syntax highlighting; leave off to use your theme.'],
    ] as const) {
      new Setting(this.containerEl).setName(name).setDesc(description).addToggle(toggle => toggle.setValue(this.plugin.settings[key]).onChange(async value => {
        this.plugin.settings[key] = value;
        await this.plugin.saveSettings();
      }));
    }
    new Setting(this.containerEl).setName('Daily notes and destinations').setHeading();
    new Setting(this.containerEl).setName('Use core Daily Notes settings').setDesc('Use the core Daily Notes folder and filename format for tomorrow. When its configuration file is absent, use the fallback fields below. Turn off to use those fields as an override.').addToggle(toggle => toggle.setValue(this.plugin.settings.useDailyNotesSettings).onChange(async value => {this.plugin.settings.useDailyNotesSettings=value;await this.plugin.saveSettings();}));
    for (const [key, label] of [['dailyFolder', 'Fallback daily note folder'], ['dailyFormat', 'Fallback daily filename format'], ['futureLog', 'Future Log path']] as const) {
      new Setting(this.containerEl).setName(label).addText(t => t.setValue(this.plugin.settings[key]).onChange(async value => {
        this.plugin.settings[key] = value;
        await this.plugin.saveSettings();
      }));
    }
    new Setting(this.containerEl).setDesc('Fallback fields apply only when core settings are unavailable or disabled. Folders must already exist; no templates are executed.');
    new Setting(this.containerEl).setDesc('BuJo Lineage adds task transfers and history. Keep BuJo Bullets enabled for checkbox styles, signifiers, and manual status commands. Configure symbols and signifiers in BuJo Bullets. Optional Lineage appearance does not change its commands or settings.');
  }
}
