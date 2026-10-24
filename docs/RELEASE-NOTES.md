BuJo Lineage 0.4.0 makes entry conversion consistent across all standard BuJo types, using the approved workflow choices.

Five separate toolbar/hotkey commands set the current line to open, completed, cancelled, event, or note. All have native icons; the existing event command ID is unchanged. Current tracked entries retain their exact metadata, IDs, links, dates, anchors and count, including when changed into an ordinary note. Re-selecting a type is a no-op.

Migrate and Schedule remain real move-and-history commands. Current completed/cancelled/event/note entries can be transferred into an open destination. Historical entries with recorded successors stop and offer to open them; they are never silently reopened or redirected.

Tracked notes remain part of durable history, so update all devices to 0.4.0+ to read them. Ordinary notes without metadata remain ordinary notes. Type commands are direct Markdown edits: they do not invoke Tasks recurrence or completion/cancellation-date automation. Pending recovery, conflicts, invalid metadata/code contexts, and unsafe recurring/dependency fields remain protected.

Update through BRAT, reload Obsidian, then add the new commands in Hotkeys or mobile toolbar settings. See docs/TRANSITIONS.md for the full matrix.

46 core/adapter tests and 53 browser checks pass, plus type checking, lint, and build. Tests cover 91 type/transfer combinations plus archived guards, no-ops, history preservation, duplicate-open prevention, actual command callbacks and compact tracked-note rendering. Live Obsidian/iPhone verification remains necessary.
