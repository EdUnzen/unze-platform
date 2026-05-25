-- UNZE Migration Part 1/3
-- Nacheinander part1 → part2 → part3 ausführen

-- ========== -- UNZE: Alle Migrationen gebündelt
-- Im Supabase SQL Editor ausführen (einmalig)


-- ========== 001_initial_schema.sql ==========
-- UNZE Initial Schema
-- Quelle: database/DATABASE_STRUCTURE.md, architecture/roles, architecture/feed
-- Ausführen in Supabase SQL Editor oder via CLI

-- =============================================================================
-- Extensions
-- =============================================================================
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- =============================================================================
-- Enums
-- =============================================================================
CREATE TYPE public.platform_type AS ENUM (
  'discord', 'whatsapp', 'telegram', 'facebook', 'unze', 'other'
);

CREATE TYPE public.community_visibility AS ENUM (
  'public', 'private', 'premium', 'hidden'
);

CREATE TYPE public.community_role AS ENUM (
  'creator', 'admin', 'moderator', 'member'
);

CREATE TYPE public.post_type AS ENUM (
  'text', 'image', 'poll', 'event', 'community_update', 'question'
);

CREATE TYPE public.post_visibility AS ENUM (
  'public', 'followers', 'community', 'private'
);

CREATE TYPE public.follow_target AS ENUM ('user', 'community');

CREATE TYPE public.subscription_status AS ENUM (
  'inactive', 'trialing', 'active', 'past_due', 'canceled', 'unpaid'
);

CREATE TYPE public.badge_type AS ENUM ('permanent', 'temporary', 'event');

CREATE TYPE public.notification_type AS ENUM (
  'follow', 'comment', 'like', 'community', 'badge', 'event', 'system'
);

CREATE TYPE public.platform_role AS ENUM ('user', 'creator', 'platform_admin');

-- =============================================================================
-- Profiles (auth.users Erweiterung)
-- =============================================================================
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username TEXT UNIQUE,
  display_name TEXT,
  avatar_url TEXT,
  bio TEXT,
  reputation_score INTEGER NOT NULL DEFAULT 0 CHECK (reputation_score >= 0),
  is_creator BOOLEAN NOT NULL DEFAULT FALSE,
  is_verified BOOLEAN NOT NULL DEFAULT FALSE,
  platform_role public.platform_role NOT NULL DEFAULT 'user',
  settings JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT profiles_username_format CHECK (
    username IS NULL OR username ~ '^[a-z0-9_]{3,30}$'
  )
);

CREATE INDEX idx_profiles_username ON public.profiles(username);
CREATE INDEX idx_profiles_is_creator ON public.profiles(is_creator) WHERE is_creator = TRUE;

-- =============================================================================
-- Creator-Erweiterung (Creator-System)
-- =============================================================================
CREATE TABLE public.creator_profiles (
  user_id UUID PRIMARY KEY REFERENCES public.profiles(id) ON DELETE CASCADE,
  headline TEXT,
  platform_links JSONB NOT NULL DEFAULT '[]'::jsonb,
  stripe_connect_account_id TEXT,
  stripe_connect_onboarding_complete BOOLEAN NOT NULL DEFAULT FALSE,
  total_communities INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- =============================================================================
-- Communities
-- =============================================================================
CREATE TABLE public.communities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT NOT NULL UNIQUE,
  title TEXT NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  banner_gradient TEXT NOT NULL DEFAULT 'from-emerald-500/90 via-teal-600/80 to-cyan-700/70',
  banner_url TEXT,
  platform_type public.platform_type NOT NULL DEFAULT 'unze',
  external_url TEXT,
  category TEXT NOT NULL DEFAULT 'Allgemein',
  tags TEXT[] NOT NULL DEFAULT '{}',
  visibility public.community_visibility NOT NULL DEFAULT 'public',
  creator_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE RESTRICT,
  is_verified BOOLEAN NOT NULL DEFAULT FALSE,
  is_trending BOOLEAN NOT NULL DEFAULT FALSE,
  member_count INTEGER NOT NULL DEFAULT 0 CHECK (member_count >= 0),
  rating_avg NUMERIC(3, 2) NOT NULL DEFAULT 0 CHECK (rating_avg >= 0 AND rating_avg <= 5),
  review_count INTEGER NOT NULL DEFAULT 0 CHECK (review_count >= 0),
  monetization_enabled BOOLEAN NOT NULL DEFAULT FALSE,
  -- Stripe-Vorbereitung (keine aktive Integration)
  stripe_product_id TEXT,
  stripe_default_price_id TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT communities_slug_format CHECK (slug ~ '^[a-z0-9-]{3,60}$')
);

