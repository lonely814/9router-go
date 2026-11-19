### Added

- **Nine more surfaces render in Simplified Chinese**: the API Keys card inside
  Endpoint & Key (`ApiKeysTable` + `ApiKeyPolicyModal`), the media provider
  detail and kind views, Cache Analytics, Compression Analytics, the Security
  panel, the request-details tab and Combos. `web/src/locales/zh.json` grows
  from 1,212 to **1,710 entries**.

  This closes the largest remaining gap: `ApiKeysTable` (1,113 lines) was the
  reason the Endpoint page still read half in English after the previous batch.

  Interpolated sentences became placeholder keys (`Delete {count} key(s)?
  {names}. This cannot be undone.`) and styled spans kept their elements, with
  the sentence translated around them. Data-driven arrays (`SCOPES`,
  `DETECTORS`, `COMBO_STRATEGIES`, `VIEW_OPTIONS`, `FIELD_SCHEMA`) stay English in
  the script and are translated where they render, so a locale switch re-labels
  them.

  Untouched on purpose: model, provider, voice and strategy ids, metric field
  names that mirror the API JSON, request and response bodies in the details
  tab, Material Symbols ligature names, env vars, and the CSV export schema.

- **`web/scripts/i18n-tagcheck.py`** — a gate that fails when a translated
  component changed its markup structure. It compares the ordered tag-name
  sequence between a git ref and the working tree. This exists because a
  previous batch silently dropped 30 `<span class="font-mono">` wrappers while
  folding their text into one `t()` call, and nothing but a manual reading of
  the diff caught it. It strips `<script>` bodies and HTML comments first — an
  earlier version read `Record<string, string>` as an opening tag and would have
  reported a change nobody made.

### Verification

- `bun run build` — success; `dist/` 1,907 KB pre-compressed to 398 KB brotli.
- `go build ./...` — success with the new `web/dist` embedded.
- `bun test src scripts` — 869 pass.
- `bun scripts/svelte-check-ratchet.ts` — 0 unresolved identifiers, 74 errors,
  baseline 74. `bunx oxlint --deny-warnings` — clean.
- **Markup unchanged, verified two ways.** `i18n-tagcheck.py` reports OK for all
  nine files (246/246/477/46/414/375/278/370/72 tags). Because an identical tag
  sequence does not prove the classes survived, a second check compared every
  `class` attribute verbatim — 1,152 attributes across the nine files, zero
  differences.
- **Every wrapped key has a catalogue entry**: 0 untranslated `t()` keys across
  the nine files (52-72 keys each).
- Real binary, headless Chromium, **16/16 checks**: Endpoint's API Keys card is
  Chinese with no English left, Security, Combos and the media image view render
  Chinese, no `t(` artifacts or bare keys anywhere, switching back restores
  English, no uncaught page errors.

### Not in this change

`analytics/AnalyticsView.svelte` — the Usage shell that hosts Overview, the date
range and the section switcher. It is untranslated, so on the Usage pages the
outer chrome is still English while the Cache and Compression views inside it
are Chinese. That shell plus the remaining modals are the next batch.

The inner Cache and Compression views could not be exercised through the UI in
this environment: an empty database renders Overview's empty state, which carries
no section switcher. Their coverage is asserted at the source level instead.
