import { publicJsonResponse } from "@/lib/marketing/public-api";
import { getPublicCommunityPreview } from "@/lib/marketing/public-directory.service";

export const revalidate = 60;

export async function GET(
  _request: Request,
  context: { params: Promise<{ slug: string }> },
) {
  const { slug } = await context.params;
  const preview = await getPublicCommunityPreview(slug);
  if (!preview) {
    return publicJsonResponse({ error: "not_found" }, 404);
  }
  return publicJsonResponse(preview);
}
