# Agentic gate posting — experimental reference workflow

A snapshot of the contributor reader used on 8 September 2026. The task-force contribution is maintained in https://github.com/trustoverip/dtgwg-zkp-tf/pull/22; this example supports implementation experiments, not a second specification.

From reader/, run `node build.cjs` and `node work/serve-readers.cjs`. Open http://127.0.0.1:8430/ after stopping any other server using that port.

The principal reads the proposed text and destination alongside a proverb, makes edits, and acknowledges the exact revision. The reader exports the body, destination, provenance and review in an MCP handoff. Changes invalidate prior approval. An authorized agent checks the revision and live destination, performs the agreed action and separately verifies its remote URL and content.

The proverb is a human review practice, not authentication. Reading aloud can be part of that practice; this implementation records a click and does not verify speech. The SHA-256 revision detects content changes; unsigned browser receipts do not independently prove identity or consent. Posting is performed by an authorized agent through an authenticated tool or CLI, not by an embedded GitHub connector in this HTML.

For future VTAs, the useful research direction is a signed, scoped authorization over the artifact digest, destination, action and expiry, with replay protection and verified execution receipts. This needs an explicit threat model and implementation; this example does not claim those properties.

No private approval receipts or credentials are included. Public draft snapshots reflect preparation-time state and are not live publication status.
