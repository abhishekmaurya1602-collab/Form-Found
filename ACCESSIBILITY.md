# Accessibility assessment

Review date: 15 October 2026. Target: WCAG 2.2 Level AA.

This is an implementation review with automated regression checks, not a completed conformance evaluation. A real browser and assistive technology were unavailable during this review. The remaining manual checks below must be completed before claiming full WCAG AA conformance.

## Scope and changes

The review covers the gallery, maker directory, saved objects/followed makers, search and filters, all 18 object stories, all seven maker profiles, About and Sources dialogs, both image-credit pages, and the accessibility information page.

| Area | Implementation | Relevant criteria |
| --- | --- | --- |
| Text and controls | Higher-contrast palette, opaque photograph labels, visible save buttons and control boundaries | 1.4.1, 1.4.3, 1.4.11 |
| Reflow and text | Rem-based readable text, wrapping navigation/filters, single-column narrow layouts, growing captions and masonry recalculation on content resize | 1.4.4, 1.4.10, 1.4.12 |
| Keyboard and focus | Skip link, modifier-based search shortcut, category focus preservation, predictable focus after removal/loading, visible focus, non-sticky header/dialog controls | 2.1.1, 2.1.2, 2.1.4, 2.4.1, 2.4.3, 2.4.7, 2.4.11 |
| Dialogs and navigation | Named native dialogs, descriptive headings, document titles, Escape support and return focus | 2.4.2, 2.4.6, 3.2.1, 4.1.2 |
| Names and feedback | Save/follow names contain visible labels; live regions stay in the active dialog/page; feedback persists without covering controls | 2.5.3, 4.1.2, 4.1.3 |
| Pointer targets | Buttons/control targets at least 44 CSS px in each dimension; separate card text links at least 24 px tall | 2.5.8 |
| Content and settings | Image alternatives, decorative images hidden, external-tab notices, forced-colors and reduced-motion styles | 1.1.1, 1.3.1, 2.3.1 |

The listed criteria describe the intent and scope of the changes; they are not assertions that every criterion has been independently verified.

## Automated results

- `npm test`: 10 application, structure, CSS and palette regression tests.
- `npm run test:axe`: 36 page/dialog states, WCAG A/AA rules through 2.2 and best practices. The audit fails on detected violations and reports rules requiring review separately.
- The axe audit uses JSDOM. Its rendered color-contrast rule is disabled because there is no layout engine. Dialog methods and layout APIs are stubbed in application tests; these checks do not establish native focus trapping, visible reflow, hit areas, or actual screen-reader speech.
- Axe reports `label-content-name-mismatch` as incomplete in gallery views because its visible-text measurement encounters a JSDOM error. Authored button labels are separately checked against their accessible names; rendered label/name matching remains part of the manual review.
- Palette checks use the WCAG relative-luminance formula against all authored product/designer backgrounds and interface surfaces. They do not measure text embedded in photographs or original visual artefacts.

Measured authored-palette ratios (rounded for display; tests use unrounded values):

| Foreground | On page background `#f8f7f4` | Minimum on authored light backgrounds |
| --- | --- | --- |
| Body `#292f27` | 12.81:1 | 9.78:1 |
| Secondary text `#505b48` | 6.69:1 | 5.10:1 |
| Olive text `#46543a` | 7.57:1 | 5.78:1 |
| Rust text `#963c24` | 6.60:1 | 5.04:1 |
| Control boundary `#737b68` | 4.12:1 | 3.14:1 |
| Focus outline `#144f91` | 7.67:1 | 5.85:1 |

White text on the ink, olive and rust surfaces measures 13.72:1, 8.11:1 and 7.07:1 respectively. Focus uses a white separator around the blue outline to remain distinguishable against dark surfaces and photographs.

## Manual verification still required

1. In current Chrome, Firefox and Safari, use Tab/Shift+Tab, Enter, Space and Escape through the entire exploration chain. Check native modal containment, Back/Forward, close/return focus, all filters, save/follow, empty states, and explicit loading. Check that focused controls remain visible while scrolling the dialog.
2. With NVDA/Firefox or NVDA/Chrome and VoiceOver/Safari, verify headings/landmarks, image alternatives, dialog names/descriptions, focused story changes, result counts and save/follow/copy announcements. Confirm controls' visible labels work with voice control.
3. Check 200% browser zoom and 400% zoom on a 1280 px-wide viewport (320 CSS px), plus mobile portrait/landscape. Confirm no two-dimensional scrolling, clipped controls or overlapping text. Original object images/diagrams may require enlargement to inspect their visual details; story text provides context.
4. Apply text spacing: line height 1.5, paragraph spacing 2em, letter spacing .12em and word spacing .16em. Confirm captions, navigation, badges, portrait credits and masonry cards grow without losing information or obscuring focus.
5. Verify pointer target geometry, Windows forced-colors, OS reduced motion, focus visibility over images, and touch use. Check externally hosted archival portraits when loaded and when unavailable.

No authentication, transactional forms, timed content, audio or video is present. Reassess if those features are introduced. Report problems through the link on [Accessibility](accessibility.html).
