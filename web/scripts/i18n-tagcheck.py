#!/usr/bin/env python3
"""Fail when a translated Svelte file changed its markup structure.

Compares the sequence of tag names (open and close) between the committed
version and the working tree. Translation may only replace text nodes and
attribute values; it must never add, drop or reorder a tag. The first attempt at
EndpointView.svelte dropped 30 <span> wrappers this way and no other gate
noticed.

Usage: i18n-tagcheck.py <ref> <file> [file...]
"""
import re
import subprocess
import sys

TAG = re.compile(r'</?([a-zA-Z][\w-]*)')
SCRIPT = re.compile(r'<script\b[^>]*>.*?</script>', re.S)
COMMENT = re.compile(r'<!--.*?-->', re.S)


def markup_only(text: str) -> str:
    """Strip the <script> body and HTML comments.

    The script block is TypeScript, not markup: a type like
    `Record<string, string>` or a comparison `a <b> c` reads as a tag to a naive
    regex and would report a false change that no one made.
    """
    return COMMENT.sub('', SCRIPT.sub('', text))


def tag_sequence(text: str) -> list[str]:
    return [m.group(1).lower() for m in TAG.finditer(markup_only(text))]


def main() -> int:
    ref, files = sys.argv[1], sys.argv[2:]
    bad = 0
    for path in files:
        old = subprocess.run(['git', 'show', f'{ref}:{path}'],
                             capture_output=True, text=True).stdout
        new = open(path, encoding='utf-8').read()
        a, b = tag_sequence(old), tag_sequence(new)
        if a == b:
            print(f'OK    {path}  ({len(a)} tags)')
            continue
        bad += 1
        print(f'FAIL  {path}  ({len(a)} -> {len(b)} tags)')
        for i in range(min(len(a), len(b))):
            if a[i] != b[i]:
                print(f'        first divergence at index {i}: <{a[i]}> -> <{b[i]}>')
                break
    return 1 if bad else 0


if __name__ == '__main__':
    sys.exit(main())
