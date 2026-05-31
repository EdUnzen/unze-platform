import { redirect } from "next/navigation";

/** Legacy-Route — einheitliches Verifizierungszentrum unter /verify/creator */
export default function DashboardVerificationRedirect() {
  redirect("/verify/creator");
}
