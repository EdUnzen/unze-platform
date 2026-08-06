import Link from "next/link";
import { BusinessSection } from "@/components/business/BusinessUi";

export default function ShopCancelledPage() {
  return (
    <BusinessSection>
      <div className="container mx-auto max-w-lg px-4 py-16 text-center">
        <h1 className="font-[family-name:var(--font-display)] text-3xl font-bold text-gray-900">
          Zahlung abgebrochen
        </h1>
        <p className="mt-4 text-gray-600">
          Es wurde nichts berechnet. Sie können jederzeit erneut buchen.
        </p>
        <Link
          href="/business/shop"
          className="mt-8 inline-block text-sm font-semibold text-[#00C853] hover:underline"
        >
          Zum Shop
        </Link>
      </div>
    </BusinessSection>
  );
}