CREATE INDEX idx_communities_slug ON public.communities(slug);
CREATE INDEX idx_communities_creator ON public.communities(creator_id);
CREATE INDEX idx_communities_visibility ON public.communities(visibility);
CREATE INDEX idx_communities_trending ON public.communities(is_trending) WHERE is_trending = TRUE;
CREATE INDEX idx_communities_tags ON public.communities USING GIN(tags);

-- =============================================================================
-- Community-Mitglieder & Rollen
-- =============================================================================
CREATE TABLE public.community_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  community_id UUID NOT NULL REFERENCES public.communities(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  role public.community_role NOT NULL DEFAULT 'member',
  joined_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (community_id, user_id)
);

CREATE INDEX idx_community_members_user ON public.community_members(user_id);
CREATE INDEX idx_community_members_community ON public.community_members(community_id);
CREATE UNIQUE INDEX idx_community_one_creator ON public.community_members(community_id)
  WHERE role = 'creator';

-- =============================================================================
-- Follow-System (Nutzer & Communities)
-- =============================================================================
CREATE TABLE public.follows (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  follower_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  target_type public.follow_target NOT NULL,
  target_user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  target_community_id UUID REFERENCES public.communities(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT follows_single_target CHECK (
    (target_type = 'user' AND target_user_id IS NOT NULL AND target_community_id IS NULL)
    OR (target_type = 'community' AND target_community_id IS NOT NULL AND target_user_id IS NULL)
  ),
  CONSTRAINT follows_no_self CHECK (
    target_user_id IS NULL OR target_user_id <> follower_id
  )
);

CREATE UNIQUE INDEX idx_follows_user ON public.follows(follower_id, target_user_id)
  WHERE target_type = 'user';
CREATE UNIQUE INDEX idx_follows_community ON public.follows(follower_id, target_community_id)
  WHERE target_type = 'community';
CREATE INDEX idx_follows_follower ON public.follows(follower_id);

-- =============================================================================
-- Feed: Posts
-- =============================================================================
CREATE TABLE public.posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  author_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  community_id UUID REFERENCES public.communities(id) ON DELETE CASCADE,
  post_type public.post_type NOT NULL DEFAULT 'text',
  title TEXT,
  content TEXT NOT NULL DEFAULT '',
  visibility public.post_visibility NOT NULL DEFAULT 'public',
  is_pinned BOOLEAN NOT NULL DEFAULT FALSE,
  like_count INTEGER NOT NULL DEFAULT 0 CHECK (like_count >= 0),
  comment_count INTEGER NOT NULL DEFAULT 0 CHECK (comment_count >= 0),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_posts_author ON public.posts(author_id);
CREATE INDEX idx_posts_community ON public.posts(community_id);
CREATE INDEX idx_posts_created ON public.posts(created_at DESC);
CREATE INDEX idx_posts_visibility ON public.posts(visibility);

-- =============================================================================
-- Feed: Kommentare
-- =============================================================================
CREATE TABLE public.comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID NOT NULL REFERENCES public.posts(id) ON DELETE CASCADE,
  author_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  parent_id UUID REFERENCES public.comments(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_comments_post ON public.comments(post_id);
CREATE INDEX idx_comments_author ON public.comments(author_id);

-- =============================================================================
-- Post-Likes
-- =============================================================================
CREATE TABLE public.post_likes (
  post_id UUID NOT NULL REFERENCES public.posts(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (post_id, user_id)
);

-- =============================================================================
-- Badges
-- =============================================================================
CREATE TABLE public.badges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  community_id UUID REFERENCES public.communities(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  badge_type public.badge_type NOT NULL DEFAULT 'permanent',
  icon_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE public.user_badges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  badge_id UUID NOT NULL REFERENCES public.badges(id) ON DELETE CASCADE,
  community_id UUID REFERENCES public.communities(id) ON DELETE CASCADE,
  granted_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (user_id, badge_id)
);

-- =============================================================================
-- Monetarisierung / Stripe-Vorbereitung
-- =============================================================================
CREATE TABLE public.subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  community_id UUID NOT NULL REFERENCES public.communities(id) ON DELETE CASCADE,
  status public.subscription_status NOT NULL DEFAULT 'inactive',
  stripe_customer_id TEXT,
  stripe_subscription_id TEXT,
  stripe_price_id TEXT,
  plan_interval TEXT,
  amount_cents INTEGER,
  currency TEXT DEFAULT 'eur',
  current_period_start TIMESTAMPTZ,
  current_period_end TIMESTAMPTZ,
  canceled_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (user_id, community_id)
);

CREATE INDEX idx_subscriptions_stripe ON public.subscriptions(stripe_subscription_id)
  WHERE stripe_subscription_id IS NOT NULL;

-- =============================================================================
-- Notifications & Push-Vorbereitung
-- =============================================================================
CREATE TABLE public.notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  type public.notification_type NOT NULL DEFAULT 'system',
  title TEXT NOT NULL,
  body TEXT,
  data JSONB NOT NULL DEFAULT '{}'::jsonb,
  read_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_notifications_user ON public.notifications(user_id, created_at DESC);
CREATE INDEX idx_notifications_unread ON public.notifications(user_id)
  WHERE read_at IS NULL;

CREATE TABLE public.push_subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  endpoint TEXT NOT NULL,
  p256dh TEXT NOT NULL,
  auth TEXT NOT NULL,
  user_agent TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (user_id, endpoint)
);

-- =============================================================================
-- Plattform-Links pro Community
-- =============================================================================
CREATE TABLE public.community_platform_links (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  community_id UUID NOT NULL REFERENCES public.communities(id) ON DELETE CASCADE,
  platform_type public.platform_type NOT NULL,
  url TEXT NOT NULL,
  label TEXT,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- =============================================================================
-- Hilfsfunktionen für RLS
-- =============================================================================
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, display_name, avatar_url)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'display_name', NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
    NEW.raw_user_meta_data->>'avatar_url'
  );
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.get_community_role(
  p_community_id UUID,
  p_user_id UUID DEFAULT auth.uid()
)
RETURNS public.community_role
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT role
  FROM public.community_members
  WHERE community_id = p_community_id
    AND user_id = p_user_id
  LIMIT 1;
