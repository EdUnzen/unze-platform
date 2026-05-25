#!/usr/bin/env node
/**
 * UNZE Validation — siehe docs/testing/AUTOMATED_VALIDATION_AND_PWA_INSTALL_SYSTEM.md
 */
import { execSync } from "child_process";
import { existsSync, readFileSync } from "fs";
import { join } from "path";

const root = process.cwd();
const steps = [];
let failed = false;

function run(name, command) {
  steps.push({ name, status: "running" });
  const idx = steps.length - 1;
  try {
    execSync(command, { cwd: root, stdio: "inherit" });
    steps[idx].status = "ok";
    console.log(`✓ ${name}\n`);
  } catch {
    steps[idx].status = "fail";
    failed = true;
    console.error(`✗ ${name}\n`);
  }
}

function check(name, condition, message) {
  if (condition) {
    console.log(`✓ ${name}`);
  } else {
    console.error(`✗ ${name}: ${message}`);
    failed = true;
  }
}

console.log("\n=== UNZE Validation ===\n");

run("TypeScript", "npm run typecheck");
run("ESLint", "npm run lint");
run("Build", "npm run build");

console.log("--- Structure checks ---\n");

check(
  "PWA manifest",
  existsSync(join(root, "public", "manifest.json")),
  "public/manifest.json fehlt",
);

const manifest = JSON.parse(
  readFileSync(join(root, "public", "manifest.json"), "utf8"),
);
check(
  "Manifest display standalone",
  manifest.display === "standalone",
  "display muss standalone sein",
);

