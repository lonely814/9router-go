// Reading the stored locale. Separate from `i18n.svelte.ts` so it can be
// tested: the rune module needs the Svelte compiler, this does not.

import { DEFAULT_LOCALE, isLocale, type Locale } from './i18nDict'

/**
 * Both keys are read. `9router-locale` namespaces the value the way the theme
 * preference does; `locale` is the bare key the sibling upstream builds write,
 * so a browser that already carries a choice keeps it.
 */
export const LOCALE_STORAGE_KEYS = ['9router-locale', 'locale'] as const

/** The stored locale, or the default when nothing usable is stored. */
export function readStoredLocale(): Locale {
  if (typeof localStorage === 'undefined') return DEFAULT_LOCALE
  for (const key of LOCALE_STORAGE_KEYS) {
    try {
      const stored = localStorage.getItem(key)
      if (isLocale(stored)) return stored
    } catch {
      // Storage can be blocked; the default still applies.
    }
  }
  return DEFAULT_LOCALE
}

/** Persist a choice under both keys. Storage refusal is not an error. */
export function writeStoredLocale(locale: Locale): void {
  if (typeof localStorage === 'undefined') return
  for (const key of LOCALE_STORAGE_KEYS) {
    try {
      localStorage.setItem(key, locale)
    } catch {
      // A private-mode browser still gets the choice for this session.
    }
  }
}
