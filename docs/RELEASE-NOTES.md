BuJo Lineage 0.3.12 accepts plain text and ordinary bullets for explicit task capture.

Migrate task and Schedule for later now accept all three forms:

- Task line
- - Task line (ordinary Markdown bullet)
- - [ ] Task line (open checkbox)

The source is normalized only when the transfer commits, becoming [>] or [<], while the destination is [ ]. Cancelling or rejecting input leaves the source untouched. Original plain text is retained as the durable recovery snapshot. Child content, tags, anchors, identity/counts, and destination-first recovery protections remain intact.

Set current line as event already handles plain text/bullets and has been rechecked. View task history accepts an untracked plain line and explains that no history exists yet. Ordinary bullets elsewhere remain ordinary notes. Completed/cancelled/event/archived tasks, headings, quotes, frontmatter, fenced code, and unsafe Tasks fields remain protected.

Update through BRAT and reload Obsidian. 35 core/adapter tests and 51 browser checks pass, plus type checking, lint, and build. Real Obsidian/mobile command behavior still requires verification.
