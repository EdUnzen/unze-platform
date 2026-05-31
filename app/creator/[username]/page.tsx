import { CreatorPublicProfileView } from "@/components/creator/CreatorPublicProfileView";
import { getCreatorPublicProfile } from "@/services/creator/creator.service";
import { notFound } from "next/navigation";

interface CreatorProfilePageProps {
  params: Promise<{ username: string }>;
}

export default async function CreatorProfilePage({ params }: CreatorProfilePageProps) {
  const { username } = await params;
  const profile = await getCreatorPublicProfile(username);
  if (!profile) notFound();

  return <CreatorPublicProfileView profile={profile} />;
}
