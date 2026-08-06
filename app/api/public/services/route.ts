import { publicJsonResponse } from "@/lib/marketing/public-api";
import { getPublicServicesDirectory } from "@/lib/marketing/public-directory.service";

export const revalidate = 60;

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const limit = Math.min(Number(searchParams.get("limit") ?? 24), 100);
  const services = await getPublicServicesDirectory(limit);
  return publicJsonResponse({ services });
}
