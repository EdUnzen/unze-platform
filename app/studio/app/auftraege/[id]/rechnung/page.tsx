import { PrintQuoteButton } from "@/components/studio/PrintQuoteButton";
import { ShopOrderInvoiceView } from "@/components/studio/ShopOrderInvoiceView";
import { getShopOrderById } from "@/lib/studio/shop-orders";
import { notFound, redirect } from "next/navigation";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function StudioShopOrderInvoicePage({ params }: PageProps) {
  const { id } = await params;
  const order = await getShopOrderById(id);
  if (!order) notFound();

  if (order.paymentStatus !== "paid") {
    redirect(`/studio/app/auftraege/${id}`);
  }

  return (
    <>
      <PrintQuoteButton label="Rechnung als PDF speichern / Drucken" />
      <div className="pt-14 print:pt-0">
        <ShopOrderInvoiceView order={order} />
      </div>
    </>
  );
}
