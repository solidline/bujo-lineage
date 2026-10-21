BuJo Lineage 0.2.0 is a **companion add-on for BuJo Bullets**, rather than a replacement.

**Keep both plugins enabled.** BuJo Bullets owns checkbox styles, signifiers, and manual status commands. BuJo Lineage adds migration, scheduling, history, and recovery, with no duplicate status commands or global journal styling.

Upgrading from 0.1.0: update through BRAT and re-enable BuJo Bullets. The plugin ID (`bujo-lineage`), existing operation journals, settings, and Markdown history schema remain compatible. Configure signifiers in BuJo Bullets; old Lineage signifier settings are retained as unused data.

Install with BRAT from this repository, or extract bujo-lineage-0.2.0.zip into <vault>/.obsidian/plugins/. Direct main.js, manifest.json, and styles.css assets are included for installers. This plugin has not been submitted to Obsidian's community plugin directory.

Validation: 22 automated tests passed, along with type checking, lint, and production build. Live Obsidian desktop, iPhone, BuJo Bullets co-installation, and Tasks editing remain unverified; see docs/MANUAL-CHECKS.md. The original upstream MIT license and attribution remain preserved.
