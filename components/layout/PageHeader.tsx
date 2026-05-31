import Link from "next/link";
import { ChevronLeft } from "lucide-react";

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  backHref?: string;
  backLabel?: string;
}

export function PageHeader({
  title,
  subtitle,
  backHref,
  backLabel = "Zurück",
}: PageHeaderProps) {
  return (
    <header className="mb-6">
      {backHref && (
        <Link
          href={backHref}
          className="mb-3 inline-flex items-center gap-1 text-sm font-medium text-unze-green"
        >
          <ChevronLeft className="h-4 w-4" aria-hidden />
          {backLabel}
        </Link>
      )}
      <h1 className="text-2xl font-bold tracking-tight text-unze-ink">{title}</h1>
      {subtitle && (
        <p className="mt-1 text-sm text-unze-ink-secondary">{subtitle}</p>
      )}
    </header>
  );
}
