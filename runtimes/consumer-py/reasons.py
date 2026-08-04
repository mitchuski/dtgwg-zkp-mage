# reasons.py — the reason register, loaded FROM THE DATA.
#
# The X1 register (fixtures/reasons.mjs, v2) is treated here as a DATA artifact,
# never imported or executed: the exact codes and the parameterized family
# prefixes are parsed out of the register source text, and the vectors' own
# expect.reason codes are collected alongside as a cross-check. Only the
# MECHANISM (isKnownReason: exact stratum + family stratum, prefix + non-empty
# parameter) is re-implemented in Python — that mechanism is the one thing the
# register file cannot carry as data.
#
# Register shape being parsed (reasons.mjs):
#   exact codes:      "  'code-name': R("     inside REASONS
#   family prefixes:  "  'code-prefix:': F("  inside FAMILY_DEFS
# Family prefixes always end in ':' and no family prefix collides with an
# exact code (the JS suite's test F10 enforces that invariant upstream).

import json
import re
from pathlib import Path

_HERE = Path(__file__).resolve().parent
_FIXTURES = _HERE.parent / 'fixtures'
_REGISTER_SOURCE = _FIXTURES / 'reasons.mjs'
_VECTOR_ROOT = _FIXTURES / 'vectors'

_KEY_RE = re.compile(r"^\s+'([^']+)':\s*([RF])\(", re.MULTILINE)
_VERSION_RE = re.compile(r"REASON_REGISTER_VERSION\s*=\s*'([^']+)'")


def _load_register():
    text = _REGISTER_SOURCE.read_text(encoding='utf-8')
    exact, families = [], []
    for code, kind in _KEY_RE.findall(text):
        if kind == 'R':
            exact.append(code)
        else:  # kind == 'F' — a parameterized family; prefix ends in ':'
            families.append(code)
    m = _VERSION_RE.search(text)
    version = m.group(1) if m else None
    return version, tuple(exact), tuple(families)


REGISTER_VERSION, EXACT_CODES, FAMILY_PREFIXES = _load_register()


def is_known_reason(code):
    """Exact match against the register, or a family match: prefix + non-empty
    parameter (e.g. 'retention-violation:transcriptDigest' matches the
    'retention-violation:' family). Same semantics as the JS isKnownReason."""
    if not isinstance(code, str):
        return False
    if code in EXACT_CODES:
        return True
    return any(code.startswith(p) and len(code) > len(p) for p in FAMILY_PREFIXES)


def vector_reasons(root=_VECTOR_ROOT):
    """The reason codes actually carried by the frozen vectors — the register
    as exercised by the data. Returns a sorted list of unique codes."""
    root = Path(root)
    manifest = json.loads((root / 'manifest.json').read_text(encoding='utf-8'))
    codes = set()
    for fam in (manifest.get('families') or {}).values():
        for rel in fam:
            v = json.loads((root / rel).read_text(encoding='utf-8'))
            reason = (v.get('expect') or {}).get('reason')
            if reason is not None:
                codes.add(reason)
    return sorted(codes)


if __name__ == '__main__':
    print(f'register version: {REGISTER_VERSION}')
    print(f'exact codes:      {len(EXACT_CODES)}')
    print(f'family prefixes:  {len(FAMILY_PREFIXES)}')
    vr = vector_reasons()
    print(f'vector reasons:   {len(vr)}')
    for c in vr:
        print(f'  {c}  known={is_known_reason(c)}')
