# Entry transitions (0.4.0)

These rules implement the owner's choices: separate commands; migration/scheduling remain real moves; historical occurrences with successors stop and offer to open them.

| Source (no recorded successor) | Open | Completed | Cancelled | Event | Note | Migrate | Schedule |
|---|---|---|---|---|---|---|---|
| Plain text | Set [ ] | Set [x] | Set [-] | Set [o] | Ordinary bullet | Move | Move |
| Ordinary bullet | Set [ ] | Set [x] | Set [-] | Set [o] | No-op | Move | Move |
| Open [ ] | No-op | Set [x] | Set [-] | Set [o] | Remove checkbox | Move | Move |
| Completed [x] | Set [ ] | No-op | Set [-] | Set [o] | Remove checkbox | Reopen and move | Reopen and move |
| Cancelled [-] | Set [ ] | Set [x] | No-op | Set [o] | Remove checkbox | Reopen and move | Reopen and move |
| Event [o] | Set [ ] | Set [x] | Set [-] | No-op | Remove checkbox | Convert and move | Convert and move |
| Legacy [>] without successor | Set [ ] | Set [x] | Set [-] | Set [o] | Remove checkbox | Move | Move |
| Legacy [<] without successor | Set [ ] | Set [x] | Set [-] | Set [o] | Remove checkbox | Move | Move |
| Any occurrence with a recorded successor | Offer successor | Offer successor | Offer successor | Offer successor | Offer successor | Offer successor | Offer successor |

Tracked current entries follow the same rules. Type changes retain the exact metadata, identity, anchor, count, links and dates. A tracked ordinary note remains indexed as a historical occurrence because it owns a valid metadata record; unrelated ordinary notes are not reclassified as tasks. Use 0.4.0+ on all devices to view history of tracked notes (older versions only indexed checkbox occurrences).

In-place commands edit one line in the active editor and preserve child content. Repeating the existing type is a no-op. Commands have icons and no default hotkeys. Configure shortcuts or mobile toolbar entries yourself.

Migrate/Schedule still use the destination modal, verified destination-first writes and recovery journal. The destination is an open task. The source becomes [>] or [<], with reciprocal identity references and an incremented successor count. Completed/cancelled/event conversion is explained before confirmation. Cancelling makes no edits. Scheduling dates remain optional.

Protected contexts remain protected: fenced code, frontmatter, headings/quotes, invalid metadata/anchors, unknown custom checkbox statuses, pending recovery and conflicting active occurrences. Recurring/dependency-bearing Tasks entries remain canonical; a type-changing command that would alter them is rejected. Selecting their unchanged type is a no-op.

The in-place commands change Markdown syntax only. They do not invoke Tasks recurrence, completion/cancellation-date generation, dependency updates or other completion side effects. Existing fields are preserved. Use Tasks' own commands when those side effects are needed.

## Verification

The automated matrix exercises 40 untracked in-place pairs, 16 untracked transfer pairs, 25 tracked in-place pairs, and 10 tracked transfer pairs. Additional tests cover all seven attempts on an archived occurrence, no-ops, children/tags/anchors, tracked-note reconstruction and reopening, conflict detection, actual command registration, and compact history rendering for notes. Real Obsidian/mobile behavior still needs a manual pass.
