# DISCUSSION DRAFTS — 2026-08-25 (survey opened 08-24 · posting = Mitch)

Supersedes DISCUSSION-DRAFTS-2026-08-18.md, which was **never posted** and has been
partially overtaken. Survey first, drafts second. Voice rule applied throughout:
no salutations, no second-person address, handles referenced in third person.

---

## SURVEY — what changed since 2026-08-18

### trustoverip/dtgwg-zkp-tf

- **#13 (Toward v0.4)** — the adoption decision the 08-18 draft §1 argued for is
  **already made**: Scott's 08-18 comment records the call outcome (group graduates
  Sankarshan's v0.4.0; Mitchell and Denys backed it verbally; document model adopted;
  PR from fork, Scott merges). **The 08-18 draft §1 is DEAD — do not post it.**
  NEW since: **@dcondrey** (new participant) posted twice on 08-19: (a) issuer
  independence doesn't fix single-attester dishonesty — soundness binds proofs to
  witnesses, not witnesses to reality; (b) proposed clarifying sentence:
  *"independence requirements bound collusion risk across attesters; they don't bound
  the risk of any single attester's dishonesty."* Unanswered by the chairs in-thread.
  → **Draft A** below.
- **PR #16 (v0.4)** — OPEN. Scott 08-19: merge-ready after dead-link + front-matter
  fixes. Sankarshan pushed 08-20 (the dcondrey distinction folded in) and 08-24
  (composed-presentation privacy + credential boundaries). **Co-chair review/approve
  = a Mitch action, not a draft.**
- **#17 (NEW, talltree 08-23) — SIROS ZK Circuit Catalog** (circuits.siros.org,
  Leif Johansson / Peter Altmann). Content-addressed artifact catalog (sha256 = the
  download URL), records origin repo/PR/commit + toolchain + licence, explicitly
  unvetted ("no promise about correctness"), managed by git PR via circuitctl.
  ~10 circuits; @DenisPopov15 (08-24) reads them as Longfellow variations
  (Google, ECDSA/mdoc-oriented). → **Draft B** below.
- **#12 (Scott's two biometric refinements)** — still zero comments. 08-18 draft §3
  survives with voice fix. → **Draft C** below.
- **Substrate self-reply (08-18 draft §2)** — still unposted, still accurate, still
  relevant: items 5/6 of #13 are now IN FLIGHT as PR #16's agility/PQ sections.
  → **Draft D** below (retargeted, lightly edited).
- #11 (sampling) — no activity since 08-02. #10, #7, #9(Q&A), #8 — unchanged.
- mitchuski/dtgwg-zkp-mage — issue #1 still the only issue (open, standing position
  thread). No new external runs.

### trustoverip/dtgwg-cred-spec (per the mid-session ask)

No Discussions tab; the action is in Issues/PRs. **stormer78 = Glenn Gore** (same
person as registry entry 0006) has run a full implementation
(`OpenVTC/verifiable-trust-infrastructure`) against the spec and filed a numbered
decision agenda (D1–D18, conformance review at
docs.fpp.storm.ws/dtg-conformance-infographic.html):

- **#21** (08-23, 3 comments, all Glenn) — glossary VRC edge-verifiability conditions
  contradict the body. Four questions D1–D4; **D2 is marked BLOCKING**: *does a VRC
  carrying R-DIDs, presented with a community-anchored ZKP, satisfy VTN-level edge
  verifiability?* Their PR #1061 (+#1073, #1074) shipped assuming YES — three changes
  deep. This is a question addressed to the ZKP side. → **Draft E** (highest value).
- **#9** (Sankarshan, 07-30) — identity linkages required by the ZKP constructions
  (P-DID↔R-DID, R-DID↔M-DID) are not encoded in the credential model. Scott replied
  08-06 for the ZKP side and said "**Mitchell may add construction-level detail**" —
  that invitation is still open. → **Draft F**.
