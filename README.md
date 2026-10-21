# BuJo Lineage

A local, mobile-compatible Obsidian Bullet Journal plugin. Capture a task in your daily note, transfer the same commitment to another note, and follow its history even after changing its wording or renaming its notes. No Tasks installation, service, account, telemetry, or network access is required.

Forked from **BuJo Bullets by Will Olson**, upstream commit `46eb512ed8d5909c54b576e67130ef12eccbed70`. The original MIT [LICENSE](LICENSE) is unchanged; see [attribution and changes](UPSTREAM.md).

## Install from GitHub

Repository: [solidline/obsidian-bujo-bullets](https://github.com/solidline/obsidian-bujo-bullets). This fork's plugin name is **BuJo Lineage**, ID `bujo-lineage`.

With [BRAT](https://github.com/TfTHacker/obsidian42-brat) installed, run **BRAT: Add a beta plugin for testing**, enter `solidline/obsidian-bujo-bullets`, and add it. Disable original BuJo Bullets and enable **BuJo Lineage** in Community plugins. BRAT is an optional installer/updater, not a runtime dependency.

For manual installation, download `bujo-lineage-0.1.0.zip` from the [latest release](https://github.com/solidline/obsidian-bujo-bullets/releases/latest) and follow the folder instructions below. The release also includes direct `main.js`, `manifest.json`, and `styles.css` assets for Obsidian installers. This fork has not been submitted to Obsidian's community plugin directory.

## Install the built version

1. Download and extract `bujo-lineage-0.1.0.zip`, or copy `dist/bujo-lineage/` from this repository.
2. Put its folder at `<vault>/.obsidian/plugins/bujo-lineage/`. That folder must directly contain `main.js`, `manifest.json`, `styles.css`, and the license files, with no extra nested folder.
3. **Disable the original BuJo Bullets plugin** to avoid duplicate commands and conflicting rendering. This fork retains its checkbox styles and configurable signifiers (`!` and `?` by default).
4. Reload Obsidian, open Settings → Community plugins, and enable **BuJo Lineage**. Requires Obsidian 1.8.0 or later. Use a disposable vault first.
5. On iPhone, open Settings → Mobile → Manage toolbar options (wording can vary by Obsidian version). Add **BuJo Lineage: Migrate task** and **BuJo Lineage: Schedule for later**. Optionally add **View task history**. Place the cursor on the task line before running a command.

The plugin uses Obsidian/browser APIs only and declares `isDesktopOnly: false`. Desktop, iPhone, and live Tasks runtime checks were **not available in this environment**. Automated vault/editor doubles passed; follow [the manual checklist](docs/MANUAL-CHECKS.md) before relying on it for your journal. No real vault was accessed.

## Everyday use

Capture `- [ ] ! Book car service #home`. Place the cursor on that parent line and run **Migrate task**. Search existing Markdown paths, tap a result, or enter a new note path. The initial suggestion is tomorrow's daily note. Enter an optional reason and tap **Transfer task**. Cancel or dismiss the modal to leave the vault unchanged.

The source becomes `[>]`; the new destination is `[ ]`. Counts progress **0 → 1 → 2**, and each successful transfer leaves one current open occurrence of that lineage. Renaming “Book car service” to “Call mechanic” does not create a new commitment. A recurrence instance is a separate commitment, so automatic transfer of recurring tasks is rejected in v1.

**Schedule for later** uses the same flow with a required calendar date, suggests the configured Future Log, marks the source `[<]`, and gives the destination one `⏳ YYYY-MM-DD` field. Existing scheduled fields (`⏳` or `⌛`) are replaced on the destination; the source keeps its original date. Due dates are preserved. An ordinary migration preserves scheduled dates. **Moving to tomorrow's note does not set tomorrow as a due date.** Neither `[<]` nor a date creates notifications or reminders.

**View task history** shows note paths, status symbols, action, timestamp, count, and optional reason, with an **Open occurrence** button for each row. Missing targets, duplicate anchors, broken reciprocal references, and conflicting successors are reported explicitly. Running a transfer command on an archived occurrence with a successor offers to open that successor or view history.

Retained status commands change the Markdown symbol directly:

| Markdown | Meaning |
|---|---|
| `- [ ]` | Open task |
| `- [x]` | Completed task |
| `- [-]` | Irrelevant/cancelled task |
| `- [>]` | Historical migrated occurrence |
| `- [<]` | Historical scheduled-elsewhere occurrence |
| `- [o]` | Event |
| `- Some note` | Ordinary note, not a checkbox task |

Manual status changes are still available; reopening an old archived copy manually can create a branch. History reports multiple open occurrences. The unsafe upstream reading-view context menu was removed; status commands remain available in the editor on desktop and mobile.

## Settings and destination rules

- **Daily note folder**: empty means vault root. Set it to match your core Daily Notes folder.
- **Daily filename format**: Moment format, default `YYYY-MM-DD`; match your Daily Notes filename format. Tomorrow is computed with local calendar-day arithmetic, not by adding 24 hours, so daylight saving changes are respected. Invalid proposed paths leave the destination blank for manual entry.
- **Future Log path**: default `Future Log.md`.
- **Signifiers**: retained upstream editor for configurable symbols and names.

Core Daily Notes configuration is not exposed through the documented public plugin API. This version deliberately uses the small explicit folder/format fallback rather than private core-plugin properties, and needs no other daily-note plugin. It appends at the end of a destination, separated by a blank line. It creates a missing note but **does not create folders**, execute templates, choose headings, or migrate within the same note. Paths are relative, Markdown-only, and reject traversal and reserved link characters. Destination search shows up to 12 matching full paths, so duplicate basenames remain distinguishable.

Only open checkbox tasks outside fenced code are transferable. Completed/cancelled/event/ordinary entries and archived sources are rejected. The original list marker and indentation, signifiers, tags, dates, and existing valid source anchor are retained. **All contiguous deeper-indented child content**, including blank lines leading into further indented content, moves to the destination; it is removed from the historical source so actionable subtasks are not duplicated after success. Unindented following paragraphs are separate note content. Children with their own block anchors or lineage are rejected to avoid copying anchors; move those separately first. Nested recurring/dependency-bearing tasks also cause rejection. Keep the cursor on the checkbox line, not a child paragraph.

## Portable storage

Three identities are distinct:

- **Lineage task ID**: `task-` plus 128 random bits, stable for the commitment.
- **Occurrence ID**: unique per appearance; generated as `occ-` plus 128 random bits.
- **Obsidian block ID**: equal to that occurrence ID. A pre-existing valid source block ID is retained and becomes that occurrence's ID.

IDs use browser cryptographic randomness, never task wording, a filename, date, or line number. Source and destination references contain **occurrence IDs, not paths**. A versioned hidden inline HTML comment belongs to the same task line. It precedes trailing Tasks emoji fields, with the block anchor last. This placement matters: Tasks parses dates from the end after removing the anchor; putting the comment after dates would prevent their recognition. The comment is part of the description and is hidden in rendered Markdown; it is visible in source mode. Displayed navigation/count text is not authoritative metadata.

The comment contains `encodeURIComponent(JSON.stringify(record))`, additionally encoding every hyphen as `%2D` to prevent arbitrary reason text from forming `-->`. Newlines, Unicode, `<script>`, and comment terminators round-trip as data. Stored text is never executed or inserted as HTML in modals.

Decoded schema v1:

```json
{
  "v": 1,
  "lineage": "task-<128-bit random hex>",
  "occurrence": "occ-<128-bit random hex>",
  "count": 1,
  "previous": "occ-<previous ID>",
  "next": "occ-<next ID, when archived>",
  "action": "migrate",
  "timestamp": "2026-10-21T17:30:00.000Z",
  "reason": "Need the registration number",
  "operation": "op-<128-bit random hex>"
}
```

`previous`, `next`, and `reason` are optional. Both source and successor record the transfer operation. On an archived row, action/time/reason describe its outgoing transfer; on the current row they describe its arrival. Counts on historical entries never increase. Action supports `capture`, `migrate`, and `schedule`; the first committed transfer materializes the initial capture as historical count 0. Completion changes status, not identity. Unknown versions, malformed comments, or mismatched anchors stop transfers and require repair; the plugin does not fabricate replacement history.

A complete, generated two-note example follows (long comments are normally hidden):

Source: `2026-10-21.md`

```markdown
- [>] ! Book car service · moved 0 times · [[2026-10-22#^occ-32b7e455ac2f1a519a328f82b12503ae|next]] <!--bujo-lineage:%7B%22v%22%3A1%2C%22lineage%22%3A%22task%2D5bdeb14bd6ae57e7a16c089600e00ce1%22%2C%22occurrence%22%3A%22occ%2D46ffe759a3179c5dfca7b2de30e7e04f%22%2C%22count%22%3A0%2C%22action%22%3A%22migrate%22%2C%22timestamp%22%3A%222026%2D10%2D21T17%3A30%3A00.000Z%22%2C%22operation%22%3A%22op%2Dca5065e7df04f8672532f2a1ba73c10a%22%2C%22next%22%3A%22occ%2D32b7e455ac2f1a519a328f82b12503ae%22%2C%22reason%22%3A%22Need%20the%20registration%20number%22%7D--> #home 📅 2026-11-10 ^occ-46ffe759a3179c5dfca7b2de30e7e04f
```

Destination after the first transfer: `2026-10-22.md`

```markdown
- [ ] ! Book car service · moved 1 time · [[2026-10-21#^occ-46ffe759a3179c5dfca7b2de30e7e04f|previous]] <!--bujo-lineage:%7B%22v%22%3A1%2C%22lineage%22%3A%22task%2D5bdeb14bd6ae57e7a16c089600e00ce1%22%2C%22occurrence%22%3A%22occ%2D32b7e455ac2f1a519a328f82b12503ae%22%2C%22count%22%3A1%2C%22previous%22%3A%22occ%2D46ffe759a3179c5dfca7b2de30e7e04f%22%2C%22action%22%3A%22migrate%22%2C%22timestamp%22%3A%222026%2D10%2D21T17%3A30%3A00.000Z%22%2C%22reason%22%3A%22Need%20the%20registration%20number%22%2C%22operation%22%3A%22op%2Dca5065e7df04f8672532f2a1ba73c10a%22%7D--> #home 📅 2026-11-10 ^occ-32b7e455ac2f1a519a328f82b12503ae
```


Navigation uses `fileManager.generateMarkdownLink` for existing files, honoring Obsidian link settings, paths and duplicate basenames; newly created notes use a full vault-relative wikilink. Enable Obsidian's **Automatically update internal links** if you want visible navigation links rewritten on rename. Hidden comments contain no note paths and do not rely on link rewriting. The history index locates IDs in current Markdown, so it survives renames and cache loss even if a visible link is stale. Deleting or changing an anchor breaks its incoming links and is reported.

[Sample notes](sample-vault/START-HERE.md) show capture → migrate → rename → schedule → complete with valid generated IDs and links. Copy the contents into a disposable vault root to use the exact links. Samples represent one completed lineage; `Capture.md` supplies a fresh task to try.

## Writes, conflicts and recovery

Obsidian offers no two-file atomic transaction. Each transfer:

1. Validates the snapshot and destination, relocates the exact captured source content, and rejects ambiguity or edits during the modal.
2. Reserves IDs and saves a pending operation in plugin `data.json` **before** task changes.
3. Appends the destination, saves open-editor content using the public `TextFileView.save()` API (or uses `Vault.process()` for closed notes), and reads back the result.
4. Rechecks conflicts, archives the exact source, verifies it, and records commitment.

Open-editor text is authoritative. Unrelated unsaved text is retained and saved as part of the operation. Divergent editors for the same file stop the operation; close duplicate panes before retrying. Exact-content matching tolerates inserted unrelated lines but rejects ambiguous identical tasks. A source edit during writing is preserved and may leave a pending transfer.

A destination write failure leaves the source open. A later failure can leave **two open copies temporarily**. The plugin reports this, retains the pending journal, blocks new transfers, and offers **Recover pending transfers**. It also attempts recovery after vault startup. Recovery recognizes the operation and reserved destination, never increments again or appends a second copy, and never deletes user edits to roll back.

If recovery stops, open **Recover pending transfers**. Expand its captured source/destination record, open the notes, preserve any new edits separately, restore the captured content as needed, close disagreeing panes, and tap **Retry recovery**. Missing folders must be recreated. For a note renamed before the original source first gained an ID, restore the original path before retrying; after IDs exist, recovery can locate renamed notes by ID. Do not delete `data.json` while an operation is pending. Successfully committed history is entirely in Markdown; plugin data is needed only for interrupted operations and settings. Keep a vault backup when manually resolving conflicts.

One instance serializes transfers and rejects rapid double taps. **Cross-device sync has no global lock.** Simultaneous offline migrations may branch. Conflicting successors, duplicate anchors, and extra open copies cause errors rather than automatic merging. History surfaces these conflicts; resolve them manually. A malformed lineage record anywhere in the indexed vault conservatively blocks transfers, with affected paths reported.

Indexing runs on create/modify/delete/rename events and on explicit commands/startup/recovery. There is no scan on each keystroke. Commands rebuild when needed to include unsaved editor text. Registered vault events are released on unload.

## Optional Tasks compatibility

This is **Markdown syntax compatibility**, not a formal runtime integration. Tasks is optional and no private Tasks APIs are used. Do not enable both BuJo Bullets and this fork. The adapter in `src/tasks-interop.ts` handles trailing emoji fields and rejection rules.

In **Tasks settings → Statuses**, manually configure these custom-status types (the plugin does not alter another plugin's configuration):

| Symbol | Tasks type |
|---|---|
| Space | `TODO` |
| `x` | `DONE` |
| `-` | `CANCELLED` |
| `>` | `NON_TASK` |
| `<` | `NON_TASK` |
| `o` | `NON_TASK` |

`NON_TASK` keeps archival copies out of `not done` results; it does **not** exclude them from all Tasks queries. Use `status.type is DONE` when asking for actual completions. The broader `done` filter also includes other non-open types.

Tasks' **🆔 dependency ID is separate** from lineage and block IDs. Any selected task/attached content containing `🆔` or `⛔` is rejected without mutation; keep that task canonical and surface it with queries. Automatic migration of `🔁` recurring tasks is also rejected to avoid a competing recurrence chain. Dataview-format date fields are deferred; use emoji dates. A recurring instance is a new commitment.

Leave completion, recurrence generation, and completion-date side effects to Tasks. A BuJo status command directly replaces a checkbox symbol; it does **not** invoke Tasks completion machinery. Static checks cover trailing date parsing and metadata retention in our transformations. Live Tasks edit-modal preservation of comments/anchors has **not been tested**; the exact [manual procedure](docs/MANUAL-CHECKS.md) is required before using Tasks editing on lineaged tasks.

Official references inspected on 2026-10-21:

- [Obsidian public API](https://github.com/obsidianmd/obsidian-api/blob/master/obsidian.d.ts): `Vault.process`, `TextFileView.save`, editor APIs, `FileManager.generateMarkdownLink`, vault events, and `Workspace.openLinkText`. Build types pinned to `obsidian@1.8.7`.
- [Obsidian block links](https://help.obsidian.md/links): final block ID positioning.
- [Tasks repository](https://github.com/obsidian-tasks-group/obsidian-tasks), [custom statuses](https://publish.obsidian.md/tasks/Getting+Started/Statuses/Custom+Statuses), and [status types](https://publish.obsidian.md/tasks/Getting+Started/Statuses/Status+Types).
- Tasks [`Task.ts`](https://github.com/obsidian-tasks-group/obsidian-tasks/blob/main/src/Task/Task.ts) and [`DefaultTaskSerializer.ts`](https://github.com/obsidian-tasks-group/obsidian-tasks/blob/main/src/TaskSerializer/DefaultTaskSerializer.ts): block anchor removal, trailing field extraction, and description serialization. Sources on `main` are moving references, not a guarantee about every Tasks release.

## Build, tests and scope

```sh
npm ci
npm run typecheck
npm test
npm run lint
npm run build
python3 scripts/package.py
```

Node 18+ is recommended (validated here with Node 24.19.0 / npm 11.9.0). Python 3 is only needed for packaging. The lockfile is committed. Runtime has no third-party dependency. `npm run dev` runs the upstream esbuild watch workflow. See [validation results](docs/VALIDATION.md).

Architecture: `lineage.ts` owns pure parsing/metadata/planning, the testable storage engine and history reconstruction; `tasks-interop.ts` is the syntax adapter; `obsidian-adapter.ts` implements editor/vault access, journal persistence, commands and native modals; upstream settings/rendering/status modules remain small. Tests use in-memory storage and actual adapter code bundled against Obsidian test doubles.

Deferred: bulk migration, automatic daily rollover, heading/template placement, calendars, dashboards, dependency-safe transfer, same-note migrations, recurrence transfer and automatic conflict merging. Very large vaults can make explicit rebuilds slower; no background service is involved.
