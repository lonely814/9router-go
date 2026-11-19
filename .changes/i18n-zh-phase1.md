### Added

- **A translation layer for the dashboard, with Simplified Chinese as the first
  locale.** The sidebar, the top bar and the login page now render Chinese when
  an operator picks 简体中文 in **Settings → Display → Language**; every other
  page stays English until its strings are catalogued.

  The lookup keys on the English text itself rather than an invented namespace,
  so a string with no translation falls back to the English it already was. That
  is what makes a partial catalogue shippable across several PRs: nothing renders
  as a bare key, nothing throws, and switching locale back to English is exactly
  the original copy. It also keeps a diff readable — a reviewer sees the sentence
  that changed, not `nav.settings`.

  `web/src/locales/zh.json` carries **145 entries** covering `lib/nav.ts` (every
  sidebar label, group heading and preset, plus their hints), `Sidebar.svelte`,
  `TopBar.svelte`, `LoginView.svelte` and the page titles `App.svelte` feeds to
  the top bar. Model ids, provider names, log lines, upstream API error strings,
  code blocks and file paths are deliberately untranslated.

  Interpolated copy passes its values (`t('Wait {seconds}s', { seconds: n })`)
  instead of being split around the number, so a translation is free to order
  them.

  The locale is stored under both `9router-locale` and `locale`, so a browser
  that already carries a choice from a sibling build keeps it. English remains
  the default, so an untouched install renders exactly what it did before.

  The layer is three files rather than one: `i18nDict.ts` holds the dictionaries
  and the pure lookup, `i18nStorage.ts` the persistence, and `i18n.svelte.ts` the
  one `$state` that makes a template re-render on a switch. Runes only exist after
  the Svelte compiler has run, and `bun test` does not compile them — splitting
  the pure half out is what lets the catalogue and the storage rules be tested at
  all. An identity check (`renders different text for every catalogued zh entry`)
  catches an entry that "translates" a string to itself.

### Verification

- `cd web && bun install && bun run build` — success; `dist/` 1758 KB
  pre-compressed to 368 KB brotli.
- `go build ./...` — success with the new `web/dist` embedded.
- `bun test src scripts` — 869 pass, including the new `i18n.test.ts` (18 cases:
  fallback, interpolation, both storage keys, unsupported stored value, storage
  that throws on read or refuses the write).
- `bun run ratchet:svelte` — 0 unresolved identifiers, 74 errors, baseline 74.
- `bunx oxlint --deny-warnings` — 0 warnings, 0 errors.
- Real binary, headless Chromium, 15/15 checks against a fresh database on
  `:20150`: login page English by default; picker offers English and 简体中文;
  the sidebar renders all nine translated labels; the top bar shows
  `设置 / 管理你的偏好与配置`; the untranslated Providers page stays English with
  no bare keys; a reload keeps Chinese; both storage keys read `zh`; the login
  page renders `密码 / 登录`; switching back restores English; no uncaught page
  errors throughout.

### Not in this change

The remaining ~600 strings on SettingsView, QuotaTrackerView, ConnectionsView,
CombosView and the media views. They render English until their entries land in
`zh.json`; adding an entry needs no component change beyond wrapping the text in
`t()`.
