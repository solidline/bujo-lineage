import { Appearance, decorateJournal } from './appearance';
import { journalHighlights } from './editor-highlights';
import { Plugin } from 'obsidian';
import { LineageController } from './obsidian-adapter';
import { BuJoPluginSettings, BuJoPluginSettingTab, DEFAULT_SETTINGS } from './settings';

/** Companion add-on: BuJo Bullets owns checkbox symbols and status commands; appearance is optional. */
export default class BuJoLineagePlugin extends Plugin {
  settings: BuJoPluginSettings;
  lineage: LineageController;
  appearance: Appearance;

  async onload() {
    const data = await this.loadData();
    this.settings = Object.assign({}, DEFAULT_SETTINGS, data);
    this.appearance = new Appearance(this.app.workspace.containerEl.ownerDocument.body, this.settings);
    this.register(() => this.appearance.clear());
    this.registerEvent(this.app.workspace.on('window-open', (_win, window) => this.appearance.attach(window.document.body)));
    this.registerEvent(this.app.workspace.on('window-close', (_win, window) => this.appearance.detach(window.document.body)));
    this.registerEditorExtension(journalHighlights);
    this.registerMarkdownPostProcessor(element => decorateJournal(element));
    this.addSettingTab(new BuJoPluginSettingTab(this.app, this));
    this.lineage = new LineageController(this);
    await this.lineage.start();
  }

  async saveSettings() {
    this.appearance?.apply(this.settings);
    if (this.lineage?.engine) await this.lineage.persist(this.lineage.engine.journal);
    else await this.saveData({ ...(await this.loadData()), ...this.settings });
  }
}
