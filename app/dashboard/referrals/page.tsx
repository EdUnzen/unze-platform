import { redirect } from "next/navigation";

/** Legacy-Route → Crowd Partner */
export default function DashboardReferralsRedirect() {
  redirect("/dashboard/crowd-partner");
}
