// Property tests for the nullifier / per-context-uniqueness construction.
//
// These assert the properties the strawman CLAIMS for this predicate, including
// the "user-as-adversary" stance (Section 2): the presenter is often the
// attacker, so we test a human attacking their OWN uniqueness, not just a happy
// path. Run: node test.mjs

import { enrol, nullifier, ContextRegistry } from './src/nullifier.mjs';

let pass = 0, fail = 0;
const ok = (name, cond) => {
  if (cond) { pass++; console.log(`  \x1b[32mPASS\x1b[0m ${name}`); }
  else { fail++; console.log(`  \x1b[31mFAIL\x1b[0m ${name}`); }
};

console.log('\nnullifier / uniqueness-within-context — properties\n');

// ---------------------------------------------------------------------------
// P1. Determinism: same human, same context -> same nullifier.
// This is what makes uniqueness enforceable at all.
// ---------------------------------------------------------------------------
const alice = enrol('human:alice');
const ctxDating = 'service:dating-app';
ok('P1 determinism — same (human, context) yields the same nullifier',
   nullifier(alice.secret, ctxDating) === nullifier(alice.secret, ctxDating));

// ---------------------------------------------------------------------------
// P2. Cross-context unlinkability: same human, different contexts -> different,
// unlinkable nullifiers. Two verifiers cannot correlate the same user.
// ---------------------------------------------------------------------------
const ctxMarket = 'service:marketplace';
ok('P2 unlinkability — same human, different contexts yields different nullifiers',
   nullifier(alice.secret, ctxDating) !== nullifier(alice.secret, ctxMarket));

// ---------------------------------------------------------------------------
// P3. Distinctness: different humans, same context -> different nullifiers.
// Real distinct people are admitted as distinct.
// ---------------------------------------------------------------------------
const bob = enrol('human:bob');
ok('P3 distinctness — different humans in one context yield different nullifiers',
   nullifier(alice.secret, ctxDating) !== nullifier(bob.secret, ctxDating));

// ---------------------------------------------------------------------------
// P4. USER-AS-ADVERSARY: one human tries to open TWO accounts in one context.
// The registry must reject the second without learning identity.
// ---------------------------------------------------------------------------
const dating = new ContextRegistry(ctxDating);
const first = dating.present(nullifier(alice.secret, ctxDating));
const second = dating.present(nullifier(alice.secret, ctxDating)); // same human, second signup
ok('P4a self-Sybil — first enrolment admitted', first.admitted === true);
ok('P4b self-Sybil — second account by the SAME human is rejected',
   second.admitted === false && second.reason === 'duplicate-human-in-context');

// ---------------------------------------------------------------------------
// P5. No cross-context leakage into the registry: alice enrolling in the
// marketplace is NOT blocked by her dating-app nullifier being seen.
// ---------------------------------------------------------------------------
const market = new ContextRegistry(ctxMarket);
ok('P5 context isolation — same human admitted in a different context',
   market.present(nullifier(alice.secret, ctxMarket)).admitted === true);

// ---------------------------------------------------------------------------
// P6. Grinding resistance (modelled): the nullifier is a function of the
// enrolment secret, which the human does not choose. Two "attempts" by the same
// human cannot produce two different in-context nullifiers.
// ---------------------------------------------------------------------------
const attempt1 = nullifier(alice.secret, ctxDating);
const attempt2 = nullifier(alice.secret, ctxDating);
ok('P6 no grinding — a human cannot derive a second in-context nullifier',
   attempt1 === attempt2);

// ---------------------------------------------------------------------------
// P7. Enrolment binding: the published commitment does not reveal the secret,
// and is stable per human (the hook the membership proof attaches to).
// ---------------------------------------------------------------------------
ok('P7a commitment is stable per human', enrol('human:alice').commitment === alice.commitment);
ok('P7b commitment does not equal the secret', alice.commitment !== alice.secret);

console.log(`\n  ${pass} passed, ${fail} failed\n`);
process.exit(fail === 0 ? 0 : 1);
