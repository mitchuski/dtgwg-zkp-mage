# Tale 2 — The Three Trials of Truth

Concepts: Adaptive vs Non-Adaptive Security, Common Reference String, Setup Ceremony

Source: The Zero Knowledge Spellbook (zk_grimoire v3.0), '#### Technical Bridge' of Tale 2 (source lines from 410); 4 lore lines dropped by rule.

---

**Setup Types:**
- **Trusted Setup (per-circuit):** Circuit-specific toxic waste
- **Universal Trusted Setup:** One ceremony, many circuits (e.g., PlonK)
- **Transparent:** No setup needed (e.g., STARKs)

**Security Levels:**
- Non-Adaptive: Adversary commits before seeing CRS
- Adaptive: Adversary sees CRS, then attempts forgery
- Perfect ZK: Simulation indistinguishable even for unbounded adversaries

**Ptau Ceremony:** Multi-party computation where toxic waste is safe unless *all* participants collude.

**Applied to:** Universal setups, ceremony design, transparent systems
