import type { PlatformCreator } from "@/types/creator";
import { fetchDiscoverCreatorsFromDb } from "./creator.repository";

export async function getDiscoverCreators(limit = 20): Promise<PlatformCreator[]> {
  return fetchDiscoverCreatorsFromDb(limit);
}

export async function getCreatorById(
  creatorId: string,
): Promise<PlatformCreator | null> {
  const { fetchCreatorByIdFromDb } = await import("./creator.repository");
  return fetchCreatorByIdFromDb(creatorId);
}
