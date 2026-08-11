// scan.mjs — lifetime-view secret scan (witness-seat W5 pattern, generalised).
//
// X10's C1 rule: an orchestrating agent's whole lifetime view (everything it
// captured — arguments, environment, child output, filed records) must contain
// no trace of a ceremony secret. In lane 1 there ARE no ceremony secrets, but
// the utility is built now so lane 2 inherits it tested rather than improvised.
//
// scanView(view, forbidden) — `view` is an array of captured items (strings or
// JSON-serialisable objects); `forbidden` is an array of secret strings that
// must not appear anywhere, in raw, JSON-escaped, hex, or base64 form.
// Returns violations [{index, needle, encoding}] — empty array = clean.

export function encodings(needle) {
  const buf = Buffer.from(needle, 'utf8');
  return [
    { encoding: 'raw', text: needle },
    { encoding: 'json', text: JSON.stringify(needle).slice(1, -1) },
    { encoding: 'hex', text: buf.toString('hex') },
    { encoding: 'base64', text: buf.toString('base64') },
  ];
}

export function scanView(view, forbidden) {
  const violations = [];
  view.forEach((item, index) => {
    const flat = typeof item === 'string' ? item : JSON.stringify(item);
    for (const needle of forbidden) {
      if (!needle || needle.length < 4) continue; // too short to scan meaningfully
      for (const { encoding, text } of encodings(needle)) {
        if (flat.includes(text)) violations.push({ index, needle, encoding });
      }
    }
  });
  return violations;
}

// assertClean — throw 'secret-in-view:<encoding>@<index>' on the first hit,
// the fail-closed form the orchestrator uses.
export function assertClean(view, forbidden) {
  const v = scanView(view, forbidden);
  if (v.length) {
    throw new Error(`secret-in-view:${v[0].encoding}@${v[0].index}`);
  }
}
