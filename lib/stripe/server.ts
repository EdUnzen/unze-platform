import { getStripeSecretKey } from "./config";

/** Lazy Stripe-Client — nur serverseitig */
export async function getStripeClient() {
  const secret = getStripeSecretKey();
  if (!secret) return null;

  const Stripe = (await import("stripe")).default;
  return new Stripe(secret, {
    apiVersion: "2026-06-24.dahlia",
    typescript: true,
  });
}
