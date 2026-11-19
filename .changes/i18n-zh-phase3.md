### Added

- **Six more pages render in Simplified Chinese**: Endpoint & Key, Proxy Pools,
  Persona (Jailbreak), Token Saver, Provider Detail and the Add Connection
  dialog. `web/src/locales/zh.json` grows from 305 to **1,212 entries**.

  The two largest files this repo has are in this batch — `ProviderDetailView`
  (5,696 lines, 193 strings) and `EndpointView` (2,544 lines, 142). Together with
  `ProxyPoolsView`, `JailbreakView`, `TokenSaverView` and
  `AddConnectionModal`, roughly 570 rendered strings were wrapped.

  Lines split around a value were joined back into one key and given a
  placeholder — `t('Switching method disconnects {url} and builds a new one — …',
  { url })` rather than three fragments. Data-driven option arrays
  (`statusOptions`, `CAVEMAN_LEVELS`, the sidebar entries) stay English in the
  script and are translated where they render, so a locale switch re-labels them.

  Untouched on purpose: model and provider ids, AWS/Azure/GitLab field names,
  env vars (`GEMINI_WEB_ROTATION`), the Cloudflare and Tailscale product names,
  tunnel hostnames and credential examples, and the RTK / Caveman / Ponytail
  prompt bodies plus their test fixtures — those are payloads, not chrome.

### Verification

- `bun run build` — success; `dist/` 1864 KB pre-compressed to 390 KB brotli.
- `go build ./...` — success with the new `web/dist` embedded.
- `bun test src scripts` — 869 pass. The catalogue's identity check caught one
  entry that translated a string to itself (`Cloudflare API Token`) and it was
  given a real translation.
- `bun scripts/svelte-check-ratchet.ts` — 0 unresolved identifiers, 74 errors,
  baseline 74. `bunx oxlint --deny-warnings` — clean.
- **Markup unchanged, verified structurally.** For each of the six files the
  sequence of tag names was extracted from the pre-change and post-change source
  and compared: 685/483/746/743/1213/348 tags, identical in every case. This
  check matters — the first attempt at `EndpointView` had dropped 30
  `<span class="font-mono">` wrappers by folding their text into one `t()`, which
  silently changed the rendered styling. That draft was discarded and the file
  redone so every styled span survives with its text translated in place.
- Real binary, headless Chromium, **26/26 checks**: all five pages show their
  Chinese markers, no literal `t(` artifacts, no bare dotted keys, no
  double-translated text, the Endpoint and Proxy Pools English chrome is gone,
  provider ids stay verbatim, switching back to English restores the pages, no
  uncaught page errors.
- The Persona page is hidden by default (`DEFAULT_HIDDEN_NAV_IDS`), and
  `App.svelte` bounces a deep link to a hidden entry back to Endpoint. The test
  reveals it through Settings first; the sidebar toggle's aria-label needed its
  own translation (`在侧边栏中显示 {entry}`) because it was a Svelte attribute
  interpolation the wrapping script had skipped.

### Not in this change

`keys/ApiKeysTable.svelte` — the API Keys card that renders inside Endpoint — is
a separate 1,113-line component and stays English for now; it is the next batch
along with the media views and the analytics tabs.
