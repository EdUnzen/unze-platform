import PlatformAreaLayout from "@/components/layout/PlatformAreaLayout";
import { requirePlatformOwner } from "@/services/platform/owner-access.service";

export default async function OwnerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await requirePlatformOwner();
  return <PlatformAreaLayout>{children}</PlatformAreaLayout>;
}
