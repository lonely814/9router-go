import { afterEach, beforeEach, describe, expect, it } from 'bun:test'
import { SUPPORTED_LOCALES, isLocale, translate } from './i18nDict'
import { LOCALE_STORAGE_KEYS, readStoredLocale, writeStoredLocale } from './i18nStorage'
import zh from '../locales/zh.json'

// Bun has no DOM storage, so a stub is installed per test and the previous
// descriptor restored after (same shape as displayPrefs.test.ts).

let entries: Record<string, string> = {}

function stubStorage(value: unknown): void {
  Object.defineProperty(globalThis, 'localStorage', { configurable: true, value })
}

const workingStorage = {
  getItem: (key: string) => entries[key] ?? null,
  setItem: (key: string, value: string) => {
    entries[key] = value
  },
}

beforeEach(() => {
  entries = {}
  stubStorage(workingStorage)
})

afterEach(() => {
  stubStorage(undefined)
})

describe('translate()', () => {
  it('returns the English source string under the en locale', () => {
    expect(translate('en', 'Settings')).toBe('Settings')
  })

  it('translates a known string under zh', () => {
    expect(translate('zh', 'Settings')).toBe('设置')
  })

  // The whole point of keying on English text: a string with no entry is not a
  // missing-key error, it is the English it already was. This is what lets the
  // catalogue be filled in over several PRs.
  it('falls back to the English key when a string is untranslated', () => {
    expect(translate('zh', 'A sentence nobody has translated yet')).toBe(
      'A sentence nobody has translated yet'
    )
  })

  // Guards against a table that "translates" a string to itself and would look
  // done while showing English.
  it('renders different text for every catalogued zh entry', () => {
    const identity = Object.keys(zh).filter((source) => translate('zh', source) === source)
    expect(identity).toEqual([])
  })
})

describe('placeholder interpolation', () => {
  it('fills a named placeholder', () => {
    expect(translate('zh', 'Wait {seconds}s', { seconds: 7 })).toBe('等待 7 秒')
  })

  it('fills every occurrence of a repeated placeholder', () => {
    expect(translate('en', '{name} and {name}', { name: 'x' })).toBe('x and x')
  })

  // A translator who adds {count} where the caller never passes one should see
  // the gap on screen, not a silently empty string.
  it('leaves an unmatched placeholder in place', () => {
    expect(translate('en', 'Wait {seconds}s', {})).toBe('Wait {seconds}s')
  })

  it('leaves the text untouched when no params are given', () => {
    expect(translate('en', 'Wait {seconds}s')).toBe('Wait {seconds}s')
  })
})

describe('locale storage', () => {
  it('writes both keys so a sibling build reads the same choice', () => {
    writeStoredLocale('zh')
    for (const key of LOCALE_STORAGE_KEYS) expect(entries[key]).toBe('zh')
  })

  it('reads back what was written', () => {
    writeStoredLocale('zh')
    expect(readStoredLocale()).toBe('zh')
  })

  // A deployment whose sibling build wrote only the bare key still gets the
  // choice; that is why both are read.
  it('honours the bare locale key alone', () => {
    entries.locale = 'zh'
    expect(readStoredLocale()).toBe('zh')
  })

  it('defaults to en with nothing stored', () => {
    expect(readStoredLocale()).toBe('en')
  })

  it('ignores an unsupported stored value', () => {
    entries['9router-locale'] = 'de'
    expect(readStoredLocale()).toBe('en')
  })

  it('defaults to en with no storage at all', () => {
    stubStorage(undefined)
    expect(readStoredLocale()).toBe('en')
  })

  it('survives storage that refuses the write', () => {
    stubStorage({
      getItem: () => null,
      setItem: () => {
        throw new Error('quota exceeded')
      },
    })
    expect(() => writeStoredLocale('zh')).not.toThrow()
  })

  it('survives storage that throws on read', () => {
    stubStorage({
      getItem: () => {
        throw new Error('blocked')
      },
      setItem: () => {},
    })
    expect(readStoredLocale()).toBe('en')
  })
})

describe('locale catalogue', () => {
  it('offers exactly the locales the dictionaries cover', () => {
    expect(SUPPORTED_LOCALES.map((locale) => locale.id)).toEqual(['en', 'zh'])
  })

  it('accepts only supported ids', () => {
    expect(isLocale('en')).toBe(true)
    expect(isLocale('zh')).toBe(true)
    expect(isLocale('de')).toBe(false)
    expect(isLocale(null)).toBe(false)
  })
})
