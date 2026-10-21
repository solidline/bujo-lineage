BuJo Lineage 0.3.4 makes migrated tasks readable while editing in Live Preview.

Validated lineage metadata and its block anchor are replaced visually with a compact, tappable history button. Task wording, counts, previous/next links, and dates remain visible. Tap history to open the task history modal. Source mode retains the full raw comment and anchor. Existing notes need no rewriting; stored Markdown and history schema are unchanged. Malformed records remain visible for repair, and fenced examples are excluded.

Obsidian already provides code syntax highlighting. The former Code highlighting setting is renamed Code block color styling, is off by default for new installs, and only provides optional colors/spacing. Existing saved preferences are preserved: turn it off to use your theme's code styling. JetBrains Mono is independent.

Update through BRAT and reload Obsidian. Use Live Preview for compact history display. Keep BuJo Bullets enabled for checkbox symbols.

22 core/adapter tests and 39 browser checks pass, plus build, lint, and type checking. New checks cover unchanged Markdown, hidden metadata/anchor, preserved dates, Source mode, cursor behavior, history button targeting after edits, malformed records, and fenced code. Live Obsidian and iPhone verification remains necessary.
