"use client";

import type { ShopOrderStatus } from "@/lib/studio/shop-order-types";
import { updateShopOrderStatusAction } from "@/lib/studio/shop-order-actions";
import { useRouter } from "next/navigation";
import { useState } from "react";

const STATUS_OPTIONS: { value: ShopOrderStatus; label: string }[] = [
  { value: "paid", label: "Bezahlt" },
  { value: "in_progress", label: "In Bearbeitung" },
  { value: "completed", label: "Erledigt" },
  { value: "cancelled", label: "Storniert" },
];

export function ShopOrderStatusForm({
  orderId,
  currentStatus,
}: {
  orderId: string;
  currentStatus: ShopOrderStatus;
}) {
  const router = useRouter();
  const [status, setStatus] = useState(currentStatus);
  const [loading, setLoading] = useState(false);

  async function onSave() {
    setLoading(true);
    await updateShopOrderStatusAction(orderId, status);
    setLoading(false);
    router.refresh();
  }

  return (
    <div className="flex flex-wrap items-end gap-3">
      <div>
        <label htmlFor="order-status" className="block text-xs font-medium text-gray-500">
          Status
        </label>
        <select
          id="order-status"
          value={status}
          onChange={(e) => setStatus(e.target.value as ShopOrderStatus)}
          className="mt-1 rounded-lg border border-gray-300 px-3 py-2 text-sm"
        >
          {STATUS_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
      </div>
      <button
        type="button"
        onClick={onSave}
        disabled={loading || status === currentStatus}
        className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-700 disabled:opacity-50"
      >
        Speichern
      </button>
    </div>
  );
}
