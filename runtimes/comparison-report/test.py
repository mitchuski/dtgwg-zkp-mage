"""Synthetic arithmetic/metadata cases only; no circuits or performance runs."""

import copy
import json
import os
from pathlib import Path
import tempfile
import unittest

import check

HERE = Path(__file__).resolve().parent


class ReportCases(unittest.TestCase):
    def setUp(self):
        self.report = check.load_report(HERE / 'template.json')

    def reject(self, report, message):
        with self.assertRaisesRegex(ValueError, message):
            check.assess(report)

    def test_reusable_complete_costs(self):
        result = check.assess(self.report)
        self.assertEqual(result['cpuNs']['recompute'], [1100, 1100])
        self.assertEqual(result['cpuNs']['proofRoute'], [1050, 1050])
        self.assertEqual(result['cpuNs']['totalSaving'], [50, 50])
        self.assertEqual(result['status'], 'arithmetic-only-synthetic')

    def test_reader_win_is_not_total_win(self):
        self.report['costs']['P']['cpuNs'] = [1200, 1200]
        result = check.assess(self.report)
        self.assertEqual(result['readerSavingSign'], 'positive')
        self.assertEqual(result['cpuNs']['totalSaving'], [-250, -250])
        self.assertEqual(result['totalSavingSign'], 'negative')

    def test_recipient_bound_proof_cost_is_paid_per_reader(self):
        self.report['proofs'].update(binding='recipient-bound', count=10)
        self.assertEqual(check.assess(self.report)['cpuNs']['totalSaving'], [-8050, -8050])
        self.report['proofs']['count'] = 1
        self.reject(self.report, 'multiplicity')

    def test_reusable_proof_multiplicity_is_explicit(self):
        self.report['proofs']['count'] = 2
        self.reject(self.report, 'multiplicity')

    def test_margin_interval_includes_zero(self):
        for name, bounds in [('P', [800, 1000]), ('R', [90, 110]), ('V', [3, 7])]:
            self.report['costs'][name]['cpuNs'] = bounds
        result = check.assess(self.report)
        self.assertEqual(result['cpuNs']['totalSaving'], [-170, 270])
        self.assertEqual(result['totalSavingSign'], 'includes-zero')

    def test_exact_break_even_and_endpoint_touch(self):
        self.report['costs']['P']['cpuNs'] = [950, 950]
        self.assertEqual(check.assess(self.report)['totalSavingSign'], 'zero')
        self.report['costs']['P']['cpuNs'] = [949, 950]
        self.assertEqual(check.assess(self.report)['totalSavingSign'], 'includes-zero')

    def test_shared_g_cancels_once(self):
        self.report['costs']['G']['cpuNs'] = [100, 500]
        result = check.assess(self.report)
        self.assertEqual(result['cpuNs']['totalSaving'], [50, 50])
        self.assertEqual(result['cpuNs']['recompute'], [1100, 1500])
        self.assertEqual(result['cpuNs']['proofRoute'], [1050, 1450])

    def test_producer_timer_including_g_requires_reconciliation(self):
        self.report['proofs']['producerAccounting'] = 'includes-G'
        self.reject(self.report, 'exclude genuinely shared G')

    def test_elapsed_is_separate_from_cpu(self):
        before = check.assess(self.report)['cpuNs']
        for cost in self.report['costs'].values():
            cost['elapsedNs'] = [0, 1]
        self.assertEqual(check.assess(self.report)['cpuNs'], before)
        self.report['costs']['V']['cpuScope'] = 'elapsed-only'
        self.reject(self.report, 'CPU scope')

    def test_excluded_witness_is_disclosed_but_not_complete(self):
        self.report['informative']['evidenceKind'] = 'measured'
        self.report['costs']['P']['included'].remove('witness')
        self.report['costs']['P']['excluded']['witness'] = 'Not measured in this example.'
        result = check.assess(self.report)
        self.assertEqual(result['status'], 'incomplete-costs')
        self.assertEqual(result['excludedComponents'], ['P:witness'])
        del self.report['costs']['P']['excluded']['witness']
        self.reject(self.report, 'each required component')

    def test_privacy_mismatch_stays_computation_reference(self):
        self.report['informative']['evidenceKind'] = 'measured'
        self.report['pinned']['comparator'] = 'computation-reference-only'
        self.assertEqual(check.assess(self.report)['status'], 'computation-reference-only')

    def test_measured_status_is_only_a_declaration(self):
        self.report['informative']['evidenceKind'] = 'measured'
        result = check.assess(self.report)
        self.assertEqual(result['status'], 'declared-complete-comparison')
        self.assertIn('no confidence, privacy, security, measurement-validity or registry verdict', result['scope'])

    def test_configuration_mismatch_rejected(self):
        self.report['costs']['V']['configuration'] = 'different-security-or-host'
        self.reject(self.report, 'configurations differ')

    def test_missing_privacy_adversary_or_horizon_rejected(self):
        for key in ['adversary', 'horizon', 'doesNotEstablish']:
            with self.subTest(key=key):
                report = copy.deepcopy(self.report)
                del report['pinned'][key]
                self.reject(report, 'missing fields')

    def test_resource_metrics_not_summed(self):
        resource = copy.deepcopy(self.report['resources'][0])
        resource.update(metric='allocation-volume', bytes=10000, limitBytes=None, limitKind='none')
        self.report['resources'].append(resource)
        result = check.assess(self.report)
        self.assertEqual(len(result['resources']), 2)
        self.assertTrue(result['resources'][0]['belowDeclaredLimit'])
        self.assertIsNone(result['resources'][1]['belowDeclaredLimit'])
        self.report['resources'][1]['configuration'] = 'other-configuration'
        self.reject(self.report, 'resource and cost configurations differ')

    def test_memory_threshold_is_strict_and_scope_explicit(self):
        resource = self.report['resources'][0]
        for value, expected in [(255, True), (256, False), (257, False)]:
            resource['bytes'] = value
            self.assertEqual(check.assess(self.report)['resources'][0]['belowDeclaredLimit'], expected)
        resource.update(scopeComplete=False, limitKind='enforced')
        result = check.assess(self.report)['resources'][0]
        self.assertFalse(result['scopeComplete'])
        self.assertEqual(result['limitKind'], 'enforced')

    def test_duplicate_resource_scope_rejected(self):
        self.report['resources'].append(copy.deepcopy(self.report['resources'][0]))
        self.reject(self.report, 'duplicate resource scope')

    def test_unsafe_numbers_rejected(self):
        for value in [True, 1.0, -1, check.MAX_INTEGER + 1]:
            with self.subTest(value=value):
                report = copy.deepcopy(self.report)
                report['costs']['P']['cpuNs'] = [value, value]
                self.reject(report, 'safe integer')

    def test_safe_integer_boundary(self):
        self.report['readers'] = 1
        for cost in self.report['costs'].values():
            cost['cpuNs'] = [0, 0]
        for value in [check.MAX_INTEGER - 1, check.MAX_INTEGER]:
            self.report['costs']['G']['cpuNs'] = [value, value]
            self.assertEqual(check.assess(self.report)['cpuNs']['recompute'], [value, value])
        self.report['costs']['G']['cpuNs'] = [check.MAX_INTEGER + 1] * 2
        self.reject(self.report, 'safe integer')

    def test_derived_overflow_rejected(self):
        self.report['costs']['R']['cpuNs'] = [check.MAX_INTEGER] * 2
        self.reject(self.report, 'derived total')

    def test_reversed_bounds_rejected(self):
        self.report['costs']['P']['cpuNs'] = [1000, 900]
        self.reject(self.report, 'reversed interval')

    def test_zero_or_unbounded_reader_count_rejected(self):
        for count in [0, 1_000_001]:
            with self.subTest(count=count):
                report = copy.deepcopy(self.report)
                report['readers'] = count
                self.reject(report, 'reader|safe integer')

    def test_unknown_fields_and_missing_boundaries_rejected(self):
        for field in ['cpuNs', 'elapsedNs', 'cpuScope', 'excluded']:
            with self.subTest(field=field):
                report = copy.deepcopy(self.report)
                del report['costs']['R'][field]
                self.reject(report, 'missing fields')
        self.report['totalMemoryBytes'] = 128
        self.reject(self.report, 'unexpected')

    def test_bounded_json_and_duplicate_keys(self):
        with tempfile.TemporaryDirectory() as directory:
            path = Path(directory) / 'case.json'
            for raw in ['{"x":1,"x":2}', '{"x":NaN}', '{"x":Infinity}', '{"x":1.0}', '{"x":9007199254740992}', ' ' * (check.MAX_BYTES + 1)]:
                with self.subTest(raw=raw[:24]):
                    path.write_text(raw)
                    with self.assertRaises(ValueError):
                        check.load_report(path)

    def test_file_size_boundary(self):
        raw = json.dumps(self.report).encode()
        with tempfile.TemporaryDirectory() as directory:
            path = Path(directory) / 'case.json'
            for size in [check.MAX_BYTES - 1, check.MAX_BYTES]:
                path.write_bytes(raw + b' ' * (size - len(raw)))
                self.assertEqual(check.load_report(path), self.report)
            path.write_bytes(raw + b' ' * (check.MAX_BYTES + 1 - len(raw)))
            with self.assertRaisesRegex(ValueError, '64 KiB'):
                check.load_report(path)

    def test_reader_limit_boundary(self):
        for count in [999_999, 1_000_000]:
            self.report['readers'] = count
            self.assertEqual(check.assess(self.report)['totalSavingSign'], 'positive')
        self.report['readers'] = 1_000_001
        self.reject(self.report, 'reader count')

    def test_malformed_resource_types_rejected(self):
        self.report['resources'][0]['metric'] = []
        self.reject(self.report, 'resource metric')

    def test_symlink_input_rejected(self):
        with tempfile.TemporaryDirectory() as directory:
            path = Path(directory) / 'link.json'
            try:
                path.symlink_to(HERE / 'template.json')
            except OSError:
                self.skipTest('symlink creation unavailable')
            with self.assertRaisesRegex(ValueError, 'symlink'):
                check.load_report(path)

    @unittest.skipUnless(hasattr(os, 'mkfifo') and hasattr(os, 'O_NONBLOCK'), 'nonblocking FIFO unavailable')
    def test_fifo_input_rejected_without_waiting_for_writer(self):
        with tempfile.TemporaryDirectory() as directory:
            path = Path(directory) / 'fifo.json'
            os.mkfifo(path)
            with self.assertRaisesRegex(ValueError, 'regular file'):
                check.load_report(path)

    def test_directory_input_rejected(self):
        with tempfile.TemporaryDirectory() as directory:
            with self.assertRaises((ValueError, OSError)):
                check.load_report(directory)

    def test_old_wg_format_name_rejected(self):
        self.report['pinned']['formatVersion'] = 'wg03-comparison/v0'
        self.reject(self.report, 'formatVersion')

    def test_deterministic_assessment(self):
        self.assertEqual(json.dumps(check.assess(self.report), sort_keys=True), json.dumps(check.assess(copy.deepcopy(self.report)), sort_keys=True))


if __name__ == '__main__':
    unittest.main(verbosity=2)
