import { createClient } from "@/lib/supabase/server";
import type { CommunityReviewView, ReviewTarget } from "@/types/review";

export type ReviewCommentView = {
  id: string;
  reviewId: string;
  reviewTarget: ReviewTarget;
  authorId: string;
  authorName: string;
  body: string;
  createdAt: string;
};

function mapReviewRow(
  row: Record<string, unknown>,
  target: ReviewTarget,
): CommunityReviewView {
  const profile = Array.isArray(row.profile) ? row.profile[0] : row.profile;
  return {
    id: row.id as string,
    communityId: target === "community" ? (row.community_id as string) : "",
    authorId: row.author_id as string,
    rating: Number(row.rating),
    title: (row.title as string) ?? undefined,
    body: row.body as string,
    createdAt: row.created_at as string,
    authorName:
      (profile?.display_name as string) ??
      (profile?.username as string) ??
      "Mitglied",
    isVerifiedMember: Boolean(profile?.is_verified),
  };
}

const PROFILE_SELECT = `
  profile:profiles!author_id (
    display_name,
    username,
    is_verified
  )
`;

export async function fetchCommunityReviewsFromDb(
  communityId: string,
  limit = 20,
): Promise<CommunityReviewView[]> {
  const supabase = await createClient();
  if (!supabase) return [];

  const { data, error } = await supabase
    .from("community_reviews")
    .select(`*, ${PROFILE_SELECT}`)
    .eq("community_id", communityId)
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) {
    if (error.code === "42P01") return [];
    console.error("[review.repository] community:", error.message);
    return [];
  }

  return (data ?? []).map((row) =>
    mapReviewRow(row as Record<string, unknown>, "community"),
  );
}

export async function fetchGroupReviewsFromDb(
  groupId: string,
  limit = 20,
): Promise<CommunityReviewView[]> {
  const supabase = await createClient();
  if (!supabase) return [];

  const { data, error } = await supabase
    .from("group_reviews")
    .select(`*, ${PROFILE_SELECT}`)
    .eq("group_id", groupId)
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) {
    if (error.code === "42P01") return [];
    console.error("[review.repository] group:", error.message);
    return [];
  }

  return (data ?? []).map((row) =>
    mapReviewRow(
      { ...row, community_id: "" } as Record<string, unknown>,
      "group",
    ),
  );
}

export async function fetchReviewCommentsFromDb(
  reviewId: string,
  reviewTarget: ReviewTarget,
): Promise<ReviewCommentView[]> {
  const supabase = await createClient();
  if (!supabase) return [];

  const { data, error } = await supabase
    .from("review_comments")
    .select(
      `
      id,
      review_id,
      review_target,
      author_id,
      body,
      created_at,
      profile:profiles!author_id (display_name, username)
    `,
    )
    .eq("review_id", reviewId)
    .eq("review_target", reviewTarget)
    .order("created_at", { ascending: true });

  if (error) {
    if (error.code === "42P01") return [];
    return [];
  }

  return (data ?? []).map((row) => {
    const profile = Array.isArray(row.profile) ? row.profile[0] : row.profile;
    return {
      id: row.id as string,
      reviewId: row.review_id as string,
      reviewTarget: row.review_target as ReviewTarget,
      authorId: row.author_id as string,
      authorName:
        (profile?.display_name as string) ??
        (profile?.username as string) ??
        "Mitglied",
      body: row.body as string,
      createdAt: row.created_at as string,
    };
  });
}

export async function insertCommunityReviewInDb(input: {
  communityId: string;
  authorId: string;
  rating: number;
  title?: string;
  body: string;
}): Promise<{ error: string | null; id?: string }> {
  const supabase = await createClient();
  if (!supabase) return { error: "Supabase nicht konfiguriert" };

  const { data, error } = await supabase
    .from("community_reviews")
    .insert({
      community_id: input.communityId,
      author_id: input.authorId,
      rating: input.rating,
      title: input.title ?? null,
      body: input.body,
    })
    .select("id")
    .single();

  if (error) return { error: error.message };
  return { error: null, id: data.id as string };
}

export async function insertGroupReviewInDb(input: {
  groupId: string;
  authorId: string;
  rating: number;
  title?: string;
  body: string;
}): Promise<{ error: string | null; id?: string }> {
  const supabase = await createClient();
  if (!supabase) return { error: "Supabase nicht konfiguriert" };

  const { data, error } = await supabase
    .from("group_reviews")
    .insert({
      group_id: input.groupId,
      author_id: input.authorId,
      rating: input.rating,
      title: input.title ?? null,
      body: input.body,
    })
    .select("id")
    .single();

  if (error) return { error: error.message };
  return { error: null, id: data.id as string };
}

export async function insertReviewCommentInDb(input: {
  reviewId: string;
  reviewTarget: ReviewTarget;
  authorId: string;
  body: string;
}): Promise<{ error: string | null }> {
  const supabase = await createClient();
  if (!supabase) return { error: "Supabase nicht konfiguriert" };

  const { error } = await supabase.from("review_comments").insert({
    review_id: input.reviewId,
    review_target: input.reviewTarget,
    author_id: input.authorId,
    body: input.body,
  });

  return { error: error?.message ?? null };
}

async function refreshCommunityRatingAggregate(communityId: string) {
  const supabase = await createClient();
  if (!supabase) return;

  const { data } = await supabase
    .from("community_reviews")
    .select("rating")
    .eq("community_id", communityId);

  const ratings = (data ?? []).map((r) => Number(r.rating));
  const avg =
    ratings.length > 0
      ? ratings.reduce((a, b) => a + b, 0) / ratings.length
      : 0;

  await supabase
    .from("communities")
    .update({
      rating_avg: Math.round(avg * 100) / 100,
      review_count: ratings.length,
    })
    .eq("id", communityId);
}

async function refreshGroupRatingAggregate(groupId: string) {
  const supabase = await createClient();
  if (!supabase) return;

  const { data } = await supabase
    .from("group_reviews")
    .select("rating")
    .eq("group_id", groupId);

  const ratings = (data ?? []).map((r) => Number(r.rating));
  const avg =
    ratings.length > 0
      ? ratings.reduce((a, b) => a + b, 0) / ratings.length
      : 0;

  await supabase
    .from("community_groups")
    .update({
      rating_avg: Math.round(avg * 100) / 100,
      review_count: ratings.length,
    })
    .eq("id", groupId);
}

export async function refreshRatingAggregate(
  target: ReviewTarget,
  targetId: string,
) {
  if (target === "community") {
    await refreshCommunityRatingAggregate(targetId);
  } else {
    await refreshGroupRatingAggregate(targetId);
  }
}
