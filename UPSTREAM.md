# Upstream attribution

BuJo Lineage is a source fork of [BuJo Bullets](https://github.com/frankolson/obsidian-bujo-bullets) by Will Olson.

Starting commit: **46eb512ed8d5909c54b576e67130ef12eccbed70** (upstream version 1.2.1).
The original MIT LICENSE is preserved verbatim. Original README: docs/UPSTREAM-README.md.
GitHub fork: https://github.com/solidline/obsidian-bujo-bullets. The owner created the remote fork; the BuJo Lineage implementation and installable release are published there at their request. No Obsidian community plugin listing was submitted.

Retained: six checkbox meanings, status commands, configurable signifiers and CSS.
Changed: removed the ordinal-based reading-view context menu because it targeted the active file rather than the rendered source and could overwrite unsaved text. Use editor palette/mobile status commands. Replaced isomorphic-dompurify (which pulled in Node/jsdom) with safe plain-text DOM wrapping of signifiers, for mobile-compatible runtime code. Added lineage and recoverable transfer workflow.
