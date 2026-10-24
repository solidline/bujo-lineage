# Manual runtime checks (not run here)

Use a disposable vault and record Obsidian/Tasks versions and OS. Copy sample-vault files into its root. These checks are required because no Obsidian GUI or iPhone runtime was available in the build environment.

## Desktop

1. Install dist/bujo-lineage, keep BuJo Bullets enabled, reload, and enable BuJo Lineage alongside it. Confirm the Lineage commands (migrate, schedule, history, recovery, and set current line as event), with no duplicated status commands. Confirm ! / ? signifiers and all six checkbox styles still come from BuJo Bullets; confirm [-] is cancelled, not a note.
2. Make an unsaved daily task with a due date, tags, !, and two indented subtasks. Run Migrate task. Cancel once; inspect source/destination to confirm no IDs or files were added.
3. Repeat, search a full note path containing spaces, choose it, supply a multiline reason containing `-->`, and transfer. Confirm source [>], destination [ ], count 0/1, unchanged due date and exactly one set of actionable children. Confirm final block IDs in source mode and click each link in Reading View and Live Preview.
4. Repeat on the destination after renaming its wording. Schedule to Future Log with a valid date; expect source [<], current [ ], count 2, exactly one scheduled field and original due date. Confirm no reminder notification was promised.
5. Rename both notes with internal-link updating on, then off. Restart Obsidian and use View task history; all occurrences must open by ID even when visible links are stale.
6. Test duplicate basenames in different folders; test a new note path and a missing folder; test invalid dates and same-note selection. Test completed/cancelled/event/ordinary/fenced-code entries. Rejections must not mutate tasks.
7. Keep the modal open and edit the source in another pane; transfer must stop rather than overwrite edits. Insert unrelated lines without changing the task; transfer may safely relocate it. Rapid double invocation must not create a second destination.
8. Simulate interruption with debugger/file permissions or a storage test harness after destination save but before source archive. Restart: recovery should reuse the destination and archive exactly once. Edit the destination before recovery; it must stop, show the pending record, and preserve edits. Close duplicate panes if their contents disagree.
9. Copy a lineaged open task into another note to simulate a sync branch. History must flag duplicate IDs/open occurrences and another transfer must reject it. Remove an occurrence to check explicit missing targets. Restore sample notes afterward.
10. Set Daily folder/format to your core Daily Notes values. Check tomorrow around a local DST transition, including year/month boundaries. Confirm no automatic folder creation or template execution.

## iPhone

1. Install/sync the same plugin folder with the app closed, enable it, and keep original BuJo Bullets enabled. Add Migrate task and Schedule for later through Settings → Mobile → toolbar options.
2. Place the editor cursor on a task and invoke each toolbar command. Search/type a destination with spaces; select a date; enter a reason; cancel and repeat. Check keyboard access, readable labels, scrolling, and touch targets.
3. Follow history buttons and previous/next links with taps only. Background/restart after a transfer and verify durable history and recovery. Repeat in airplane mode: no server or login should be needed.
4. Avoid simultaneous offline transfers on desktop and phone. If deliberately testing them, confirm conflicts are reported after sync; no automatic branch winner should be chosen.

## Optional Tasks: exact metadata-preservation procedure

1. Record installed Tasks version. Manually set status types: space TODO, x DONE, - CANCELLED, >/< /o NON_TASK (each symbol separately).
2. Capture `- [ ] ! Book car service #home 📅 2026-11-10`. Migrate, then schedule to 2026-11-02. In source mode, copy the **entire** destination line into a scratch plain-text reference outside the vault; record decoded lineage ID, occurrence ID and count, plus final block anchor.
3. Invoke **Tasks: Create or edit task** on the current occurrence. Change only wording to “Call mechanic” and scheduled date to 2026-11-03. Save. Inspect source mode: exactly one `<!--bujo-lineage:...-->` comment must remain, all decoded identity/count/reference/operation fields must match the reference, and the identical `^occ-...` anchor must remain last. Check the due date survives and the scheduled field is singular.
4. Run View task history, then restart Obsidian and run it again. Both must find the renamed current occurrence. Follow its previous link and return through history.
5. Use Tasks' completion command or checkbox interaction on the current occurrence. Verify expected Tasks done-date behavior and unchanged metadata and anchor. Run a Tasks query with `not done`: archived NON_TASK rows must be absent. Query `status.type is DONE`: only actual completions should appear. A broad query may include NON_TASK rows; that is expected.
6. Attempt to migrate tasks with `🆔 abc123`, `⛔ abc123`, and `🔁 every week` separately. Confirm clear rejection and no task changes or reserved operation writes.
7. If Tasks strips or moves the comment/anchor incorrectly, stop using its edit modal on lineaged tasks in that version. Preserve a backup and report the exact before/after source. This release claims syntax-level compatibility, not a passed Tasks runtime guarantee.


