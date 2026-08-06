"use client";

import { BUSINESS_COPY } from "@/lib/constants/business-copy";
import { useState } from "react";

export function BusinessFaqAccordion({ theme = "light" }: { theme?: "light" | "dark" }) {
  const [openIndex, setOpenIndex] = useState<number | null>(0);
  const items = BUSINESS_COPY.faq;
  const dark = theme === "dark";

  return (
    <div className="space-y-3">
      {items.map((item, i) => {
        const open = openIndex === i;
        return (
          <div
            key={item.q}
            className={`overflow-hidden rounded-2xl border transition ${
              dark
                ? "border-white/10 bg-white/5"
                : "border-gray-200 bg-white shadow-sm"
            }`}
          >
            <button
              type="button"
              onClick={() => setOpenIndex(open ? null : i)}
              className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left"
              aria-expanded={open}
            >
              <span className={`font-medium ${dark ? "text-white" : "text-gray-900"}`}>{item.q}</span>
              <span
                className={`shrink-0 text-lg transition-transform ${open ? "rotate-45" : ""} ${
                  dark ? "text-white/60" : "text-gray-400"
                }`}
                aria-hidden
              >
                +
              </span>
            </button>
            {open ? (
              <p
                className={`border-t px-5 pb-4 pt-2 text-sm leading-relaxed ${
                  dark ? "border-white/10 text-white/75" : "border-gray-100 text-gray-600"
                }`}
              >
                {item.a}
              </p>
            ) : null}
          </div>
        );
      })}
    </div>
  );
}
