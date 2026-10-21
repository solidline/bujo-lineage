# Attribution and add-on relationship

BuJo Lineage **0.2.0+ is a companion add-on** for [BuJo Bullets](https://github.com/frankolson/obsidian-bujo-bullets), by Will Olson. Enable both: BuJo Bullets handles checkbox rendering, signifiers, and manual status commands; BuJo Lineage handles transfers, scheduling, history, and recovery. Lineage uses shared Markdown syntax without private APIs or configuration changes to the original plugin. Basic transfer/history also works without BuJo Bullets, using Obsidian's standard checkbox rendering.

The initial 0.1.0 implementation began from upstream commit **46eb512ed8d5909c54b576e67130ef12eccbed70** (upstream version 1.2.1). The original MIT LICENSE remains unchanged and the original README is preserved at docs/UPSTREAM-README.md. Attribution reflects that origin; it does not make Will Olson responsible for the add-on.

Version 0.2.0 removes the copied status-command handler, signifier renderer/settings, and global checkbox CSS. The lineage schema and plugin ID remain unchanged for existing installations.

GitHub repository: https://github.com/solidline/bujo-lineage. The owner renamed it from obsidian-bujo-bullets. GitHub still records its original fork ancestry; product behavior is a companion add-on regardless of that ancestry label.

No Obsidian community plugin listing has been submitted.
