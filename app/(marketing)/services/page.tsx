import { MarketingCtaBar } from "@/components/landing/marketing/MarketingCtaBar";
import { MarketingPageHero } from "@/components/landing/marketing/MarketingPageHero";
import { PublicServiceCardView } from "@/components/landing/marketing/PublicServiceCard";
import { PwaInstallHint } from "@/components/landing/marketing/PwaInstallHint";
import { fetchPublicServices } from "@/lib/marketing/public-client";
import type { PublicServiceCard } from "@/lib/marketing/public-directory.service";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Services",
  description: "Öffentliche Services und Angebote aus UNZE-Communities.",
};

export const revalidate = 60;

export default async function ServicesPage() {
  let services: PublicServiceCard[] = [];
  try {
    services = await fetchPublicServices(24);
  } catch {
    services = [];
  }

  return (
    <>
      <MarketingPageHero
        eyebrow="Services"
        title="Services aus Communities"
        description="Services, Coaching und Angebote — öffentlich sichtbar, Buchung in der UNZE-App."
      >
        <MarketingCtaBar />
      </MarketingPageHero>

      <div className="container mx-auto max-w-6xl px-4 py-10 md:py-14">
        {services.length === 0 ? (
          <p className="text-sm text-gray-500">Derzeit keine öffentlichen Services.</p>
        ) : (
          <div className="grid gap-5 sm:grid-cols-2">
            {services.map((service) => (
              <PublicServiceCardView key={service.id} service={service} />
            ))}
          </div>
        )}
        <div className="mt-12">
          <PwaInstallHint />
        </div>
      </div>
    </>
  );
}
