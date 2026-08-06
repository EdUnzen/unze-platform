const url = process.argv[2] ?? "http://localhost:3000/business";
const res = await fetch(url);
const html = await res.text();
console.log("URL:", url, "status:", res.status);

const patterns = [
  /TypeError[^\\"]{0,120}/g,
  /Cannot read properties[^\\"]{0,120}/g,
  /is not a function[^\\"]{0,80}/g,
  /"message":"[^"]{5,200}"/g,
  /Runtime TypeError/g,
];

for (const re of patterns) {
  const matches = [...html.matchAll(re)];
  if (matches.length) {
    console.log("\nPattern", re.source, "matches:", matches.length);
    for (const m of matches.slice(0, 5)) {
      console.log(" -", m[0].slice(0, 200));
    }
  }
}

const chunks = html.split("self.__next_f.push(").slice(1, 6);
console.log("\nFirst RSC chunk snippets:");
for (const chunk of chunks) {
  const snippet = chunk.slice(0, 300).replace(/\s+/g, " ");
  if (/error|Error|TypeError/i.test(snippet)) {
    console.log("!", snippet);
  }
}
