// X6 B3 — worked example: PR-UNQ, erosion-aware.
//
// Extends the decision doc's Appendix B compact boundary-record for PR-UNQ.
// The certification cliffs are Appendix B's own (epoch 30 days, enrolment-root
// cryptoperiod 2 years, nullifier retention 35 days). The erosion side names
// what Appendix B could not yet say: the nullifier's within-context pseudonym
// (§13.5) is the cleanest accumulating observable — every accepted show adds
// one stable pseudonymous point to the verifier-side corpus B_t — plus the
// registry-query pattern and schema-variant rarity from the §19 surface list.
//
// The horizon basis is 'declared': the 2-year figure restates Appendix B's
// assurance_horizon as a governance declaration, not a measurement of
// H(X | B_t) — which is exactly the quantity nobody can measure in deployment.

export const PR_UNQ_EROSION_RECORD = {
  boundary_id: 'AB-PR-UNQ-001-EROSION',
  predicate: 'PR-UNQ',
  profile: 'extended-personhood-v1',
  statement_established:
    'The same enrolled secret cannot produce two accepted actions in the ' +
    'declared context, scope, purpose, and epoch without producing the same ' +
    'nullifier.',
  negative_meaning: [
    'does not establish one natural person globally',
    'does not establish one enrolment across issuers',
    'does not establish non-transfer of the enrolled secret',
  ],
  against_whom: [
    'honest-but-curious verifier',
    'colluding verifiers across distinct contexts',
    'issuer and verifier collusion, subject to declared issuer-data limits',
  ],
  for_how_long: {
    certification: {
      cliffs: {
        epoch: '30 days',
        enrolment_root_cryptoperiod: '2 years',
        nullifier_retention: '35 days',
      },
    },
    erosion: [
      {
        clock: 'log-retention',
        accumulatingObservables: [
          'within-context pseudonym: the stable nullifier value each accepted show contributes (§13.5)',
          'registry-query pattern: status and registry lookups correlated with presentation timing (§19)',
          'schema-variant rarity: derived values and rarity of the attestation shape presented (§19)',
        ],
        monitoringSignal:
          'nullifier-set-size × presentation-frequency proxy (per context, per epoch)',
        estimatedHorizon: { value: '2 years', basis: 'declared' },
        rebaseTrigger:
          'epoch rollover (§5.8) / re-enrolment under §22.3 migration',
      },
    ],
  },
  alongside_what: [
    'attestation schema v1',
    'canonical transcript v1',
    'registry snapshot no older than 24 hours',
    'no stable external account identifier shared across contexts',
  ],
  accountable_parties: {
    enrolment_correctness: 'issuer',
    context_definition: 'context authority',
    nullifier_state: 'verifier-set operator',
    cryptographic_correctness: 'proof implementation',
    erosion_monitoring: 'verifier-set operator',
    rebase_execution: 'context authority (§23 matrix — migration/re-enrolment trigger)',
  },
  redress: [
    'duplicate-decision challenge endpoint',
    'issuer re-evaluation',
    'verifier state correction',
    'appeal to context authority',
  ],
};

// Print the canonical form when run directly.
import { pathToFileURL } from 'node:url';
if (
  process.argv[1] &&
  import.meta.url === pathToFileURL(process.argv[1]).href
) {
  const { serializeRecord } = await import('./record.mjs');
  console.log(serializeRecord(PR_UNQ_EROSION_RECORD));
}
