"use client";

import { StudioAreaList } from "@/components/studio/StudioAreaList";
import { usePathname } from "next/navigation";

export default function StudioMehrPage() {
  const pathname = usePathname() ?? "/studio/app/mehr";

  return (
    <div className="mx-auto max-w-lg px-4 py-8 sm:px-6">
      <h1 className="font-[family-name:var(--font-display)] text-2xl font-bold text-gray-900">
        Bereiche
      </h1>
      <p className="mt-1 text-sm text-gray-600">
        Dieselbe Landkarte wie oben links — alle Räume auf einer Seite.
      </p>
      <div className="mt-8">
        <StudioAreaList pathname={pathname} />
      </div>
    </div>
  );
}
