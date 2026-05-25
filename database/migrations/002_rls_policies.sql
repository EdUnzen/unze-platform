-- UNZE Row Level Security Policies
-- Nach 001_initial_schema.sql ausführen

-- =============================================================================
-- RLS aktivieren
-- =============================================================================
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.creator_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.communities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.community_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.follows ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.post_likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.badges ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_badges ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.push_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.community_platform_links ENABLE ROW LEVEL SECURITY;

-- =============================================================================
-- Profiles
-- =============================================================================
CREATE POLICY "profiles_select_public"
  ON public.profiles FOR SELECT
  USING (TRUE);

CREATE POLICY "profiles_update_own"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

CREATE POLICY "profiles_insert_own"
  ON public.profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

-- =============================================================================
-- Creator Profiles
-- =============================================================================
CREATE POLICY "creator_profiles_select_public"
  ON public.creator_profiles FOR SELECT
  USING (TRUE);

CREATE POLICY "creator_profiles_manage_own"
  ON public.creator_profiles FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- =============================================================================
-- Communities
-- =============================================================================
CREATE POLICY "communities_select_visible"
  ON public.communities FOR SELECT
  USING (
    visibility IN ('public', 'premium')
    OR creator_id = auth.uid()
    OR public.is_community_member(id)
  );

CREATE POLICY "communities_insert_authenticated"
  ON public.communities FOR INSERT
  WITH CHECK (
    auth.uid() IS NOT NULL
    AND creator_id = auth.uid()
  );

CREATE POLICY "communities_update_creator_admin"
  ON public.communities FOR UPDATE
  USING (public.can_manage_community(id))
  WITH CHECK (public.can_manage_community(id));

CREATE POLICY "communities_delete_creator_only"
  ON public.communities FOR DELETE
  USING (
    creator_id = auth.uid()
    AND public.get_community_role(id) = 'creator'
  );

-- =============================================================================
-- Community Members
-- =============================================================================
CREATE POLICY "community_members_select"
  ON public.community_members FOR SELECT
  USING (
    public.is_community_visible(community_id)
    OR user_id = auth.uid()
  );

CREATE POLICY "community_members_insert_join"
  ON public.community_members FOR INSERT
  WITH CHECK (
    auth.uid() IS NOT NULL
    AND user_id = auth.uid()
    AND role = 'member'
    AND EXISTS (
      SELECT 1 FROM public.communities c
      WHERE c.id = community_id
        AND c.visibility IN ('public', 'premium')
    )
  );

CREATE POLICY "community_members_manage_roles"
  ON public.community_members FOR UPDATE
  USING (public.can_manage_community(community_id))
  WITH CHECK (
    public.can_manage_community(community_id)
    AND role <> 'creator'
  );

CREATE POLICY "community_members_delete"
  ON public.community_members FOR DELETE
  USING (
    user_id = auth.uid()
    OR public.can_manage_community(community_id)
  );

-- =============================================================================
-- Follows
-- =============================================================================
CREATE POLICY "follows_select_own"
  ON public.follows FOR SELECT
  USING (follower_id = auth.uid() OR target_user_id = auth.uid());

CREATE POLICY "follows_insert_own"
  ON public.follows FOR INSERT
  WITH CHECK (follower_id = auth.uid());

CREATE POLICY "follows_delete_own"
  ON public.follows FOR DELETE
  USING (follower_id = auth.uid());

-- =============================================================================
-- Posts
-- =============================================================================
CREATE POLICY "posts_select_visible"
  ON public.posts FOR SELECT
  USING (
    visibility = 'public'
    OR author_id = auth.uid()
    OR (
      visibility = 'community'
      AND community_id IS NOT NULL
      AND public.is_community_member(community_id)
    )
    OR (
      visibility = 'followers'
      AND (
        author_id = auth.uid()
        OR EXISTS (
          SELECT 1 FROM public.follows f
          WHERE f.follower_id = auth.uid()
            AND f.target_type = 'user'
            AND f.target_user_id = posts.author_id
        )
      )
    )
  );

