const url = process.argv[2] ?? "http://localhost:3000/business";
const res = await fetch(url);
const html = await res.text();

console.log("URL:", url);
console.log("Status:", res.status);

const title = html.match(/<title[^>]*>([^<]+)<\/title>/)?.[1];
console.log("Title:", title);

const needles = [
  "Runtime TypeError",
  "Unhandled Runtime Error",
  "Application error",
  "Cannot read properties",
  "is not a function",
  "Cannot read property",
  "Hydration failed",
  "Text content does not match",
  "usePathname",
  "Bail out to client-side rendering",
];

for (const needle of needles) {
  let idx = 0;
  while ((idx = html.indexOf(needle, idx)) >= 0) {
    console.log("\nFOUND:", needle);
    console.log(html.slice(Math.max(0, idx - 60), idx + 200).replace(/\s+/g, " "));
    idx += needle.length;
  }
}

const chunks = html.split("self.__next_f.push(");
console.log("\nRSC chunks:", chunks.length);
for (let i = 0; i < chunks.length; i++) {
  const c = chunks[i];
  if (/TypeError|Cannot read|is not a function|\"message\":\"Error/i.test(c)) {
    console.log("\n--- suspicious chunk", i, "---");
    console.log(c.slice(0, 800).replace(/\\n/g, " "));
  }
}
