// The pure half of the translation layer: the dictionaries, the locale type and
// the lookup. Kept out of `i18n.svelte.ts` because runes only exist after the
// Svelte compiler has run, so anything a `bun test` imports has to be plain
// TypeScript.
//
// The key is the English text itself, not an invented namespace like
// `nav.settings`. Two things follow from that choice:
//
//   - A string with no translation falls back to the key, which is the English
//     it would have shown anyway. A partially translated locale is therefore
//     always shippable: nothing renders as a bare key and nothing throws.
//   - A diff reads as the sentence it changes, so a reviewer sees the copy
//     rather than having to look up `nav.settings` in a JSON file.
//
// `en` is deliberately empty — English *is* the fallback, so there is no second
// copy of the source strings to drift out of date.
import zh from '../locales/zh.json'

export type Locale = 'en' | 'zh'

/** The locales the picker offers, in the order it draws them. */
export const SUPPORTED_LOCALES: { id: Locale; label: string }[] = [
  { id: 'en', label: 'English' },
  { id: 'zh', label: '简体中文' },
]

export const DEFAULT_LOCALE: Locale = 'en'

const dictionaries: Record<Locale, Record<string, string>> = {
  en: {},
  zh: zh as Record<string, string>,
}

/** Narrow an arbitrary value (localStorage, a select's value) to a Locale. */
export function isLocale(value: unknown): value is Locale {
  return value === 'en' || value === 'zh'
}

/**
 * Translate one English string for a locale. `params` fills `{name}`
 * placeholders after the lookup, so a translation may order them freely.
 */
export function translate(
  locale: Locale,
  text: string,
  params?: Record<string, string | number>
): string {
  const translated = dictionaries[locale][text] ?? text
  if (!params) return translated
  return translated.replace(/\{(\w+)\}/g, (match, name: string) =>
    name in params ? String(params[name]) : match
  )
}
