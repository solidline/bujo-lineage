import { Plugin } from 'obsidian';
import { LineageController } from './obsidian-adapter';
import { BuJoPluginSettings, BuJoPluginSettingTab, DEFAULT_SETTINGS } from './settings';

/** Companion add-on: BuJo Bullets owns checkbox rendering and status commands. */
export default class BuJoLineagePlugin extends Plugin {
  settings: BuJoPluginSettings;
  lineage: LineageController;

  async onload() {
    const data = await this.loadData();
    this.settings = Object.assign({}, DEFAULT_SETTINGS, data);
    this.addSettingTab(new BuJoPluginSettingTab(this.app, this));
    this.lineage = new LineageController(this);
    await this.lineage.start();
  }

  async saveSettings() {
    if (this.lineage?.engine) await this.lineage.persist(this.lineage.engine.journal);
    else await this.saveData({ ...(await this.loadData()), ...this.settings });
  }
}
