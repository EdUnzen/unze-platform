import { PrintQuoteButton } from "@/components/studio/PrintQuoteButton";
import { QuotePdfView } from "@/components/studio/QuotePdfView";
import { getStudioQuoteById } from "@/lib/studio/quotes";
import { notFound } from "next/navigation";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function StudioQuotePdfPage({ params }: PageProps) {
  const { id } = await params;
  const quote = await getStudioQuoteById(id);
  if (!quote) notFound();

  return (
    <>
      <PrintQuoteButton />
      <div className="pt-14 print:pt-0">
        <QuotePdfView quote={quote} />
      </div>
    </>
  );
}
