"use client";

import { formatEuroCents } from "@/lib/business/pricing-utils";
import { updateQuoteAction } from "@/lib/studio/quote-actions";
import type { QuoteLineItem, StudioQuote } from "@/lib/studio/quote-types";
import { useMemo, useState } from "react";

interface QuoteEditorProps {
  quote: StudioQuote;
}

function recalcTotals(lineItems: QuoteLineItem[], taxRate: number) {
  const subtotalCents = lineItems.reduce((s, i) => s + i.quantity * i.unitCents, 0);
  const taxCents = Math.round(subtotalCents * (taxRate / 100));
  return { subtotalCents, taxCents, totalCents: subtotalCents + taxCents };
}

export function QuoteEditor({ quote }: QuoteEditorProps) {
  const [lineItems, setLineItems] = useState<QuoteLineItem[]>(quote.lineItems);
  const totals = useMemo(() => recalcTotals(lineItems, quote.taxRate), [lineItems, quote.taxRate]);

  function updateItem(index: number, patch: Partial<QuoteLineItem>) {
    setLineItems((items) =>
      items.map((item, i) => (i === index ? { ...item, ...patch } : item)),
    );
  }

  function addItem() {
    setLineItems((items) => [...items, { label: "Neue Position", quantity: 1, unitCents: 0 }]);
  }

  function removeItem(index: number) {
    setLineItems((items) => items.filter((_, i) => i !== index));
  }

  return (
    <form action={updateQuoteAction} className="space-y-4">
      <input type="hidden" name="quoteId" value={quote.id} />
      <input type="hidden" name="lineItemsJson" value={JSON.stringify(lineItems)} />

      <div>
        <label htmlFor="title" className="block text-xs font-medium text-gray-500">
          Titel
        </label>
        <input
          id="title"
          name="title"
          defaultValue={quote.title ?? ""}
          className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
        />
      </div>

      <div className="space-y-3">
        <p className="text-xs font-medium uppercase tracking-wide text-gray-400">Positionen</p>
        {lineItems.map((item, index) => (
          <div key={index} className="grid gap-2 rounded-lg border border-gray-200 p-3 sm:grid-cols-[1fr_80px_120px_auto]">
            <input
              value={item.label}
              onChange={(e) => updateItem(index, { label: e.target.value })}
              className="rounded border border-gray-300 px-2 py-1.5 text-sm"
              placeholder="Beschreibung"
            />
            <input
              type="number"
              min={1}
              value={item.quantity}
              onChange={(e) => updateItem(index, { quantity: Number(e.target.value) || 1 })}
              className="rounded border border-gray-300 px-2 py-1.5 text-sm"
            />
            <input
              type="number"
              min={0}
              step={100}
              value={item.unitCents}
              onChange={(e) => updateItem(index, { unitCents: Number(e.target.value) || 0 })}
              className="rounded border border-gray-300 px-2 py-1.5 text-sm"
              title="Cent"
            />
            <button
              type="button"
              onClick={() => removeItem(index)}
              className="text-xs text-red-600 hover:underline"
            >
              Entfernen
            </button>
          </div>
        ))}
        <button type="button" onClick={addItem} className="text-sm text-emerald-700 hover:underline">
          + Position hinzufügen
        </button>
      </div>

      <div>
        <label htmlFor="notes" className="block text-xs font-medium text-gray-500">
          Hinweise
        </label>
        <textarea
          id="notes"
          name="notes"
          rows={3}
          defaultValue={quote.notes ?? ""}
          className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
        />
      </div>

      <dl className="rounded-lg bg-gray-50 p-4 text-sm">
        <div className="flex justify-between">
          <dt className="text-gray-500">Netto</dt>
          <dd>{formatEuroCents(totals.subtotalCents)}</dd>
        </div>
        <div className="mt-1 flex justify-between">
          <dt className="text-gray-500">MwSt. ({quote.taxRate}%)</dt>
          <dd>{formatEuroCents(totals.taxCents)}</dd>
        </div>
        <div className="mt-2 flex justify-between border-t border-gray-200 pt-2 font-semibold">
          <dt>Gesamt</dt>
          <dd>{formatEuroCents(totals.totalCents)}</dd>
        </div>
      </dl>

      <button
        type="submit"
        className="rounded-lg px-4 py-2 text-sm font-semibold text-white"
        style={{ backgroundColor: "#1DB872" }}
      >
        Angebot speichern
      </button>
    </form>
  );
}
