const urls = [
  "http://localhost:3000/",
  "http://localhost:3000/business",
  "http://localhost:3000/communities",
  "http://localhost:3000/studio/app/uebersicht",
];

const needles = [
  "Runtime TypeError",
  "TypeError",
  "next-error-h1",
  "Application error",
  "Cannot read properties",
  "is not a function",
];

for (const url of urls) {
  const res = await fetch(url);
  const html = await res.text();
  console.log(`\n=== ${url} (${res.status}) ===`);
  const title = html.match(/<title[^>]*>([^<]+)<\/title>/)?.[1] ?? "(no title)";
  console.log("Title:", title);
  for (const needle of needles) {
    if (html.includes(needle)) {
      const idx = html.indexOf(needle);
      console.log("FOUND:", needle);
      console.log(html.slice(Math.max(0, idx - 60), idx + 200).replace(/\s+/g, " "));
    }
  }
  if (!needles.some((n) => html.includes(n))) {
    console.log("No error markers in HTML");
  }
}
