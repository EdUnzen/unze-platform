import { redirect } from "next/navigation";

/** Legacy-Route \u2192 Crowd Partner */
export default function DashboardReferralsRedirect() {
  redirect("/dashboard/crowd-partner");
}