$$;

CREATE OR REPLACE FUNCTION public.is_community_member(
  p_community_id UUID,
  p_user_id UUID DEFAULT auth.uid()
)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.community_members
    WHERE community_id = p_community_id AND user_id = p_user_id
  );
$$;

CREATE OR REPLACE FUNCTION public.can_manage_community(
  p_community_id UUID,
  p_user_id UUID DEFAULT auth.uid()
)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.community_members
    WHERE community_id = p_community_id
      AND user_id = p_user_id
      AND role IN ('creator', 'admin')
  );
$$;

CREATE OR REPLACE FUNCTION public.can_moderate_community(
  p_community_id UUID,
  p_user_id UUID DEFAULT auth.uid()
)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.community_members
    WHERE community_id = p_community_id
      AND user_id = p_user_id
      AND role IN ('creator', 'admin', 'moderator')
  );
$$;

CREATE OR REPLACE FUNCTION public.is_community_visible(
  p_community_id UUID
)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.communities c
    WHERE c.id = p_community_id
      AND (
        c.visibility = 'public'
        OR c.visibility = 'premium'
        OR public.is_community_member(p_community_id)
        OR c.creator_id = auth.uid()
      )
  );
$$;

-- Mitgliedercount synchron halten
CREATE OR REPLACE FUNCTION public.sync_community_member_count()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE public.communities SET member_count = member_count + 1 WHERE id = NEW.community_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE public.communities SET member_count = GREATEST(0, member_count - 1) WHERE id = OLD.community_id;
  END IF;
  RETURN COALESCE(NEW, OLD);
