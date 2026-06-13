import { revalidatePath, revalidateTag } from "next/cache";

/** Discover-Liste (unstable_cache tag) + Route invalidieren. */
export function revalidateDiscover() {
  revalidateTag("discover");
  revalidateTag("discover-events");
  revalidatePath("/discover");
}