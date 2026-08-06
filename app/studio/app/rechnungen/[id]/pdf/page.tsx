import { PrintQuoteButton } from "@/components/studio/PrintQuoteButton";

import { InvoicePdfView } from "@/components/studio/QuotePdfView";

import { getStudioQuoteById } from "@/lib/studio/quotes";

import { notFound, redirect } from "next/navigation";



interface PageProps {

  params: Promise<{ id: string }>;

}



export default async function StudioInvoicePdfPage({ params }: PageProps) {

  const { id } = await params;

  const quote = await getStudioQuoteById(id);

  if (!quote) notFound();



  if (quote.paymentStatus !== "paid" && quote.amountPaidCents <= 0) {

    redirect(`/studio/app/angebote/${id}/pdf`);

  }



  return (

    <>

      <PrintQuoteButton label="Rechnung als PDF speichern / Drucken" />

      <div className="pt-14 print:pt-0">

        <InvoicePdfView quote={quote} />

      </div>

    </>

  );

}

