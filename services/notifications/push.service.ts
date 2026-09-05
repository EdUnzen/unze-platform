import webpush from "web-push";
import { getVapidConfig, isPushConfigured } from "@/lib/push/vapid";
import { createAdminClient } from "@/lib/supabase/admin";

export async function sendPushToUser(input: {
  userId: string;
  title: string;
  body?: string;
  url?: string;
}): Promise<void> {
  if (!isPushConfigured()) return;

  const admin = createAdminClient();
  if (!admin) return;

  const { data: subs } = await admin
    .from("push_subscriptions")
    .select("endpoint, p256dh, auth")
    .eq("user_id", input.userId);

  if (!subs?.length) return;

  const vapid = getVapidConfig();
  webpush.setVapidDetails(vapid.subject, vapid.publicKey, vapid.privateKey);

  const payload = JSON.stringify({
    title: input.title,
    body: input.body ?? "",
    url: input.url ?? "/notifications",
    icon: "/icons/icon-192.png",
  });

  await Promise.allSettled(
    subs.map(async (sub) => {
      try {
        await webpush.sendNotification(
          {
            endpoint: sub.endpoint,
            keys: { p256dh: sub.p256dh, auth: sub.auth },
          },
          payload,
        );
      } catch (err) {
        const statusCode =
          err && typeof err === "object" && "statusCode" in err
            ? (err as { statusCode?: number }).statusCode
            : undefined;
        if (statusCode === 404 || statusCode === 410) {
          await admin
            .from("push_subscriptions")
            .delete()
            .eq("endpoint", sub.endpoint);
        }
      }
    }),
  );
}
