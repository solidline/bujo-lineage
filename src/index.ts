import { Plugin } from 'obsidian';
import { CommandHandler } from './handlers/command-handler';
import { LineageController } from './obsidian-adapter';
import {
  BuJoPluginSettings,
  BuJoPluginSettingTab,
  DEFAULT_SETTINGS
} from './settings';

export type Bullet = {
  name: string
  character: string
}

export const AVAILABLE_BULLETS_TYPES: Bullet[] = [
  { name: 'Incomplete', character: ' ' },
  { name: 'Complete', character: 'x' },
  { name: 'Irrelevant', character: '-' },
  { name: 'Migrated', character: '>' },
  { name: 'Scheduled', character: '<' },
  { name: 'Event', character: 'o' },
]

export default class BuJoPlugin extends Plugin {
  settings: BuJoPluginSettings;
  commandHandler: CommandHandler;

  lineage: LineageController;

  async onload() {
    await this.loadSettings();
    this.commandHandler = new CommandHandler(this);
    this.lineage = new LineageController(this);
    await this.lineage.start();

    this.registerMarkdownPostProcessor((element, _context) => {
      const bullets = new Set(element.findAll('ul > li'));
      for (const bullet of bullets) {
        // Wrap text nodes without reparsing rendered HTML or disrupting checkbox
        // handlers owned by Obsidian/Tasks. User signifiers remain plain text.
        if (bullet.querySelector(':scope > .bujo-bullet-signifier')) continue;
        const walker = document.createTreeWalker(bullet, NodeFilter.SHOW_TEXT);
        let node = walker.nextNode();
        while (node && !node.textContent?.trim()) node = walker.nextNode();
        if (!node || node.parentElement?.closest('.bujo-bullet-signifier')) continue;
        const text = node.textContent || '';
        const signifier = this.settings.signifiers.find(s => s.value && text.startsWith(s.value + ' '));
        if (!signifier) continue;
        const span = document.createElement('span');
        span.className = 'bujo-bullet-signifier';
        span.textContent = signifier.value;
        const remainder = document.createTextNode(text.slice(signifier.value.length));
        node.parentNode?.insertBefore(span, node);
        node.parentNode?.replaceChild(remainder, node);
      }

    })
  }

  async loadSettings() {
    this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
    this.addSettingTab(new BuJoPluginSettingTab(this.app, this));
  }

  async saveSettings() {
    if (this.lineage?.engine) await this.lineage.persist(this.lineage.engine.journal);
    else await this.saveData({ ...(await this.loadData()), ...this.settings });
  }
}
