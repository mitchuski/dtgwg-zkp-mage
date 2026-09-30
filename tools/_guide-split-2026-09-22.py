from pathlib import Path
import json,re,shutil,hashlib
E=Path.cwd(); S=E.parent/'dtgwg-zkp-spec'; T=E.parent/'dtgwg-zkp-tf-mage'; G=T/'guide'; Z=E/'zkbook/spec'; PIN='315cf4466bfcfe3d70c88a6706d0a6ca633c60c9'
for d in ['spec/terms-definitions','tools','static']: (G/d).mkdir(parents=True,exist_ok=True)
def put(p,t): p.parent.mkdir(parents=True,exist_ok=True);p.write_text(t,encoding='utf-8',newline='\n')
def get(p):return p.read_text(encoding='utf-8-sig')
manifest={'sourceRepository':'trustoverip/dtgwg-zkp-spec','sourceRevision':PIN,'meeting':'https://lf-toip.atlassian.net/wiki/spaces/HOME/pages/1181057055','status':'editorial extraction draft; no adoption or new evidence state','files':[]}
chapters=['implementation-guide.md','trust-graph.md','research-and-book.md','cryptographic-background.md']
for f in chapters:
 text=get(S/'spec'/f);manifest['files'].append({'source':'spec/'+f,'destination':'guide/spec/'+f,'sourceSha256':hashlib.sha256((text.replace('\r\n','\n')).encode()).hexdigest()})
 # Definitions stay authoritative in the specification; no editable record copy in the guide.
 text=re.sub(r'\[\[ref:\s*([^\]]+)\]\]',r'[[xref: DTG_ZKP, \1]]',text)
 if f=='cryptographic-background.md': text=re.sub(r'^> \*\*WG-13.*$', '> **WG-13 — Guide separation.** The 22 September discussion supports a separate implementation guide. This draft relocates the explanatory chapter; the specification retains the construction definitions and evidence states. This is an editorial extraction, not cryptographic approval.',text,flags=re.M)
 if f=='implementation-guide.md': text=text.replace('### Choose the outcome first','The 22 September call identifies the two-vouch admission proof (023) as the immediate integration focus. Earlier milestone proposals below are retained as review history, not as a competing implementation decision.\n\n### Choose the outcome first')
 if f=='research-and-book.md': text=text.replace('at the end of this specification','in the guide’s editorial worklist')
 put(G/'spec'/f,text)
