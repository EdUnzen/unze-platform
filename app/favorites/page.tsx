import { FavoritesSections } from "@/components/favorites/FavoritesSections";
import { PageHeader } from "@/components/layout/PageHeader";
import { FAVORITES_SUBTITLE } from "@/lib/constants/platform-copy";
import { CTA_PLATFORM_DISCOVER } from "@/lib/constants/cta-copy";
import { getCurrentUser } from "@/services/auth/auth.service";
import {
  getFavoritesBundle,
  hasAnyFavorites,
} from "@/services/favorites/favorites.service";
import { Heart } from "lucide-react";
import Link from "next/link";

export default async function FavoritesPage() {
  const user = await getCurrentUser();
  const bundle = user ? await getFavoritesBundle() : null;

  return (
    <div className="page-padding">
      <PageHeader
        title="Favoriten"
        subtitle={FAVORITES_SUBTITLE}
      />

      {!user ? (
        <div className="flex flex-col items-center justify-center rounded-3xl bg-white py-16 shadow-card">
          <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-unze-green-muted">
            <Heart className="h-8 w-8 text-unze-green" aria-hidden />
          </div>
          <p className="text-sm font-medium text-unze-ink">Anmelden erforderlich</p>
          <p className="mt-1 max-w-xs text-center text-sm text-unze-ink-secondary">
            Folge Communities und Gruppen unter Entdecken — sie erscheinen hier.
          </p>
          <Link
            href="/auth/login"
            className="mt-4 text-sm font-medium text-unze-green"
          >
            Jetzt anmelden
          </Link>
        </div>
      ) : bundle && hasAnyFavorites(bundle) ? (
        <FavoritesSections bundle={bundle} />
      ) : (
        <div className="flex flex-col items-center justify-center rounded-3xl bg-white py-16 shadow-card">
          <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-unze-green-muted">
            <Heart className="h-8 w-8 text-unze-green" aria-hidden />
          </div>
          <p className="text-sm font-medium text-unze-ink">Noch keine Favoriten</p>
          <p className="mt-1 max-w-xs text-center text-sm text-unze-ink-secondary">
            Folge Communities und Gruppen unter Entdecken. Events aus gefolgten
            Communities erscheinen hier automatisch.
          </p>
          <Link
            href="/discover"
            className="mt-4 text-sm font-medium text-unze-green"
          >
            {CTA_PLATFORM_DISCOVER}
          </Link>
        </div>
      )}
    </div>
  );
}
