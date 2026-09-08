# Decentralized Trust Graph — Zero-Knowledge Proof Specification

_Version:_ 0.1  
_Document Status:_ Working Draft  
<!-- _DOI:_ To be assigned when this specification reaches ToIP Approved Deliverable status. See https://lf-toip.atlassian.net/wiki/spaces/HOME/pages/767787009/ToIP+Approved+Deliverable+Process#Persistent-DOI-Link -->
_GitHub:_ <https://github.com/trustoverip/dtgwg-zkp-spec>

_Editors:_

- Mitchell Travers, Soulbis — co-chair, DTG ZKP Task Force

_Contributors:_

- Scott Jones, Realeyes — co-chair, DTG ZKP Task Force
- Sankarshan Mukhopadhyay
- Denys Popov
- Glenn Gore, First Person Project
- Geoff Turk, First Person Project
- Drummond Reed, First Person Project
- Brendan A. Miller, Applied Social Media Lab, Berkman Klein Center at Harvard University
- Alberto Leon, Applied Social Media Lab, Berkman Klein Center at Harvard University
- The participants of the Decentralized Trust Graph Working Group (DTGWG) and its task forces

**Abstract**

A Decentralized Trust Graph (DTG) is a graph of cryptographically verifiable trust relationships between people, organizations, devices and AI agents. The DTG Credentials Core Specification defines the credentials that create and annotate the graph and defers its zero-knowledge layer to the DTG ZKP Task Force. This specification is that layer: an implementation-oriented guide to ZKPs for decentralized trust graphs generally. Personhood and liveness are important use cases, alongside membership, relationships, selective disclosure, common control, status and delegated authority; they do not define its overall scope. It defines **construction records**: for each zero-knowledge proof the trust graph needs — membership in a community, a scoped nullifier, transcript binding, holder binding, distinctness, non-revocation, common control across identifiers, a blinded context binder, and their compositions such as the community-anchored proof of a relationship — what a verifier learns, from whom, and without what; the witness kept private from the verifier under the declared custody model; the public inputs; the clauses of the statement, each bound to a named gadget; the disclosure set; what the proof does not establish; the adversary each privacy claim is made against and the horizon that bounds it; the conformance fixtures that test it; the construction options across proving systems with their measured or conjectured cost; and what the construction requires of issuers. Every construction record is machine-checked against a schema that refuses a record lacking any of these, and each record carries a state — requested, carded, constructed, run, vetted, published — that says how much weight it bears: evidence maturity, independent reproduction and normative adoption are separate; adoption requires an explicitly recorded task-force decision. The specification also records the requests it answers in their own form, beginning with ADR-001 *Community-Anchored Proof*, and the shared public-input conventions — context descriptor, set roots, epoch, transcript digest, declared correlation scope — that every construction draws on.

**Intellectual Property Rights**

This specification is provided under the [Joint Development Foundation (JDF) charter](https://cdn.platform.linuxfoundation.org/agreements/ToIP.pdf) for [Trust Over IP](https://trustoverip.org) (ToIP) and is subject to the intellectual property rights policy of the **Decentralized Trust Graph Working Group**:

_Copyright:_ [Creative Commons Attribution 4.0 International (CC BY 4.0)](https://creativecommons.org/licenses/by/4.0/)  
_Patent:_ W3C Mode (based on the [W3C Patent Policy](https://www.w3.org/Consortium/Patent-Policy-20040205/))  
_Source Code:_ [Apache License, Version 2.0](https://www.apache.org/licenses/LICENSE-2.0)

THESE MATERIALS ARE PROVIDED "AS IS." The parties expressly disclaim any warranties (express, implied, or otherwise), including implied warranties of merchantability, non-infringement, fitness for a particular purpose, or title, related to the materials. The entire risk as to implementing or otherwise using the materials is assumed by the implementer and user. IN NO EVENT WILL THE PARTIES BE LIABLE TO ANY OTHER PARTY FOR LOST PROFITS OR ANY FORM OF INDIRECT, SPECIAL, INCIDENTAL, OR CONSEQUENTIAL DAMAGES OF ANY CHARACTER FROM ANY CAUSES OF ACTION OF ANY KIND WITH RESPECT TO THIS DELIVERABLE OR ITS GOVERNING AGREEMENT, WHETHER BASED ON BREACH OF CONTRACT, TORT (INCLUDING NEGLIGENCE), OR OTHERWISE, AND WHETHER OR NOT THE OTHER MEMBER HAS BEEN ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
