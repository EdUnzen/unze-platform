/** Feed-Mischung: Follow-basiert + Explore-Anteil */

export const FEED_EXPLORE_RATIO = 0.12;

export type FeedSource = "follow" | "explore";

export function getExploreInsertInterval(): number {
  return Math.max(5, Math.round(1 / FEED_EXPLORE_RATIO));
}

export function interleaveFeedPosts<T extends { id: string }>(
  followPosts: T[],
  explorePosts: T[],
  limit: number,
): T[] {
  const seen = new Set<string>();
  const follow = followPosts.filter((p) => {
    if (seen.has(p.id)) return false;
    seen.add(p.id);
    return true;
  });
  const explore = explorePosts.filter((p) => {
    if (seen.has(p.id)) return false;
    seen.add(p.id);
    return true;
  });

  const interval = getExploreInsertInterval();
  const result: T[] = [];
  let fi = 0;
  let ei = 0;

  while (result.length < limit && (fi < follow.length || ei < explore.length)) {
    const shouldExplore =
      result.length > 0 &&
      result.length % interval === 0 &&
      ei < explore.length;

    if (shouldExplore) {
      result.push(explore[ei++]);
    } else if (fi < follow.length) {
      result.push(follow[fi++]);
    } else if (ei < explore.length) {
      result.push(explore[ei++]);
    } else {
      break;
    }
  }

  return result;
}
