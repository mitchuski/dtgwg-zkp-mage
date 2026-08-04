// X2 — the context human-legibility instrument (reference model).
//
// The §6.8 six-question test made runnable: a *context card* generated from the
// §6.2 canonical context descriptor itself, so the user-facing description
// provably matches the cryptographic configuration. The §26 requirement for
// "evidence that user-facing context descriptions match the cryptographic
// configuration" becomes a DERIVATION, not an audit: the card carries the same
// descriptor digest the proof transcript (§15.2) binds — a mismatch is a build
// failure, not a finding.
//
// Three exports, mirroring X2's build plan:
//   renderCard(descriptor, options?)            — M2: card = render(descriptor)
//   checkLegibility(descriptor, card, just?)    — M3: coverage + digest match
//   diffCards(oldCard, newCard)                 — M3: expansion made visible (§6.6/§6.7)
//
// Zero-dep, offline, deterministic. Shares the §6.2 encoding + digest with the
// other X-series consumers via ../canonical/canonical.mjs (one encoding, three
// consumers). This file must never import a clock or the network.

import {
  DESCRIPTOR_FIELDS,
  DESCRIPTOR_OPTIONAL,
  descriptorDigest,
  validateDescriptor,
} from '../canonical/canonical.mjs';

// --- the field → question map (X2 design point 2, the §6.8 table) -------------
//
// Every mapped field's VALUE is interpolated verbatim into the text of each
// question it feeds; checkLegibility later re-verifies that interpolation, so
// "contributes to a rendered question" is a checkable property of the text, not
// a claim in a side list.
//
// | Q  | §6.8 question                            | descriptor inputs (§6.2)      |
// |----|------------------------------------------|-------------------------------|
// | q1 | What activity is this proof for?         | purpose · scope               |
// | q2 | Who can recognise repeat use?            | verifierSet · contextAuthority|
// | q3 | For how long is repeat use linkable?     | epoch · epochPolicy · retentionPolicy |
// | q4 | What happens when the epoch changes?     | epochPolicy · nullifierVersion|
// | q5 | Does fallback change who observes?       | (provingMode option — §21.2; not a §6.2 field) |
// | q6 | How do I challenge a decision?           | contextAuthority (§6.7 route) |
export const FIELD_QUESTION_MAP = {
  purpose: ['q1'],
  scope: ['q1'],
  verifierSet: ['q2'],
  contextAuthority: ['q2', 'q6'],
  epoch: ['q3'],
  epochPolicy: ['q3', 'q4'],
  retentionPolicy: ['q3'],
  nullifierVersion: ['q4'],
};

// Fields that are real linkability-domain inputs (they are digest-relevant and
// any change re-versions the card) but whose IDENTIFIERS are cryptographic /
// governance internals with no independent operational meaning to a person.
// §6.8 last sentence: the interface need not expose internals, but the omission
// must be RECORDED, never silent — hence a justification, not a blank.
export const DEFAULT_JUSTIFICATIONS = {
  protocol:
    'version pin — cryptographic internal (§6.8: internals need not be exposed); ' +
    'any change re-versions this card via the digest',
  profile:
    'profile version pin — its operational meaning is fully rendered through q1–q6; ' +
    'a profile change re-versions this card via the digest',
  contextPolicy:
    'policy identifier — the policy CONTENT is what q1–q4 and q6 render; ' +
    'the identifier itself is a governance internal, surfaced via the digest',
  registryDomain:
    'accreditation-domain scoping of the verifier set — recognition meaning is ' +
    'carried by q2; the identifier is a governance internal, surfaced via the digest',
};

const Q_IDS = ['q1', 'q2', 'q3', 'q4', 'q5', 'q6'];

// The §5.12 mandatory narrow language, verbatim. A nullifier establishes scoped
// reuse detection — the card must say exactly that and must NEVER use the broad
// personhood phrasing §5.12 forbids (see NARROW_LANGUAGE / BROAD_LANGUAGE below).
const NARROW = 'recognise repeat use (scoped reuse detection)';
export const NARROW_LANGUAGE = 'scoped reuse detection';
export const BROAD_LANGUAGE = /unique human|one unique|one person per/i;

