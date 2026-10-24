BuJo Lineage 0.3.11 visually distinguishes events from completed tasks when Tasks supplies checked-checkbox styling.

With BuJo journal styling enabled, [o] events show a hollow circle, without a completion checkmark or strike-through. The event's own checkbox is targeted, leaving completed child tasks intact. The underlying Markdown, checkbox state, and Tasks settings are unchanged.

For query semantics, manually configure symbol o as NON_TASK in Tasks → Statuses. A visual override cannot change Tasks' status classification. Disabling journal styling restores the host rendering.

Update through BRAT and reload Obsidian. 31 core/adapter tests, 51 Chromium checks, type checking, lint, and build pass. Browser fixtures simulate Tasks styling; live Tasks/Obsidian/iPhone rendering still needs verification.
