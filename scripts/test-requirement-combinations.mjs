#!/usr/bin/env node
/**
 * Requirement Engine combination tests (AND/OR, severity, predicates).
 * Usage: npm run test:requirements
 */
import { readFileSync, existsSync, writeFileSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";
import pg from "pg";
import { randomUUID } from "crypto";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const REPORT = join(root, "docs", "testing", "REQUIREMENT_COMBINATIONS_REPORT.md");

function loadEnvLocal() {
  const paths = [join(root, ".env.local"), join(root, ".env.vercel")];
  const env = {};
  for (const path of paths) {
    if (!existsSync(path)) continue;
    for (const line of readFileSync(path, "utf8").split("\n")) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith("#")) continue;
      const idx = trimmed.indexOf("=");
      if (idx === -1) continue;
      const key = trimmed.slice(0, idx).trim();
      if (!env[key]) env[key] = trimmed.slice(idx + 1).trim();
    }
  }
  return env;
}

function buildDbUrl(env) {
  if (env.SUPABASE_DB_URL || env.DATABASE_URL) {
    return env.SUPABASE_DB_URL || env.DATABASE_URL;
  }
  const password = env.SUPABASE_DB_PASSWORD;
  const match = (env.NEXT_PUBLIC_SUPABASE_URL ?? "").match(/https:\/\/([^.]+)\.supabase\.co/);
  if (password && match) {
    return `postgresql://postgres:${encodeURIComponent(password)}@db.${match[1]}.supabase.co:5432/postgres`;
  }
  return null;
}

const results = [];
function record(name, ok, note = "") {
  results.push({ name, ok, note });
  console.log(`${ok ? "OK" : "FAIL"} ${name}${note ? ` — ${note}` : ""}`);
}

