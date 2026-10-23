BuJo Lineage 0.3.8 fixes tomorrow migrations going to the vault root instead of the Daily Notes folder.

Use core Daily Notes settings is enabled by default. The destination now follows the core Daily Notes folder and filename format, read from daily-notes.json through the public vault adapter, including custom configuration directories. No private core-plugin APIs are used, and the core configuration is never modified.

When the configuration file is absent, the existing manual folder/format fields act as fallbacks. Turn the toggle off to use those fields as an explicit override. Malformed or unreadable core configuration shows an error and allows manual destination selection instead of silently choosing root. Templates are not executed; missing folders remain an explicit error.

Update through BRAT and reload Obsidian. Check Settings → BuJo Lineage → Use core Daily Notes settings. Existing misplaced notes are not moved automatically.

29 core/adapter tests and 45 browser checks pass, plus type checking, lint, and build. New regressions cover folder/format resolution, custom config directories, fallback/override behavior, invalid config, and a complete transfer into the resolved Daily Notes folder with no root copy. Live Obsidian/iPhone verification remains necessary.
