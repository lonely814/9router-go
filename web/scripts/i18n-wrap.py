#!/usr/bin/env python3
"""Wrap translatable literals in t() in a Svelte component.

Only two shapes are handled, both of which keep markup byte-identical:

  >Text<                      ->  >{t('Text')}<
  attr="Text"                 ->  attr={t('Text')}

Anything with interpolation, nested tags, or a `{` in it is skipped and reported
so it can be done by hand. The script is idempotent: a literal already wrapped
in t( is left alone.
"""

import re
import sys

# Element text: a whole text node, optional surrounding whitespace preserved.
TEXT_NODE = re.compile(r'>(\s*)([A-Z][^<>{}\n]{1,200}?)(\s*)<')
# Attribute values on the attributes that carry user-visible copy.
ATTR = re.compile(r'\b(label|placeholder|title|aria-label)="([A-Z][^"{}<>]{1,200})"')

# Strings that must never be translated: identifiers, formats, brand names.
SKIP = {
    '9router-go', 'GitHub', 'Telegram', 'Discord', 'OIDC', 'SAML', 'SSO', 'JSON',
    'API', 'URL', 'CLI', 'USD', 'CNY', 'ID', 'DB', 'RTK', 'OAuth', 'HTTP',
    'HTTPS', 'MITM', 'SQLite', 'Bun', 'Go', 'Docker', 'Windows', 'Linux',
    'macOS', 'Android', 'iOS', 'PNG', 'SVG', 'WebP', 'JPEG', 'MB', 'KB', 'GB',
}
# Whole-string matches that are data, not copy.
SKIP_RE = re.compile(
    r'^(?:'
    r'[A-Z0-9_]+'                       # CONSTANT_CASE
    r'|[\w.-]+@[\w.-]+'                 # email
    r'|https?://\S+'                    # url
    r'|-?\d[\d.,]*%?[A-Za-z]?'          # numbers, units
    r'|[\d./:+-]+'                      # dates, times, ranges
    r')$'
)


def translatable(text: str) -> bool:
    if text in SKIP:
        return False
    if SKIP_RE.match(text):
        return False
    if not re.search(r'[A-Za-z]{2}', text):
        return False
    # Punctuation-only or symbol-led nodes are separators, not copy.
    if not re.search(r'[A-Za-z]{3}', text):
        return False
    if text in {':', '·', '—', '-', '/', '|', '×'}:
        return False
    # A lone path, placeholder or bracketed format is not a sentence.
    if re.fullmatch(r'[^A-Za-z]*', text):
        return False
    return True


def wrap(path: str, apply: bool) -> None:
    src = open(path, encoding='utf-8').read()
    head, sep, body = src.partition('</script>')
    if not sep:
        print(f'{path}: no <script> block, skipped')
        return

    wrapped: dict[str, str] = {}

    def text_sub(m: re.Match) -> str:
        lead, text, trail = m.group(1), m.group(2), m.group(3)
        if not translatable(text):
            return m.group(0)
        # A node that already sits inside a t() call is left alone.
        if text.startswith("{t('"):
            return m.group(0)
        wrapped[text] = text
        return f'>{lead}{{t(\'{escape(text)}\')}}{trail}<'

    def attr_sub(m: re.Match) -> str:
        name, text = m.group(1), m.group(2)
        if not translatable(text):
            return m.group(0)
        wrapped[text] = text
        return f'{name}={{t(\'{escape(text)}\')}}'

    new_body = TEXT_NODE.sub(text_sub, body)
    new_body = ATTR.sub(attr_sub, new_body)

    if apply and new_body != body:
        open(path, 'w', encoding='utf-8').write(head + sep + new_body)

    print(f'{path}: {len(wrapped)} strings{" (written)" if apply else " (dry run)"}')


def escape(text: str) -> str:
    """Escape a literal for a single-quoted TS string."""
    return text.replace('\\', '\\\\').replace("'", "\\'")


if __name__ == '__main__':
    apply = '--apply' in sys.argv
    for arg in sys.argv[1:]:
        if arg.startswith('--'):
            continue
        wrap(arg, apply)
