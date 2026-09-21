# AS · general #25 (reply) — a VMC issued to an agent node is membership, not agenthood; the six properties it leaves open are records 020 and 021, one disclosure at a time
chip: Q RE-TARGETED · SIX WEEKS QUIET · SHORT
thread: https://github.com/trustoverip/dtgwg-general/discussions/25
note: martipos asked (8 Jul) whether agenthood is conferred like personhood, by a VMC to an agent node; sankarshan (6 Aug) said no — membership only — and listed six properties a VMC does not establish (control, accountability, autonomy, for whom, capabilities, bounded authority). This agrees and says where each of the six is proven. Q (the agents-only VTC standing update) stays held as its own thread.
ledger: 57
proverb: Membership says the door opened; it does not say who walked through, or on whose errand.
---
Agreeing with the answer upthread, from the proof side: a VMC whose subject is an agent node establishes that the community admitted that node under its rules — membership — and nothing about agenthood, exactly as a VMC to a person establishes membership and not personhood (the ZKP draft's records 002 and 010 carry that as negative space: uniqueness and personhood are never inferred from a membership).

The six properties listed as *not* established are not lost; they are what two other records prove, each disclosed only when a verifier's policy asks for it. *Who the agent acts for, and who is accountable* — a delegation chain (record 020, over the VDC): the agent holds a valid, unrevoked delegation from a member, scopes nested, depth bounded, the root a member of the registry, without disclosing the chain. *What the agent may do, and within what bounds* — an authority chain (record 021, over the VAC): the agent acts as itself under attenuated authority, each link narrowing its parent, none revoked, the root issued by the party governing the scope. *Whether it acts autonomously* is then a disclosed public input of the enclosing proof (`nodeType`, and the authority's `actions`), never something the membership implies.

So the answer to the question as asked is: no — and the model does not need it to be yes, because the properties agenthood would bundle are each provable on their own from the credentials the specification already defines. Records in the [working draft on `main`](https://trustoverip.github.io/dtgwg-zkp-spec/); nothing adopted.

*membership says the door opened; it does not say who walked through, or on whose errand.*

⚔️⊥⿻⊥🧙
