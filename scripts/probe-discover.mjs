#!/usr/bin/env node
const base = process.argv[2] ?? "https://www.unze.app";
const r = await fetch(`${base}/discover`, { redirect: "follow" });
const t = await r.text();
console.log("status", r.status);
console.log("error UI", t.includes("Etwas ist schiefgelaufen"));
console.log("discover ok", t.includes("Communities") && !t.includes("Etwas ist schiefgelaufen"));
const digest = t.match(/Ref:\s*([A-F0-9]+)/i);
if (digest) console.log("digest", digest[1]);