## Appearance (0.3.0)

1. Keep BuJo Bullets enabled. In BuJo Lineage settings, toggle journal styling and code highlighting independently. Confirm disabling both restores your theme's appearance without changing note text.
2. Switch between light and dark mode. Check open/x/-/>/</o task states, leading ! and ?, tags, due/scheduled dates, count text, previous/next links, nested lists, and a task containing inline code. Repeat in Reading View, Live Preview, and Source mode; verify fenced task examples are not decorated as real journal tasks.
3. On iPhone, tap all six checkbox states and navigate history links. Confirm compact controls do not overlap neighboring task text or child bullets. Test narrow portrait and landscape; turn journal styling off if a theme's layout conflicts.
4. Create fenced python/javascript/json blocks with comments, strings, numbers, and long lines. Check readable light/dark colors, code copy buttons, horizontal scrolling, selection, and editing. Confirm an unknown language stays plain text.
5. In a desktop popout, toggle appearance, switch modes, close the popout, then unload the plugin. No Lineage body classes should remain. Highlighting must never change Markdown, identity comments, Tasks fields, or block anchors.

6. Toggle Prefer JetBrains Mono with both color toggles off. Confirm note text, Live Preview/Source mode, inline code and fenced code use the bundled font while sidebar/UI fonts remain unchanged. Disable it to restore theme fonts. Repeat offline on iPhone; check fallback emoji and non-Latin glyphs, popout windows, and plugin unload.

## Compact metadata (0.3.4)

Migrate a task, then edit its wording in Live Preview. The encoded HTML comment and block ID should be replaced visually by one history button; the count, previous/next navigation and Tasks dates should remain readable. Tap history from source and destination to confirm the correct task opens. Move the cursor through the line and edit adjacent text. Switch to Source mode to verify the unchanged comment and block anchor, then back to Live Preview. Verify copied/edited tasks retain IDs and that code examples and malformed comments are not silently hidden. In settings, Code block color styling is optional: Obsidian syntax highlighting continues with it off.

## Optional scheduled date (0.3.5)

Schedule a fresh task to Future Log with the date blank: source [<], destination [ ], count incremented, no new scheduled field, and move timestamp visible in history. Repeat with an existing scheduled date and leave blank: retain that field and any due date. Enter a replacement date: exactly one scheduled field should remain. A supplied invalid date must reject without mutations.

## Mobile spacing regression (0.3.6)

On iPhone in Live Preview and Reading View, test open/completed/migrated tasks with links and long wrapping titles, nested tasks, and a history button. Checkbox glyphs should be compact (22px), migrated arrows should appear once, wrapped text should follow the native hanging indent, and the history control should stay inline without a large empty box. Repeat in portrait/landscape, with the default theme, and with journal styling off. No note margins outside task lists should change.

## Daily Notes destination (0.3.8)

Set the core Daily Notes folder to Daily Notes and choose a filename format. Keep Use core Daily Notes settings enabled in Lineage. Migrate a task and verify the tomorrow suggestion includes that folder and format and the resulting task is written there, not at the root. Change the core folder and repeat without reloading. Disable the toggle to verify explicit fallback fields. Core configuration is read-only; templates are not run and missing folders are still rejected. A custom Obsidian config directory should work too.

## Event command (0.3.9)

Search Set current line as event in the command palette and Settings → Hotkeys. Bind a shortcut, convert ordinary text, a bullet, and an open untracked task, and verify - [o] with intact child notes/tags/anchors. Confirm tracked, archived, done, cancelled, recurring and dependency-bearing tasks and fenced examples reject without edits. Add the command to the iPhone toolbar and test by tap.

## Tasks event appearance (0.3.11)

With Tasks and journal styling enabled, create - [o] Firestone event and a separate - [x] completed task. Confirm the event is an empty circle without a checkmark/strike-through in Live Preview and Reading View, while the completed task remains checked. Add a completed child task under the event and verify it is not restyled as an event. Toggle journal styling off/on. In Tasks settings, manually set o to NON_TASK and verify queries reflect that classification. No plugin settings should be modified by Lineage.
