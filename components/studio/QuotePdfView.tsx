import { StudioDocumentView } from "@/components/studio/StudioDocumentView";

import type { StudioQuote } from "@/lib/studio/quote-types";



interface QuotePdfViewProps {

  quote: StudioQuote;

}



export function QuotePdfView({ quote }: QuotePdfViewProps) {

  return <StudioDocumentView quote={quote} kind="quote" />;

}



interface InvoicePdfViewProps {

  quote: StudioQuote;

}



export function InvoicePdfView({ quote }: InvoicePdfViewProps) {

  return <StudioDocumentView quote={quote} kind="invoice" />;

}

