import { redirect } from "next/navigation";

export default function CreatePostPage() {
  redirect("/discover?tab=events");
}
