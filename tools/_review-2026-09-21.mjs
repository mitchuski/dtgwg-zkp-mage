#!/usr/bin/env node
// _review-2026-09-21.mjs — one-shot, idempotent: fold the credential maintainer's review of PR #8 (geoffturk,
// 2026-09-16) into records 007, 008, 009, 010, 011 and 021. Record 022 (blinded digest references) is a new file.
import { readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
const ROOT = new URL('..', import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, '$1');
const card = (id) => join(ROOT, 'board', 'cards', `${id}.json`);
const load = (id) => JSON.parse(readFileSync(card(id), 'utf8'));
const save = (id, d) => writeFileSync(card(id), JSON.stringify(d, null, 2) + '\n');
const REVIEW = 'zkp-spec PR #8 review (geoffturk, 2026-09-16, the credential maintainer\'s reading of the interface)';
const once = (arr, s) => { if (!arr.some(x => x === s)) arr.push(s); };
const rev = (d, note) => { d.revisions = d.revisions || []; if (!d.revisions.some(r => r.date === '2026-09-21')) d.revisions.push({ date: '2026-09-21', by: 'mitchuski', note }); };

// ---- 007 common control: the two new asks (commitment home; MUST vs profile) and the WD02-examples finding
{ const d = load('007');
  d.issuance[0] = 'each identifier that may need to be proven co-controlled must be, or carry, a ZK-openable commitment to the holder secret: a SNARK-native key (e.g. a BabyJubJub or BLS12-381 Multikey) or a published Poseidon/KZG commitment beside an Ed25519 key — the X3 requirement of record 010 applied to identifiers rather than signatures (cred-spec #17)';
  once(d.issuance, 'where the commitment lives — the task force\'s preference, stated for the credential specification to give it a home: as a verification method in the identifier\'s DID document (a `Multikey` entry carrying the commitment or the SNARK-native key), not as a member of any credential. The commitment is a property of the identifier — one per identifier, shared by every credential that names it, resolved the way a verifier already resolves the signing key — so it changes no credential schema and leaves the credential layer one requirement (which DID methods can carry it) instead of a member on every type. A credential member is the fallback only for a profile whose DID method cannot carry a second verification method');
  once(d.issuance, 'the WD02 example set read against this line (the credential maintainer\'s answer to question 2 of zkp-tf #23): `did:key` over Ed25519 carries exactly one key and cannot carry a second verification method, so an Ed25519 `did:key` identifier has no place for the commitment and cannot satisfy this record as it stands; `did:peer` (numalgo 2 and 4) and `did:webvh` can carry one. The first implementation should mint the narrow-scope identifiers that may be co-proven as `did:peer` with the commitment as a second verification method, or as `did:key` over a SNARK-native key type — and that is the first thing for it to find out (WG-14)');
  once(d.issuance, 'whether the requirement can be a MUST: yes, conditioned on the identifier\'s key profile rather than on a derivation the whole graph shares. The sentence should bind an identifier minted under a profile that declares co-control provable (a derivable key with a published commitment, or a SNARK-native key); a key held in a secure element with no available scalar is outside that profile, and co-control for it is established at issuance by the party who can prove it (the issuance-time attestation route of record 010) or not at all. WG-02\'s decision on derivation selects the first profile; it does not need to precede the sentence');
  once(d.provenance.spec, REVIEW + ': records 007, 009, 010 and 011 confirmed against cred-spec #9 as settled on 2026-09-10; two asks new to the credential layer — where the ZK-openable commitment lives, and whether the requirement can be a MUST — answered in the issuance lines above');
  rev(d, 'Review of 2026-09-16 (credential maintainer): the commitment\'s home stated as a task-force preference (DID-document verification method; credential member only as fallback); the requirement sentence conditioned on a key profile rather than on universal derivation; the WD02 example set found unable to satisfy this record as it stands (Ed25519 `did:key` cannot carry the commitment) — WG-14. Citations by section title. State unchanged.');
  save('007', d); }

// ---- 008 blinded binder: re-read against cred-spec PR #56 (taskContext = initiating document id + taskDigestMultibase)
{ const d = load('008');
  d.witness[0] = 'the taskContext value — under cred-spec PR #56 (open, 2026-09-17) the `id` of the exchange\'s initiating document together with `taskDigestMultibase`, the task digest of that document; before it, the id/threadId pairing';
  d.issuance[0] = 'issuers carry a committed form of the exchange citation in place of the plaintext pair — under cred-spec PR #56 that pair is `taskContext` (the initiating document\'s `id`) and `taskDigestMultibase` (its task digest), both durable correlators of the credential across presentations; this is a change to cred-spec §The `taskContext` Property and §The `taskDigestMultibase` Property, and the one member this record asks the credential layer for. Filed against the credential specification as its own issue on 2026-09-21 (the review asked that it be an issue the Credentials TF can schedule; PR #18 is parked and is not it)';
  once(d.provenance.spec, 'cred-spec PR #56 (albertoleon7794, 2026-09-17, open): `taskContext` becomes the initiating document\'s `id` (not the threadId) and gains `taskDigestMultibase`, the task digest of that document, taken with `proof` removed — a sixth digest-valued member, and a second plaintext correlator beside the first');
  once(d.provenance.spec, REVIEW + ': this record is scoped to the trust-task binder; the five digest-valued members of cred-spec #38 are record 022; the taskContext change is to be filed against the credential specification as an issue');
  rev(d, 'Review of 2026-09-16: witness and issuance re-read against cred-spec PR #56 (initiating-document id + task digest); the #38 digest members moved to their own record, 022; the taskContext ask filed as a credential-specification issue. State unchanged.');
  save('008', d); }

// ---- 009 hidden-value equality: the separation confirmed
{ const d = load('009');
  once(d.provenance.spec, REVIEW + ': "Record 009 is the right separation" — the chain predicates and the shared-subject rule are hidden-value equality, not common control; the credential specification\'s editor\'s note is to be reworked to two primitives (007, 009) citing 009, 011, 012 and 021');
  save('009', d); }

// ---- 010 community-anchored proof: question 2 of #23 answered by the credential maintainer
{ const d = load('010');
  once(d.provenance.spec, REVIEW + ' — the answer to question 2 of zkp-tf #23 (which credential, holder-key and offline-voucher artifacts the first implementation supports): the WD02 examples as they stand — `did:key` and `did:peer` Ed25519 identifiers, the VMC pair with the community-issued grant as the membership leaf, a VRC issued from a `pairwise` identifier carrying the issuer\'s linkage proof under the MAY. Read against record 007\'s issuance line the Ed25519 `did:key` half of that set cannot carry the commitment (record 007, WG-14)');
  once(d.provenance.spec, 'cred-spec §Community-Anchored Zero-Knowledge Proof: Governance Considerations 1 confirmed to carry the membership-pair rule; statement 3\'s negative space confirmed to match the SHOULD / SHOULD NOT wording (review of 2026-09-16)');
  rev(d, 'Review of 2026-09-16: the credential maintainer\'s answer to question 2 of #23 recorded; the example set\'s Ed25519 `did:key` identifiers found unable to carry the commitment record 007 requires (WG-14). Citations by section title. State unchanged.');
  save('010', d); }

// ---- 011 pairwise edge: what it answers on cred-spec #9, now said
{ const d = load('011');
  once(d.provenance.spec, REVIEW + ': record 011 answers the first two questions of cred-spec #9 implicitly — the persona-to-pairwise link is a co-control witness (record 007 in the presenter\'s hands), and the VPC plays no part in the proof; the counterparty\'s persona-to-pairwise link needs the counterparty\'s attestation, the same asymmetry as statement 3 of the community-anchored proof. Stated on #9 on 2026-09-21');
  rev(d, 'Review of 2026-09-16: the record\'s implicit answers to cred-spec #9\'s first two questions made explicit in provenance and stated on the thread; the counterparty-attestation asymmetry noted. State unchanged.');
  save('011', d); }

// ---- 021 authority chain: the digest concern now has a record
{ const d = load('021');
  d.issuance[1] = '`authority.parent` is a digestMultibase digest of the parent (§Digest Encoding); the unsalted-digest concern of cred-spec #38 applies to it — record 022 (blinded digest references) is the construction for that member and the four others; record 008\'s blinding question is the trust-task binder\'s';
  save('021', d); }
console.log('folded: 007 008 009 010 011 021');
