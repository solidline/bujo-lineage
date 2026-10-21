BuJo Lineage 0.3.2 makes task styling visible in Live Preview even when Obsidian does not put data-task on the task line.

With BuJo journal styling enabled, tasks now get colored side markers and short open/done/cancelled/migrated/scheduled/event labels. Checkbox theme variables and completed inner-text colors are styled explicitly. The editor supplies status decorations directly rather than relying on host attributes. Markdown, task identities, checkbox behavior, and clipboard text are unchanged.

Update through BRAT, reload Obsidian, and check Settings → BuJo Lineage → Appearance → BuJo journal styling. Keep BuJo Bullets enabled for custom checkbox symbols. Migration counts and history links appear when you transfer tasks, not on ordinary capture tasks. JetBrains Mono and code highlighting remain independent preferences.

22 core/adapter tests and 28 Chromium browser checks pass, plus build, lint, and type checking. The new checks cover all six editor statuses without host data-task attributes and visible labels/colored markers. Live Obsidian and iPhone rendering remain unverified.
