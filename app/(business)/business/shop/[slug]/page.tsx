import { redirect } from "next/navigation";
import { shopSlugToInquiryHref } from "@/lib/business/inquiry-links";

type PageProps = {
  params: Promise<{ slug: string }>;
};

/** Öffentlicher Shop entfernt — Weiterleitung zum Anfrageformular mit Vorauswahl */
export default async function Page({ params }: PageProps) {
  const { slug } = await params;
  redirect(shopSlugToInquiryHref(slug));
}