put(G/'source-map.json',json.dumps(manifest,indent=2)+'\n')
put(G/'spec/header.md','''# DTG ZKP Implementation Guide

_Version:_ 1.0  
_Document Status:_ Editor’s Draft 0.1.0  
_Last Updated:_ 22 September 2026

This informative companion explains the DTG ZKP specification. It is not an approved deliverable, a conformance specification or evidence of implemented cryptographic security. Its source baseline is spec PR #11 at `'''+PIN+'''`.

Documents: [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/). Build tooling: Apache-2.0. See [attribution](#attribution-and-maintenance).
''')
put(G/'spec/intro.md','''## Reading this guide

Start with the application outcome, then identify the credentials, witnesses and policy before choosing a proving system. Read the implementation walkthrough for the process, the trust-graph chapter for context, and the cryptographic background for the mathematics. The SIROS review pack provides a focused route for the planned 29 September session.

The [ZKP specification](https://trustoverip.github.io/dtgwg-zkp-spec/) owns construction definitions, public-input conventions, conformance and evidence states. This guide explains them. Implementation source stays with its maintainers; the [evidence repository](https://github.com/mitchuski/dtgwg-zkp-mage) carries experiments and reproduction records. No new construction registry is introduced.

### The admission proof and the community-anchored proof

Record 010 includes the presenter’s own community membership. Record 023 describes an applicant presenting multiple voucher credentials without requiring the applicant’s membership. Neither description proves that the applicant is not already a member. The membership policy, distinctness definition and offline voucher artifact must be settled with the implementation team. Distinct leaves do not by themselves prove independent controllers.

The 22 September notes identify [zkBricks](https://zkbricks.com/) as Berkeley’s deployable home. That website is not a pinned implementation reference for 023. Request the exact repository, revision, interface and statement; record integration deviations in the construction’s provenance.

### Revision boundary

Read records 022 and 023 from [the pinned PR #11 snapshot](https://github.com/trustoverip/dtgwg-zkp-spec/tree/'''+PIN+''') until it merges. A moving published page and a pinned source revision can differ. Links to the proposed guide page are publication targets until the guide PR is merged and Pages is configured.
''')
put(G/'spec/siros-review.md','''## SIROS reading and review pack — 29 September

Prepared after the 22 September meeting. Proposed review questions, not assignments or claims about SIROS capabilities. Confirm the session and participants with the chairs before sending.

### Fifteen-minute reading path

1. Read the specification Introduction and Public Inputs conventions: identify the exact statement, context and disclosed values.
2. Read construction 003 (transcript binding), 004 (holder binding) and 006 (status), including their negative space and witness requirements.
3. Compare 010 with 023. The immediate question is which parts of the admission statement an existing-credential route can implement; the complete composition is not yet demonstrated.
4. Read the guide’s implementation steps 2–3 and the cryptographic background’s P2 and P8. Separate credential authentication, holder-key access and circuit security.
5. Use the [SIROS catalogue repository](https://github.com/sirosfoundation/go-zk-circuits) and [manifest](https://api.circuits.siros.org/v1/manifest.json) to choose one exact artifact. Pin its identifier, digest, source revision and toolchain before comparing results.

Records: [003](https://github.com/trustoverip/dtgwg-zkp-spec/blob/'''+PIN+'''/conformance/records/003.json), [004](https://github.com/trustoverip/dtgwg-zkp-spec/blob/'''+PIN+'''/conformance/records/004.json), [006](https://github.com/trustoverip/dtgwg-zkp-spec/blob/'''+PIN+'''/conformance/records/006.json), [010](https://github.com/trustoverip/dtgwg-zkp-spec/blob/'''+PIN+'''/conformance/records/010.json), [023](https://github.com/trustoverip/dtgwg-zkp-spec/blob/'''+PIN+'''/conformance/records/023.json).

### Questions for Leif and the team

- Which credential formats, curves and signature suites does the selected artifact support today? Which inputs or credential changes would DTG need?
- How is holder/device binding established when keys are non-exportable? What is checked inside the proof versus by the verifier?
- Which audience, challenge and profile identifiers are authenticated? What are the replay and freshness checks?
- Can two independently signed credentials be linked privately to a common subject or issuer? If not, which new circuit or issuance artifact is required?
- What disclosure and timing remains visible to the verifier, issuer, registry and any delegated prover, and for how long?
- How are credential status and root freshness handled? Does witness retrieval reveal the presentation or holder?
- Which 023 clauses are implemented, which can be composed, and which are unsupported? What review or independent reproduction supports that answer?

### Requested comparison packet

Use the same acceptance statement and synthetic fixtures across routes. Return the circuit/artifact id and digest; source and tool versions; credential and public-input manifest; hardware and OS; security parameters and setup assumptions; cold and warm proving time; peak memory; verification time; proof bytes; proving/verifying artifact bytes; credential bytes; and end-to-end presentation bytes. Distinguish each size: a signing key, signature, proof and circuit artifact are different objects.

Include rejection cases for altered signature, wrong holder, wrong audience/challenge, unsupported profile, stale status and duplicate voucher. Identify mocks and external checks. Missing data is unknown, not zero. A catalogue digest establishes artifact identity, not correctness or security review. Do not reuse September 5 catalogue counts or artifact sizes as current measurements.

### Intended output of the session

Agree one representative artifact and workload, its relationship to 023, an implementation owner, a reviewer and a target date. Record unsupported clauses explicitly. Keep the candidate route separate from a recommendation or normative choice.
''')
appendix=get(Z/'appendix.md');split=appendix.index('### Maintenance Note:');work=appendix[split:];put(G/'spec/editorial-worklist.md','## Editorial worklist\n\nInformative research and maintenance proposals inherited from the specification. Not a set of assigned commitments.\n\n'+work)
put(G/'spec/attribution.md','''## Attribution and maintenance

This guide relocates and adapts material from the DTG ZKP specification at revision `'''+PIN+'''`. The source map records each extracted chapter and its source digest. The source text and its inherited citations remain reviewable through that revision.

The Cryptographic Background is adapted from Mitchell Travers’s earlier explanatory Zero Knowledge Spellbook material in the agentprivacy body of work. On 8 September 2026 Mitchell Travers authorized inclusion of the adapted text under CC BY 4.0. This relocation preserves attribution to that adapted text; it does not relicense the wider source work. Subsequent edits are identified by version control.

Guide documents are licensed [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/). Build scripts remain Apache-2.0 under the repository licence. The guide is informative and does not override the specification. Review changes for consistent claims, disclosure sets, adversaries, horizons and evidence states.

The spec repository owns the records; the task-force repository owns this guide; Berkeley/SIROS/OpenVTC own their implementation sources; the evidence bench holds experiments. Importing source is an explicit review step, never an automatic overwrite of guide edits.
''')
put(G/'LICENSE.md','Guide Markdown documents are licensed under Creative Commons Attribution 4.0 International: https://creativecommons.org/licenses/by/4.0/legalcode\n\nSee spec/attribution.md for provenance and attribution. Build tooling is Apache-2.0 under ../LICENSE. Third-party works linked from this guide retain their own licences.\n')
put(G/'README.md','''# DTG ZKP Implementation Guide

Informative companion, extracted after the 22 September 2026 discussion. Construction records remain in `trustoverip/dtgwg-zkp-spec`. This guide has no editable copy of that catalogue.

From this directory: `npm ci`, `npm run render`, then `npm run check`. Output is `docs/`; do not commit it. `npm run collectExternalReferences` refreshes external glossary data. The lockfile is copied from the validated ZKP specification toolchain.

The Pages workflow uploads a preview artifact for pull requests. Deployment is manual and main-branch-only, so the first merge does not silently change repository hosting. A repository administrator must enable GitHub Pages with GitHub Actions before dispatching deployment. Intended URL: https://trustoverip.github.io/dtgwg-zkp-tf/ .

Read spec/siros-review.md for the proposed September 29 review path. Review source-map.json and spec/attribution.md before merging. The deeper book is part of this guide for now, not a third deliverable.
''')
config=json.loads(get(S/'specs.json'));c=config['specs'][0];c.update(title='DTG ZKP Implementation Guide',description='Informative implementation walkthrough, cryptographic background and reviewer reading paths for the DTG ZKP specification.',source={'host':'github','account':'trustoverip','repo':'dtgwg-zkp-tf'},markdown_paths=['header.md','intro.md']+chapters+['siros-review.md','editorial-worklist.md','attribution.md']);c['external_specs'].append({'external_spec':'DTG_ZKP','gh_page':'https://trustoverip.github.io/dtgwg-zkp-spec/','url':'https://github.com/trustoverip/dtgwg-zkp-spec'});put(G/'specs.json',json.dumps(config,indent=2)+'\n')
for f in ['package.json','package-lock.json','.npmrc']:shutil.copyfile(S/f,G/f)
p=json.loads(get(G/'package.json'));p['scripts']['check']='node tools/check-guide.mjs';put(G/'package.json',json.dumps(p,indent=2)+'\n')
for f in ['logo.svg','favicon.ico']:shutil.copyfile(S/'static'/f,G/'static'/f)
put(G/'.gitignore','node_modules/\ndocs/\n.cache/\n.env*\n*.log\n')
# Core keeps thin stable anchor pages and the WG questions; long text is in guide.
for f in ['implementation-guide.md','trust-graph.md','research-and-book.md']:
 old=get(Z/f); title=old.splitlines()[0]; notes='\n\n'.join(re.findall(r'^> \*\*WG-.*$',old,re.M));stub=title+'\n\nThis section is informative. The explanatory treatment has moved to the [companion Implementation Guide](https://trustoverip.github.io/dtgwg-zkp-tf/). The guide and this extraction are coordinated drafts until their pull requests merge. Construction definitions and conformance remain in this specification.\n\n'+notes+'\n';put(Z/f,stub)
