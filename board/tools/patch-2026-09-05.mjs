// One-shot patch, 2026-09-05: WD02 vocabulary (three correlation scopes, R/M/C/P-DID retired),
// the common-control clause on 010/011, Scott's #39/#40 work items on 001/006/020.
// Run once from board/: node tools/patch-2026-09-05.mjs — idempotent (checks before writing).
import { readFileSync, writeFileSync } from 'node:fs';
import { join, dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const load = (id) => JSON.parse(readFileSync(join(ROOT, 'cards', `${id}.json`), 'utf8'));
const save = (c) => writeFileSync(join(ROOT, 'cards', `${c.id}.json`), JSON.stringify(c, null, 2) + '\n');
const DATE = '2026-09-05';
const log = [];

// ---- 001: issuer-as-predicate alias (Scott, cred-tf #39 08-25) ------------------------------
{
  const c = load('001');
  if (!/issuer-as-predicate/.test(c.request?.need || '')) {
    c.request = c.request || {};
    c.request.need = (c.request.need ? c.request.need + ' · ' : '') + 'alias: issuer-as-predicate (ScottJeezey, cred-tf #39 2026-08-25) — prove an issuer belongs to an accredited set rather than naming it, because the observer is often a venue or event and therefore the most identifying element';
    c.provenance = c.provenance || {}; c.provenance.spec = c.provenance.spec || [];
    c.provenance.spec.push('cred-tf #39 (ScottJeezey 2026-08-25): issuer-as-predicate named as a ZKP TF work item — this card');
    save(c); log.push('001: issuer-as-predicate alias added');
  }
}

// ---- 006: the set-root primitive (anchoring = revocation status = registry membership) ------
{
  const c = load('006');
  if (!c.substitutions.some(s => /accumulator non-membership/.test(s.route))) {
    c.substitutions.push({
      route: 'set-root primitive (cred-tf #40 unification): a signed, published set root + a membership or non-membership proof carried in the presentation — accumulator non-membership witness as the ZK-friendly form; the same pantry object serves anchoring (card 001), revocation status (this card) and registry membership',
      cost: 'unmeasured — ScottJeezey: "ours to pressure-test", priority',
      measured: false,
      source: 'cred-tf #40 (stormer78 08-22; ScottJeezey 08-24) · cred-tf #39 (ScottJeezey 08-25)'
    });
    c.provenance = c.provenance || {}; c.provenance.spec = c.provenance.spec || [];
    c.provenance.spec.push('cred-tf #40 / #39: set-root-plus-proof as one primitive; "no live lookups" as the privacy-profile default (profile default, not absolute — Sankarshan)');
    c.doesNotEstablish.push('that the verifier performed no live lookup — the card makes the presentation self-carrying (root + witness); whether a deployment still phones home is a profile statement, not a proof property');
    save(c); log.push('006: set-root primitive route + no-live-lookup line added');
  }
}

// ---- 010: WD02 vocabulary + the voucher-side common-control clause --------------------------
{
  const c = load('010');
  if (!c.components.includes('007')) {
    c.components.push('007');
    c.ingredients = [
      'the VRC (Omar → Nia): the vouch, its statement, and the pairwise-scope identifier pair it was issued between',
      "Nia's VMC from C — the community-issued grant (and her own acknowledgement half)",
      "Omar's VMC grant from C as it sits in C's membership root (the leaf and its path — no copy of Omar's acknowledgement exists on Nia's side)",
      "Nia's holder secret, and the derivation material linking her VRC-side identifier to her VMC-side identifier (card 007) — unless she declared one `directed` identifier for both",
      "Omar's linkage: either one `directed` identifier used in both his VMC and the VRC (WD02's honest default for intra-community edges), or a co-control attestation Omar issued alongside the VRC (card 007 run by the voucher at issuance — the vouch-under-community-credential shape of ePrint 2026/333); Nia cannot derive this from her own secret",
      'non-revocation witnesses for the VRC and both VMC handles'
    ];
    c.dish = 'A maintainer learns that a member of community C has a working relationship with the presenter, that the presenter is also a member of C, and that the two are different members — and learns nothing else: not who vouched, not the pairwise identifiers under the edge, and nothing that recognises the presenter next time in another context.';
    c.method.splice(3, 0, {
      clause: "S7 (WD02, PR #30) — the identifier Nia used in the VRC and the identifier her VMC grant names are controlled by one secret; likewise Omar's VRC-issuing identifier and his VMC-grant identifier (from his linkage artifact, or trivially if he used one `directed` identifier) — otherwise clauses 1–3 are about four unrelated identifiers",
      gadget: 'key-binding',
      component: '007'
    });
    c.yield = c.yield.map(y => y.replace(/R-DID|P-DID|M-DID|C-DID/g, 'identifier'));
    c.doesNotEstablish.push("that Omar's two identifiers are co-controlled when he supplied no linkage and used pairwise identifiers for both — then clause 3 is unprovable by Nia, and the card says so rather than reading a link out of a field (cred-spec #9)");
    c.adversary = c.adversary.map(a => ({ ...a, claim: a.claim.replace('no relationship identifier, no counterparty identifier', 'no pairwise-scope identifier of the edge, no counterparty identifier') }));
    c.issuance = (c.issuance || []).map(x => x.replace(/R-DID|M-DID/g, 'identifier'));
    if (!c.issuance.some(x => /linkage/.test(x))) c.issuance.push("a VRC issued from a pairwise-scope identifier by a member who wants it usable in community-anchored proofs carries the issuer's co-control attestation to their VMC-side identifier (card 007 at issuance) — or the member declares `directed` and uses one identifier; the credential layer names the option, not the link (cred-spec #9)");
    c.provenance.spec.push('cred-spec PR #30 §Community-Anchored Zero-Knowledge Proof (WD02 draft): "the proof must additionally establish common control" · cred-spec #31 row #9');
    c.history.push({ to: 'carded', by: 'mitchuski', date: DATE, evidence: 'WD02 three-scope vocabulary (PR #30); S7 common-control clause via card 007; voucher-side linkage stated as ingredient + issuance option — re-carded, state unchanged', task: 'board/card' });
    save(c); log.push('010: S7 + 007 component + WD02 vocabulary');
  }
}

// ---- 011: WD02 vocabulary; co-control via 007 -----------------------------------------------
{
  const c = load('011');
  if (!c.components.includes('007')) {
    c.name = 'Pairwise edge (VRC possession, directed personas shown, pairwise identifiers hidden)';
    c.dish = 'A verifier learns that two disclosed persona identifiers (declared `directed`) hold a valid relationship credential between them, without learning the pairwise-scope identifiers under it and without a handle that correlates this presentation with any other.';
    c.request.need = 'prove two known personas have a relationship without exposing the private pairwise channel (cred-spec §Pairwise Zero-Knowledge Proof, WD02 wording: disclose the parties’ `directed` persona identifiers while hiding the underlying `pairwise` ones)';
    c.ingredients = [
      'the VRC and the pairwise-scope identifier pair it was issued between',
      'the co-control witnesses linking each disclosed `directed` persona identifier to its hidden pairwise identifier (card 007; cred-spec #9: co-control proven in ZK, never a field) — the counterparty’s half is theirs to supply',
      'the presenter’s holder secret'
    ];
    c.pantry = ['the two `directed` persona identifiers (disclosed on purpose)', 'rl_root, epoch', 'transcriptDigest'];
    c.method = [
      { clause: 'the VRC verifies under the issuing pairwise identifier’s key', gadget: 'signature-verify' },
      { clause: 'each disclosed persona identifier is co-controlled with its hidden pairwise identifier (card 007) — the presenter’s from their own secret, the counterparty’s from the counterparty’s attestation', gadget: 'key-binding', component: '007' },
      { clause: 'the presenter’s presentation key derives from the secret behind their pairwise identifier', gadget: 'key-binding', component: '004' },
      { clause: 'the VRC handle is not revoked at epoch', gadget: 'non-revocation', component: '006' },
      { clause: 'bound to one transcript', gadget: 'transcript-bind', component: '003' }
    ];
    c.components = ['003', '004', '006', '007'];
    c.yield = ['the two `directed` persona identifiers', 'rl_root, epoch', 'transcriptDigest'];
    c.doesNotEstablish.push('the counterparty’s persona↔pairwise linkage without the counterparty’s attestation (card 007 negative space)');
    c.adversary = [{ claim: 'pairwise identifiers hidden; no cross-presentation correlator minted by the linkage itself', against: ['verifier', 'verifiers-colluding'] }];
    c.provenance.spec = ['cred-spec §Pairwise Zero-Knowledge Proof (WD02 wording, PR #30)', 'cred-spec #9 (F post: co-control as requirement, not field)', 'cred-spec PR #30 §Correlation Scope'];
    c.history.push({ to: 'carded', by: 'mitchuski', date: DATE, evidence: 'WD02 vocabulary; co-control routed through card 007 — re-carded, state unchanged', task: 'board/card' });
    save(c); log.push('011: renamed + 007 + WD02 vocabulary');
  }
}

// ---- 020: Scott's acceptance (#40), stormer78's core/profile split, #31 pre-merge list ------
{
  const c = load('020');
  if (c.state === 'requested') {
    c.priority = 'P2';
    c.owner = 'construction: sankarshanmukhopadhyay · DenisPopov15 · mitchuski (per ScottJeezey, cred-tf #40) · record: stormer78 (PR #19)';
    c.request.issue += ' · cred-tf #40 (stormer78 08-22 design note; ScottJeezey 08-24: "on our list alongside Q2") · cred-spec #31 pre-merge list for #19';
    c.request.need = 'prove an agent may act for a principal within scope S until T, chain attenuation-only, without revealing the principal — in the chained PROFILE only: the WD02 core VDC is single-hop, principal-issued, delegate-countersigned and needs no chain proof (cred-tf #40 §1)';
    c.dish = 'A verifier learns that the presenting agent holds a delegation chain rooted at a principal who is a member of a recognised community, with scope narrowing at every hop, no hop expired or revoked, and every hop accepted by its delegate — without learning the principal. (Profile case; the core single-hop VDC is verified by five local checks and no proof.)';
    c.ingredients.push('each hop’s acceptance countersignature (`delegation.accepts` = SAID of the grant) — the acceptance is constitutive, not optional evidence (cred-tf #40 §3, KERI two-seal shape)');
    c.method.splice(1, 0, { clause: 'each hop’s delegate countersigned the grant: `accepts` matches the grant digest (digestMultibase, WD02 D-A) and verifies under the delegate’s key', gadget: 'signature-verify' });
    c.method[0].clause = 'act ∈ scope_n ⊆ … ⊆ scope_root, depth ≤ maxDepth, validUntil monotone along the chain, root hop signed by the principal (Scott’s predicate shape, cred-tf #40)';
    c.doesNotEstablish.push('that the principal has not declined renewal — in the core, revocation is non-renewal within one validUntil; the profile’s credentialStatus re-adds a live lookup and this card’s non-revocation leg is what lets the presentation carry it instead');
    c.doesNotEstablish.push('what the delegate actually did in the principal’s name — the invocation record lives on the framework side (the artifact gap, cred-tf #40 Q8)');
    c.issuance = [
      'VDC as an edge credential type (cred-spec PR #19, rebased over WD02 vocabulary) with ZK-friendly signatures — X3 applies',
      'the delegator’s identifier is `directed`, a context-scoped identifier per delegation, not `pairwise` (cred-spec #31 pre-merge note for #19)',
      'grant and acceptance digests are digestMultibase (WD02 D-A); the acceptance is REQUIRED (cred-tf #40; review feedback folded per #31)',
      'chaining (`parent`, `maxDepth`, `credentialStatus`) exists only in the opt-in profile, visible to the verifier, costs stated (cred-tf #40 §1)'
    ];
    c.provenance.spec.push('cred-tf #40 (delegation as a design-time case; the chain-resolution boundary) · cred-spec #31 (#19 pre-merge checklist)');
    c.state = 'carded';
    c.history.push({ to: 'carded', by: 'mitchuski', date: DATE, evidence: 'ScottJeezey accepted delegation-chain validity as a ZKP TF target (cred-tf #40, 2026-08-24); predicate shape + acceptance clause + core/profile split from stormer78’s note; issuance lines from cred-spec #31', task: 'board/card' });
    save(c); log.push('020: carded (P2) with acceptance clause, core/profile split, #31 issuance lines');
  }
}

console.log(log.length ? log.join('\n') : 'nothing to patch (already applied)');
