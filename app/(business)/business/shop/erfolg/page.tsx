import Link from "next/link";
import { BusinessSection } from "@/components/business/BusinessUi";
import { shopSlugToAnalysisTier } from "@/lib/business/analysis-shop";
import { getShopOrderByReference } from "@/lib/studio/shop-orders";

interface PageProps {
  searchParams: Promise<{ ref?: string }>;
}

export default async function ShopSuccessPage({ searchParams }: PageProps) {
  const { ref } = await searchParams;
  const order = ref ? await getShopOrderByReference(ref) : null;
  const analyseTier = order ? shopSlugToAnalysisTier(order.productSlug) : null;
  const analyseFormHref =
    analyseTier && order
      ? `/business/analyse?tier=${analyseTier}&order=${encodeURIComponent(order.referenceId)}#analyse-formular`
      : null;

  return (
    <BusinessSection>
      <div className="container mx-auto max-w-lg px-4 py-16 text-center">
        <h1 className="font-[family-name:var(--font-display)] text-3xl font-bold text-gray-900">
          Vielen Dank für Ihre Buchung
        </h1>
        {order ? (
          <>
            <p className="mt-4 text-gray-600">
              Auftrag <span className="font-mono font-semibold">{order.referenceId}</span> —{" "}
              {order.productName}
            </p>
            <p className="mt-2 text-sm text-gray-500">
              Sie erhalten in Kürze eine Bestätigung an {order.customerEmail}.
            </p>
            {analyseFormHref ? (
              <Link
                href={analyseFormHref}
                className="mt-6 inline-flex rounded-full bg-[#00C853] px-6 py-3 text-sm font-semibold text-white hover:bg-[#00b34a]"
              >
                Analyse-Formular jetzt ausfüllen
              </Link>
            ) : null}
          </>
        ) : (
          <p className="mt-4 text-gray-600">Ihre Zahlung wurde empfangen.</p>
        )}
        <Link
          href="/business/shop"
          className="mt-8 inline-block text-sm font-semibold text-[#00C853] hover:underline"
        >
          Zurück zum Shop
        </Link>
      </div>
    </BusinessSection>
  );
}
