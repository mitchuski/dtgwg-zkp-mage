"""mint_kappa.py - seal this formal package's run as a kappa evidence bundle.

Adapted from formal_mage/tools/mint_formal.py (same Bundle, same `formal/axiom-audit/1` check rule).
Requires a PASS receipt from `sh formal/scripts/check-axioms.sh` (coverage, clause review and Lean
gates); re-runs `lake env lean Checks.lean` and refuses if its roots differ from the receipt's. Mints:
  - one blob per Lean source and review file, plus README.md, coverage.json, clause-review.json, pending-models.json, the
    receipt and the raw audit output;
  - one record/1 per audit root: {theorem, module, axioms, ok}, provenance = the audit output;
  - a ledger and a check/1 under `formal/axiom-audit/1`, then the run-root.
Writes formal/evidence/kappa/<YYYY-MM-DD>_<n>/. Verify:
  python ../kappa_evidence_mage/verify_bundle.py formal/evidence/kappa/<dir>
usage: python formal/scripts/mint_kappa.py [--out DIR]
"""
from __future__ import annotations
import argparse, datetime, glob, json, os, re, subprocess, sys

HERE = os.path.abspath(os.path.join(os.path.dirname(os.path.abspath(__file__)), ".."))
KE = os.path.abspath(os.path.join(os.path.expanduser("~"), "kappa_evidence_mage"))
sys.path.insert(0, KE)
from bundle import Bundle, redact  # noqa: E402

LANE = "formal/dtgwg-zkp-spec"
STD = {"propext", "Classical.choice", "Quot.sound"}
ENV = {**os.environ, "NO_COLOR": "1", "TERM": "dumb"}


def rd(rel: str) -> bytes:
    with open(os.path.join(HERE, rel), "rb") as f:
        return redact(f.read().decode("utf-8").replace("\r\n", "\n")).encode("utf-8")


def main() -> int:
    ap = argparse.ArgumentParser()
    ap.add_argument("--out", default=None)
    a = ap.parse_args()
    receipt = json.loads(rd("evidence/axiom-audit.json"))
    if receipt.get("status") != "PASS":
        sys.exit("receipt is not PASS; run sh formal/scripts/check-axioms.sh first")
    audit = subprocess.run(["lake", "env", "lean", "Checks.lean"], cwd=HERE, env=ENV, capture_output=True,
                           text=True, encoding="utf-8", shell=(os.name == "nt"))
    text = (audit.stdout + audit.stderr).replace("\r\n", "\n")
    if audit.returncode or re.search(r"sorry|error:", text, re.I):
        sys.exit("Checks.lean failed:\n" + text[-2000:])
    rows = []
    for line in text.splitlines():
        m = re.match(r"^'([A-Za-z0-9_.]+)' (does not depend on any axioms|depends on axioms: \[(.*)\])", line)
        if m:
            ax = [] if m.group(3) is None else [s.strip() for s in m.group(3).split(",") if s.strip()]
            rows.append({"theorem": m.group(1), "module": ".".join(m.group(1).split(".")[:-1]), "axioms": ax,
                         "ok": all(x in STD for x in ax)})
    if sorted(r["theorem"] for r in rows) != sorted(r["name"] for r in receipt["roots"]):
        sys.exit("the audit's roots differ from the PASS receipt; re-run check-axioms.sh")

    B = Bundle(LANE, "unsigned:dtgwg-zkp-mage")
    audit_k = B.put_blob(redact(text).encode("utf-8"), "source:axiom-audit.txt")
    sources = sorted(p.replace("\\", "/") for p in glob.glob("Formal/**/*.lean", root_dir=HERE, recursive=True))
    sources += sorted(p.replace("\\", "/") for p in glob.glob("review/*", root_dir=HERE))
    sources += ["Formal.lean", "Checks.lean", "lakefile.lean", "lean-toolchain", "coverage.json",
                "clause-review.json", "pending-models.json", "evidence/axiom-audit.json", "README.md"]
    blob = {s: B.put_blob(rd(s), f"source:{s}") for s in sources}
    ks = []
    for i, r in enumerate(rows):
        k = B.record(i, "theorem", r, audit_k, f"theorem:{r['theorem']}")
        for f, fk in blob.items():
            if f.endswith(".lean") and f[:-5].replace("/", ".") in (r["module"], r["module"].rsplit(".", 1)[0]):
                B.edge(k, fk, "refers-to")
        ks.append(k)
    lk = B.ledger("axiom-audit", f"the {len(ks)} audit roots and their axiom footprints", ks)
    facts = {"n": len(rows), "ok": sum(1 for r in rows if r["ok"]),
             "axioms": sorted({x for r in rows for x in r["axioms"]}),
             "nonstandard": sorted({x for r in rows for x in r["axioms"] if x not in STD})}
    B.check("axiom-audit-check", lk, "formal/axiom-audit/1", facts)
    toolchain = rd("lean-toolchain").decode().strip()
    B.root(["axiom-audit", "axiom-audit-check"],
           extra={"toolchain": toolchain, "trusted_base": "Lean kernel + " + ", ".join(sorted(STD)),
                  "receiptSourceTreeSha256": receipt["sourceTreeSha256"]})
    day = datetime.date.today().isoformat()
    out = a.out or os.path.join(HERE, "evidence", "kappa", f"{day}_{len(rows)}")
    B.write(out, ["| theorem | axioms |", "|---|---|"] +
            [f"| `{r['theorem']}` | {', '.join(r['axioms']) or '(none)'} |" for r in rows] +
            ["", f"{facts['ok']}/{facts['n']} within the standard axioms; toolchain {toolchain}.",
             "", "Verify from the bundle alone: `python ../kappa_evidence_mage/verify_bundle.py <this dir>`."])
    return 0


if __name__ == "__main__":
    sys.exit(main())
