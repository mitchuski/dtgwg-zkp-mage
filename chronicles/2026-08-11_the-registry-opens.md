# 2026-08-11 · The Registry Opens

> **Provenance.** A chronicle — the narrative working record kept alongside the lab, reflected
> into this repo so collaborators can follow the arc with the runtime traces beside it. Voice:
> framework (master series). The maintainer’s master copy is the source of truth; this copy is
> adapted only in this header and in paths (home-directory references translated to repo-relative
> where the artefact lives here). Signed by the First Person: not yet.
>
> **Runtime traces:**
> - `explorations/X10-ceremony-as-trust-task.md` — the design note; `runtimes/ceremony-orchestrator/` → `node test.mjs` 8/8
> - `CIRCUITS.md` — carries the determinism correction this chronicle records
> - registry entries `0000`–`0003` at [the live registry](https://mitchuski.github.io/dtgwg-zkp-mage/)

*A question asked sideways — "could our agents be submitted as entropy to the circuits?" — got the
only answer that survives contact with a log file: agents orchestrate entropy; they are never the
entropy. By midnight the answer was a design note, a runtime, a public site, two pushed commits, a
refuted claim, and a stranger-shaped seat with no name on it.*

**Scope:** the DTG ZKP TF call companion (2026-08-11), exploration X10
(`explorations/X10-ceremony-as-trust-task.md`), the lab's 18th suite
(`runtimes/ceremony-orchestrator/`, 8/8), and the verification registry now public at
[mitchuski.github.io/dtgwg-zkp-mage](https://mitchuski.github.io/dtgwg-zkp-mage/) (commits `7681990`
→ `1ff3183`). Continues the 2026-07-16 dream-cycle, 2026-07-18 first-circuit, and 2026-07-28
thread-returns chronicles. Lab now **18 suites / 178 properties, all green**.

---

## 1. The question, and the reframing

Call day. The companion for the root-paper runthrough was rebuilt and re-verified in the morning —
every suite re-run, every number checked against its source. Then the sideways question: the working
group's agent runtimes, submitted as *entropy* to the circuits' trusted setup?

The reframing that became X10: a ceremony's security never needed good randomness from anyone — it
needs one honest participant who destroys their toxic waste. And an agent is the worst possible
custodian of a secret, because everything an agent generates or observes lands in a context window,
and context windows are logged, retained, replayed. A beacon value that transits an agent's
transcript is a compromised contribution *by construction*. So the rule, fixed before any building:
**agents orchestrate entropy; they are never the entropy** — randomness from the machine's own
CSPRNG inside the contribution subprocess, and the orchestrator's whole lifetime view scanned to
prove the secret's bytes appear nowhere. The witness seat's oldest discipline — attest, never mint —
one level up.

Three lanes, sequenced by risk: a verification registry now (no secrets exist in it at all); a
universal phase-1 powers-of-tau when the group wants ceremony work (useful whichever way
construction selection goes); per-circuit phase-2 *structurally* gated behind §25 — not policy but
code: the endpoint throws `phase2-gate-closed`, and a property test asserts no contribution path can
be constructed in the suite.

## 2. The registry's first finding was against its own maker

Lane 1 needed a byte-exact acceptance test, and building it forced the question the setup script had
been hedging in a subordinate clause. A full fresh rebuild on the same machine, same lockfile, same
fixed entropy string: the compiled circuits came back byte-identical — and the entire setup chain
did not. snarkjs mixes its own randomness into every contribution no matter what entropy you hand
it, which is correct ceremony hygiene on its part and a refutation of the lab's own published claim
that "any two machines build byte-identical artifacts."

So the claim died before the registry went public, killed by the machinery built to test it. The
acceptance model shipped honest: circuit digests **required**, setup-chain digests **advisory**,
the proving-system evidence carried by the volunteer's own suites running green. CIRCUITS.md and the
call companion were corrected the same hour. The loop's whole purpose is that this happens *before*
anything ships — this time the loop ate its own author first, which is the loop working exactly.

## 3. Public within the hour, and the first stranger was the maker's own machine

Push. Pages. The registry live with the maintainer's reference run and a timestamped live entry. Then
the real test: a cold clone of the *published* repo, played as a first volunteer — which failed in
under a minute, because `build/` is gitignored and the compiler refuses to invent its own output
path. A bug no workbench run could ever find, found by the first cold path through the public door.
Fixed, pushed, re-cloned, re-run: verdict **ACCEPT**, circuit digests matching, twelve advisory
divergences recorded by name — the corrected model demonstrating itself on its first customer.

## 4. The seat with no name

Then the last question of the night: could a run post as *anonymous*? The honest version of that
question is this project's thesis in miniature: **admission and identity are separable.** A seat was
minted — `seat-7f`, "Pseudonymous seat · admission-gated · name withheld" — passed the same gate,
ran the same suites, filed the same digest-checked record, and sits on the public registry with a
note stating plainly that it ran on maintainer hardware as a demonstration, not as independent
verification. Personhood-without-identity, enacted on the trust artifact itself.

And the demonstration surfaced a real boundary question for the register: the run record's
informative fields — CPU model, OS — are a quiet correlator. Anyone comparing rows can see the
nameless seat's hardware matches the maintainer's. The observable-event-minimisation discipline
(X4, §19) applies to the registry's own records: a genuinely pseudonymous seat profile would coarsen
or omit platform fields, traded against their diagnostic value. Filed as an X10 open question.

## 5. The post

A show-and-tell discussion was drafted for the upstream repo, saying the quiet part plainly: the lab
is **the spec's test suite being written first, in public, while it's still cheap to be wrong** —
fixtures that graduate into the conformance suite, reference constructions that carry the measured
numbers construction selection is waiting for, a registry that rehearses how implementers will one
day verify against the spec itself. Posting is the co-chair's own act, under his own name, per the
position protocol. The registry announcement for the ratification thread links back to it.

## Why this is interesting

- **The ceremony was always a trust task.** A trusted-setup contribution is an act performed under a
  transcript, producing an attestation whose accountability lives in governance while the
  cryptography carries only the chain. The framework didn't need a new concept — the ceremony needed
  the framework's oldest one.
- **The refutation is the credential.** A registry that opened by falsifying its own maker's claim
  has demonstrated the only property that makes registries worth reading.
- **Negative results arrived on schedule.** Cold-clone bug: minutes. Determinism overclaim: hours
  before publication instead of months after. The economics of being wrong early, measured twice in
  one day.
- **The nameless seat is the thesis.** One row on one table shows admission without identity — and
  immediately shows the next leak (platform fingerprints), which is how boundary work is supposed to
  feel: every answered question invoices the next one.

*Uncommitted, as ever — the First Person's read comes first.*