const requiredPaths = [
  "app/layout.tsx",
  "app/page.tsx",
  "app/discover/page.tsx",
  "app/auth/login/page.tsx",
  "middleware.ts",
  "lib/supabase/server.ts",
  "lib/supabase/client.ts",
  "components/navigation/BottomNav.tsx",
  "components/community/CommunityCard.tsx",
  "components/pwa/InstallPrompt.tsx",
  "services/community/community.service.ts",
  "services/auth/auth.service.ts",
  "services/feed/feed.service.ts",
  "services/follow/follow.service.ts",
  "database/migrations/001_initial_schema.sql",
  "database/migrations/002_rls_policies.sql",
  "database/migrations/004_community_groups_discover.sql",
  "app/create/community/page.tsx",
  "app/community/[slug]/edit/page.tsx",
  "components/community/CommunityForm.tsx",
  "services/community/member.service.ts",
  "services/community/group.service.ts",
  "services/dashboard/dashboard.service.ts",
  "services/badges/badge.service.ts",
  "app/dashboard/community/[slug]/page.tsx",
  "app/dashboard/community/[slug]/members/page.tsx",
  "components/dashboard/DashboardTabs.tsx",
  "database/migrations/005_dashboard_member_access.sql",
  "database/migrations/006_community_access_governance.sql",
  "services/access/access.service.ts",
  "services/access/access.repository.ts",
  "lib/permissions/community.permissions.ts",
  "app/dashboard/community/[slug]/access/page.tsx",
  "components/dashboard/AccessSettingsPanel.tsx",
  "components/dashboard/ApplicationReviewList.tsx",
  "database/migrations/007_invite_links_approval.sql",
  "services/access/invite.service.ts",
  "services/access/invite.repository.ts",
  "app/dashboard/community/[slug]/requests/page.tsx",
  "app/invite/[code]/page.tsx",
  "components/dashboard/InviteLinkManager.tsx",
  "components/dashboard/JoinRequestsDashboard.tsx",
  "lib/access/lifecycle-notifications.ts",
  "services/lifecycle/restriction.service.ts",
  "database/migrations/008_community_lifecycle.sql",
  "database/migrations/009_join_approval_modes.sql",
  "components/dashboard/RestrictionsPanel.tsx",
  "app/dashboard/lifecycle-actions.ts",
  "database/migrations/010_platform_governance.sql",
  "lib/permissions/engine.ts",
  "lib/permissions/definitions.ts",
  "services/governance/audit.service.ts",
  "services/governance/report.service.ts",
  "services/governance/moderation.service.ts",
  "services/governance/permission.service.ts",
  "services/governance/soft-delete.service.ts",
  "services/trust/trust.service.ts",
  "services/notifications/notification-center.service.ts",
  "lib/notifications/events.ts",
  "types/governance.ts",
  "app/dashboard/governance-actions.ts",
  "app/notifications/page.tsx",
  "components/dashboard/ModerationPanel.tsx",
  "components/dashboard/AuditLogPanel.tsx",
  "components/governance/ReportDialog.tsx",
  "database/migrations/011_storage_proofs.sql",
  "lib/storage/buckets.ts",
  "lib/storage/validation.ts",
  "services/storage/storage.service.ts",
  "services/storage/proof.service.ts",
  "components/dashboard/ApplicationProofViewer.tsx",
  "app/dashboard/proof-actions.ts",
  "database/migrations/012_verification_system.sql",
  "types/verification.ts",
  "services/verification/verification.service.ts",
  "components/verification/CreatorVerificationForm.tsx",
  "components/verification/VerificationReviewPanel.tsx",
  "app/verify/creator/page.tsx",
  "app/dashboard/verification/page.tsx",
  "database/migrations/013_platform_events.sql",
  "database/migrations/014_platform_integrity.sql",
  "lib/auth/routes.ts",
  "types/events.ts",
  "lib/events/catalog.ts",
  "lib/events/registry.ts",
  "lib/events/mappings.ts",
  "lib/platform/services.ts",
  "services/platform/event-bus.service.ts",
  "services/platform/event.repository.ts",
  "services/platform/activity.service.ts",
  "services/platform/discover.service.ts",
  "services/platform/billing.service.ts",
  "services/platform/membership.service.ts",
  "services/platform/handlers/notification.handler.ts",
  "services/platform/handlers/audit.handler.ts",
  "components/dashboard/ActivityFeed.tsx",
  "lib/access/join-questions.ts",
  "components/dashboard/DashboardAttentionPanel.tsx",
  "components/dashboard/DashboardQuickNav.tsx",
  "components/dashboard/CommunityLifecyclePanel.tsx",
  "components/dashboard/ApplicationAnswersPanel.tsx",
  "components/dashboard/StatusBadge.tsx",
  "components/layout/PlatformTopBar.tsx",
  "components/community/CommunityManageButton.tsx",
  "components/feed/PostComposer.tsx",
  "components/feed/FeedPostList.tsx",
  "lib/notifications/resolve-link.ts",
  "app/create/post/page.tsx",
  "app/create/post-actions.ts",
  "lib/discover/filter-communities.ts",
  "services/creator/creator.service.ts",
  "services/creator/creator.repository.ts",
  "types/creator.ts",
  "lib/notifications/realtime.ts",
  "components/community/CommunityHeader.tsx",
  "components/community/CommunityMetaGrid.tsx",
  "components/community/CommunityAtAGlance.tsx",
  "components/discover/DiscoverFilters.tsx",
  "components/discover/CreatorCard.tsx",
  "docs/testing/PLATFORM_BETA_FLOW.md",
  "docs/testing/REAL_E2E_FLOW.md",
  "docs/testing/LOCAL_PLATFORM_TEST.md",
  "docs/testing/DEMO_PLATFORM_TEST.md",
  "docs/testing/SETUP_NOW.md",
  "database/BUNDLE_all_migrations.sql",
  "scripts/check-supabase.mjs",
  "scripts/seed-demo-platform.mjs",
];

for (const p of requiredPaths) {
  check(`Path: ${p}`, existsSync(join(root, p)), "Datei fehlt");
}

console.log("\n=== Ergebnis ===\n");
if (failed) {
  console.error("Validation FEHLGESCHLAGEN\n");
  process.exit(1);
}
console.log("Validation ERFOLGREICH\n");
