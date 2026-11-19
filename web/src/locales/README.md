# Locales

`<locale>.json` holds one flat map of English source text to translated text.
The English text is the key — see `web/src/lib/i18nDict.ts` for why.

Adding a language: add its id to `Locale` in `i18nDict.ts`, add an entry to
`SUPPORTED_LOCALES`, import the JSON in `dictionaries`, and drop the file here.

## Phase 2 backlog

Phase 1 covers the shell: `lib/nav.ts`, `Sidebar.svelte`, `TopBar.svelte`,
`LoginView.svelte` and the page titles `App.svelte` passes to the top bar.

Still English, roughly 600 strings:

| File | What it needs |
| --- | --- |
| `components/SettingsView.svelte` | section headings and every field label |
| `components/QuotaTrackerView.svelte` | card headings, quota row names, filter labels |
| `components/connections/*` | add/edit dialogs, provider detail tabs, empty states |
| `components/combos/*` | strategy names, helper text, validation messages |
| `components/media/*` | per-kind headings and empty states |
| `components/analytics/*` | chart legends and range labels |
| `lib/currency.ts`, `lib/displayPrefs.ts` | option labels returned as data |

To translate a string: wrap it in `t()` where it renders and add the entry to
`<locale>.json`. No other change is needed — an entry with no wrapper is inert,
and a wrapper with no entry falls back to English.

Do not translate: model ids, provider ids and names, log output, upstream API
error strings, code blocks, file paths.
