BuJo Lineage 0.3.9 adds a directly available event-capture command:

**BuJo Lineage: Set current line as event**

Use it on ordinary text, a bullet, a blank line, or an untracked open task to create - [o]. Wording, indentation, tags, anchors and child content are preserved. Already tracked commitments, closed/archived tasks, recurring/dependency-bearing tasks, fenced code and frontmatter are rejected without edits.

After updating through BRAT and reloading, open Settings → Hotkeys and search Set current line as event to assign a shortcut. On iPhone, add the command to the mobile toolbar. No default hotkey is assigned, avoiding shortcut conflicts. The helper does not require a corresponding command from BuJo Bullets.

31 core/adapter tests and 45 browser checks pass, plus type checking, lint, and build. Actual keyboard/mobile-toolbar behavior still requires verification in Obsidian.
