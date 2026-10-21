BuJo Lineage 0.3.5 makes the scheduled date optional.

Schedule for later still suggests Future Log, marks the source [<], creates one open destination, increments the count, and records the transfer timestamp in history. Leave the date blank to rely on the Future Log location and move history. No scheduled field is added; any existing scheduled date is preserved. Choose a date to add or replace the single Tasks-compatible scheduled field. Due dates remain unchanged. A supplied invalid date still rejects the transfer before writing.

Update through BRAT and reload Obsidian. No settings or stored-history migration is required. Live Preview continues to show compact history metadata; Source mode retains the raw record.

25 core/adapter tests and 39 browser checks pass, plus type checking, lint, and build. New tests cover scheduling without a date, durable timestamp/count/references, existing-date preservation, replacement dates, and the actual vault adapter with a blank date. Live Obsidian/iPhone checks remain unverified.
