BuJo Lineage 0.3.3 fixes overlapping status text and extra empty pill outlines in Live Preview.

The experimental status badges are removed. They used task-line pseudo-elements whose positioning can be controlled by Obsidian or a theme, causing labels to overlap text. Colored side markers, checkbox accents, syntax highlighting, and the JetBrains Mono preference remain. BuJo Bullets continues to supply checkbox status symbols.

Update through BRAT and reload Obsidian. Keep BuJo journal styling enabled. No task text, identities, dates, or history is changed.

22 core/adapter tests and 29 Chromium checks pass, plus build, lint, and type checking. Regression checks emulate a theme's absolutely positioned task-line pseudo-elements and verify that no status label or empty pill border is added. Live Obsidian/iPhone rendering remains unverified.