CREATE POLICY "posts_insert_authenticated"
  ON public.posts FOR INSERT
  WITH CHECK (
    auth.uid() = author_id
    AND (
      community_id IS NULL
      OR public.is_community_member(community_id)
    )
  );

CREATE POLICY "posts_update_author_or_mod"
  ON public.posts FOR UPDATE
  USING (
    author_id = auth.uid()
    OR (community_id IS NOT NULL AND public.can_moderate_community(community_id))
  );

CREATE POLICY "posts_delete_author_or_mod"
  ON public.posts FOR DELETE
  USING (
    author_id = auth.uid()
    OR (community_id IS NOT NULL AND public.can_moderate_community(community_id))
  );

-- =============================================================================
-- Comments
-- =============================================================================
CREATE POLICY "comments_select_if_post_visible"
  ON public.comments FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.posts p
      WHERE p.id = comments.post_id
    )
  );

CREATE POLICY "comments_insert_authenticated"
  ON public.comments FOR INSERT
  WITH CHECK (auth.uid() = author_id);

CREATE POLICY "comments_update_own"
  ON public.comments FOR UPDATE
  USING (author_id = auth.uid());

CREATE POLICY "comments_delete_own_or_mod"
  ON public.comments FOR DELETE
  USING (
    author_id = auth.uid()
    OR EXISTS (
      SELECT 1 FROM public.posts p
      WHERE p.id = comments.post_id
        AND p.community_id IS NOT NULL
        AND public.can_moderate_community(p.community_id)
    )
  );

-- =============================================================================
-- Post Likes
-- =============================================================================
CREATE POLICY "post_likes_select"
  ON public.post_likes FOR SELECT
  USING (TRUE);

CREATE POLICY "post_likes_insert_own"
  ON public.post_likes FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "post_likes_delete_own"
  ON public.post_likes FOR DELETE
  USING (auth.uid() = user_id);

-- =============================================================================
-- Badges
-- =============================================================================
CREATE POLICY "badges_select"
  ON public.badges FOR SELECT
  USING (
    community_id IS NULL
    OR public.is_community_visible(community_id)
  );

CREATE POLICY "badges_manage_community"
  ON public.badges FOR ALL
  USING (
    community_id IS NOT NULL
    AND public.can_manage_community(community_id)
  );

-- =============================================================================
-- User Badges
-- =============================================================================
CREATE POLICY "user_badges_select"
  ON public.user_badges FOR SELECT
  USING (TRUE);

CREATE POLICY "user_badges_manage"
  ON public.user_badges FOR ALL
  USING (
    community_id IS NOT NULL
    AND public.can_manage_community(community_id)
  );

-- =============================================================================
-- Subscriptions (Stripe-Vorbereitung)
-- =============================================================================
CREATE POLICY "subscriptions_select_own"
  ON public.subscriptions FOR SELECT
  USING (
    user_id = auth.uid()
    OR public.can_manage_community(community_id)
  );

CREATE POLICY "subscriptions_insert_own"
  ON public.subscriptions FOR INSERT
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "subscriptions_update_own_or_creator"
  ON public.subscriptions FOR UPDATE
  USING (
    user_id = auth.uid()
    OR public.get_community_role(community_id) = 'creator'
  );

-- =============================================================================
-- Notifications
-- =============================================================================
CREATE POLICY "notifications_select_own"
  ON public.notifications FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "notifications_update_own"
  ON public.notifications FOR UPDATE
  USING (user_id = auth.uid());

-- =============================================================================
-- Push Subscriptions
-- =============================================================================
CREATE POLICY "push_subscriptions_own"
  ON public.push_subscriptions FOR ALL
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- =============================================================================
-- Community Platform Links
-- =============================================================================
CREATE POLICY "platform_links_select"
  ON public.community_platform_links FOR SELECT
  USING (public.is_community_visible(community_id));

CREATE POLICY "platform_links_manage"
  ON public.community_platform_links FOR ALL
  USING (public.can_manage_community(community_id));