- **#22** (Glenn) — replace four VID types with one declared correlation scope
  (D5 blocking for them, D6). Vocabulary proposal for WD02; primarily editors' call.
  ZK-adjacent but no draft — support verbally if asked.
- **#23** (Glenn, 08-24) — asymmetric edge: halves may declare different scopes;
  missing rule "effective disclosure = max of the halves; declared scope binds only
  its own holder." → **Draft G** (short, optional).
- **#24** (Glenn, 08-24) — edge verifiability across different VTNs / no VTN; proposes
  defining verifiability **per verifier** (what is checkable), not per registry.
  → **Draft H** (short).
- **#25** (Glenn, 08-24) — relationship policy discovery: both communities must admit
  an edge, neither can learn the other's policy pre-publish. Proposes discoverable
  admissibility predicates on the community profile. → **Draft I** (short).
- #11/PR #15 (trust-task normative dependency), PR #18 (taskContext binding),
  PR #19 (VDC), PR #20 (did:webvh) — watched, no draft; PR #18/#19 touch trust-task
  and delegation territory but the editors own them.

### RELEVANCE RE-CHECK 2026-08-24 (after "the patch is sorted" notification)

Verified against live PR #16 state (open, NOT merged; upstream doc still v0.3):
the notification = Sankarshan's 08-24 01:29 UTC comment attaching a **focused
patch** of post-graduation semantic changes. Scott's merge gate (dead links +
front-matter) still standing. Confirmed: dcondrey = "David" per Sankarshan's 08-20
comment; the 08-20 revision absorbed his point as Draft A states. Draft-by-draft:
**A, D, J survive verbatim** ("under review / in flight / while open" all still
true); **E, B, C, H, I, G untouched**; **F strengthened** (convergence note added —
the patch names "provable relationship interfaces that avoid durable cross-context
correlators", F's exact class); **K added** (the new live decision: merge scope).

### MERGE UPDATE 2026-08-24 18:25 UTC — v0.4 IS UPSTREAM

Scott merged PR #16 (`3b6b3f2`): upstream `proof-of-liveness-requirements.md` = **v0.4,
"Proposed Task Force Working Draft"**. Merge contains only the commits through 08-20
(v0.4 + independence clarification + `b0460be` "make upstream v0.4 references
self-contained") — the 08-24 focused patch was NOT folded in, and the dead-links
question was solved by making references self-contained. **Both open items resolved
exactly as Draft K argued → K retired unposted** (ledger entry 5 finalized false,
the ledger's first death) **→ replaced by K′**: short #13 comment marking the merge
+ routing the focused patch to a v0.5-cycle thread. A/D/J tense-corrected from
"under review / in flight" to "merged today"; E/B/C/F/H/I/G unaffected. #13 has no
post-merge comment yet — K′ fills that gap. "Review PR #16" action is now moot.

### TRIM PASS 2026-08-25 (voice rule: fold posts short, working record separate)

E, B and J were folded to ~60% length in the VIEWER — **the viewer cards are now
the canonical posting text**; the E/B/J sections below retain the long working
forms (every claim survived the trim, nothing was dropped, only compressed).
Left long deliberately: D (a detail note by design) and F (the invited
construction detail). A, C, H, I, G were already short.

### K′ DEMOTED 2026-08-25 (Mitch's call: skip admin where understanding exists)

K′ rewritten to two plain sentences and marked OPTIONAL. Post only if #13 stays
quiet and nobody routes the attached patch; if Scott announces/routes it or the
next call handles it, skip and finalize ledger entry 15 as retired (like entry 5).

### Posting order recommendation

1. **E** (#21 — unblocks Glenn's D2, three shipped changes riding on it)
2. **A** (#13 — dcondrey is new and unanswered; welcome + ratify + place the boundary)
3. **B** (#17 — fresh thread, catalog↔registry bridge)
4. **F** (#9 — the standing invitation)
5. **D** (#13 comment — substrate input to merged v0.4's agility/PQ sections)
6. **C** (#12), then **H**, **I**, **G** as time allows (or verbally on the next call);
   **K′** only if #13 stays quiet and the patch stays unrouted; **J** = new thread, last.

Mechanics: GitHub Discussions = paste via browser (no REST posting). Cred-spec
issues could ride the authorized API flow with a process note, but upstream-repo
precedent is browser-paste by Mitch; recommend paste.

---

## DRAFT A — zkp-tf discussion #13, reply to @dcondrey

The proposed sentence — "independence requirements bound collusion risk across
attesters; they don't bound the risk of any single attester's dishonesty" — is
correct, and worth adopting close to verbatim. It is the draft's own assurance
boundary ("cryptography proves attestation properties, not that the biometric
determination was correct") applied to item 9, and stating it at the point of use
is better than relying on the boundary section to be remembered.

For the record of where it lands: the v0.4 PR picked up this distinction in its
2026-08-20 revision, so the thread's concern is reflected in the text under review.

One note from the executable side, because the reference implementation already
behaves exactly this way: in the multi-issuer model the aggregate bound is
conditional on *declared* independence (the assumptions are explicit inputs, not
conclusions), and each issuer's error rate ε_i enters as a certified claim from the
registry — the proof consumes it, it never establishes it. A dishonest attester is
an ε_i failure: out of scope for soundness, in scope for accreditation. k-of-n
across issuers spreads exposure to a single dishonest attester only under a declared
honest-majority assumption — it is risk distribution under stated assumptions, not a
soundness repair. Independence classes prevent double-counting of evidence; they do
not detect dishonesty. That is the same sentence, seen from the code.

---

## DRAFT B — zkp-tf discussion #17 (SIROS catalog)

Position: build. The catalog and the task-force lab's verification registry are
complementary halves of one evidence problem, and neither replaces the other.

The catalog records **provenance**: content-addressed artifacts (the sha256 is the
URL), origin repo/PR/commit, toolchain, licence — and it honestly declines to claim
correctness. The registry records the other half, **independent reproduction**:
whether a second party on different hardware rebuilds the same required digests and
gets the same behavioral results (its first fully external run reproduced the
maintainer digests byte-identically across win32/x64 ↔ darwin/arm64:
https://mitchuski.github.io/dtgwg-zkp-mage/). Provenance says where an artifact came
from; reproduction says a stranger can remake it. A catalog entry could carry a
reproduction-evidence field, and a registry row could pin content-addressed
artifacts — both are small JSON changes, and the pairing would be stronger than
either alone.

One empirical caution on content-addressing scope, from the lab's own measurements:
compiler outputs (r1cs/wasm) reproduce byte-identically across rebuilds and
architectures, but proving-setup artifacts diverge on every rebuild — the toolchain
mixes fresh CSPRNG entropy into each contribution. For those files a content hash
pins *what was published* but cannot certify *how it was made*; that class needs
ceremony/acceptance semantics, not just an address. Worth flagging which class each
catalog entry's files fall into.

Recorded-commit provenance also addresses a real drift class: at least one widely
used circuit package is "audited" at a 2024 commit while the npm release ships a
different interface. A catalog that pins exact commits makes that failure visible.

**INTEGRATION NOTE (2026-08-25, not for the thread): catalog+registry = PVM
certification-clock inputs.** X6's clock families split certification (set-bound,
dated) from erosion (accumulation); the certification clocks lacked a measured
basis. Catalog provenance (built-when, from-commit, audited-at-commit) + registry
rows (reproduced-when/by-whom/on-what) = dated certification events — assurance
horizons become a data series instead of an assertion. Route: X6/erosion-record
ladder + INTEGRATION-MAP, Mitch's model frame, not TF-thread material.

On the Longfellow reading from @DenisPopov15: if so, the scope note for this group
is that Longfellow-style circuits prove statements over credentials *as already
signed* on existing ECDSA/mdoc rails — no issuer-side changes — while this task
force's predicates sit at the opposite design point, where issuers can choose their
commitment scheme. Both belong in the construction-selection gate as declared
substrate/scope inputs rather than competitors.

---

## DRAFT C — zkp-tf discussion #12 (was 08-18 §3, voice-fixed)

Accepting both refinements; both are the missing half of work already on the bench.

**1 (enrolment dedup carries the teeth): yes to the write-up.** The narrowing being
ratified — scoped reuse detection, not "one unique human" — was written precisely to
leave room for this: the math gives same-secret-same-nullifier, and everything
between "one human" and "one secret" is enrolment governance. The open
enrolment-root discussion (whether the enrolment root belongs in the nullifier
preimage) has been missing exactly this biometric-provider grounding — FMR/FNMR,
re-enrolment resistance, capture conditions. The write-up would give that decision
its evidence base.

**2 (biometric dependency axis): agreed, and it is a small executable change.** The
multi-issuer independence register already models correlated issuers collapsing to
one component over declared dependency classes, and the classes are deliberately
open-ended. Adding `sharedModel` / `sharedVendor` / `sharedEnrolmentData` as
first-class classes is a few lines plus a test asserting that two legally separate
issuers sharing a model collapse to one component. Staging that now, so deployment
knowledge can populate the taxonomy rather than argue for its existence.

---

## DRAFT D — substrate note (post as #13 self-contained comment; cite PR #16 §§ agility/PQ)

**Input to the agility and post-quantum sections now in flight in PR #16: the
proof-system substrate has become a selection variable.**

On 13 August the Ethereum Foundation announced (via Justin Drake) a pivot in its L1
roadmap away from SNARK-friendly hashes toward hash-friendly SNARKs — binary-field
constructions (Binius, 2023) and batch-proving techniques (Flock — Bünz, Rothblum,
Wang, arXiv, 29 July 2026) that make standard hashes cheap to prove by bending the
field to fit the hash rather than the hash to fit the field. Flock's published
single-core M4 Max numbers: 82k BLAKE3 / 42k SHA-256 compressions and 30k Keccak
permutations proven per second.

Two caveats first, for the register: **there is no break** — no cryptanalytic result
against Poseidon was reported, and existing deployments are not required to change;
and the decision **binds Ethereum's L1 roadmap only**. This is a strategic retreat
from an assumption, not a cryptanalytic event.

Why it belongs in the two sections:

**Construction selection.** The selection process has implicitly treated the
proof-system substrate as settled background. Prime field versus binary field is now
a live selection axis: any candidate leaning on Poseidon commitments or
Poseidon-derived nullifiers carries a visible strategic horizon even though nothing
is broken today. The honest framing: cryptanalytic maturity of the hash and
longevity of the surrounding proof-system ecosystem are separate risks, and only the
second one moved. Candidates evaluated under the gate should declare their substrate
and their migration story. This also re-grounds the lab benchmarks correctly:
Groth16/BN254 numbers are era-specific measurements of the problem's shape; the
structural findings (e.g. transcript binding costing exactly one constraint) should
port across substrates, the absolute constraint counts will not.

**Post-quantum and horizon.** Direct real-world support for the migration-trigger
language: a migration trigger firing *strategically rather than cryptanalytically*,
at ecosystem scale, with no break anywhere. Hash-based cryptography under minimal
assumptions is the conservative answer to harvest-now-reconstruct-later, and
institutional weight now sits behind it. For this group the transfer is stronger
than for payments: personhood credentials and nullifiers are long-lived by design,
so they inherit harvest-now exposure at full strength. The agility-mandatory posture
in the draft is exactly right; this is the citation for why.

---

## DRAFT E — cred-spec issue #21 (answers D2, the blocking question) ⭐ POST FIRST

Answering question 2 from the ZKP task-force side, since it is the one marked
blocking and it is a construction question. Questions 1, 3 and 4 are editorial calls
this comment deliberately leaves to the editors.

**Q2 — does a VRC carrying R-DIDs, presented with a community-anchored ZKP, satisfy
VTN-level edge verifiability? Intent: yes.** The community-anchored construction
proves precisely the predicate that glossary conditions (c) and (d) express by
disclosure — that the credential's issuer holds a VMC from a VTC recognised in the
relevant anchor set — without revealing the DIDs. If a valid community-anchored
proof did not confer edge verifiability, the construction would have no purpose. So
the reading in this issue matches the ZKP side's reading: an R-DID edge with a valid
community-anchored proof is a first-class DTG edge, and condition (a) is a
bootstrapping-era artifact.

**The honest qualifier, and it is exactly #9:** the linkage the construction relies
on — that the controller of the VRC's R-DID is the same party as the VMC's M-DID —
is not yet encoded by the credential model. Until those linkages are defined, the
accurate status is *intended design goal, satisfiable once #9 lands*, and the ZKP
task force's stated preference is that they land as hidden in-proof witness
relations rather than disclosed fields, precisely to avoid rebuilding by disclosure
the correlation surface the glossary's conditions create.

Practical note for the three-changes-deep implementation: building on "yes" matches
the construction's intent. The exposure to watch is not whether an R-DID edge
counts; it is how the #9 linkage encoding resolves, because that determines what
witness data the proof consumes.

This also bears on #24's proposal: defining edge verifiability per verifier, in
terms of what must be checkable, is the definition a zero-knowledge presentation can
actually satisfy — "recognised in that VTN" becomes "the anchor set the verifier
accepts", which is how reference circuits already phrase it (the accepted anchor
root is a public input to the statement). The task-force lab keeps an executable
model of exactly this admissibility rule — edges admitted on proof rather than
disclosure, personhood-gated, R-DID-unique — at
https://github.com/mitchuski/dtgwg-zkp-mage (path P10) for anyone who wants to test
a reading against behavior rather than prose.

---

## DRAFT F — cred-spec issue #9 (the invited construction-level detail)

Adding the construction-level detail to the ZKP-side position above. The two
missing linkages are, in proof terms, the same predicate instantiated twice:
*co-control* — two identifiers whose keys derive from one holder secret.

- **P-DID ↔ R-DID**: witness = the holder secret from which both keys derive
  (hierarchical derivation), proven in zero knowledge as a key-derivation relation.
  No credential field needed; the VPC's role is to bind the persona claim to that
  secret, not to name the R-DID.
- **R-DID ↔ M-DID**: same relation, with the additional condition that the M-DID's
  enrolment is the personhood-anchored one (the nullifier-bearing enrolment), which
  is what makes the community-anchored proof mean what it claims.

Three consequences worth encoding as requirements rather than assumptions:

1. The spec should state the linkage as a requirement — "these identifiers MUST be
   provably co-controlled in zero knowledge" — and deliberately NOT add a visible
   field. A disclosed association is a correlator; a witness relation is not.
2. The witness never crosses the wire, and each presentation proves co-control fresh
   under a per-context transcript, so no cross-context correlation handle is minted
   by the linkage itself. (Transcript binding is cheap: measured at exactly one
   constraint in the lab's reference circuit.)
3. The decision that must precede ratification is whether the key-derivation scheme
   is normative, because it determines what witness data exists for provers to use.
   That decision is upstream of both constructions and is carried as a named
   dependency in the ZKP TF's construction-selection gate.

Offer: the lab can stage an executable model of both linkages (derivation plus
co-control check) alongside the existing predicate references, so this discussion
can point at behavior rather than prose. A short cross-TF sync on where each linkage
lives still stands as proposed.

One convergence note: the focused patch attached to the ZKP TF's v0.4 PR on
2026-08-24 names this same class from the requirements side — "provable
relationship interfaces that avoid durable cross-context correlators" — so the two
documents are arriving at the witness-relation answer independently, which is
usually the sign it is the right one.

---

## DRAFT K — zkp-tf PR #16 comment: co-chair position on merge scope (NEW 08-24)

Triggered by Sankarshan's 08-24 01:29 UTC comment ("the patch is sorted"): a
focused patch of post-graduation semantic changes attached to the still-open PR.
Settles Scott's two open items; keeps the merge at ratified scope. **RE-CHECK
BEFORE POSTING** — if Scott has already merged or ruled on scope, this dies like
the old #13 §1 did. Full text in viewer card 2b:

- Links: mark implementation-guide refs forthcoming, migrate next (not fork links).
- Focused patch: OUT of this PR — the group graduated the reviewed v0.4;
  silence-is-assent never covered the new text. Quality ≠ process: the additions
  (evidence closure, composed-presentation privacy, provable relationship
  interfaces, confidential binders, external-resolution privacy) = strong v0.5
  candidate set, several converge with bench work (X3 composition, O4 registry,
  F's co-control witness relations) → #13-style thread next cycle.
- Then merge and announce as planned.

---

## DRAFT G — cred-spec issue #23 (short, optional)

Supporting the proposed rule from the ZKP side, with one reframing that may help it
land: *declared scope governs what a holder emits; effective disclosure is a
property of the edge, computed over every place either half is published.* In the
task force's observer model, a counterparty's published half is simply another
observer surface — and privacy properties are always evaluated against observers,
not against intentions. The max-of-halves sentence is the edge-level corollary and
is worth stating as a Privacy Consideration regardless of how #22 resolves. It also
generalises: it holds for any composition, not only two-party edges — joint
disclosure of a set of presentations can exceed the union of the parts, which is why
the composition case deserves its own consideration text.

---

## DRAFT H — cred-spec issue #24 (short)

Supporting the proposed answer — define edge verifiability per verifier, in terms of
what must be checkable — from the construction side: that is the only definition a
zero-knowledge presentation can satisfy, because a ZK proof is verifier-relative by
construction. The statement being proven binds the anchor set the verifier accepts
(a root as public input), not a registry membership fact the verifier cannot
observe. Under that definition the three unanswered cases resolve naturally:
different VTNs = the verifier chooses which anchor set(s) it accepts, and proving
against multiple roots is buildable (k-of-n across issuers exists as a reference
construction in the task-force lab); deliberately unanchored = verifiable exactly as
far as the verifier's accepted anchors reach, stated rather than silent; external
verifier = the definition's home case. "Recognition" then becomes an input the
verifier declares, not a property the network confers.

---

## DRAFT I — cred-spec issue #25 (short)

The proposed answer (discoverable admissibility predicates on the community profile)
is the right first step, and the requested properties — say what forms are accepted
without revealing membership — are achievable with plain published fields; no proof
machinery needed for step one. Two notes for the record:

1. Question 3 (ordering so neither party discloses before admissibility is known)
   is a commit-before-reveal handshake shape: exchange commitments to the halves,
   check admissibility, then publish. Worth stating as an intended ordering even if
   the mechanism stays out of scope.
2. There is a stronger form the ZKP task force can carry as future work: proving
   "my half would be admissible under the counterparty's policy" without revealing
   the policy or the member — mutual admissibility as a zero-knowledge predicate.
   That belongs with the registry-ZK interaction the credentials spec already defers
   to the ZKP layer; filing it there so this issue can close on the cheap fix.

---

## DRAFT J — zkp-tf NEW DISCUSSION: zk-kit tooling evaluation (from NOTE-2026-08-19)

Suggested title: **"Tooling note: zk-kit — cite, lint, track; keep it out of the
include path."** Category: General. Pairs with Draft B (#17 carries one anonymized
sentence of finding 1); the §16.1 audit-scope proposal is timely while PR #16 is
open. Full post text lives in the viewer (card 10) — summary of contents:

1. Naming collision recorded: zk-kit (PSE-descended monorepo, evaluated) vs
   dl-solarity/zkit (Hardhat plugin, vendor-fork compilers — would have broken
   cross-arch digest identity).
2. Three verified findings: audited-commit ≠ shipped-npm interface
   (binary-merkle-root `215dfb3` vs 2.0.0); MultiMux1 selector booleanity left to
   callers (lab reference is stricter); audit finding resolved by a comment.
3. Verdict: cite/lint/track, not in the include path.
4. Cheap wins: Circomspect into acceptance gates; §16.1 audit-scope language
   ("audited MUST name the reviewed commit and file set"); zk-kit.noir as the
   agility exemplar.
5. IPR flag: circomlib GPL-3.0 (npm metadata/headers) vs LGPL-3.0 (repo LICENSE) —
   flag on current practice, lab depends on it for Poseidon.
6. Honest open measurement: tree-swap compile not yet run; ordering constraint —
   tree swap before the enrolment-root-in-preimage decision or it is
   nullifier-breaking.

## G.1 RITE — PROVERBS SERVED 2026-08-24 (extended from pushes to upstream posts)

**Definition (as shown in the viewer sidebar, privacymage voice).** The smallest
trust task I know. When an agent prepares a publication under my name — a push, a
post — it writes one fresh line at the moment of the act, naming what that act
*means*. Never stock, never reused: a spell is spent in the casting. Pressing
*Activated* is not a consent click; it is my crossing of the Gap — proof that I
read what the runtime wrote and understood what is about to travel under my name.
The agent operates; it never decides. The shape is deliberate — fresh challenge,
live response, bound to the act — the same PR-LIV shape the task force is
specifying, worked first on the maintainer's own seat. Instituted 2026-08-14 as
gate G.1 of the registry acceptance flow. Speech after proof.

One fresh proverb per post, naming what the act means; activation in the hosted
viewer = proof of understanding, opens that post's copy gate. On the record here:

| Draft | Proverb |
|---|---|
| E (#21 D2) | "Three doors were built on a yes not yet spoken; say it where the builder can hear." |
| A (#13 dcondrey) | "Witnesses who cannot collude may still each lie; keep the two dangers counted apart." |
| B (#17 SIROS) | "Where a thing came from and whether a stranger can remake it are different truths; let neither stand in for the other." |
| F (#9 linkages) | "One secret may hold two names in the dark; write the duty to prove it, never the link that shows it." |
| D (substrate) | "The ground moved though nothing broke; record the moving before the breaking." |
| C (#12 refinements) | "The teeth are kept at enrolment; the mathematics only counts what enrolment lets through." |
| H (#24 per-verifier) | "An edge is verifiable in the eye that checks it, not in the ledger that lists its makers." |
| I (#25 discovery) | "State what you would refuse before another must disclose to learn it." |
| G (#23 max-of-halves) | "One half kept dark is spent by the other half shining; measure the edge, not the intention." |
| J (zk-kit thread) | "The seal binds the stone that was read, not the stone that ships." |
| K (PR #16 scope) | "Merge the promise as it was made; let what grew since ask at its own gate." |

Viewer hosted locally (127.0.0.1 only; port in session notes). Activation state =
browser localStorage, not this file; this table is the served-record.

## MITCH ACTIONS BEYOND POSTS

- **PR #16 review/approve** as co-chair (Scott merges after dead-links + front-matter;
  Sankarshan pushed again 08-24 — a fresh read of the 08-24 delta is worth it before
  approving).
- Chronicles staged 08-18 still awaiting push + G.1 rite (unchanged).
- ~~If Draft C posts, stage the X8 change after~~ **DONE 08-25, order flipped**:
  biometric classes (`model:`/`vendor:`/`enrolment-data:`) + X8-B1..B4 tests built
  in BOTH copies of runtimes/multi-issuer (14/14, was 10/10; workbench mirrored).
  **Push the multi-issuer change BEFORE posting C** (its rite = natural carrier for
  the FIRST proverb-ledger head anchor in the commit message).
