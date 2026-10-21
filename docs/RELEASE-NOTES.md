BuJo Lineage 0.3.6 corrects mobile task spacing and padding.

Visible checkbox controls are now 22px instead of 44px. The old forced negative checkbox margin and task-list padding are removed; Obsidian and the active theme retain their native hanging indentation. Side markers use inset shadows instead of borders/padding that shift text. Task row spacing is normalized, history buttons use a compact 32px mobile minimum height, and BuJo glyph masks are centered with no-repeat to prevent tiled migration arrows.

Update through BRAT and reload Obsidian. BuJo journal styling remains optional. No task text, dates, IDs, or history is changed.

25 core/adapter tests and 44 Chromium checks pass, plus type checking, lint, and build. New regressions verify compact controls, preserved theme margins/list padding and CodeMirror indentation, no-repeat glyph masks, and smaller history controls. Representative phone-width previews were regenerated. Real iPhone/Obsidian and third-party themes still need verification.
