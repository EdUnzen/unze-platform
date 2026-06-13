import { requirePlatformOwner } from "@/services/platform/owner-access.service";

export default async function OwnerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await requirePlatformOwner();
  return <>{children}</>;
}
