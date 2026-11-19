// The dashboard's reactive translation layer. The dictionaries, the locale type
// and the lookup live in `i18nDict.ts`; this file adds the one thing that has to
// be a rune — the active locale — and the persistence around it.
//
// Always call `t()` from a template or a `$derived`, never once into a plain
// const: the lookup reads `current`, and that read is what subscribes the
// template to a locale switch.
import { readStoredLocale, writeStoredLocale } from './i18nStorage'
import {
  SUPPORTED_LOCALES,
  DEFAULT_LOCALE,
  isLocale,
  translate,
  type Locale,
} from './i18nDict'

export { SUPPORTED_LOCALES, DEFAULT_LOCALE, isLocale, type Locale }

// Module-level rune state: an operator who switches language expects the open
// page to change, and every reader is inside this module's own reactive scope.
// Nothing is polled, and no event has to carry the change between components.
let current = $state<Locale>(readStoredLocale())

/** The active locale, for a picker that binds to it. */
export function getLocale(): Locale {
  return current
}

/** Switch locale and persist it for the next visit. */
export function setLocale(locale: Locale): void {
  current = locale
  writeStoredLocale(locale)
}

/**
 * Translate one English string into the active locale. `params` fills `{name}`
 * placeholders after the lookup, so a translation may order them freely.
 */
export function t(text: string, params?: Record<string, string | number>): string {
  // Reading `current` here is what makes a template re-render on setLocale.
  return translate(current, text, params)
}
