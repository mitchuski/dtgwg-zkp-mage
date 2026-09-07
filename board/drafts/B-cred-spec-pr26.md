# B · cred-spec PR #26 — co-chair review (edge verifiability, verifier-relative)
chip: RETIRED — precision lives in card 010
thread: https://github.com/trustoverip/dtgwg-cred-spec/pull/26
note: Glenn wrote the text from the Q2 answer + albertoleon's two checkers. No reviews yet. Approve; one precision on "anchor set".
ledger: 18
proverb: An edge is verifiable in the eye that checks it; name the state that eye was given to check against.
---
Co-chair read from the ZKP side: the "with respect to a verifier" framing is the same definition the proof layer uses — a ZK proof is verifier-relative by construction (#24), so defining the property that way removes the last mismatch between the two layers. Accepting disclosure or proof equivalently in the anchor predicate is the intent (#21 Q2).

One precision worth a clause: "the issuer holds a VMC from a VTC in the anchor set" — for the proof route the anchor set is whatever the verifier can check independently (a published membership root or accumulator at a stated registry state), which is ADR-001 T2/C2. Naming that the set is *checked against a registry state the verifier recognises* keeps the text honest for both routes without choosing a mechanism.

Approve otherwise.
