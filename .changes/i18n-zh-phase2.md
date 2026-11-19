### Added

- **Settings and Quota Tracker now render in Simplified Chinese**, the two pages
  an operator opens first after switching the language in the previous phase.
  `web/src/locales/zh.json` grows from 145 to **305 entries**.

  Settings covers every section heading and field label — Runtime Storage,
  Security & Password, SSO, Default Routing Strategy, Observability, Global
  System Prompt, White-label branding, Display, and the advanced Sidebar /
  Usage dashboard cards. Quota Tracker covers the toolbar, the account and sort
  filters, the row actions, the reset-card prompts and all four empty states.

  The empty-state copy lives in `quota/types.ts` as data rather than in the
  component, so it is translated where it renders. Two sentences that
  interpolated their values inline became placeholder forms
  (`No {status} accounts found for {provider}.`, `Showing {start}-{end} of
  {total}`) and are filled through `t()` at the call site, which is what lets a
  translation put the values in a different order. `getPageSizeLabel` and
  `getConnectionsPaginationSummary` had no remaining caller after that and were
  deleted.

  Untouched on purpose: SQLite, WAL, DB_PATH, DATA_DIR, OIDC/SAML, model and
  provider names, the `GET /api/qoder/checkins` path and the X.509 config field
  names.

  `web/scripts/i18n-wrap.py` is the tool that did the mechanical part: it wraps
  a whole text node (`>Text<`) or a `label`/`placeholder`/`title`/`aria-label`
  value in `t()`, skips anything with interpolation or nested tags, and is
  idempotent. Only the `<script>` body is skipped — the wrapping happens in the
  template, so markup stays byte-identical. The strings it cannot safely reach
  (interpolations, data-driven labels, multi-line copy) were done by hand.

### Verification

- `bun run build` — success; `dist/` 1772 KB pre-compressed to 372 KB brotli.
- `go build ./...` — success with the new `web/dist` embedded.
- `bun test src scripts` — 869 pass.
- `bun run ratchet:svelte` — 0 unresolved identifiers, 74 errors, baseline 74.
  This gate caught a real defect during the work: the `t` import had been lost
  in `QuotaTrackerView`, which would have thrown `ReferenceError` the first time
  the page rendered. 51 new `Cannot find name 't'` errors appeared and the import
  was restored.
- `bunx oxlint --deny-warnings` — 0 warnings, 0 errors.
- Real binary, headless Chromium, **12/12 checks**: all eight settings headings
  and eleven field labels render Chinese; SQLite/WAL/OIDC stay English; the
  quota toolbar, filters and empty state are fully Chinese with no English
  left over; an untranslated page (Providers) stays English; no bare dotted keys
  and no literal `t(` artifacts anywhere; the locale survives navigation;
  switching back restores English on both pages; no uncaught page errors.
- Diff discipline: every changed line in `ProfileSettingsView.svelte` is a
  one-for-one replacement (a script compared line counts per diff hunk — zero
  blocks changed shape). `QuotaTrackerView.svelte` has two structural edits, both
  inside `<script>`: two imports added, and two `$derived` expressions became
  `$derived.by` because filling placeholders needs more than one line. No markup
  structure was added, removed or reordered.
