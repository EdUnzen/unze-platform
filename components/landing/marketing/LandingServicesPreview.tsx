import { CtaLink } from "@/components/landing/LegalPage";
import { PublicServiceCardView } from "@/components/landing/marketing/PublicServiceCard";
import { fetchPublicServices } from "@/lib/marketing/public-client";
import type { PublicServiceCard } from "@/lib/marketing/public-directory.service";

export async function LandingServicesPreview() {
  let services: PublicServiceCard[] = [];
  try {
    services = await fetchPublicServices(3);
  } catch {
    services = [];
  }

  if (services.length === 0) return null;

  return (
    <section className="bg-gray-50 py-16 md:py-20">
      <div className="container mx-auto max-w-6xl px-4">
        <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wider text-[#00C853]">Services</p>
            <h2 className="mt-2 font-[family-name:var(--font-display)] text-2xl font-bold text-gray-900 md:text-3xl">
              Angebote aus Communities
            </h2>
            <p className="mt-2 text-sm text-gray-600">
              Coaching, Kurse und Services — öffentlich sichtbar auf UNZE.
            </p>
          </div>
          <CtaLink href="/services" variant="secondary">
            Alle Services
          </CtaLink>
        </div>
        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {services.map((service) => (
            <PublicServiceCardView key={service.id} service={service} />
          ))}
        </div>
      </div>
    </section>
  );
}
