import { redirect } from "next/navigation";
import { BUSINESS_KONTAKT_HREF } from "@/lib/business/inquiry-links";

/** Öffentlicher Shop entfernt — alles über Anfrageformular & Studio */
export default function Page() {
  redirect(BUSINESS_KONTAKT_HREF);
}
