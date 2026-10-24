# Validation results

Validated in the managed Linux workspace on 2026-10-21 with Node 24.19.0 and npm 11.9.0.

| Check | Result |
|---|---|
| `npm run typecheck` | Passed |
| `npm test` | **22 passed, 0 failed**: 15 portable-core tests + 7 actual-adapter tests against Obsidian/vault/editor doubles |
| `npm run lint` | Passed, no warnings |
| `npm run build` | Passed; minified CommonJS main.js |
| Runtime imports | Obsidian and host-provided CodeMirror view/language modules; no Node, filesystem, server or Tasks runtime imports |
| Generated sample | Valid schema/anchors, reciprocal links, counts 0/1/2, history reconstructs from Markdown alone |
| Live Obsidian desktop | Not run: no application installed |
| iPhone | Not run: no device/runtime available |
| Tasks edit modal / completion runtime | Not run; syntax and source contracts only |

Core cases cover initial identity, reciprocal links, repeated transfers, renamed wording, scheduling/date replacement, due dates/tags/signifiers/indentation/children/anchors, invalid task kinds and Tasks fields, invalid dates and paths, cancellation with no writes, same-note rejection, destination/source write failures, persisted journal save failure, recovery after restart, retry idempotence, concurrent invocation, source edits during writing, unsafe reason text, malformed/unknown metadata, missing history targets, duplicate operations and conflicting successors. Calendar tests use real Moment under America/New_York across DST and year boundaries.

Adapter tests exercise the actual shipped adapter bundled against a small Obsidian mock. They verify unsaved editor text and save ordering, unchanged unrelated edits, stale modal snapshots, missing folders, same-note/date validation before writes, duplicate basenames and the link-generation API, renamed-note reconstruction after restart, duplicate anchors (including ordinary paragraphs), divergent editors, and journal-based recovery. These doubles establish application logic, not GUI rendering or real-device behavior.

See [MANUAL-CHECKS.md](MANUAL-CHECKS.md) for desktop, iPhone, and exact Tasks metadata-preservation steps. Live rendering and Tasks edit behavior remain explicitly unverified.

Version 0.2.0 add-on check: actual plugin entrypoint registers only migrate, schedule, history, and recovery commands, without copied status/signifier modules. Version 0.3.0 adds a new optional renderer with scoped appearance only. Live co-installation with BuJo Bullets still requires the manual checks.

Version 0.3.0: `npm run test:appearance` passed **20 headless Chromium checks** at 390×844 with touch emulation. They cover independent toggles, popout/unload cleanup, preserving text/checkbox/link DOM and click handlers, repeat rendering, nested tasks, code/metadata exclusions, real CodeMirror Markdown fenced-code exclusion, light/dark palette changes, scrollable code at phone width, 44px touch checkbox targets, and restoring theme layout when disabled. Browser fixtures and representative preview screenshots are not live Obsidian or iPhone tests.

Version 0.3.1: the browser suite now passes **25 checks**, including bundled JetBrains Mono loading, font preference independent of color toggles, CodeMirror font application, restoring the theme font, and unloading the font class. Real iPhone font rendering remains untested.

Version 0.3.2: 28 Chromium checks pass, including all six explicit editor-line status decorations without host data-task attributes, visible open labels, and distinct done/migrated side markers. This tests the reported selector mismatch using real CodeMirror fixtures, not a live Obsidian app.

Version 0.3.3: 29 browser checks pass. A regression fixture with theme-owned, absolutely positioned cm-line::after pseudo-elements verifies that Lineage adds neither status text nor outlined pills to them. Status classes/side markers remain intact. Live Obsidian rendering still requires user verification.

Version 0.3.4: 39 browser checks pass. Metadata fixtures verify compact Live Preview rendering, hidden encoded payload and block anchor, preserved scheduled dates and full Markdown, history button targeting before/after wording edits, stable display with cursor inside metadata, raw Source mode inspection, malformed-record visibility, and fenced-code exclusions. This uses real CodeMirror with a simulated Live Preview state field, not live Obsidian.

Version 0.3.5: 25 core/adapter tests (17 core, 8 adapter) and 39 browser checks pass. Optional-date scheduling tests cover a fresh task moved to Future Log without a date, persisted transfer timestamp/count/reciprocal references, existing scheduled/due-date preservation for empty or whitespace dates, replacement dates, and a blank date through the actual adapter. Supplied invalid-date rejection remains covered.

Version 0.3.6: 25 core/adapter tests and 44 browser checks pass. New mobile fixtures verify 22px checkbox sizing, preserved theme checkbox margins/list padding, preserved CodeMirror theme hanging indentation, non-repeating glyph masks, and compact 32px history controls. Side markers no longer consume layout width. Browser previews were regenerated; actual iPhone rendering remains unverified.

Version 0.3.7 removes the vertical status stripe. The browser suite now passes 45 checks, including stripe absence and preserved done/migrated text colors. All 25 core/adapter tests, build, lint, and type checking pass.

Version 0.3.8: 29 core/adapter tests (17 core + 12 adapter) and 45 browser checks pass. Destination regressions cover core Daily Notes folder/format, nested date paths, custom config directories, manual overrides, missing-file fallback, explicit core root defaults, malformed settings, and a complete transfer to the resolved folder with no root copy. Local calendar/DST tests remain covered. Real Obsidian/iPhone verification remains necessary.

Version 0.3.9: 31 core/adapter tests (19 core + 12 adapter) and 45 browser checks pass. New event helper tests cover text/blank/bullet/open-task/numbered-list conversion, preserved indentation/tags/block anchors, event idempotence, rejection of tracked/closed/archived/recurring/dependency-bearing tasks, frontmatter/fenced examples, and leaving code context. Command-registration tests confirm the event command is exposed directly by Lineage.

Version 0.3.11: 31 core/adapter tests and 51 Chromium checks pass. New fixtures emulate Tasks checked styling and verify the hollow event circle, hidden completion checkmark, preserved checkbox state, no event strike-through, unchanged nested completed task, toggle restoration, and editor markers without host status attributes. Actual Tasks/Obsidian runtime remains untested.

Version 0.3.12: 35 core/adapter tests (22 core + 13 adapter) and 51 browser checks pass. Explicit plain/bullet capture tests verify no global ordinary-note reclassification, no pre-commit source changes, reciprocal identity/counts, preserved children/tags/anchors, optional-date scheduling, recovery from a plain source, protected child edits, unsafe context rejection, and stale modal validation through the actual adapter. Event capture remains covered for both forms.
