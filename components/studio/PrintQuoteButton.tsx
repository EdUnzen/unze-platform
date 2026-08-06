"use client";

type PrintQuoteButtonProps = {
  label?: string;
};

export function PrintQuoteButton({
  label = "Als PDF speichern / Drucken",
}: PrintQuoteButtonProps) {
  return (
    <div className="fixed inset-x-0 top-0 z-50 border-b border-gray-200 bg-white px-4 py-3 text-center text-sm print:hidden">
      <button
        type="button"
        onClick={() => window.print()}
        className="rounded-lg bg-emerald-600 px-4 py-2 font-semibold text-white"
      >
        {label}
      </button>
    </div>
  );
}