END;
$$;

-- =============================================================================
-- Triggers
-- =============================================================================
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

CREATE TRIGGER profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER communities_updated_at
  BEFORE UPDATE ON public.communities
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER posts_updated_at
  BEFORE UPDATE ON public.posts
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER subscriptions_updated_at
  BEFORE UPDATE ON public.subscriptions
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER community_members_count
  AFTER INSERT OR DELETE ON public.community_members
  FOR EACH ROW EXECUTE FUNCTION public.sync_community_member_count();

-- Creator als erstes Mitglied bei Community-Erstellung
CREATE OR REPLACE FUNCTION public.handle_new_community()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.community_members (community_id, user_id, role)
  VALUES (NEW.id, NEW.creator_id, 'creator');
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_community_created
  AFTER INSERT ON public.communities
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_community();



-- ========== 002_rls_policies.sql ==========
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



-- ========== 004_community_groups_discover.sql ==========
-- Community-Gruppen & Discover-Vorbereitung
-- Nach 002_rls_policies.sql ausführen

-- =============================================================================
-- Discover-Felder auf Communities
-- =============================================================================
ALTER TABLE public.communities
  ADD COLUMN IF NOT EXISTS discover_enabled BOOLEAN NOT NULL DEFAULT TRUE,
  ADD COLUMN IF NOT EXISTS discover_score INTEGER NOT NULL DEFAULT 0;

CREATE INDEX IF NOT EXISTS idx_communities_discover
  ON public.communities(discover_enabled, discover_score DESC, member_count DESC)
  WHERE discover_enabled = TRUE AND visibility IN ('public', 'premium');

-- =============================================================================
-- Gruppen innerhalb von Communities
-- =============================================================================
CREATE TABLE IF NOT EXISTS public.community_groups (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  community_id UUID NOT NULL REFERENCES public.communities(id) ON DELETE CASCADE,
  slug TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  sort_order INTEGER NOT NULL DEFAULT 0,
  is_public BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (community_id, slug),
  CONSTRAINT community_groups_slug_format CHECK (slug ~ '^[a-z0-9-]{2,40}$')
);

CREATE INDEX IF NOT EXISTS idx_community_groups_community
  ON public.community_groups(community_id, sort_order);

-- =============================================================================
-- Trigger updated_at
-- =============================================================================
CREATE TRIGGER community_groups_updated_at
  BEFORE UPDATE ON public.community_groups
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- =============================================================================
-- RLS
-- =============================================================================
ALTER TABLE public.community_groups ENABLE ROW LEVEL SECURITY;

CREATE POLICY "community_groups_select"
  ON public.community_groups FOR SELECT
  USING (public.is_community_visible(community_id));

CREATE POLICY "community_groups_manage"
  ON public.community_groups FOR ALL
  USING (public.can_manage_community(community_id))
  WITH CHECK (public.can_manage_community(community_id));



-- ========== 005_dashboard_member_access.sql ==========
-- Dashboard: Manager dürfen alle Mitglieder einer Community sehen
-- Nach 004 ausführen

DROP POLICY IF EXISTS "community_members_select" ON public.community_members;

CREATE POLICY "community_members_select"
  ON public.community_members FOR SELECT
  USING (
    public.can_manage_community(community_id)
    OR public.can_moderate_community(community_id)
    OR public.is_community_visible(community_id)
    OR user_id = auth.uid()
  );


