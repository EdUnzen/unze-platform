import { getCurrentUser } from "@/services/auth/auth.service";
import { redirect } from "next/navigation";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getCurrentUser();
  if (!user) {
    redirect("/auth/login?next=/dashboard");
  }

  return <>{children}</>;
}
