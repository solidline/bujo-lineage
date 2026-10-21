BuJo Lineage 0.3.1 adds **Prefer JetBrains Mono** under Settings → BuJo Lineage → Appearance.

The preference is enabled by default and applies to note text and code, independently of the journal and code color toggles. Disable it to restore your theme's fonts. Workspace navigation and UI fonts stay unchanged.

JetBrains Mono Regular is bundled locally, unmodified, under its SIL Open Font License 1.1. The font and license are embedded in styles.css so BRAT installs need no extra asset, separate font installation, network request, or font service. This includes iPhone use; actual iPhone font rendering still needs a device check.

Update through BRAT using solidline/bujo-lineage. Keep BuJo Bullets enabled alongside BuJo Lineage. The plugin ID and history schema are unchanged. Nothing is submitted to Obsidian's community plugin directory.

Validation: 22 core/adapter tests and 25 browser checks pass, including bundled font loading, font toggle independence, CodeMirror fonts, theme font restoration, and unload cleanup. Build, lint, and type checking passed. Live Obsidian/iPhone and Tasks behavior remain untested.
