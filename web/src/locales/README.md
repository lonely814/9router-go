# Locales

`<locale>.json` holds one flat map of English source text to translated text.
The English text is the key — see `web/src/lib/i18nDict.ts` for why.

Adding a language: add its id to `Locale` in `i18nDict.ts`, add an entry to
`SUPPORTED_LOCALES`, import the JSON in `dictionaries`, and drop the file here.

## Phase 2 backlog

Done: the shell (`lib/nav.ts`, `Sidebar.svelte`, `TopBar.svelte`,
`LoginView.svelte`, the page titles `App.svelte` passes to the top bar),
`ProfileSettingsView.svelte` and `QuotaTrackerView.svelte` (+ the empty-state
copy in `components/quota/types.ts`).

Still English, roughly 1,800 candidate strings:

| File | Strings |
| --- | --- |
| `components/connections/ProviderDetailView.svelte` | 193 |
| `components/JailbreakView.svelte` | 170 |
| `components/ProxyPoolsView.svelte` | 144 |
| `components/EndpointView.svelte` | 142 |
| `components/TokenSaverView.svelte` | 120 |
| `components/connections/AddConnectionModal.svelte` | 84 |
| `components/media/MediaProviderDetail.svelte` | 77 |
| `components/CacheAnalyticsView.svelte` | 74 |
| `components/keys/ApiKeyPolicyModal.svelte` | 64 |
| `components/CompressionAnalyticsView.svelte` | 64 |

`web/scripts/i18n-wrap.py <file> [--apply]` does the mechanical half: it wraps a
whole text node or a `label`/`placeholder`/`title`/`aria-label` value in `t()`
and skips interpolations, nested tags and anything with a `{` in it. Run it
without `--apply` first and read the count. It does not add the import — that is
one line, and getting it wrong is what the svelte-check ratchet catches.

Option lists and empty-state messages that live in a `types.ts` need the wrap at
the render site instead, and any sentence that interpolates a value inline has
to become a `{placeholder}` form filled through `t()`'s second argument.

To translate a string: wrap it in `t()` where it renders and add the entry to
`<locale>.json`. No other change is needed — an entry with no wrapper is inert,
and a wrapper with no entry falls back to English.

Do not translate: model ids, provider ids and names, log output, upstream API
error strings, code blocks, file paths.
