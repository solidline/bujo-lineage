# Validation results

Validated in the managed Linux workspace on 2026-10-21 with Node 24.19.0 and npm 11.9.0.

| Check | Result |
|---|---|
| `npm run typecheck` | Passed |
| `npm test` | **22 passed, 0 failed**: 15 portable-core tests + 7 actual-adapter tests against Obsidian/vault/editor doubles |
| `npm run lint` | Passed, no warnings |
| `npm run build` | Passed; minified CommonJS main.js |
| Runtime imports | Only `obsidian`; no Node, filesystem, server or Tasks runtime imports |
| Generated sample | Valid schema/anchors, reciprocal links, counts 0/1/2, history reconstructs from Markdown alone |
| Live Obsidian desktop | Not run: no application installed |
| iPhone | Not run: no device/runtime available |
| Tasks edit modal / completion runtime | Not run; syntax and source contracts only |

Core cases cover initial identity, reciprocal links, repeated transfers, renamed wording, scheduling/date replacement, due dates/tags/signifiers/indentation/children/anchors, invalid task kinds and Tasks fields, invalid dates and paths, cancellation with no writes, same-note rejection, destination/source write failures, persisted journal save failure, recovery after restart, retry idempotence, concurrent invocation, source edits during writing, unsafe reason text, malformed/unknown metadata, missing history targets, duplicate operations and conflicting successors. Calendar tests use real Moment under America/New_York across DST and year boundaries.

Adapter tests exercise the actual shipped adapter bundled against a small Obsidian mock. They verify unsaved editor text and save ordering, unchanged unrelated edits, stale modal snapshots, missing folders, same-note/date validation before writes, duplicate basenames and the link-generation API, renamed-note reconstruction after restart, duplicate anchors (including ordinary paragraphs), divergent editors, and journal-based recovery. These doubles establish application logic, not GUI rendering or real-device behavior.

See [MANUAL-CHECKS.md](MANUAL-CHECKS.md) for desktop, iPhone, and exact Tasks metadata-preservation steps. Live rendering and Tasks edit behavior remain explicitly unverified.

Version 0.2.0 add-on check: actual plugin entrypoint registers only migrate, schedule, history, and recovery commands, with no Markdown postprocessor. Global checkbox CSS and copied status/signifier modules have been removed. Live co-installation with BuJo Bullets still requires the manual checks.
