import { CreatorPublicProfileView } from "@/components/creator/CreatorPublicProfileView";
import { getCreatorPublicProfileById } from "@/services/creator/creator.service";
import { notFound } from "next/navigation";

interface CreatorIdProfilePageProps {
  params: Promise<{ id: string }>;
}

export default async function CreatorIdProfilePage({ params }: CreatorIdProfilePageProps) {
  const { id } = await params;
  const profile = await getCreatorPublicProfileById(id);
  if (!profile) notFound();

  return <CreatorPublicProfileView profile={profile} />;
}