async function main() {
  const env = { ...process.env, ...loadEnvLocal() };
  const dbUrl = buildDbUrl(env);
  if (!dbUrl) {
    console.error("DB URL fehlt");
    process.exit(1);
  }

  const client = new pg.Client({ connectionString: dbUrl, ssl: { rejectUnauthorized: false } });
  await client.connect();

  const tempResourceId = randomUUID();
  const tempSetId = randomUUID();
  let communityId;
  let memberUserId;
  let credentialId;
  let collectionId;

  try {
    console.log("\n=== Requirement Engine Kombinationstests ===\n");

    const { rows: communityRows } = await client.query(`
      SELECT id FROM public.communities ORDER BY created_at LIMIT 1
    `);
    communityId = communityRows[0]?.id;
    record("Community vorhanden", Boolean(communityId));
    if (!communityId) throw new Error("Keine Community");

    const { rows: memberRows } = await client.query(
      `
      SELECT user_id FROM public.community_members
      WHERE community_id = $1 AND deleted_at IS NULL
      LIMIT 1
    `,
      [communityId],
    );
    memberUserId = memberRows[0]?.user_id;
    record("Mitglied gefunden", Boolean(memberUserId));

    const { rows: credRows } = await client.query(
      `
      SELECT id FROM public.credentials WHERE community_id = $1 LIMIT 1
    `,
      [communityId],
    );
    credentialId = credRows[0]?.id;

    const { rows: leafMembership } = await client.query(
      `
      SELECT passed FROM public.eval_requirement_leaf(
        $1, 'membership', $2, NULL, 'community', $2, $2
      ) LIMIT 1
    `,
      [memberUserId, communityId],
    );
    record("Leaf membership", leafMembership[0]?.passed === true, "Mitglied erkannt");

    const { rows: leafRole } = await client.query(
      `
      SELECT passed FROM public.eval_requirement_leaf(
        $1, 'role', NULL, 'member', 'community', $2, $2
      ) LIMIT 1
    `,
      [memberUserId, communityId],
    );
    record("Leaf role (member)", leafRole[0]?.passed === true);

    const { rows: leafPremium } = await client.query(
      `
      SELECT passed FROM public.eval_requirement_leaf(
        $1, 'premium', $2, NULL, 'community', $2, $2
      ) LIMIT 1
    `,
      [memberUserId, communityId],
    );
    record("Leaf premium", typeof leafPremium[0]?.passed === "boolean", `passed=${leafPremium[0]?.passed}`);

    if (credentialId) {
      const { rows: leafCred } = await client.query(
        `
        SELECT passed FROM public.eval_requirement_leaf(
          $1, 'credential', $2, NULL, 'community', $3, $3
        ) LIMIT 1
      `,
        [memberUserId, credentialId, communityId],
      );
      record("Leaf credential", typeof leafCred[0]?.passed === "boolean", `passed=${leafCred[0]?.passed}`);
    } else {
      record("Leaf credential", true, "keine Credential in Community — übersprungen");
    }

    const { rows: collRows } = await client.query(
      `
      SELECT cc.id FROM public.credential_collections cc
      JOIN public.credential_collection_items cci ON cci.collection_id = cc.id
      WHERE cc.community_id = $1 LIMIT 1
    `,
      [communityId],
    );
    collectionId = collRows[0]?.id;
    if (collectionId) {
      const { rows: leafColl } = await client.query(
        `
        SELECT passed FROM public.eval_requirement_leaf(
          $1, 'collection', $2, NULL, 'community', $3, $3
        ) LIMIT 1
      `,
        [memberUserId, collectionId, communityId],
      );
      record("Leaf collection", typeof leafColl[0]?.passed === "boolean", `passed=${leafColl[0]?.passed}`);
    } else {
      record("Leaf collection", true, "keine Sammlung — übersprungen");
    }

    await client.query(
      `
      INSERT INTO public.requirement_sets (id, resource_type, resource_id, community_id, severity, is_active)
      VALUES ($1, 'community', $2, $3, 'required', TRUE)
    `,
      [tempSetId, tempResourceId, communityId],
    );

    const andRootId = randomUUID();
    const andChild1 = randomUUID();
    const andChild2 = randomUUID();

    await client.query(
      `
      INSERT INTO public.requirement_nodes (id, set_id, parent_id, operator, sort_order)
      VALUES ($1, $2, NULL, 'AND', 0)
    `,
      [andRootId, tempSetId],
    );
    await client.query(
      `
      INSERT INTO public.requirement_nodes
        (id, set_id, parent_id, operator, predicate_type, predicate_ref_id, sort_order)
      VALUES
        ($1, $2, $3, 'LEAF', 'membership', $4, 0),
        ($5, $2, $3, 'LEAF', 'role', NULL, 1)
    `,
      [andChild1, tempSetId, andRootId, communityId, andChild2],
    );
    await client.query(
      `UPDATE public.requirement_nodes SET predicate_value = 'member' WHERE id = $1`,
      [andChild2],
    );

    const { rows: andEval } = await client.query(
      `
      SELECT public.eval_requirement_node($1, $2, 'community', $3, $4) AS passed
    `,
      [memberUserId, andRootId, tempResourceId, communityId],
    );
    record("Operator AND (membership + role)", andEval[0]?.passed === true);

    const orRootId = randomUUID();
    const orChild1 = randomUUID();
    const orChild2 = randomUUID();
    const orSetId = randomUUID();
    const orResourceId = randomUUID();

    await client.query(
      `
      INSERT INTO public.requirement_sets (id, resource_type, resource_id, community_id, severity, is_active)
      VALUES ($1, 'community', $2, $3, 'recommended', TRUE)
    `,
      [orSetId, orResourceId, communityId],
    );
    await client.query(
      `
      INSERT INTO public.requirement_nodes (id, set_id, parent_id, operator, sort_order)
      VALUES ($1, $2, NULL, 'OR', 0)
    `,
      [orRootId, orSetId],
    );
    await client.query(
      `
      INSERT INTO public.requirement_nodes
        (id, set_id, parent_id, operator, predicate_type, predicate_ref_id, predicate_value, sort_order)
      VALUES
        ($1, $2, $3, 'LEAF', 'premium', $4, NULL, 0),
        ($5, $2, $3, 'LEAF', 'membership', $4, NULL, 1)
    `,
      [orChild1, orSetId, orRootId, communityId, orChild2],
    );

    const { rows: orEval } = await client.query(
      `
      SELECT public.eval_requirement_node($1, $2, 'community', $3, $4) AS passed
    `,
      [memberUserId, orRootId, orResourceId, communityId],
    );
    record("Operator OR (premium | membership)", orEval[0]?.passed === true);

    const { rows: reqRequired } = await client.query(
      `
      SELECT public.evaluate_requirements($1, 'community', $2) AS r
    `,
      [memberUserId, tempResourceId],
    );
    const reqObj = reqRequired[0]?.r;
    record(
      "evaluate_requirements severity=required",
      reqObj?.severity === "required" && reqObj?.fulfilled === true,
      `fulfilled=${reqObj?.fulfilled}`,
    );
    record(
      "evaluate_requirements satisfied key",
      Array.isArray(reqObj?.satisfied) || (reqObj?.satisfied && typeof reqObj.satisfied === "object"),
    );

    const { rows: reqRecommended } = await client.query(
      `
      SELECT public.evaluate_requirements($1, 'community', $2) AS r
    `,
      [memberUserId, orResourceId],
    );
    const recObj = reqRecommended[0]?.r;
    record(
      "evaluate_requirements severity=recommended",
      recObj?.severity === "recommended",
      `fulfilled=${recObj?.fulfilled}`,
    );

    await client.query(`DELETE FROM public.requirement_sets WHERE id = $1`, [orSetId]);
  } finally {
    if (tempSetId) {
      await client.query(`DELETE FROM public.requirement_sets WHERE id = $1`, [tempSetId]).catch(() => {});
    }
    await client.end();
  }

  const passed = results.filter((r) => r.ok).length;
  const failed = results.filter((r) => !r.ok);

  const md = `# Requirement Engine Kombinationstests

Stand: ${new Date().toISOString()}

## Ergebnis

${passed}/${results.length} OK${failed.length ? ` — ${failed.length} fehlgeschlagen` : ""}

## Details

${results.map((r) => `- ${r.ok ? "?" : "?"} **${r.name}**${r.note ? ` — ${r.note}` : ""}`).join("\n")}

---

_Automatisch generiert via \`npm run test:requirements\`_
`;
  writeFileSync(REPORT, md, "utf8");
  console.log(`\n? ${REPORT}\n`);

  if (failed.length) process.exit(1);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
