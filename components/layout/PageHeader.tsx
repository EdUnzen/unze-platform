interface PageHeaderProps {
  title: string;
  subtitle?: string;
}

export function PageHeader({ title, subtitle }: PageHeaderProps) {
  return (
    <header className="mb-6">
      <h1 className="text-2xl font-bold tracking-tight text-unze-ink">{title}</h1>
      {subtitle && (
        <p className="mt-1 text-sm text-unze-ink-secondary">{subtitle}</p>
      )}
    </header>
  );
}
