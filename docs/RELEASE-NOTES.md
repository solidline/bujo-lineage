BuJo Lineage 0.3.10 adds native icons to all commands so mobile toolbar buttons no longer fall back to a question mark:

- Migrate task: right arrow
- Schedule for later: calendar with clock
- Set current line as event: circle
- View task history: history
- Recover pending transfers: counterclockwise arrow

Update through BRAT and reload Obsidian. If a saved mobile toolbar button still shows a question mark, remove and re-add that command. Command IDs, hotkeys, task data, and behavior are unchanged.

Type checking, lint, build, 31 core/adapter tests and 45 browser checks passed. Actual iPhone toolbar appearance remains unverified.
