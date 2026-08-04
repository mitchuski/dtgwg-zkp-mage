// Lint vectors — the third vector class. (X1 design commitment 3.)
//
// §9's "verifier must not infer" column cannot be tested cryptographically:
// no circuit stops a verifier from *saying* "this proves one unique human".
// But it CAN be tested as claim-language linting of verifier OUTPUTS — §26.1
// already mandates rejecting "a verifier output implying biometric
// correctness". A lint vector pairs a verifier-output text with this
// prohibited-pattern list; a conformant implementation's user-facing and
// logged outputs must pass the lint.
//
// The patterns come from two normative places:
//   §9  — the per-predicate "verifier must not infer" column (global
//         uniqueness, civil identity, biometric correctness, cross-context
//         identity, key-control-as-intent/authority);
//   §24 — the prohibited-claims list ("one-human-one-record", global stable
//         identifiers, civil-identity requirements).
//
// Ownership note (X1 open question, honestly carried): §27.4 gives Human
// Experience work the legibility surface; this list is a shared artefact with
// them, seeded here in English only. Over-matching is the intended failure
// direction — a verifier output that trips a pattern by accident should be
// REWRITTEN narrower, not the pattern loosened.

export const LINT_LIST_VERSION = 'v1';

// A pattern may carry an `unless` regex: the pattern trips only if `re`
// matches AND `unless` does NOT match the text. This is how a claim CLASS can
// be prohibited in its undocumented form while its fully-parameterised §2.4
// form passes — bullet 5's "no defined adversary or test" is exactly that
// distinction: the words "collusion resistance" are not the violation; the
// missing against-whom / tested-by structure is.
const P = (id, re, source, reason, unless) =>
  Object.freeze(unless === undefined
    ? { id, re, source, reason }
    : { id, re, source, reason, unless });

export const PROHIBITED_PATTERNS = Object.freeze([
  // §24: "describe a nullifier as proof of one-human-one-record" — forbidden.
  P('one-human-one-record', /one[\s-]human[\s-]one[\s-](record|vote|account)/i,
    '§24 prohibited claims', 'overclaim-verifier-output'),
  // §9 PR-LIV / PR-PER: "globally unique" / "global uniqueness" must not be inferred.
  P('global-uniqueness', /global(ly)?[\s-]unique(ness)?/i,
    '§9 PR-LIV, PR-PER, PR-UNQ "must not infer"', 'overclaim-verifier-output'),
  // §9 PR-LIV / PR-PER: civil identity is never established by these predicates.
  P('civil-identity', /civil identity/i,
    '§9 PR-LIV, PR-PER "must not infer"; §24', 'overclaim-verifier-output'),
  // §9 PR-UNQ: "one natural person globally" is exactly what may NOT be claimed.
  P('unique-human', /unique (natural )?(human|person)/i,
    '§9 PR-UNQ "must not infer"', 'overclaim-verifier-output'),
  P('one-natural-person', /one natural person/i,
    '§9 PR-UNQ "must not infer"', 'overclaim-verifier-output'),
  // §26.1 bullet 2 / §10.2: the biometric determination's correctness is the
  // issuer's accountability (§10.5), never the proof's claim.
  P('biometric-correctness', /biometric[^.]{0,60}(correct|accurate|verified)/i,
    '§26.1 bullet 2; §10.2 negative meaning', 'overclaim-verifier-output'),
  P('liveness-proof-overclaim', /proof (of|that)[^.]*(was|is) (live|alive)/i,
    '§10.2 (PR-LIV proves attestation possession, not liveness fact)',
    'overclaim-verifier-output'),
  // §9 PR-UNQ: cross-context identity must not be inferred (§2.3 trade curve).
  P('cross-context-identity', /same (person|user|human) across (contexts|services|verifiers)/i,
    '§9 PR-UNQ "must not infer"; §2.3', 'overclaim-verifier-output'),
  // §9 PR-HLD + §26.1 bullet 9: key control is not authority, consent, intent,
  // or presence. This pattern carries its own reason code because §26.1 names
  // it as a distinct mandatory rejection.
  P('key-control-authority', /key[\s-](control|possession)[^.]{0,80}(authori[sz]|consent|intent|presen)/i,
    '§9 PR-HLD "must not infer"; §14.2; §26.1 bullet 9', 'key-control-as-authority'),
  // §26.1 bullet 5: a collusion-resistance claim with no defined adversary or
  // test. The claim class trips UNLESS the text carries the §2.4 structure —
  // against whom, for what, alongside what, tested by which fixture.
  P('undocumented-collusion-claim',
    /(collusion[\s-]resistan(t|ce)|resistant to [^.]{0,80}collusion)/i,
    '§26.1 bullet 5; §24 collusion-resistance claims; §2.4 "against whom"',
    'undocumented-collusion-claim',
    /claimed against [^.]+ for [^.]+ alongside [^.]+ tested by/i),
  // §26.1 bullet 11: a disclosure claim that ignores observable events or
  // accompanying fields. "Learns nothing" / "no information is revealed" are
  // false at the event layer: the verifier always observes occurrence, timing,
  // and the transcript's accompanying fields (§2.6). Honest narrow language
  // ("observes occurrence and timing; the witness remains hidden") passes.
  P('verifier-learns-nothing', /verifier[^.]{0,40}learns nothing/i,
    '§26.1 bullet 11; §2.6 composition; §2.4 "alongside what"',
    'disclosure-ignores-observables'),
  P('no-information-revealed',
    /no (information|data) is (revealed|disclosed|leaked|learned)/i,
    '§26.1 bullet 11; §2.6 (occurrence and timing are always observable)',
    'disclosure-ignores-observables'),
]);

// Lint a verifier-output text. { ok, hits: [{ id, source, reason, match }] }.
// ok === true means the text stays inside the §9 claim ceiling.
export function lintVerifierOutput(text) {
  if (typeof text !== 'string') {
    return { ok: false, hits: [{ id: 'not-a-text', source: 'lint.mjs', reason: 'overclaim-verifier-output', match: String(text) }] };
  }
  const hits = [];
  for (const p of PROHIBITED_PATTERNS) {
    const m = text.match(p.re);
    if (m && !(p.unless && p.unless.test(text))) {
      hits.push({ id: p.id, source: p.source, reason: p.reason, match: m[0] });
    }
  }
  return { ok: hits.length === 0, hits };
}
