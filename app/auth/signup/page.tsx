import { redirect } from "next/navigation";

export default function AuthSignupPage() {
  redirect("/auth/login?mode=signup");
}