# Keep central review record instead of losing questions in moved chapters.
put(Z/'guide-pointer.md','''## Cryptographic Background

The explanatory chapter is maintained in the [DTG ZKP Implementation Guide](https://trustoverip.github.io/dtgwg-zkp-tf/#cryptographic-background). This document retains construction definitions, public-input conventions and conformance. The link is a publication target until the guide is deployed.

> **WG-13 — Direction: separate the guide.** The 22 September discussion supports a separate implementation guide in the ZKP task-force repository. This editorial extraction implements that direction; it does not ratify construction choices or change evidence states.
''')
put(Z/'appendix.md',appendix[:split]+'### Guide maintenance and verification worklist\n\nThe explanatory maintenance method and V01–V12 worklist are now in the [companion guide](https://trustoverip.github.io/dtgwg-zkp-tf/).\n\n'+ '\n\n'.join(re.findall(r'^> \*\*WG-(?:09|11) —.*$',work,re.M))+'\n')
intro=get(Z/'intro.md');intro=intro.replace('Start with the Implementation Guide:', 'Use the separate companion Implementation Guide for the walkthrough:');intro+='''
### Structure and construction navigation

Read Public Inputs for shared conventions, Construction Records for the exact statements and dependencies, Integration for unresolved profile requirements, and Conformance for validation targets. The construction index gives stable identifiers, kinds and evidence states. The guide provides explanation; it does not define additional conformance requirements.

- Admission with multiple vouchers: 023; compare 010, which includes presenter membership.
- Relationship presentations: 010 and 011.
- Common control and equality: 007, 009 and 012.
- Context and digest binding: 003, 008 and 022.
- Delegation and authority: 020 and 021.
- Mutual edge admissibility: 013, still requested.

Constructions remain in this versioned specification. A separate construction registry has not been selected. Evidence registries and third-party artifact catalogues have different roles.
''';put(Z/'intro.md',intro)
# Fix incorrect range taxonomy centrally, preserving every ID.
p=E/'board/tools/spec-render.mjs';text=get(p);text=text.replace('Identifiers are stable handles, not a sequence: 001–009 are primitive constructions; 010–019 are compositions over community and relationship credentials; 020–029 are delegation and authority chains. Unused numbers in a range are unassigned, not missing.','Identifiers are stable handles, not a type taxonomy or contiguous sequence. The kind column identifies primitives and compositions. Records 020 and 021 concern chains, 022 is a digest-reference primitive, and 023 concerns admission; unassigned numbers are not missing records.');put(p,text)
# Prevent future export from restoring long chapter. Original primer stays an archival input, not export source.
p=E/'tools/zkbook-export.mjs';text=get(p);text=text.replace("read(join(SPEC, 'primer.md')).trimEnd()", "read(join(SPEC, 'guide-pointer.md')).trimEnd()");put(p,text)
print('Guide source, SIROS pack and core extraction prepared; no publication.')
