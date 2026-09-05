export type VapidConfig = {
  subject: string;
  publicKey: string;
  privateKey: string;
};

export function isPushConfigured(): boolean {
  return Boolean(
    process.env.VAPID_PUBLIC_KEY &&
      process.env.VAPID_PRIVATE_KEY &&
      process.env.VAPID_SUBJECT,
  );
}

export function getVapidPublicKey(): string | null {
  return process.env.VAPID_PUBLIC_KEY ?? null;
}

export function getVapidConfig(): VapidConfig {
  const publicKey = process.env.VAPID_PUBLIC_KEY;
  const privateKey = process.env.VAPID_PRIVATE_KEY;
  const subject =
    process.env.VAPID_SUBJECT ??
    process.env.BUSINESS_NOTIFY_EMAIL ??
    "mailto:support@unze.app";

  if (!publicKey || !privateKey) {
    throw new Error("VAPID-Schlüssel fehlen (VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY)");
  }

  return { subject, publicKey, privateKey };
}
