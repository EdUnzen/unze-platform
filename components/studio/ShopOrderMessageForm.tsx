"use client";

import { sendShopOrderMessageAction } from "@/lib/studio/shop-order-actions";
import { useRouter } from "next/navigation";
import { useState } from "react";

export function ShopOrderMessageForm({ orderId }: { orderId: string }) {
  const router = useRouter();
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [feedback, setFeedback] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setFeedback(null);

    const result = await sendShopOrderMessageAction({ orderId, subject, body });
    setLoading(false);

    if ("error" in result && result.error) {
      setFeedback(result.error);
      return;
    }

    setSubject("");
    setBody("");
    setFeedback(
      "warning" in result && result.warning
        ? result.warning
        : "Nachricht gesendet und im Verlauf gespeichert.",
    );
    router.refresh();
  }

  return (
    <form onSubmit={onSubmit} className="mt-6 space-y-3 rounded-xl border border-gray-200 bg-gray-50 p-4">
      <h3 className="text-sm font-semibold text-gray-900">Nachricht an Kunden (E-Mail + Verlauf)</h3>
      <input
        value={subject}
        onChange={(e) => setSubject(e.target.value)}
        placeholder="Betreff (optional)"
        className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
      />
      <textarea
        required
        rows={4}
        value={body}
        onChange={(e) => setBody(e.target.value)}
        placeholder="Ihre Nachricht…"
        className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
      />
      {feedback ? <p className="text-sm text-emerald-700">{feedback}</p> : null}
      <button
        type="submit"
        disabled={loading}
        className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-700 disabled:opacity-50"
      >
        Senden
      </button>
    </form>
  );
}
