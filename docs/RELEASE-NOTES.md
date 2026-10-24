BuJo Lineage 0.3.13 allows explicit event-to-task conversion through Migrate task and Schedule for later.

Run either command on a [o] event. The destination modal explains that the event will become an open [ ] task. Confirming migration makes the source [>]; scheduling makes it [<]. The destination is [ ] with normal lineage, counts, links and move timestamp. Cancelling leaves the original event unchanged. Tags, anchors and attached content are preserved appropriately.

This is an explicit conversion to a task, not automatic event rollover or completion. Completed/cancelled/archived tasks, recurring/dependency fields, and code examples remain protected. Source-write failure and restart recovery retain the original event snapshot and reuse the reserved destination.

Update through BRAT and reload Obsidian. 37 core/adapter tests and 51 browser checks pass, plus type checking, lint, and build. Actual Obsidian/mobile behavior still requires verification.
