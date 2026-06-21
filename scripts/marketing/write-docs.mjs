#!/usr/bin/env node
import { writeFileSync } from "fs";
import { join } from "path";

const root = join(process.cwd(), "docs", "marketing");

const readme = `# UNZE Marketing v3

Premium-Produktmarketing: echte App-Screenshots, immersive iPhone-Mockups, keine Textfolien.

## Pipeline

\`\`\`bash
npm run marketing:build
\`\`\`

## Ausgabe (\`docs/marketing/output/\`)

| Pfad | Kanal |
|------|-------|
| \`tiktok/\`, \`reels/\`, \`youtube-shorts/\`, \`instagram/stories/\` | 9:16 Story (7 Slides) |
| \`features/\` | Feature Ads (1 Botschaft) |
| \`carousel/\`, \`instagram/feed/\` | Instagram Carousel / Feed |
| \`creator-beta/\` | Creator Kampagne |
| \`animations/*.gif\` | TikTok, Reels, Landing |
| \`hero-landing.png\`, \`website-header.png\`, \`creator-beta-banner.png\` | Web |
| \`linkedin-creator.png\`, \`facebook-creator.png\`, \`press-kit-hero.png\` | Social / Presse |

## TikTok Story

1. Mitglieder-Screen + Problem-Hook
2. Home + UNZE
3. Discover + Feature-Chips
4. Creator Dashboard
5. Monetarisierung
6. Crowd Partner
7. CTA Create Community

## Demo-Communities (Live)

Rocket League Deutschland 12.400 | Fotografie Deutschland 8.400 | Programmier Community 7.200 | Mathe Akademie 4.900 | Street Photography Europe 5.600 | Creator Lounge 4.100 | Fitness Community 3.800 | Handwerker Netzwerk 2.900 | Business Creator Club 2.300
`;

const campaign = `# Creator Beta v3

## Botschaft

Werde einer der ersten Creator auf UNZE. Je fr\u00fcher deine Community w\u00e4chst, desto st\u00e4rker dein Netzwerk.

## Assets

- Story: \`output/tiktok/tiktok-01-problem.png\` bis \`tiktok-07-cta.png\`
- Features: \`output/features/feat-*.png\`
- Creator: \`output/creator-beta/\`
- Animationen: \`output/animations/\`

## Regenerierung

\`\`\`bash
npm run marketing:build
npm run marketing:validate
\`\`\`

URL: https://unze-platform.vercel.app
`;

writeFileSync(join(root, "README.md"), readme, "utf8");
writeFileSync(join(root, "CREATOR_BETA_CAMPAIGN.md"), campaign, "utf8");
console.log("Marketing v3 Docs geschrieben.");