// --- M2: render(descriptor) → card --------------------------------------------
//
// options:
//   provingMode    — §21 mediated-proving declaration, when the deployment has a
//                    fallback path. NOT a §6.2 descriptor field (it is transcript-
//                    optional in §15.2), so it does not enter the digest; it enters
//                    q5. Absent ⇒ the q5 answer is the local-only declaration.
//   justifications — extra { field: reason } non-materiality records, merged over
//                    DEFAULT_JUSTIFICATIONS (X2 design point 3(b)).
export function renderCard(descriptor, options = {}) {
  const v = validateDescriptor(descriptor);
  if (!v.ok) {
    throw new Error(
      `invalid-descriptor:${[...v.missing.map((m) => `missing:${m}`), ...v.unknown.map((u) => `unknown:${u}`)].join(',')}`
    );
  }
  const digest = descriptorDigest(descriptor);
  const d = descriptor;

  // The six §6.8 questions, each answered ONLY from named descriptor fields
  // (plus the q5 option). Plain-language register; identifiers are quoted
  // verbatim so the derivation is visible to checkLegibility.
  const questions = {
    // q1 — what activity is this proof for? (purpose · scope; §5.6/§5.7 —
    // governed identifiers, never verifier free text)
    q1:
      `This proof is for the activity "${d.purpose}" within the scope "${d.scope}". ` +
      `It shows you are eligible for that one activity and nothing else.`,

    // q2 — who can recognise repeat use? (verifierSet · contextAuthority)
    // Narrow language mandatory (§5.12): scoped reuse detection, and no broader claim.
    q2:
      `Only the verifiers in "${d.verifierSet}", governed by "${d.contextAuthority}", ` +
      `can ${NARROW} within this context. No service outside that governed set is ` +
      `granted recognition, and recognition never crosses into other contexts (§6.6).`,

    // q3 — for how long is repeat use linkable? (epoch · epochPolicy · retentionPolicy)
    q3:
      `Repeat use is linkable during the epoch "${d.epoch}", which rolls over under ` +
      `"${d.epochPolicy}"; verifier records fall under "${d.retentionPolicy}". Within ` +
      `that window the governed verifiers can ${NARROW}; when the window closes, the ` +
      `linkage ends.`,

    // q4 — what happens when the epoch changes? (epochPolicy · nullifierVersion)
    q4:
      `When the epoch rolls over under "${d.epochPolicy}", the reuse-detection value ` +
      `(nullifier, "${d.nullifierVersion}") changes with it: what you did before the ` +
      `change and what you do after it cannot be linked to each other.`,

    // q5 — does fallback change who observes? (§21.2 mediated-proving declaration;
    // an OPTION, not a descriptor field — absent means no mediated path exists)
    q5: options.provingMode
      ? `Yes — if your device cannot prove on its own, a mediated prover ` +
        `("${options.provingMode}") helps, and that mediating service becomes an ` +
        `additional observer of the event. Mediation is shown to you while it ` +
        `happens (§21.2), and the mediator is bound by non-retention rules.`
      : `No — local proving only — no additional observer. The proof is generated ` +
        `on your own device; no extra service sees that this event happened.`,

    // q6 — how do I challenge a decision? (contextAuthority's §6.7 route)
    q6:
      `A wrong reuse or uniqueness decision can be challenged through ` +
      `"${d.contextAuthority}", which is required (§6.7) to provide a correction, ` +
      `appeal, and challenge route for this context.`,
  };

  // Coverage record (X2 design point 3): every §6.2 field is either rendered
  // into a question or carries a recorded non-materiality justification.
  // "unrendered" should always be empty for a conformant render — it exists so
  // the shape of a FAILURE is representable, not because we ever emit one.
  const justified = {};
  const mergedJust = { ...DEFAULT_JUSTIFICATIONS, ...(options.justifications ?? {}) };
  const present = [...DESCRIPTOR_FIELDS, ...DESCRIPTOR_OPTIONAL].filter(
    (f) => d[f] !== undefined
  );
  const rendered = present.filter((f) => FIELD_QUESTION_MAP[f]);
  const unrendered = [];
  for (const f of present) {
    if (FIELD_QUESTION_MAP[f]) continue;
    if (mergedJust[f]) justified[f] = mergedJust[f];
    else unrendered.push(f);
  }

  return {
    // Provenance is structural: the card carries the digest it was rendered
    // from; the transcript (§15.2 contextDescriptorDigest) binds the same one.
    digest,
    // Card version derives from the digest prefix — a descriptor change IS a
    // card re-version; a card that "didn't change when the domain did" cannot
    // exist (§6.6 silent expansion, made impossible rather than audited).
    version: `card:${digest.slice(0, 12)}`,
    questions,
    coverage: { rendered, justified, unrendered },
    // Non-normative echo of the linkability-domain inputs, so diffCards can
    // judge WIDENING (not just change) without re-parsing question prose.
    linkability: {
      verifierSet: d.verifierSet,
      contextAuthority: d.contextAuthority,
      epoch: d.epoch,
      epochPolicy: d.epochPolicy,
      retentionPolicy: d.retentionPolicy,
    },
  };
}

