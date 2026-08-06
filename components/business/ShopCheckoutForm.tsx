"use client";



import { useState } from "react";

import { CreditCard, Loader2, Lock } from "lucide-react";

import type { ShopProduct } from "@/lib/constants/business-shop-catalog";



type ShopCheckoutFormProps = {

  product: ShopProduct;

  source?: string | null;

  theme?: "light" | "dark";

};



export function ShopCheckoutForm({ product, source, theme = "light" }: ShopCheckoutFormProps) {

  const [customerName, setCustomerName] = useState("");

  const [customerEmail, setCustomerEmail] = useState("");

  const [company, setCompany] = useState("");

  const [message, setMessage] = useState("");

  const [error, setError] = useState<string | null>(null);

  const [loading, setLoading] = useState(false);



  async function onSubmit(e: React.FormEvent) {

    e.preventDefault();

    setError(null);

    setLoading(true);



    try {

      const res = await fetch("/api/business/shop/checkout", {

        method: "POST",

        headers: { "Content-Type": "application/json" },

        body: JSON.stringify({

          productSlug: product.slug,

          customerName,

          customerEmail,

          company: company || null,

          message: message || null,

          source: source ?? null,

        }),

      });



      const json = (await res.json()) as { checkoutUrl?: string; error?: string };

      if (!res.ok || !json.checkoutUrl) {

        setError(json.error ?? "Checkout fehlgeschlagen");

        setLoading(false);

        return;

      }



      window.location.href = json.checkoutUrl;

    } catch {

      setError("Netzwerkfehler — bitte erneut versuchen");

      setLoading(false);

    }

  }



  const isDark = theme === "dark";

  const labelClass = isDark ? "text-white/80" : "text-gray-700";

  const inputClass = isDark

    ? "mt-1 w-full rounded-xl border border-white/15 bg-white/5 px-3 py-2.5 text-sm text-white placeholder:text-white/30 transition focus:border-[#00C853]/50 focus:bg-white/10 focus:outline-none focus:ring-2 focus:ring-[#00C853]/20"

    : "mt-1 w-full rounded-xl border border-gray-200 bg-gray-50/50 px-3 py-2.5 text-sm transition focus:border-[#00C853]/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#00C853]/20";

  const trustBoxClass = isDark

    ? "rounded-xl border border-white/10 bg-white/5 p-4 text-xs text-white/60"

    : "rounded-xl bg-gray-50 p-4 text-xs text-gray-600";

  const trustTitleClass = isDark ? "font-medium text-white/90" : "font-medium text-gray-800";

  const errorClass = isDark

    ? "rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-300"

    : "rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600";



  return (

    <form onSubmit={onSubmit} className="space-y-3.5">

      <div>

        <label htmlFor="shop-name" className={`block text-sm font-medium ${labelClass}`}>

          Name *

        </label>

        <input

          id="shop-name"

          required

          value={customerName}

          onChange={(e) => setCustomerName(e.target.value)}

          className={inputClass}

        />

      </div>

      <div>

        <label htmlFor="shop-email" className={`block text-sm font-medium ${labelClass}`}>

          E-Mail *

        </label>

        <input

          id="shop-email"

          type="email"

          required

          value={customerEmail}

          onChange={(e) => setCustomerEmail(e.target.value)}

          className={inputClass}

        />

      </div>

      <div>

        <label htmlFor="shop-company" className={`block text-sm font-medium ${labelClass}`}>

          Unternehmen

        </label>

        <input

          id="shop-company"

          value={company}

          onChange={(e) => setCompany(e.target.value)}

          className={inputClass}

        />

      </div>

      <div>

        <label htmlFor="shop-message" className={`block text-sm font-medium ${labelClass}`}>

          Nachricht (optional)

        </label>

        <textarea

          id="shop-message"

          rows={3}

          value={message}

          onChange={(e) => setMessage(e.target.value)}

          className={inputClass}

        />

      </div>



      {error ? <p className={errorClass}>{error}</p> : null}



      <div className={trustBoxClass}>

        <p className={`flex items-center gap-2 ${trustTitleClass}`}>

          <Lock className="h-3.5 w-3.5 text-[#00C853]" aria-hidden />

          Sichere Zahlung über Stripe

        </p>

        <p className="mt-2">

          Bearbeitungszeit: {product.processingTime}. Nach der Zahlung erhalten Sie eine Bestätigung

          per E-Mail.

        </p>

      </div>



      <button

        type="submit"

        disabled={loading}

        className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-[#00C853] px-4 py-3.5 text-sm font-semibold text-white shadow-lg shadow-[#00C853]/15 transition hover:bg-[#00b34a] disabled:opacity-60"

      >

        {loading ? (

          <Loader2 className="h-4 w-4 animate-spin" aria-hidden />

        ) : (

          <CreditCard className="h-4 w-4" aria-hidden />

        )}

        {product.priceLabel ?? "Jetzt buchen"} — zur Zahlung

      </button>

    </form>

  );

}


