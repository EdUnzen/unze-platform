-- Performance-Indizes (Sprint A — rückwärtskompatibel)

CREATE INDEX IF NOT EXISTS idx_posts_public_feed
  ON public.posts (created_at DESC)
  WHERE visibility = 'public';

CREATE INDEX IF NOT EXISTS idx_posts_community_pinned
  ON public.posts (community_id, is_pinned DESC, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_posts_explore_rank
  ON public.posts (visibility, like_count DESC, created_at DESC)
  WHERE visibility = 'public';

CREATE INDEX IF NOT EXISTS idx_post_likes_user
  ON public.post_likes (user_id, post_id);

CREATE INDEX IF NOT EXISTS idx_follows_community_target
  ON public.follows (target_community_id)
  WHERE target_type = 'community';

CREATE INDEX IF NOT EXISTS idx_badges_community
  ON public.badges (community_id);

CREATE INDEX IF NOT EXISTS idx_user_badges_badge
  ON public.user_badges (badge_id);

CREATE INDEX IF NOT EXISTS idx_join_applications_user_community
  ON public.community_join_applications (user_id, community_id);

CREATE INDEX IF NOT EXISTS idx_community_members_user_role
  ON public.community_members (user_id, role)
  WHERE deleted_at IS NULL;

CREATE INDEX IF NOT EXISTS idx_posts_community_created
  ON public.posts (community_id, created_at DESC);
