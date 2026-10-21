BuJo Lineage 0.3.0 adds **optional journal styling and code highlighting** inside the existing companion add-on.

In Settings → BuJo Lineage → Appearance, toggle **BuJo journal styling** and **Code highlighting** independently. Both are enabled by default and follow Obsidian's light/dark mode. Journal styling adds restrained task-state colors, priority/question and date accents, quiet history links, comfortable spacing, and 44px checkbox targets on touch devices. Code blocks use coordinated syntax colors and horizontal scrolling; fenced code needs a language label.

Keep **BuJo Bullets and BuJo Lineage enabled together**. BuJo Bullets retains symbols, signifier configuration, and status commands. No Markdown, lineage identities, or stored history is changed by styling. Turn off either toggle to restore that part of your active theme.

Update with BRAT from solidline/bujo-lineage, or extract bujo-lineage-0.3.0.zip into <vault>/.obsidian/plugins/. The plugin ID and history schema are unchanged. Direct main.js, manifest.json, and styles.css assets are included. Nothing has been submitted to Obsidian's community plugin directory.

Validation: 22 core/adapter tests plus 20 Chromium appearance checks passed, along with type checking, lint, and production build. Browser checks cover DOM/text preservation, link handlers, independent toggles, light/dark mode, actual CodeMirror fenced-code exclusions, 44px touch targets, and code scrolling at phone width. Representative browser previews are included in docs. Live Obsidian/iPhone, third-party theme combinations, and Tasks editing remain unverified; see docs/MANUAL-CHECKS.md.
