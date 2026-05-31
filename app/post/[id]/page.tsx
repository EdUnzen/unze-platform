import { redirect } from "next/navigation";

interface PostPageProps {
  params: Promise<{ id: string }>;
}

export default async function PostPage({ params }: PostPageProps) {
  await params;
  redirect("/discover?tab=communities");
}
