export type StripeMode = "sandbox" | "live" | "disabled";

function readEnv(name: string): string | undefined {
  return process.env[name]?.trim() || undefined;
}

export function isStripeConfigured(): boolean {
  return Boolean(readEnv("STRIPE_SECRET_KEY"));
}

export function getStripePublishableKey(): string | null {
  return readEnv("NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY") ?? null;
}

export function getStripeSecretKey(): string | null {
  return readEnv("STRIPE_SECRET_KEY") ?? null;
}

export function getStripeWebhookSecret(): string | null {
  return readEnv("STRIPE_WEBHOOK_SECRET") ?? null;
}

export function getStripeMode(): StripeMode {
  const key = getStripeSecretKey();
  if (!key) return "disabled";
  if (key.startsWith("sk_test_")) return "sandbox";
  if (key.startsWith("sk_live_")) return "live";
  return "sandbox";
}
