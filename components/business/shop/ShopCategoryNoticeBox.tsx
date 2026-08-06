import type { ShopCategoryNotice } from "@/lib/constants/business-shop-category-notices";
import { Info } from "lucide-react";

type ShopCategoryNoticeBoxProps = {
  notice: ShopCategoryNotice;
};

export function ShopCategoryNoticeBox({ notice }: ShopCategoryNoticeBoxProps) {
  return (
    <div className="mb-5 flex gap-3 rounded-xl border border-emerald-100 bg-emerald-50/60 px-4 py-3.5">
      <Info className="mt-0.5 h-4 w-4 shrink-0 text-[#00C853]" aria-hidden />
      <div>
        <p className="text-sm font-semibold text-gray-900">{notice.title}</p>
        <p className="mt-1 text-xs leading-relaxed text-gray-600">{notice.body}</p>
      </div>
    </div>
  );
}

type ShopProductFulfillmentNoteProps = {
  title: string;
  body: string;
};

export function ShopProductFulfillmentNote({ title, body }: ShopProductFulfillmentNoteProps) {
  return (
    <div className="rounded-xl border border-violet-100 bg-violet-50/50 px-4 py-3.5">
      <p className="text-sm font-semibold text-gray-900">{title}</p>
      <p className="mt-1 text-sm leading-relaxed text-gray-700">{body}</p>
    </div>
  );
}