// --- M3a: the legibility conformance check ------------------------------------
//
// Recomputes everything from the descriptor and the card TEXT — it does not
// trust the card's own coverage claim. Failures are named (§26.1-style negative
// tests reject by name):
//   'digest-mismatch'                — card digest ≠ descriptorDigest(descriptor)
//   'unrendered-field:<name>'        — field neither interpolated into a mapped
//                                      question's text nor justified
//   'missing-narrow-language:<qN>'   — q2/q3 lost the §5.12 verbatim phrase
//   'broad-personhood-language:<qN>' — any question uses the forbidden broad claim
export function checkLegibility(descriptor, card, justifications = {}) {
  const failures = [];

  // Digest match is the derivation guarantee (§26 evidence): a card whose
  // digest mismatches its descriptor MUST be rejected by name.
  if (card?.digest !== descriptorDigest(descriptor)) failures.push('digest-mismatch');

  // Coverage: a field "contributes to a rendered question" iff its value
  // appears verbatim in the text of at least one question the map assigns it.
  const mergedJust = {
    ...DEFAULT_JUSTIFICATIONS,
    ...(card?.coverage?.justified ?? {}),
    ...justifications,
  };
  const present = [...DESCRIPTOR_FIELDS, ...DESCRIPTOR_OPTIONAL].filter(
    (f) => descriptor[f] !== undefined
  );
  for (const f of present) {
    const qs = FIELD_QUESTION_MAP[f];
    const renderedHere =
      qs && qs.some((q) => String(card?.questions?.[q] ?? '').includes(String(descriptor[f])));
    if (!renderedHere && !mergedJust[f]) failures.push(`unrendered-field:${f}`);
  }

  // Narrow-language conformance (§5.12): the repeat-use questions must carry
  // the verbatim narrow phrase, and NO question may carry the broad claim.
  for (const q of ['q2', 'q3']) {
    if (!String(card?.questions?.[q] ?? '').includes(NARROW_LANGUAGE)) {
      failures.push(`missing-narrow-language:${q}`);
    }
  }
  for (const q of Q_IDS) {
    if (BROAD_LANGUAGE.test(String(card?.questions?.[q] ?? ''))) {
      failures.push(`broad-personhood-language:${q}`);
    }
  }

  return { ok: failures.length === 0, failures };
}

// --- M3b: expansion made visible (diff-on-change, §6.6/§6.7) -------------------
//
// §6.7: "a context change that expands linkability MUST be treated as a material
// privacy change." On the card that is a versioned diff with q2/q3 deltas
// highlighted. Widening is judged on the linkability echo, not the prose:
//
//   q2 delta (recognition set / authority changed) → expansion, CONSERVATIVELY.
//     From opaque governed identifiers we cannot prove the new set is a subset
//     of the old, and §6.7 treats an unproven-equal recognition set as material.
//   q3 delta → expansion iff a linkability WINDOW grew. Duration-shaped policy
//     identifiers ("rollover:30d", "retention:35d") are compared numerically; a
//     shrink or a routine epoch rollover (same policy, new epoch id) is a delta
//     but NOT an expansion. A window change we cannot compare is conservatively
//     treated as widening.
const DURATION = /(\d+(?:\.\d+)?)\s*(h|d|w|y)\b/;
const DAYS = { h: 1 / 24, d: 1, w: 7, y: 365 };
function parseWindowDays(s) {
  const m = DURATION.exec(String(s ?? ''));
  return m ? Number(m[1]) * DAYS[m[2]] : null;
}
function windowWidened(oldLink, newLink) {
  let widened = false;
  for (const f of ['epochPolicy', 'retentionPolicy']) {
    if (oldLink?.[f] === newLink?.[f]) continue; // unchanged window
    const a = parseWindowDays(oldLink?.[f]);
    const b = parseWindowDays(newLink?.[f]);
    if (a === null || b === null) widened = true; // incomparable change → conservative
    else if (b > a) widened = true; // window grew → linkability widened
    // b < a: window shrank — a delta, not an expansion
  }
  return widened;
}

export function diffCards(oldCard, newCard) {
  const deltas = [];
  for (const q of Q_IDS) {
    const before = oldCard?.questions?.[q];
    const after = newCard?.questions?.[q];
    if (before !== after) deltas.push({ question: q, before, after });
  }
  const changed = deltas.length > 0 || oldCard?.digest !== newCard?.digest;

  const q2Delta = deltas.some((d) => d.question === 'q2');
  const q3Delta = deltas.some((d) => d.question === 'q3');
  const expansion =
    q2Delta || (q3Delta && windowWidened(oldCard?.linkability, newCard?.linkability));

  return { changed, deltas, expansion };
}
