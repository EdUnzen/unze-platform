-- UNZE: Alle Migrationen gebündelt
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


-- ========== 006_community_access_governance.sql ==========
-- UNZE Community Access & Governance System
-- Kernmodul: Zugangsstatus, Beitrittsanträge, Fragen, Plattform-IDs, Rollen
-- Nach 005_dashboard_member_access.sql ausführen

-- =============================================================================
-- Enums
-- =============================================================================
CREATE TYPE public.community_access_status AS ENUM (
  'open',
  'closed',
  'paused',
  'invite_only',
  'member_limit_reached'
);

CREATE TYPE public.join_approval_mode AS ENUM (
  'auto_accept',
  'manual_review',
  'auto_reject',
  'waitlist'
);

CREATE TYPE public.join_question_type AS ENUM (
  'text',
  'checkbox',
  'rules_consent',
  'age_verification'
);

CREATE TYPE public.platform_identity_type AS ENUM (
  'discord',
  'whatsapp',
  'telegram',
  'facebook',
  'psn',
  'epic',
  'phone',
  'linkedin',
  'instagram',
  'x',
  'tiktok',
  'other'
);

CREATE TYPE public.join_application_status AS ENUM (
  'pending',
  'accepted',
  'rejected',
  'waitlisted',
  'withdrawn'
);

-- verified_member Rolle (Owner = creator, bereits vorhanden)
ALTER TYPE public.community_role ADD VALUE IF NOT EXISTS 'verified_member';

-- =============================================================================
-- Communities: Access-Einstellungen
-- =============================================================================
ALTER TABLE public.communities
  ADD COLUMN IF NOT EXISTS access_status public.community_access_status NOT NULL DEFAULT 'open',
  ADD COLUMN IF NOT EXISTS admissions_paused BOOLEAN NOT NULL DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS member_limit INTEGER,
  ADD COLUMN IF NOT EXISTS join_approval_mode public.join_approval_mode NOT NULL DEFAULT 'auto_accept',
  ADD COLUMN IF NOT EXISTS community_rules TEXT,
  ADD COLUMN IF NOT EXISTS require_rules_consent BOOLEAN NOT NULL DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS require_age_verification BOOLEAN NOT NULL DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS min_age INTEGER,
  ADD COLUMN IF NOT EXISTS required_platform_ids JSONB NOT NULL DEFAULT '[]'::jsonb;

ALTER TABLE public.communities
  ADD CONSTRAINT communities_member_limit_positive
    CHECK (member_limit IS NULL OR member_limit > 0);

ALTER TABLE public.communities
  ADD CONSTRAINT communities_min_age_range
    CHECK (min_age IS NULL OR (min_age >= 13 AND min_age <= 120));

CREATE INDEX IF NOT EXISTS idx_communities_access_status
  ON public.communities(access_status);

-- =============================================================================
-- Beitrittsfragen (Creator-definiert)
-- =============================================================================
CREATE TABLE public.community_join_questions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  community_id UUID NOT NULL REFERENCES public.communities(id) ON DELETE CASCADE,
  question_type public.join_question_type NOT NULL DEFAULT 'text',
  label TEXT NOT NULL,
  placeholder TEXT,
  options JSONB NOT NULL DEFAULT '[]'::jsonb,
  is_required BOOLEAN NOT NULL DEFAULT TRUE,
  sort_order INTEGER NOT NULL DEFAULT 0,
  config JSONB NOT NULL DEFAULT '{}'::jsonb,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_join_questions_community
  ON public.community_join_questions(community_id, sort_order);

-- =============================================================================
-- Beitrittsanträge
-- =============================================================================
CREATE TABLE public.community_join_applications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  community_id UUID NOT NULL REFERENCES public.communities(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  status public.join_application_status NOT NULL DEFAULT 'pending',
  system_message TEXT,
  reviewed_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  reviewed_at TIMESTAMPTZ,
  rejection_reason TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (community_id, user_id)
);

CREATE INDEX idx_join_applications_community_status
  ON public.community_join_applications(community_id, status);

CREATE INDEX idx_join_applications_user
  ON public.community_join_applications(user_id);

-- =============================================================================
-- Antworten auf Beitrittsfragen
-- =============================================================================
CREATE TABLE public.community_join_application_answers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  application_id UUID NOT NULL REFERENCES public.community_join_applications(id) ON DELETE CASCADE,
  question_id UUID REFERENCES public.community_join_questions(id) ON DELETE SET NULL,
  value_text TEXT,
  value_boolean BOOLEAN,
  value_json JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_join_answers_application
  ON public.community_join_application_answers(application_id);

-- =============================================================================
-- Plattform-Identitäten im Antrag (Discord, PSN, etc.)
-- =============================================================================
CREATE TABLE public.community_join_platform_identities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  application_id UUID NOT NULL REFERENCES public.community_join_applications(id) ON DELETE CASCADE,
  platform_type public.platform_identity_type NOT NULL,
  value TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (application_id, platform_type)
);

CREATE INDEX idx_join_platform_identities_application
  ON public.community_join_platform_identities(application_id);

-- =============================================================================
-- Hilfsfunktionen: Mitgliedslimit & Zugangsprüfung
-- =============================================================================
CREATE OR REPLACE FUNCTION public.is_community_at_member_limit(
  p_community_id UUID
)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.communities c
    WHERE c.id = p_community_id
      AND c.member_limit IS NOT NULL
      AND c.member_count >= c.member_limit
  );
$$;

CREATE OR REPLACE FUNCTION public.sync_community_access_status_on_count()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_community_id UUID;
  v_at_limit BOOLEAN;
BEGIN
  v_community_id := COALESCE(NEW.community_id, OLD.community_id);
  v_at_limit := public.is_community_at_member_limit(v_community_id);

  IF v_at_limit THEN
    UPDATE public.communities
    SET access_status = 'member_limit_reached'
    WHERE id = v_community_id
      AND access_status NOT IN ('closed', 'invite_only');
  ELSE
    UPDATE public.communities
    SET access_status = 'open'
    WHERE id = v_community_id
      AND access_status = 'member_limit_reached';
  END IF;

  RETURN COALESCE(NEW, OLD);
END;
$$;

CREATE TRIGGER community_members_access_status
  AFTER INSERT OR DELETE ON public.community_members
  FOR EACH ROW EXECUTE FUNCTION public.sync_community_access_status_on_count();

CREATE OR REPLACE FUNCTION public.community_has_join_questions(
  p_community_id UUID
)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.community_join_questions q
    WHERE q.community_id = p_community_id
      AND q.is_active = TRUE
  );
$$;

CREATE OR REPLACE FUNCTION public.get_join_block_reason(
  p_community_id UUID,
  p_user_id UUID DEFAULT auth.uid()
)
RETURNS TEXT
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_c RECORD;
BEGIN
  SELECT
    c.visibility,
    c.access_status,
    c.admissions_paused,
    c.join_approval_mode,
    c.monetization_enabled
  INTO v_c
  FROM public.communities c
  WHERE c.id = p_community_id;

  IF NOT FOUND THEN
    RETURN 'Community nicht gefunden';
  END IF;

  IF public.is_community_member(p_community_id, p_user_id) THEN
    RETURN NULL;
  END IF;

  IF v_c.access_status = 'closed' THEN
    RETURN 'Community aktuell geschlossen';
  END IF;

  IF v_c.admissions_paused OR v_c.access_status = 'paused' THEN
    RETURN 'Weitere Bewerbungen aktuell pausiert';
  END IF;

  IF public.is_community_at_member_limit(p_community_id) THEN
    RETURN 'Mitgliederlimit erreicht';
  END IF;

  IF v_c.visibility = 'premium' AND v_c.monetization_enabled THEN
    RETURN 'Kostenpflichtiger Zugang — Abo erforderlich';
  END IF;

  IF v_c.visibility = 'private' OR v_c.access_status = 'invite_only' THEN
    IF v_c.join_approval_mode = 'auto_reject' THEN
      RETURN 'Nur auf Einladung — Beitritt nicht möglich';
    END IF;
    RETURN NULL;
  END IF;

  IF v_c.join_approval_mode = 'auto_reject' THEN
    RETURN 'Beitritt derzeit nicht möglich';
  END IF;

  RETURN NULL;
END;
$$;

CREATE OR REPLACE FUNCTION public.can_direct_join_community(
  p_community_id UUID,
  p_user_id UUID DEFAULT auth.uid()
)
RETURNS BOOLEAN
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_c RECORD;
BEGIN
  IF public.get_join_block_reason(p_community_id, p_user_id) IS NOT NULL THEN
    RETURN FALSE;
  END IF;

  SELECT c.visibility, c.join_approval_mode
  INTO v_c
  FROM public.communities c
  WHERE c.id = p_community_id;

  IF v_c.join_approval_mode <> 'auto_accept' THEN
    RETURN FALSE;
  END IF;

  IF public.community_has_join_questions(p_community_id) THEN
    RETURN FALSE;
  END IF;

  IF v_c.visibility NOT IN ('public', 'premium') THEN
    RETURN FALSE;
  END IF;

  RETURN TRUE;
END;
$$;

-- Antrag annehmen und Mitglied hinzufügen (SECURITY DEFINER)
CREATE OR REPLACE FUNCTION public.accept_join_application(
  p_application_id UUID,
  p_reviewer_id UUID DEFAULT auth.uid()
)
RETURNS public.community_join_applications
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_app public.community_join_applications;
  v_block TEXT;
BEGIN
  SELECT * INTO v_app
  FROM public.community_join_applications
  WHERE id = p_application_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Antrag nicht gefunden';
  END IF;

  IF v_app.status NOT IN ('pending', 'waitlisted') THEN
    RAISE EXCEPTION 'Antrag kann nicht mehr bearbeitet werden';
  END IF;

  IF NOT public.can_moderate_community(v_app.community_id, p_reviewer_id)
     AND NOT public.can_manage_community(v_app.community_id, p_reviewer_id) THEN
    RAISE EXCEPTION 'Keine Berechtigung';
  END IF;

  v_block := public.get_join_block_reason(v_app.community_id, v_app.user_id);
  IF v_block IS NOT NULL AND v_block <> 'Mitgliederlimit erreicht' THEN
    RAISE EXCEPTION '%', v_block;
  END IF;

  IF public.is_community_at_member_limit(v_app.community_id) THEN
    RAISE EXCEPTION 'Mitgliederlimit erreicht';
  END IF;

  INSERT INTO public.community_members (community_id, user_id, role)
  VALUES (v_app.community_id, v_app.user_id, 'member')
  ON CONFLICT (community_id, user_id) DO NOTHING;

  UPDATE public.community_join_applications
  SET
    status = 'accepted',
    reviewed_by = p_reviewer_id,
    reviewed_at = NOW(),
    system_message = 'Antrag angenommen',
    updated_at = NOW()
  WHERE id = p_application_id
  RETURNING * INTO v_app;

  RETURN v_app;
END;
$$;

-- =============================================================================
-- Triggers: updated_at
-- =============================================================================
CREATE TRIGGER community_join_questions_updated_at
  BEFORE UPDATE ON public.community_join_questions
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER community_join_applications_updated_at
  BEFORE UPDATE ON public.community_join_applications
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- =============================================================================
-- RLS
-- =============================================================================
ALTER TABLE public.community_join_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.community_join_applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.community_join_application_answers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.community_join_platform_identities ENABLE ROW LEVEL SECURITY;

-- Fragen: öffentlich lesbar wenn Community sichtbar; Verwalten nur Admin+
CREATE POLICY "join_questions_select"
  ON public.community_join_questions FOR SELECT
  USING (public.is_community_visible(community_id));

CREATE POLICY "join_questions_manage"
  ON public.community_join_questions FOR ALL
  USING (public.can_manage_community(community_id))
  WITH CHECK (public.can_manage_community(community_id));

-- Anträge: eigene lesen; Moderator+ lesen/bearbeiten; User erstellen
CREATE POLICY "join_applications_select_own"
  ON public.community_join_applications FOR SELECT
  USING (
    user_id = auth.uid()
    OR public.can_moderate_community(community_id)
  );

CREATE POLICY "join_applications_insert_own"
  ON public.community_join_applications FOR INSERT
  WITH CHECK (
    auth.uid() IS NOT NULL
    AND user_id = auth.uid()
    AND NOT public.is_community_member(community_id)
  );

CREATE POLICY "join_applications_update_moderator"
  ON public.community_join_applications FOR UPDATE
  USING (public.can_moderate_community(community_id))
  WITH CHECK (public.can_moderate_community(community_id));

CREATE POLICY "join_applications_update_own_withdraw"
  ON public.community_join_applications FOR UPDATE
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid() AND status = 'withdrawn');

-- Antworten
CREATE POLICY "join_answers_select"
  ON public.community_join_application_answers FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.community_join_applications a
      WHERE a.id = application_id
        AND (
          a.user_id = auth.uid()
          OR public.can_moderate_community(a.community_id)
        )
    )
  );

CREATE POLICY "join_answers_insert_own"
  ON public.community_join_application_answers FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.community_join_applications a
      WHERE a.id = application_id AND a.user_id = auth.uid()
    )
  );

-- Plattform-Identitäten
CREATE POLICY "join_platform_identities_select"
  ON public.community_join_platform_identities FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.community_join_applications a
      WHERE a.id = application_id
        AND (
          a.user_id = auth.uid()
          OR public.can_moderate_community(a.community_id)
        )
    )
  );

CREATE POLICY "join_platform_identities_insert_own"
  ON public.community_join_platform_identities FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.community_join_applications a
      WHERE a.id = application_id AND a.user_id = auth.uid()
    )
  );

-- Community-Mitglieder: erweiterte Join-Policy
DROP POLICY IF EXISTS "community_members_insert_join" ON public.community_members;

CREATE POLICY "community_members_insert_join"
  ON public.community_members FOR INSERT
  WITH CHECK (
    auth.uid() IS NOT NULL
    AND user_id = auth.uid()
    AND role IN ('member', 'verified_member')
    AND public.can_direct_join_community(community_id, auth.uid())
  );

-- Notifications: Moderator+ können Systemnachrichten für Anträge erstellen
CREATE POLICY "notifications_insert_system"
  ON public.notifications FOR INSERT
  WITH CHECK (
    auth.uid() IS NOT NULL
    AND (
      user_id = auth.uid()
      OR EXISTS (
        SELECT 1 FROM public.community_members cm
        WHERE cm.user_id = auth.uid()
          AND cm.role IN ('creator', 'admin', 'moderator')
      )
    )
  );


-- ========== 007_invite_links_approval.sql ==========
-- UNZE Invite Links & Extended Join/Approval System
-- Nach 006_community_access_governance.sql ausführen

-- =============================================================================
-- Community Access Mode (Creator-Presets)
-- =============================================================================
CREATE TYPE public.community_access_mode AS ENUM (
  'open',
  'private',
  'closed',
  'invite_only',
  'premium'
);

ALTER TABLE public.communities
  ADD COLUMN IF NOT EXISTS access_mode public.community_access_mode NOT NULL DEFAULT 'open';

-- Antrag-Quelle & Einladungsbezug
ALTER TABLE public.community_join_applications
  ADD COLUMN IF NOT EXISTS invite_link_id UUID,
  ADD COLUMN IF NOT EXISTS source TEXT NOT NULL DEFAULT 'application';

-- =============================================================================
-- Einladungslinks
-- =============================================================================
CREATE TABLE public.community_invite_links (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  community_id UUID NOT NULL REFERENCES public.communities(id) ON DELETE CASCADE,
  code TEXT NOT NULL UNIQUE,
  label TEXT,
  created_by UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  assigned_role public.community_role NOT NULL DEFAULT 'member',
  expires_at TIMESTAMPTZ,
  max_uses INTEGER,
  use_count INTEGER NOT NULL DEFAULT 0 CHECK (use_count >= 0),
  is_single_use BOOLEAN NOT NULL DEFAULT FALSE,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  bypass_closed BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT invite_links_max_uses_positive CHECK (max_uses IS NULL OR max_uses > 0),
  CONSTRAINT invite_links_assigned_role_not_creator CHECK (assigned_role <> 'creator')
);

CREATE INDEX idx_invite_links_community
  ON public.community_invite_links(community_id, is_active);

CREATE INDEX idx_invite_links_code
  ON public.community_invite_links(code)
  WHERE is_active = TRUE;

ALTER TABLE public.community_join_applications
  ADD CONSTRAINT join_applications_invite_fk
  FOREIGN KEY (invite_link_id) REFERENCES public.community_invite_links(id) ON DELETE SET NULL;

-- =============================================================================
-- Einlösungen (Audit + einmalige Links)
-- =============================================================================
CREATE TABLE public.community_invite_redemptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  invite_link_id UUID NOT NULL REFERENCES public.community_invite_links(id) ON DELETE CASCADE,
  community_id UUID NOT NULL REFERENCES public.communities(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  assigned_role public.community_role NOT NULL,
  redeemed_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (invite_link_id, user_id)
);

CREATE INDEX idx_invite_redemptions_community
  ON public.community_invite_redemptions(community_id);

-- =============================================================================
-- Hilfsfunktionen: Einladung validieren
-- =============================================================================
CREATE OR REPLACE FUNCTION public.get_invite_link_by_code(
  p_code TEXT
)
RETURNS public.community_invite_links
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT *
  FROM public.community_invite_links
  WHERE code = p_code
    AND is_active = TRUE
  LIMIT 1;
$$;

CREATE OR REPLACE FUNCTION public.is_invite_link_valid(
  p_invite public.community_invite_links,
  p_user_id UUID DEFAULT auth.uid()
)
RETURNS TEXT
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF p_invite IS NULL THEN
    RETURN 'Einladungslink ungültig';
  END IF;

  IF NOT p_invite.is_active THEN
    RETURN 'Einladungslink deaktiviert';
  END IF;

  IF p_invite.expires_at IS NOT NULL AND p_invite.expires_at < NOW() THEN
    RETURN 'Einladungslink abgelaufen';
  END IF;

  IF p_invite.is_single_use AND p_invite.use_count >= 1 THEN
    RETURN 'Einladungslink bereits verwendet';
  END IF;

  IF p_invite.max_uses IS NOT NULL AND p_invite.use_count >= p_invite.max_uses THEN
    RETURN 'Einladungslink ausgeschöpft';
  END IF;

  IF EXISTS (
    SELECT 1 FROM public.community_invite_redemptions r
    WHERE r.invite_link_id = p_invite.id AND r.user_id = p_user_id
  ) THEN
    RETURN 'Du hast diesen Link bereits eingelöst';
  END IF;

  IF public.is_community_member(p_invite.community_id, p_user_id) THEN
    RETURN NULL;
  END IF;

  IF public.is_community_at_member_limit(p_invite.community_id) THEN
    RETURN 'Mitgliederlimit erreicht';
  END IF;

  RETURN NULL;
END;
$$;

-- Einladung einlösen (SECURITY DEFINER)
CREATE OR REPLACE FUNCTION public.redeem_community_invite(
  p_code TEXT,
  p_user_id UUID DEFAULT auth.uid()
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_invite public.community_invite_links;
  v_community public.communities;
  v_error TEXT;
  v_role public.community_role;
BEGIN
  IF p_user_id IS NULL THEN
    RAISE EXCEPTION 'Nicht angemeldet';
  END IF;

  SELECT * INTO v_invite FROM public.get_invite_link_by_code(p_code) FOR UPDATE;
  v_error := public.is_invite_link_valid(v_invite, p_user_id);

  IF v_error IS NOT NULL THEN
    IF v_error = 'Du hast diesen Link bereits eingelöst' OR public.is_community_member(v_invite.community_id, p_user_id) THEN
      SELECT slug INTO v_community FROM public.communities WHERE id = v_invite.community_id;
      RETURN jsonb_build_object(
        'status', 'already_member',
        'community_id', v_invite.community_id,
        'slug', (SELECT slug FROM public.communities WHERE id = v_invite.community_id)
      );
    END IF;
    RAISE EXCEPTION '%', v_error;
  END IF;

  SELECT * INTO v_community FROM public.communities WHERE id = v_invite.community_id;

  IF NOT v_invite.bypass_closed THEN
    IF v_community.access_status IN ('closed', 'paused')
       OR v_community.admissions_paused THEN
      RAISE EXCEPTION 'Community aktuell nicht erreichbar';
    END IF;
  END IF;

  IF v_community.visibility = 'premium'
     AND v_community.monetization_enabled THEN
    IF NOT EXISTS (
      SELECT 1 FROM public.subscriptions s
      WHERE s.community_id = v_invite.community_id
        AND s.user_id = p_user_id
        AND s.status IN ('active', 'trialing')
    ) THEN
      RAISE EXCEPTION 'Kostenpflichtiger Zugang — Abo erforderlich';
    END IF;
  END IF;

  v_role := v_invite.assigned_role;
  IF v_role = 'creator' THEN
    v_role := 'member';
  END IF;

  INSERT INTO public.community_members (community_id, user_id, role)
  VALUES (v_invite.community_id, p_user_id, v_role)
  ON CONFLICT (community_id, user_id) DO NOTHING;

  INSERT INTO public.community_invite_redemptions (
    invite_link_id, community_id, user_id, assigned_role
  ) VALUES (
    v_invite.id, v_invite.community_id, p_user_id, v_role
  )
  ON CONFLICT (invite_link_id, user_id) DO NOTHING;

  UPDATE public.community_invite_links
  SET use_count = use_count + 1, updated_at = NOW()
  WHERE id = v_invite.id;

  IF v_invite.is_single_use OR (v_invite.max_uses IS NOT NULL AND v_invite.use_count + 1 >= v_invite.max_uses) THEN
    UPDATE public.community_invite_links
    SET is_active = FALSE
    WHERE id = v_invite.id;
  END IF;

  RETURN jsonb_build_object(
    'status', 'joined',
    'community_id', v_invite.community_id,
    'slug', v_community.slug,
    'role', v_role::TEXT
  );
END;
$$;

-- Warteliste: ältesten Antrag annehmen wenn Platz frei
CREATE OR REPLACE FUNCTION public.promote_next_waitlisted_application(
  p_community_id UUID,
  p_reviewer_id UUID DEFAULT auth.uid()
)
RETURNS public.community_join_applications
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_app public.community_join_applications;
BEGIN
  IF NOT public.can_moderate_community(p_community_id, p_reviewer_id) THEN
    RAISE EXCEPTION 'Keine Berechtigung';
  END IF;

  IF public.is_community_at_member_limit(p_community_id) THEN
    RAISE EXCEPTION 'Mitgliederlimit erreicht';
  END IF;

  SELECT * INTO v_app
  FROM public.community_join_applications
  WHERE community_id = p_community_id
    AND status = 'waitlisted'
  ORDER BY created_at ASC
  LIMIT 1
  FOR UPDATE SKIP LOCKED;

  IF NOT FOUND THEN
    RETURN NULL;
  END IF;

  PERFORM public.accept_join_application(v_app.id, p_reviewer_id);
  SELECT * INTO v_app FROM public.community_join_applications WHERE id = v_app.id;
  RETURN v_app;
END;
$$;

-- =============================================================================
-- Triggers
-- =============================================================================
CREATE TRIGGER community_invite_links_updated_at
  BEFORE UPDATE ON public.community_invite_links
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- =============================================================================
-- RLS
-- =============================================================================
ALTER TABLE public.community_invite_links ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.community_invite_redemptions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "invite_links_select_managers"
  ON public.community_invite_links FOR SELECT
  USING (public.can_manage_community(community_id));

CREATE POLICY "invite_links_manage"
  ON public.community_invite_links FOR ALL
  USING (public.can_manage_community(community_id))
  WITH CHECK (
    public.can_manage_community(community_id)
    AND assigned_role <> 'creator'
  );

CREATE POLICY "invite_links_select_active_public"
  ON public.community_invite_links FOR SELECT
  USING (is_active = TRUE);

CREATE POLICY "invite_redemptions_select"
  ON public.community_invite_redemptions FOR SELECT
  USING (
    user_id = auth.uid()
    OR public.can_moderate_community(community_id)
  );

CREATE POLICY "invite_redemptions_insert_system"
  ON public.community_invite_redemptions FOR INSERT
  WITH CHECK (user_id = auth.uid());

-- Notifications für Creator bei neuen Anträgen (Insert via Service)


-- ========== 008_community_lifecycle.sql ==========
-- UNZE Community Lifecycle System
-- Status: archiviert, Warteliste, Bann/Rejoin-Schutz, Datei-Nachweise, Creator-Optionen
-- Nach 007_invite_links_approval.sql ausführen

-- =============================================================================
-- Enum-Erweiterungen
-- =============================================================================
ALTER TYPE public.community_access_status ADD VALUE IF NOT EXISTS 'archived';

ALTER TYPE public.join_question_type ADD VALUE IF NOT EXISTS 'file_upload';
ALTER TYPE public.join_question_type ADD VALUE IF NOT EXISTS 'image_upload';

CREATE TYPE public.community_restriction_type AS ENUM (
  'ban',
  'cooldown',
  'removed_block'
);

-- =============================================================================
-- Lifecycle-Einstellungen auf communities
-- =============================================================================
ALTER TABLE public.communities
  ADD COLUMN IF NOT EXISTS waitlist_enabled BOOLEAN NOT NULL DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS auto_reject_at_limit BOOLEAN NOT NULL DEFAULT TRUE,
  ADD COLUMN IF NOT EXISTS auto_messages_enabled BOOLEAN NOT NULL DEFAULT TRUE,
  ADD COLUMN IF NOT EXISTS rejoin_cooldown_days INTEGER,
  ADD COLUMN IF NOT EXISTS allow_rejoin_after_ban BOOLEAN NOT NULL DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS paid_join_required BOOLEAN NOT NULL DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS archived_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS lifecycle_notes TEXT;

ALTER TABLE public.communities
  ADD CONSTRAINT communities_rejoin_cooldown_positive
    CHECK (rejoin_cooldown_days IS NULL OR rejoin_cooldown_days >= 0);

-- =============================================================================
-- Rejoin-Schutz / Bann-System
-- =============================================================================
CREATE TABLE public.community_member_restrictions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  community_id UUID NOT NULL REFERENCES public.communities(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  restriction_type public.community_restriction_type NOT NULL,
  reason TEXT,
  restricted_until TIMESTAMPTZ,
  created_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  lifted_at TIMESTAMPTZ,
  lifted_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_member_restrictions_community
  ON public.community_member_restrictions(community_id, user_id);

CREATE UNIQUE INDEX idx_member_restrictions_active_ban
  ON public.community_member_restrictions(community_id, user_id)
  WHERE lifted_at IS NULL AND restriction_type = 'ban';

-- =============================================================================
-- Datei-/Bildnachweise für Bewerbungen (Storage-Vorbereitung)
-- =============================================================================
CREATE TABLE public.community_join_application_files (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  application_id UUID NOT NULL REFERENCES public.community_join_applications(id) ON DELETE CASCADE,
  question_id UUID REFERENCES public.community_join_questions(id) ON DELETE SET NULL,
  file_name TEXT NOT NULL,
  mime_type TEXT,
  file_size_bytes INTEGER CHECK (file_size_bytes IS NULL OR file_size_bytes >= 0),
  storage_bucket TEXT DEFAULT 'community-join-proofs',
  storage_path TEXT,
  public_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_join_application_files_app
  ON public.community_join_application_files(application_id);

-- =============================================================================
-- Hilfsfunktionen
-- =============================================================================
CREATE OR REPLACE FUNCTION public.is_user_restricted_from_community(
  p_community_id UUID,
  p_user_id UUID DEFAULT auth.uid()
)
RETURNS TEXT
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_r RECORD;
BEGIN
  SELECT restriction_type, reason, restricted_until
  INTO v_r
  FROM public.community_member_restrictions
  WHERE community_id = p_community_id
    AND user_id = p_user_id
    AND lifted_at IS NULL
    AND (
      restricted_until IS NULL
      OR restricted_until > NOW()
    )
  ORDER BY created_at DESC
  LIMIT 1;

  IF NOT FOUND THEN
    RETURN NULL;
  END IF;

  IF v_r.restriction_type = 'ban' THEN
    RETURN COALESCE(v_r.reason, 'Du bist von dieser Community ausgeschlossen');
  END IF;

  IF v_r.restriction_type = 'cooldown' THEN
    RETURN COALESCE(v_r.reason, 'Rejoin-Schutz aktiv — bitte später erneut versuchen');
  END IF;

  RETURN COALESCE(v_r.reason, 'Beitritt derzeit nicht möglich');
END;
$$;

CREATE OR REPLACE FUNCTION public.get_join_block_reason(
  p_community_id UUID,
  p_user_id UUID DEFAULT auth.uid()
)
RETURNS TEXT
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_c RECORD;
  v_restriction TEXT;
BEGIN
  SELECT
    c.visibility,
    c.access_status,
    c.admissions_paused,
    c.join_approval_mode,
    c.monetization_enabled,
    c.paid_join_required,
    c.waitlist_enabled,
    c.auto_reject_at_limit
  INTO v_c
  FROM public.communities c
  WHERE c.id = p_community_id;

  IF NOT FOUND THEN
    RETURN 'Community nicht gefunden';
  END IF;

  IF public.is_community_member(p_community_id, p_user_id) THEN
    RETURN NULL;
  END IF;

  v_restriction := public.is_user_restricted_from_community(p_community_id, p_user_id);
  IF v_restriction IS NOT NULL THEN
    RETURN v_restriction;
  END IF;

  IF v_c.access_status = 'archived' THEN
    RETURN 'Community archiviert — keine Beitritte möglich';
  END IF;

  IF v_c.access_status = 'closed' THEN
    RETURN 'Community aktuell geschlossen';
  END IF;

  IF v_c.admissions_paused OR v_c.access_status = 'paused' THEN
    RETURN 'Weitere Bewerbungen aktuell pausiert';
  END IF;

  IF public.is_community_at_member_limit(p_community_id) THEN
    IF v_c.waitlist_enabled AND NOT v_c.auto_reject_at_limit THEN
      RETURN NULL;
    END IF;
    RETURN 'Mitgliederlimit erreicht';
  END IF;

  IF v_c.visibility = 'premium'
     AND (v_c.monetization_enabled OR v_c.paid_join_required) THEN
    RETURN 'Kostenpflichtiger Zugang — Abo erforderlich';
  END IF;

  IF v_c.visibility = 'private' OR v_c.access_status = 'invite_only' THEN
    IF v_c.join_approval_mode = 'auto_reject' THEN
      RETURN 'Nur auf Einladung — Beitritt nicht möglich';
    END IF;
    RETURN NULL;
  END IF;

  IF v_c.join_approval_mode = 'auto_reject' THEN
    RETURN 'Beitritt derzeit nicht möglich';
  END IF;

  RETURN NULL;
END;
$$;

-- Warteliste: bei freiem Platz automatisch promoten
CREATE OR REPLACE FUNCTION public.handle_member_leave_waitlist_promote()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_waitlist_enabled BOOLEAN;
BEGIN
  IF TG_OP <> 'DELETE' THEN
    RETURN OLD;
  END IF;

  SELECT waitlist_enabled INTO v_waitlist_enabled
  FROM public.communities
  WHERE id = OLD.community_id;

  IF v_waitlist_enabled AND NOT public.is_community_at_member_limit(OLD.community_id) THEN
    BEGIN
      PERFORM public.promote_next_waitlisted_application(
        OLD.community_id,
        (SELECT creator_id FROM public.communities WHERE id = OLD.community_id)
      );
    EXCEPTION WHEN OTHERS THEN
      NULL;
    END;
  END IF;

  IF OLD.role <> 'creator' THEN
    INSERT INTO public.community_member_restrictions (
      community_id,
      user_id,
      restriction_type,
      reason,
      restricted_until,
      created_by
    )
    SELECT
      OLD.community_id,
      OLD.user_id,
      'cooldown',
      'Rejoin-Schutz nach Verlassen',
      NOW() + (c.rejoin_cooldown_days || ' days')::INTERVAL,
      NULL
    FROM public.communities c
    WHERE c.id = OLD.community_id
      AND c.rejoin_cooldown_days IS NOT NULL
      AND c.rejoin_cooldown_days > 0
      AND NOT EXISTS (
        SELECT 1 FROM public.community_member_restrictions r
        WHERE r.community_id = OLD.community_id
          AND r.user_id = OLD.user_id
          AND r.lifted_at IS NULL
          AND r.restriction_type = 'ban'
      );
  END IF;

  RETURN OLD;
END;
$$;

DROP TRIGGER IF EXISTS community_members_leave_lifecycle ON public.community_members;
CREATE TRIGGER community_members_leave_lifecycle
  AFTER DELETE ON public.community_members
  FOR EACH ROW EXECUTE FUNCTION public.handle_member_leave_waitlist_promote();

-- Archivierte Communities aus Discover ausblenden
CREATE OR REPLACE FUNCTION public.sync_community_archived_discover()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  IF NEW.access_status = 'archived' AND OLD.access_status IS DISTINCT FROM 'archived' THEN
    NEW.discover_enabled := FALSE;
    NEW.archived_at := COALESCE(NEW.archived_at, NOW());
  ELSIF NEW.access_status <> 'archived' AND OLD.access_status = 'archived' THEN
    NEW.archived_at := NULL;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS communities_archived_discover ON public.communities;
CREATE TRIGGER communities_archived_discover
  BEFORE UPDATE ON public.communities
  FOR EACH ROW EXECUTE FUNCTION public.sync_community_archived_discover();

-- =============================================================================
-- RLS
-- =============================================================================
ALTER TABLE public.community_member_restrictions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.community_join_application_files ENABLE ROW LEVEL SECURITY;

CREATE POLICY "member_restrictions_select"
  ON public.community_member_restrictions FOR SELECT
  USING (
    user_id = auth.uid()
    OR public.can_moderate_community(community_id)
  );

CREATE POLICY "member_restrictions_manage"
  ON public.community_member_restrictions FOR ALL
  USING (public.can_moderate_community(community_id))
  WITH CHECK (public.can_moderate_community(community_id));

CREATE POLICY "join_application_files_select"
  ON public.community_join_application_files FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.community_join_applications a
      WHERE a.id = application_id
        AND (
          a.user_id = auth.uid()
          OR public.can_moderate_community(a.community_id)
        )
    )
  );

CREATE POLICY "join_application_files_insert_own"
  ON public.community_join_application_files FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.community_join_applications a
      WHERE a.id = application_id AND a.user_id = auth.uid()
    )
  );

-- Storage bucket Vorbereitung (Supabase Dashboard / CLI):
-- bucket: community-join-proofs, private, RLS per community


-- ========== 009_join_approval_modes.sql ==========
-- UNZE Join-Approval-Modi erweitern (Einladung, kostenpflichtige Freischaltung)
-- Nach 008_community_lifecycle.sql ausführen

ALTER TYPE public.join_approval_mode ADD VALUE IF NOT EXISTS 'invite_required';
ALTER TYPE public.join_approval_mode ADD VALUE IF NOT EXISTS 'paid_unlock';


-- ========== 010_platform_governance.sql ==========
-- UNZE Platform Governance Layer — Foundation Systems
-- Permission Engine, Reports, Audit, Trust, Soft Delete, Notification Center prep
-- Nach 009_join_approval_modes.sql ausführen

-- =============================================================================
-- Enums
-- =============================================================================
CREATE TYPE public.report_target_type AS ENUM (
  'user',
  'community',
  'creator',
  'post',
  'comment'
);

CREATE TYPE public.report_status AS ENUM (
  'pending',
  'reviewing',
  'resolved',
  'dismissed'
);

CREATE TYPE public.moderation_action_type AS ENUM (
  'warn',
  'mute',
  'strike',
  'ban',
  'unban',
  'lift_restriction',
  'dismiss_report',
  'restore_member'
);

CREATE TYPE public.audit_category AS ENUM (
  'role_change',
  'application',
  'invite',
  'restriction',
  'settings',
  'membership',
  'moderation',
  'community_lifecycle',
  'permission'
);

CREATE TYPE public.trust_event_type AS ENUM (
  'verified_member_granted',
  'verified_member_revoked',
  'strike_received',
  'ban_received',
  'report_filed',
  'report_resolved',
  'community_joined',
  'community_left',
  'reputation_adjustment',
  'spam_flag',
  'scam_flag'
);

CREATE TYPE public.trust_flag_type AS ENUM (
  'spam_suspect',
  'scam_suspect',
  'report_spike',
  'verified',
  'restricted'
);

ALTER TYPE public.community_restriction_type ADD VALUE IF NOT EXISTS 'mute';
ALTER TYPE public.community_restriction_type ADD VALUE IF NOT EXISTS 'strike';

ALTER TYPE public.notification_type ADD VALUE IF NOT EXISTS 'application';
ALTER TYPE public.notification_type ADD VALUE IF NOT EXISTS 'moderation';
ALTER TYPE public.notification_type ADD VALUE IF NOT EXISTS 'community_event';
ALTER TYPE public.notification_type ADD VALUE IF NOT EXISTS 'invite';

-- =============================================================================
-- Permission Engine — granulare Rechte mit Community-Overrides
-- =============================================================================
CREATE TABLE public.community_permission_definitions (
  key TEXT PRIMARY KEY,
  label TEXT NOT NULL,
  description TEXT,
  default_min_role public.community_role NOT NULL DEFAULT 'member',
  category TEXT NOT NULL DEFAULT 'general',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE public.community_permission_overrides (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  community_id UUID NOT NULL REFERENCES public.communities(id) ON DELETE CASCADE,
  permission_key TEXT NOT NULL REFERENCES public.community_permission_definitions(key) ON DELETE CASCADE,
  role public.community_role NOT NULL,
  granted BOOLEAN NOT NULL,
  updated_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (community_id, permission_key, role)
);

CREATE INDEX idx_permission_overrides_community
  ON public.community_permission_overrides(community_id);

-- Seed: granulare Permission-Definitionen
INSERT INTO public.community_permission_definitions (key, label, description, default_min_role, category) VALUES
  ('view', 'Ansehen', 'Community-Inhalte ansehen', 'member', 'content'),
  ('post', 'Beiträge erstellen', 'Posts in der Community erstellen', 'member', 'content'),
  ('comment', 'Kommentieren', 'Kommentare schreiben', 'member', 'content'),
  ('moderate', 'Moderieren', 'Inhalte moderieren', 'moderator', 'moderation'),
  ('review_applications', 'Anträge prüfen', 'Beitrittsanträge prüfen', 'moderator', 'access'),
  ('manage_invites', 'Einladungen verwalten', 'Einladungslinks erstellen', 'moderator', 'access'),
  ('ban_members', 'Mitglieder sperren', 'Bann/Mute/Strikes aussprechen', 'moderator', 'moderation'),
  ('view_restrictions', 'Sperren einsehen', 'Moderationshistorie & Sperren', 'moderator', 'moderation'),
  ('manage_reports', 'Meldungen bearbeiten', 'Nutzer-/Community-Meldungen prüfen', 'moderator', 'moderation'),
  ('view_audit_log', 'Audit-Log einsehen', 'Governance-Aktionen nachvollziehen', 'admin', 'governance'),
  ('manage_members', 'Mitglieder verwalten', 'Mitglieder entfernen/wiederherstellen', 'admin', 'members'),
  ('manage_roles', 'Rollen verwalten', 'Mitgliederrollen zuweisen', 'admin', 'members'),
  ('manage_settings', 'Einstellungen', 'Community-Einstellungen ändern', 'admin', 'settings'),
  ('manage_access', 'Zugang verwalten', 'Join-Logik & Status', 'admin', 'access'),
  ('manage_join_questions', 'Bewerbungsfragen', 'Fragen für Beitrittsanträge', 'admin', 'access'),
  ('manage_permissions', 'Rechte konfigurieren', 'Rollen-Rechte pro Community', 'admin', 'governance'),
  ('manage_monetization', 'Monetarisierung', 'Stripe & Abos (vorbereitet)', 'creator', 'monetization'),
  ('archive_community', 'Archivieren/Pausieren', 'Community-Lifecycle steuern', 'creator', 'lifecycle'),
  ('delete_community', 'Community löschen', 'Soft-Delete (Creator only)', 'creator', 'lifecycle'),
  ('transfer_ownership', 'Ownership übertragen', 'Creator-Rolle übergeben', 'creator', 'lifecycle')
ON CONFLICT (key) DO NOTHING;

-- =============================================================================
-- Reports & Moderation
-- =============================================================================
CREATE TABLE public.platform_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  reporter_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  target_type public.report_target_type NOT NULL,
  target_id UUID NOT NULL,
  community_id UUID REFERENCES public.communities(id) ON DELETE SET NULL,
  reason TEXT NOT NULL,
  details TEXT,
  status public.report_status NOT NULL DEFAULT 'pending',
  reviewed_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  reviewed_at TIMESTAMPTZ,
  resolution_note TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_platform_reports_community
  ON public.platform_reports(community_id, status, created_at DESC);

CREATE INDEX idx_platform_reports_target
  ON public.platform_reports(target_type, target_id);

CREATE TABLE public.moderation_actions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  community_id UUID NOT NULL REFERENCES public.communities(id) ON DELETE CASCADE,
  actor_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE SET NULL,
  target_user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  action_type public.moderation_action_type NOT NULL,
  report_id UUID REFERENCES public.platform_reports(id) ON DELETE SET NULL,
  restriction_id UUID REFERENCES public.community_member_restrictions(id) ON DELETE SET NULL,
  reason TEXT,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_moderation_actions_community
  ON public.moderation_actions(community_id, created_at DESC);

CREATE TABLE public.community_member_strikes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  community_id UUID NOT NULL REFERENCES public.communities(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  strike_number INTEGER NOT NULL CHECK (strike_number > 0),
  reason TEXT,
  issued_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  moderation_action_id UUID REFERENCES public.moderation_actions(id) ON DELETE SET NULL,
  expires_at TIMESTAMPTZ,
  active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_member_strikes_user
  ON public.community_member_strikes(community_id, user_id, active);

-- =============================================================================
-- Audit Logs
-- =============================================================================
CREATE TABLE public.audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  community_id UUID REFERENCES public.communities(id) ON DELETE SET NULL,
  actor_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  action TEXT NOT NULL,
  category public.audit_category NOT NULL,
  target_type TEXT,
  target_id UUID,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_audit_logs_community
  ON public.audit_logs(community_id, created_at DESC);

CREATE INDEX idx_audit_logs_category
  ON public.audit_logs(category, created_at DESC);

-- =============================================================================
-- Notification Center — Präferenzen
-- =============================================================================
CREATE TABLE public.notification_preferences (
  user_id UUID PRIMARY KEY REFERENCES public.profiles(id) ON DELETE CASCADE,
  applications BOOLEAN NOT NULL DEFAULT TRUE,
  moderation BOOLEAN NOT NULL DEFAULT TRUE,
  invites BOOLEAN NOT NULL DEFAULT TRUE,
  community_events BOOLEAN NOT NULL DEFAULT TRUE,
  system BOOLEAN NOT NULL DEFAULT TRUE,
  push_enabled BOOLEAN NOT NULL DEFAULT FALSE,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- =============================================================================
-- Trust / Reputation Layer
-- =============================================================================
ALTER TABLE public.communities
  ADD COLUMN IF NOT EXISTS trust_score INTEGER NOT NULL DEFAULT 100;

ALTER TABLE public.communities
  ADD CONSTRAINT communities_trust_score_range
    CHECK (trust_score >= 0 AND trust_score <= 1000);

CREATE TABLE public.trust_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  community_id UUID REFERENCES public.communities(id) ON DELETE SET NULL,
  event_type public.trust_event_type NOT NULL,
  delta INTEGER NOT NULL DEFAULT 0,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_trust_events_user ON public.trust_events(user_id, created_at DESC);
CREATE INDEX idx_trust_events_community ON public.trust_events(community_id, created_at DESC);

CREATE TABLE public.user_trust_flags (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  flag_type public.trust_flag_type NOT NULL,
  community_id UUID REFERENCES public.communities(id) ON DELETE SET NULL,
  reason TEXT,
  active BOOLEAN NOT NULL DEFAULT TRUE,
  created_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_user_trust_flags_active
  ON public.user_trust_flags(user_id, active)
  WHERE active = TRUE;

-- =============================================================================
-- Soft Delete / Archivierung
-- =============================================================================
ALTER TABLE public.communities
  ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS deleted_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL;

ALTER TABLE public.community_members
  ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS deleted_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS restored_at TIMESTAMPTZ;

ALTER TABLE public.posts
  ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS deleted_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL;

ALTER TABLE public.comments
  ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS deleted_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL;

CREATE INDEX idx_communities_not_deleted
  ON public.communities(id) WHERE deleted_at IS NULL;

CREATE INDEX idx_community_members_active
  ON public.community_members(community_id, user_id) WHERE deleted_at IS NULL;

-- =============================================================================
-- Hilfsfunktionen
-- =============================================================================
CREATE OR REPLACE FUNCTION public.soft_remove_community_member(
  p_member_id UUID,
  p_actor_id UUID
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE public.community_members
  SET deleted_at = NOW(),
      deleted_by = p_actor_id,
      restored_at = NULL
  WHERE id = p_member_id
    AND deleted_at IS NULL
    AND role <> 'creator';
END;
$$;

CREATE OR REPLACE FUNCTION public.restore_community_member(
  p_member_id UUID
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE public.community_members
  SET deleted_at = NULL,
      deleted_by = NULL,
      restored_at = NOW()
  WHERE id = p_member_id
    AND deleted_at IS NOT NULL;
END;
$$;

CREATE OR REPLACE FUNCTION public.count_active_member_strikes(
  p_community_id UUID,
  p_user_id UUID
)
RETURNS INTEGER
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT COUNT(*)::INTEGER
  FROM public.community_member_strikes
  WHERE community_id = p_community_id
    AND user_id = p_user_id
    AND active = TRUE
    AND (expires_at IS NULL OR expires_at > NOW());
$$;

-- =============================================================================
-- RLS
-- =============================================================================
ALTER TABLE public.community_permission_definitions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.community_permission_overrides ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.platform_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.moderation_actions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.community_member_strikes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notification_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.trust_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_trust_flags ENABLE ROW LEVEL SECURITY;

CREATE POLICY "permission_definitions_select"
  ON public.community_permission_definitions FOR SELECT
  USING (TRUE);

CREATE POLICY "permission_overrides_select"
  ON public.community_permission_overrides FOR SELECT
  USING (
    public.can_manage_community(community_id, auth.uid())
    OR public.can_moderate_community(community_id, auth.uid())
  );

CREATE POLICY "permission_overrides_manage"
  ON public.community_permission_overrides FOR ALL
  USING (public.can_manage_community(community_id, auth.uid()))
  WITH CHECK (public.can_manage_community(community_id, auth.uid()));

CREATE POLICY "reports_insert_own"
  ON public.platform_reports FOR INSERT
  WITH CHECK (auth.uid() = reporter_id);

CREATE POLICY "reports_select_reporter"
  ON public.platform_reports FOR SELECT
  USING (auth.uid() = reporter_id);

CREATE POLICY "reports_select_moderator"
  ON public.platform_reports FOR SELECT
  USING (
    community_id IS NOT NULL
    AND public.can_moderate_community(community_id, auth.uid())
  );

CREATE POLICY "reports_update_moderator"
  ON public.platform_reports FOR UPDATE
  USING (
    community_id IS NOT NULL
    AND public.can_moderate_community(community_id, auth.uid())
  );

CREATE POLICY "moderation_actions_select"
  ON public.moderation_actions FOR SELECT
  USING (public.can_moderate_community(community_id, auth.uid()));

CREATE POLICY "moderation_actions_insert"
  ON public.moderation_actions FOR INSERT
  WITH CHECK (
    auth.uid() = actor_id
    AND public.can_moderate_community(community_id, auth.uid())
  );

CREATE POLICY "member_strikes_select"
  ON public.community_member_strikes FOR SELECT
  USING (
    auth.uid() = user_id
    OR public.can_moderate_community(community_id, auth.uid())
  );

CREATE POLICY "member_strikes_insert"
  ON public.community_member_strikes FOR INSERT
  WITH CHECK (public.can_moderate_community(community_id, auth.uid()));

CREATE POLICY "audit_logs_select"
  ON public.audit_logs FOR SELECT
  USING (
    community_id IS NULL
    OR public.can_manage_community(community_id, auth.uid())
  );

CREATE POLICY "audit_logs_insert"
  ON public.audit_logs FOR INSERT
  WITH CHECK (
    auth.uid() = actor_id
    AND (
      community_id IS NULL
      OR public.can_moderate_community(community_id, auth.uid())
    )
  );

CREATE POLICY "notification_preferences_own"
  ON public.notification_preferences FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "trust_events_select_own"
  ON public.trust_events FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "trust_events_select_moderator"
  ON public.trust_events FOR SELECT
  USING (
    community_id IS NOT NULL
    AND public.can_moderate_community(community_id, auth.uid())
  );

CREATE POLICY "trust_flags_select_own"
  ON public.user_trust_flags FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "trust_flags_select_moderator"
  ON public.user_trust_flags FOR SELECT
  USING (
    community_id IS NOT NULL
    AND public.can_moderate_community(community_id, auth.uid())
  );


-- ========== 011_storage_proofs.sql ==========
-- UNZE Storage & Bewerbungs-/Nachweis-System
-- Private/public Buckets, sichere Nachweise, modulare Asset-Registry
-- Nach 010_platform_governance.sql ausführen

-- =============================================================================
-- Enums
-- =============================================================================
CREATE TYPE public.proof_category AS ENUM (
  'image',
  'document',
  'age',
  'identity',
  'creator',
  'community',
  'generic'
);

CREATE TYPE public.storage_asset_category AS ENUM (
  'join_proof',
  'feed_media',
  'premium_content',
  'avatar',
  'banner',
  'creator_verification'
);

CREATE TYPE public.storage_visibility AS ENUM (
  'private',
  'community',
  'public'
);

ALTER TYPE public.join_question_type ADD VALUE IF NOT EXISTS 'age_proof';
ALTER TYPE public.join_question_type ADD VALUE IF NOT EXISTS 'identity_proof';

-- =============================================================================
-- Nachweis-Metadaten erweitern
-- =============================================================================
ALTER TABLE public.community_join_application_files
  ADD COLUMN IF NOT EXISTS proof_category public.proof_category NOT NULL DEFAULT 'generic',
  ADD COLUMN IF NOT EXISTS storage_bucket TEXT NOT NULL DEFAULT 'community-join-proofs',
  ADD COLUMN IF NOT EXISTS checksum TEXT,
  ADD COLUMN IF NOT EXISTS uploaded_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL;

CREATE INDEX idx_join_application_files_question
  ON public.community_join_application_files(question_id);

-- =============================================================================
-- Modulare Storage-Asset-Registry (Feed, Media, Premium vorbereitet)
-- =============================================================================
CREATE TABLE public.storage_assets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  bucket_id TEXT NOT NULL,
  storage_path TEXT NOT NULL,
  owner_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  community_id UUID REFERENCES public.communities(id) ON DELETE SET NULL,
  asset_category public.storage_asset_category NOT NULL DEFAULT 'join_proof',
  visibility public.storage_visibility NOT NULL DEFAULT 'private',
  mime_type TEXT,
  file_size_bytes INTEGER CHECK (file_size_bytes IS NULL OR file_size_bytes >= 0),
  original_name TEXT,
  checksum TEXT,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  deleted_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (bucket_id, storage_path)
);

CREATE INDEX idx_storage_assets_owner ON public.storage_assets(owner_id, created_at DESC);
CREATE INDEX idx_storage_assets_community ON public.storage_assets(community_id, asset_category)
  WHERE deleted_at IS NULL;

-- =============================================================================
-- Hilfsfunktion: Community-ID aus Storage-Pfad (Segment 1)
-- =============================================================================
CREATE OR REPLACE FUNCTION public.storage_path_community_id(object_name TEXT)
RETURNS UUID
LANGUAGE sql
IMMUTABLE
AS $$
  SELECT NULLIF(split_part(object_name, '/', 1), '')::UUID;
$$;

CREATE OR REPLACE FUNCTION public.storage_path_owner_id(object_name TEXT)
RETURNS UUID
LANGUAGE sql
IMMUTABLE
AS $$
  SELECT NULLIF(split_part(object_name, '/', 2), '')::UUID;
$$;

-- =============================================================================
-- Storage Buckets
-- =============================================================================
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES
  (
    'community-join-proofs',
    'community-join-proofs',
    FALSE,
    10485760,
    ARRAY[
      'image/jpeg', 'image/png', 'image/webp', 'image/heic', 'image/heif',
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ]::text[]
  ),
  (
    'unze-public-media',
    'unze-public-media',
    TRUE,
    52428800,
    ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'video/mp4', 'video/webm']::text[]
  ),
  (
    'unze-private-media',
    'unze-private-media',
    FALSE,
    52428800,
    NULL
  )
ON CONFLICT (id) DO UPDATE SET
  public = EXCLUDED.public,
  file_size_limit = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;

-- =============================================================================
-- Storage RLS — community-join-proofs (strikt privat)
-- Pfad: {communityId}/{userId}/{batchId}/{filename}
-- =============================================================================
CREATE POLICY "join_proofs_insert_own"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'community-join-proofs'
    AND public.storage_path_owner_id(name) = auth.uid()
  );

CREATE POLICY "join_proofs_select_authorized"
  ON storage.objects FOR SELECT
  TO authenticated
  USING (
    bucket_id = 'community-join-proofs'
    AND (
      public.storage_path_owner_id(name) = auth.uid()
      OR public.can_moderate_community(public.storage_path_community_id(name))
    )
  );

CREATE POLICY "join_proofs_delete_own_or_mod"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (
    bucket_id = 'community-join-proofs'
    AND (
      public.storage_path_owner_id(name) = auth.uid()
      OR public.can_moderate_community(public.storage_path_community_id(name))
    )
  );

-- =============================================================================
-- Storage RLS — unze-public-media (öffentlich lesbar)
-- Pfad: {ownerId}/{category}/{filename}
-- =============================================================================
CREATE POLICY "public_media_insert_own"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'unze-public-media'
    AND public.storage_path_owner_id(name) = auth.uid()
  );

CREATE POLICY "public_media_select_all"
  ON storage.objects FOR SELECT
  TO authenticated
  USING (bucket_id = 'unze-public-media');

CREATE POLICY "public_media_delete_own"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (
    bucket_id = 'unze-public-media'
    AND public.storage_path_owner_id(name) = auth.uid()
  );

-- =============================================================================
-- Storage RLS — unze-private-media (Premium/Feed vorbereitet)
-- =============================================================================
CREATE POLICY "private_media_insert_own"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'unze-private-media'
    AND public.storage_path_owner_id(name) = auth.uid()
  );

CREATE POLICY "private_media_select_authorized"
  ON storage.objects FOR SELECT
  TO authenticated
  USING (
    bucket_id = 'unze-private-media'
    AND (
      public.storage_path_owner_id(name) = auth.uid()
      OR (
        public.storage_path_community_id(name) IS NOT NULL
        AND public.can_moderate_community(public.storage_path_community_id(name))
      )
    )
  );

-- =============================================================================
-- storage_assets RLS
-- =============================================================================
ALTER TABLE public.storage_assets ENABLE ROW LEVEL SECURITY;

CREATE POLICY "storage_assets_select_own"
  ON public.storage_assets FOR SELECT
  USING (owner_id = auth.uid());

CREATE POLICY "storage_assets_select_moderator"
  ON public.storage_assets FOR SELECT
  USING (
    community_id IS NOT NULL
    AND public.can_moderate_community(community_id)
  );

CREATE POLICY "storage_assets_insert_own"
  ON public.storage_assets FOR INSERT
  WITH CHECK (owner_id = auth.uid());

CREATE POLICY "storage_assets_update_own"
  ON public.storage_assets FOR UPDATE
  USING (owner_id = auth.uid());

-- =============================================================================
-- join_application_files: proof_category + Admin-Lesezugriff
-- =============================================================================
DROP POLICY IF EXISTS "join_application_files_select" ON public.community_join_application_files;

CREATE POLICY "join_application_files_select"
  ON public.community_join_application_files FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.community_join_applications a
      WHERE a.id = application_id
        AND (
          a.user_id = auth.uid()
          OR public.can_moderate_community(a.community_id)
        )
    )
  );

CREATE POLICY "join_application_files_insert_draft"
  ON public.community_join_application_files FOR INSERT
  WITH CHECK (
    uploaded_by = auth.uid()
    AND EXISTS (
      SELECT 1 FROM public.community_join_applications a
      WHERE a.id = application_id
        AND a.user_id = auth.uid()
    )
  );


-- ========== 012_verification_system.sql ==========
-- UNZE Creator-/Community-Verifizierungssystem
-- Nach 011_storage_proofs.sql ausführen

-- =============================================================================
-- Enums
-- =============================================================================
CREATE TYPE public.verification_subject_type AS ENUM ('user', 'community');

CREATE TYPE public.verification_type AS ENUM (
  'creator_identity',
  'creator_business',
  'community',
  'platform'
);

CREATE TYPE public.verification_status AS ENUM (
  'draft',
  'pending',
  'reviewing',
  'approved',
  'rejected',
  'expired',
  'revoked'
);

CREATE TYPE public.verification_document_type AS ENUM (
  'identity_document',
  'selfie',
  'business_registration',
  'tax_certificate',
  'platform_reference',
  'community_ownership',
  'other'
);

CREATE TYPE public.creator_verification_tier AS ENUM (
  'none',
  'identity',
  'business',
  'platform'
);

ALTER TYPE public.trust_event_type ADD VALUE IF NOT EXISTS 'creator_verified';
ALTER TYPE public.trust_event_type ADD VALUE IF NOT EXISTS 'community_verified';
ALTER TYPE public.trust_event_type ADD VALUE IF NOT EXISTS 'verification_rejected';

ALTER TYPE public.audit_category ADD VALUE IF NOT EXISTS 'verification';

-- =============================================================================
-- Profile & Community Erweiterungen
-- =============================================================================
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS creator_verification_tier public.creator_verification_tier NOT NULL DEFAULT 'none',
  ADD COLUMN IF NOT EXISTS creator_verification_status public.verification_status NOT NULL DEFAULT 'draft',
  ADD COLUMN IF NOT EXISTS verified_creator_at TIMESTAMPTZ;

ALTER TABLE public.communities
  ADD COLUMN IF NOT EXISTS community_verification_status public.verification_status NOT NULL DEFAULT 'draft',
  ADD COLUMN IF NOT EXISTS verified_community_at TIMESTAMPTZ;

-- =============================================================================
-- Verifizierungsanträge
-- =============================================================================
CREATE TABLE public.verification_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  subject_type public.verification_subject_type NOT NULL,
  subject_id UUID NOT NULL,
  verification_type public.verification_type NOT NULL,
  status public.verification_status NOT NULL DEFAULT 'pending',
  submitted_by UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  business_name TEXT,
  business_registration_id TEXT,
  notes TEXT,
  rejection_reason TEXT,
  reviewed_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  reviewed_at TIMESTAMPTZ,
  expires_at TIMESTAMPTZ,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_verification_requests_subject
  ON public.verification_requests(subject_type, subject_id, status);

CREATE INDEX idx_verification_requests_pending
  ON public.verification_requests(status, created_at DESC)
  WHERE status IN ('pending', 'reviewing');

-- =============================================================================
-- Verifizierungsdokumente (privat)
-- =============================================================================
CREATE TABLE public.verification_documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  request_id UUID NOT NULL REFERENCES public.verification_requests(id) ON DELETE CASCADE,
  document_type public.verification_document_type NOT NULL,
  storage_bucket TEXT NOT NULL DEFAULT 'unze-verification-private',
  storage_path TEXT NOT NULL,
  file_name TEXT NOT NULL,
  mime_type TEXT,
  file_size_bytes INTEGER CHECK (file_size_bytes IS NULL OR file_size_bytes >= 0),
  uploaded_by UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_verification_documents_request
  ON public.verification_documents(request_id);

-- =============================================================================
-- Zugriffsprotokoll (Privacy & Security)
-- =============================================================================
CREATE TABLE public.verification_access_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  document_id UUID NOT NULL REFERENCES public.verification_documents(id) ON DELETE CASCADE,
  request_id UUID NOT NULL REFERENCES public.verification_requests(id) ON DELETE CASCADE,
  accessor_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  action TEXT NOT NULL DEFAULT 'view',
  ip_hint TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_verification_access_logs_doc
  ON public.verification_access_logs(document_id, created_at DESC);

-- =============================================================================
-- Hilfsfunktionen
-- =============================================================================
CREATE OR REPLACE FUNCTION public.is_platform_admin(p_user_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = p_user_id AND platform_role = 'platform_admin'
  );
$$;

CREATE OR REPLACE FUNCTION public.can_review_verification(
  p_user_id UUID,
  p_request_id UUID
)
RETURNS BOOLEAN
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_req public.verification_requests%ROWTYPE;
BEGIN
  SELECT * INTO v_req FROM public.verification_requests WHERE id = p_request_id;
  IF NOT FOUND THEN RETURN FALSE; END IF;

  IF public.is_platform_admin(p_user_id) THEN RETURN TRUE; END IF;

  IF v_req.subject_type = 'community' THEN
    RETURN public.can_manage_community(v_req.subject_id, p_user_id);
  END IF;

  RETURN FALSE;
END;
$$;

-- =============================================================================
-- Storage Bucket — strikt privat
-- Pfad: {subjectType}/{subjectId}/{requestId}/{docType}_{uuid}_{filename}
-- =============================================================================
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'unze-verification-private',
  'unze-verification-private',
  FALSE,
  15728640,
  ARRAY[
    'image/jpeg', 'image/png', 'image/webp', 'image/heic', 'image/heif',
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
  ]::text[]
)
ON CONFLICT (id) DO UPDATE SET
  public = FALSE,
  file_size_limit = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;

CREATE POLICY "verification_docs_insert_own"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'unze-verification-private'
    AND split_part(name, '/', 3) IN (
      SELECT id::text FROM public.verification_requests
      WHERE submitted_by = auth.uid()
        AND status IN ('draft', 'pending', 'reviewing')
    )
  );

CREATE POLICY "verification_docs_select_reviewer"
  ON storage.objects FOR SELECT
  TO authenticated
  USING (
    bucket_id = 'unze-verification-private'
    AND (
      split_part(name, '/', 3) IN (
        SELECT id::text FROM public.verification_requests WHERE submitted_by = auth.uid()
      )
      OR public.can_review_verification(
        auth.uid(),
        split_part(name, '/', 3)::uuid
      )
    )
  );

-- =============================================================================
-- RLS
-- =============================================================================
ALTER TABLE public.verification_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.verification_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.verification_access_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "verification_requests_select_own"
  ON public.verification_requests FOR SELECT
  USING (submitted_by = auth.uid());

CREATE POLICY "verification_requests_select_reviewer"
  ON public.verification_requests FOR SELECT
  USING (public.can_review_verification(auth.uid(), id));

CREATE POLICY "verification_requests_insert_own"
  ON public.verification_requests FOR INSERT
  WITH CHECK (submitted_by = auth.uid());

CREATE POLICY "verification_requests_update_reviewer"
  ON public.verification_requests FOR UPDATE
  USING (public.can_review_verification(auth.uid(), id));

CREATE POLICY "verification_documents_select"
  ON public.verification_documents FOR SELECT
  USING (
    uploaded_by = auth.uid()
    OR public.can_review_verification(auth.uid(), request_id)
  );

CREATE POLICY "verification_documents_insert_own"
  ON public.verification_documents FOR INSERT
  WITH CHECK (
    uploaded_by = auth.uid()
    AND EXISTS (
      SELECT 1 FROM public.verification_requests r
      WHERE r.id = request_id AND r.submitted_by = auth.uid()
    )
  );

CREATE POLICY "verification_access_logs_select_reviewer"
  ON public.verification_access_logs FOR SELECT
  USING (public.can_review_verification(auth.uid(), request_id));

CREATE POLICY "verification_access_logs_insert"
  ON public.verification_access_logs FOR INSERT
  WITH CHECK (accessor_id = auth.uid());


-- ========== 013_platform_events.sql ==========
-- UNZE Platform Event Architecture — Global Event Store & Activity Log
-- Nach 012_verification_system.sql ausführen

-- =============================================================================
-- Enums
-- =============================================================================
CREATE TYPE public.platform_event_domain AS ENUM (
  'community',
  'membership',
  'verification',
  'moderation',
  'trust',
  'billing',
  'badge',
  'governance',
  'invite',
  'notification'
);

-- =============================================================================
-- Immutable Event Store (Event Sourcing light — Realtime/Analytics vorbereitet)
-- =============================================================================
CREATE TABLE public.platform_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_type TEXT NOT NULL,
  domain public.platform_event_domain NOT NULL,
  actor_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  subject_type TEXT,
  subject_id UUID,
  community_id UUID REFERENCES public.communities(id) ON DELETE SET NULL,
  target_user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  payload JSONB NOT NULL DEFAULT '{}'::jsonb,
  correlation_id UUID,
  idempotency_key TEXT UNIQUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_platform_events_type ON public.platform_events(event_type, created_at DESC);
CREATE INDEX idx_platform_events_community ON public.platform_events(community_id, created_at DESC)
  WHERE community_id IS NOT NULL;
CREATE INDEX idx_platform_events_actor ON public.platform_events(actor_id, created_at DESC)
  WHERE actor_id IS NOT NULL;
CREATE INDEX idx_platform_events_target ON public.platform_events(target_user_id, created_at DESC)
  WHERE target_user_id IS NOT NULL;
CREATE INDEX idx_platform_events_correlation ON public.platform_events(correlation_id)
  WHERE correlation_id IS NOT NULL;

-- Realtime-Vorbereitung: Supabase Realtime auf platform_events aktivieren (Dashboard)

-- =============================================================================
-- Event-Handler Audit Trail (welche Handler liefen)
-- =============================================================================
CREATE TABLE public.platform_event_deliveries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID NOT NULL REFERENCES public.platform_events(id) ON DELETE CASCADE,
  handler_name TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'ok',
  error_message TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_event_deliveries_event ON public.platform_event_deliveries(event_id);

-- =============================================================================
-- RLS
-- =============================================================================
ALTER TABLE public.platform_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.platform_event_deliveries ENABLE ROW LEVEL SECURITY;

CREATE POLICY "platform_events_insert_authenticated"
  ON public.platform_events FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "platform_events_select_actor"
  ON public.platform_events FOR SELECT
  TO authenticated
  USING (
    actor_id = auth.uid()
    OR target_user_id = auth.uid()
  );

CREATE POLICY "platform_events_select_community_mod"
  ON public.platform_events FOR SELECT
  TO authenticated
  USING (
    community_id IS NOT NULL
    AND public.can_moderate_community(community_id, auth.uid())
  );

CREATE POLICY "platform_events_select_platform_admin"
  ON public.platform_events FOR SELECT
  TO authenticated
  USING (public.is_platform_admin(auth.uid()));

CREATE POLICY "event_deliveries_select_platform_admin"
  ON public.platform_event_deliveries FOR SELECT
  TO authenticated
  USING (public.is_platform_admin(auth.uid()));

CREATE POLICY "event_deliveries_insert_service"
  ON public.platform_event_deliveries FOR INSERT
  TO authenticated
  WITH CHECK (TRUE);


-- ========== 014_platform_integrity.sql ==========
-- UNZE Platform Integrity — Creator-Mitgliedschaft & Daten-Konsistenz
-- Nach 013_platform_events.sql ausführen

-- Creator fehlt in community_members (z.B. vor Trigger oder manuelle Inserts)
INSERT INTO public.community_members (community_id, user_id, role)
SELECT c.id, c.creator_id, 'creator'::public.community_role
FROM public.communities c
WHERE NOT EXISTS (
  SELECT 1
  FROM public.community_members m
  WHERE m.community_id = c.id
    AND m.user_id = c.creator_id
)
ON CONFLICT (community_id, user_id) DO UPDATE
  SET role = EXCLUDED.role
  WHERE public.community_members.role <> 'creator'::public.community_role;

-- Mitgliederzähler mit tatsächlichen Mitgliedern abgleichen
UPDATE public.communities c
SET member_count = sub.cnt
FROM (
  SELECT community_id, COUNT(*)::INTEGER AS cnt
  FROM public.community_members
  GROUP BY community_id
) sub
WHERE c.id = sub.community_id
  AND c.member_count IS DISTINCT FROM sub.cnt;

-- Trigger absichern (idempotent)
CREATE OR REPLACE FUNCTION public.handle_new_community()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.community_members (community_id, user_id, role)
  VALUES (NEW.id, NEW.creator_id, 'creator')
  ON CONFLICT (community_id, user_id) DO UPDATE
    SET role = 'creator'::public.community_role;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_community_created ON public.communities;
CREATE TRIGGER on_community_created
  AFTER INSERT ON public.communities
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_community();


-- ========== 015_api_table_grants.sql ==========
-- UNZE 015: API-Grants für PostgREST / supabase-js
-- Nach BUNDLE ausführen wenn "permission denied for table" (42501)
-- Supabase: neue Projekte vergeben keine Auto-Grants mehr an anon/authenticated/service_role

GRANT USAGE ON SCHEMA public TO postgres, anon, authenticated, service_role;

GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public
  TO anon, authenticated, service_role;

GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public
  TO anon, authenticated, service_role;

-- Funktionen (RLS-Helper, RPCs)
GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA public
  TO anon, authenticated, service_role;

-- Zukünftige Tabellen automatisch exponieren
ALTER DEFAULT PRIVILEGES IN SCHEMA public
  GRANT SELECT, INSERT, UPDATE, DELETE ON TABLES
  TO anon, authenticated, service_role;

ALTER DEFAULT PRIVILEGES IN SCHEMA public
  GRANT USAGE, SELECT ON SEQUENCES
  TO anon, authenticated, service_role;

ALTER DEFAULT PRIVILEGES IN SCHEMA public
  GRANT EXECUTE ON FUNCTIONS
  TO anon, authenticated, service_role;


-- ========== 016_community_engagement_metrics.sql ==========
-- UNZE Community Engagement — Aufrufe & Shares (additiv, rückwärtskompatibel)
-- Nach 015_api_table_grants.sql

ALTER TABLE public.communities
  ADD COLUMN IF NOT EXISTS view_count_total BIGINT NOT NULL DEFAULT 0 CHECK (view_count_total >= 0),
  ADD COLUMN IF NOT EXISTS view_count_weekly INTEGER NOT NULL DEFAULT 0 CHECK (view_count_weekly >= 0),
  ADD COLUMN IF NOT EXISTS share_count INTEGER NOT NULL DEFAULT 0 CHECK (share_count >= 0);

ALTER TABLE public.community_groups
  ADD COLUMN IF NOT EXISTS view_count_weekly INTEGER NOT NULL DEFAULT 0 CHECK (view_count_weekly >= 0),
  ADD COLUMN IF NOT EXISTS share_count INTEGER NOT NULL DEFAULT 0 CHECK (share_count >= 0);

COMMENT ON COLUMN public.communities.view_count_weekly IS 'Aggregierte Wochen-Aufrufe (Community-Seite + Discover)';
COMMENT ON COLUMN public.communities.share_count IS 'Anzahl geteilter Community-Links';
COMMENT ON COLUMN public.community_groups.share_count IS 'Anzahl geteilter Gruppen-Links';


-- ========== 017_post_content_extensions.sql ==========
-- Post-Content-Erweiterung: Medien, Gruppen-Kontext, Engagement-Metriken
-- Rückwärtskompatibel — bestehende Posts bleiben unverändert nutzbar

-- =============================================================================
-- Post-Typen erweitern
-- =============================================================================
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_enum e
    JOIN pg_type t ON e.enumtypid = t.oid
    WHERE t.typname = 'post_type' AND e.enumlabel = 'video'
  ) THEN
    ALTER TYPE public.post_type ADD VALUE 'video';
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM pg_enum e JOIN pg_type t ON e.enumtypid = t.oid
    WHERE t.typname = 'post_type' AND e.enumlabel = 'clip'
  ) THEN
    ALTER TYPE public.post_type ADD VALUE 'clip';
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM pg_enum e JOIN pg_type t ON e.enumtypid = t.oid
    WHERE t.typname = 'post_type' AND e.enumlabel = 'gallery'
  ) THEN
    ALTER TYPE public.post_type ADD VALUE 'gallery';
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM pg_enum e JOIN pg_type t ON e.enumtypid = t.oid
    WHERE t.typname = 'post_type' AND e.enumlabel = 'highlight'
  ) THEN
    ALTER TYPE public.post_type ADD VALUE 'highlight';
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM pg_enum e JOIN pg_type t ON e.enumtypid = t.oid
    WHERE t.typname = 'post_type' AND e.enumlabel = 'request'
  ) THEN
    ALTER TYPE public.post_type ADD VALUE 'request';
  END IF;
END $$;

-- =============================================================================
-- Posts: Gruppe, Medien, Metadaten, Engagement
-- =============================================================================
ALTER TABLE public.posts
  ADD COLUMN IF NOT EXISTS group_id UUID REFERENCES public.community_groups(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS media JSONB NOT NULL DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  ADD COLUMN IF NOT EXISTS view_count INTEGER NOT NULL DEFAULT 0 CHECK (view_count >= 0),
  ADD COLUMN IF NOT EXISTS share_count INTEGER NOT NULL DEFAULT 0 CHECK (share_count >= 0);

CREATE INDEX IF NOT EXISTS idx_posts_group ON public.posts(group_id);
CREATE INDEX IF NOT EXISTS idx_posts_type_created ON public.posts(post_type, created_at DESC);

COMMENT ON COLUMN public.posts.media IS 'Array: { type, url, thumbnailUrl?, alt?, durationSec? }';
COMMENT ON COLUMN public.posts.metadata IS 'Event-Zeit, Ort, CTA — typspezifische Zusatzdaten';


-- ========== 018_platform_types_extend.sql ==========
-- Plattform-Typen erweitern (rückwärtskompatibel)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_enum e JOIN pg_type t ON e.enumtypid = t.oid
    WHERE t.typname = 'platform_type' AND e.enumlabel = 'instagram'
  ) THEN
    ALTER TYPE public.platform_type ADD VALUE 'instagram';
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM pg_enum e JOIN pg_type t ON e.enumtypid = t.oid
    WHERE t.typname = 'platform_type' AND e.enumlabel = 'tiktok'
  ) THEN
    ALTER TYPE public.platform_type ADD VALUE 'tiktok';
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM pg_enum e JOIN pg_type t ON e.enumtypid = t.oid
    WHERE t.typname = 'platform_type' AND e.enumlabel = 'youtube'
  ) THEN
    ALTER TYPE public.platform_type ADD VALUE 'youtube';
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM pg_enum e JOIN pg_type t ON e.enumtypid = t.oid
    WHERE t.typname = 'platform_type' AND e.enumlabel = 'website'
  ) THEN
    ALTER TYPE public.platform_type ADD VALUE 'website';
  END IF;
END $$;


-- ========== 019_creator_referral_revenue.sql ==========
-- Creator Referral & Revenue Share (optional, kein MLM)
-- Rückwärtskompatibel — bestehende Tabellen unverändert

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'referral_status') THEN
    CREATE TYPE public.referral_status AS ENUM (
      'pending', 'active', 'conflict', 'revoked'
    );
  END IF;
END $$;

CREATE TABLE IF NOT EXISTS public.creator_referrals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  referred_user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  referrer_user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  status public.referral_status NOT NULL DEFAULT 'pending',
  conflict_note TEXT,
  reviewed_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  reviewed_at TIMESTAMPTZ,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT creator_referrals_no_self CHECK (referred_user_id <> referrer_user_id),
  CONSTRAINT creator_referrals_referred_unique UNIQUE (referred_user_id)
);

CREATE INDEX IF NOT EXISTS idx_creator_referrals_referrer
  ON public.creator_referrals(referrer_user_id, status);

CREATE TABLE IF NOT EXISTS public.revenue_share_ledger (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  community_id UUID REFERENCES public.communities(id) ON DELETE SET NULL,
  creator_user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  referrer_user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  gross_amount_cents INTEGER NOT NULL DEFAULT 0 CHECK (gross_amount_cents >= 0),
  platform_fee_cents INTEGER NOT NULL DEFAULT 0 CHECK (platform_fee_cents >= 0),
  net_platform_cents INTEGER NOT NULL DEFAULT 0 CHECK (net_platform_cents >= 0),
  referrer_share_cents INTEGER NOT NULL DEFAULT 0 CHECK (referrer_share_cents >= 0),
  currency TEXT NOT NULL DEFAULT 'eur',
  ledger_status TEXT NOT NULL DEFAULT 'sandbox'
    CHECK (ledger_status IN ('sandbox', 'pending', 'paid', 'void')),
  stripe_payment_intent_id TEXT,
  stripe_transfer_id TEXT,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_revenue_ledger_creator
  ON public.revenue_share_ledger(creator_user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_revenue_ledger_referrer
  ON public.revenue_share_ledger(referrer_user_id, created_at DESC)
  WHERE referrer_user_id IS NOT NULL;

CREATE TRIGGER creator_referrals_updated_at
  BEFORE UPDATE ON public.creator_referrals
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

ALTER TABLE public.creator_referrals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.revenue_share_ledger ENABLE ROW LEVEL SECURITY;

CREATE POLICY "creator_referrals_select_involved"
  ON public.creator_referrals FOR SELECT
  USING (
    auth.uid() = referred_user_id
    OR auth.uid() = referrer_user_id
  );

CREATE POLICY "creator_referrals_insert_self"
  ON public.creator_referrals FOR INSERT
  WITH CHECK (auth.uid() = referred_user_id);

CREATE POLICY "creator_referrals_update_self"
  ON public.creator_referrals FOR UPDATE
  USING (auth.uid() = referred_user_id)
  WITH CHECK (auth.uid() = referred_user_id);

CREATE POLICY "revenue_ledger_select_involved"
  ON public.revenue_share_ledger FOR SELECT
  USING (
    auth.uid() = creator_user_id
    OR auth.uid() = referrer_user_id
  );

COMMENT ON TABLE public.creator_referrals IS 'Optional: Creator gibt an, wer ihn geworben hat — kein MLM';
COMMENT ON TABLE public.revenue_share_ledger IS 'Netto Revenue Share — Sandbox + später Stripe';


-- ========== 020_performance_indexes.sql ==========
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


-- ========== 021_platform_feature_flags.sql ==========
-- UNZE Phase 1: Feature-Flags — Feed/Posts deaktivieren ohne Löschen
-- Nach 020_performance_indexes.sql

-- =============================================================================
-- Feature-Flag-Tabelle
-- =============================================================================
CREATE TABLE IF NOT EXISTS public.platform_feature_flags (
  key TEXT PRIMARY KEY,
  enabled BOOLEAN NOT NULL DEFAULT TRUE,
  description TEXT,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TRIGGER platform_feature_flags_updated_at
  BEFORE UPDATE ON public.platform_feature_flags
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

INSERT INTO public.platform_feature_flags (key, enabled, description) VALUES
  ('feed_posts', FALSE, 'Feed-Beiträge (posts) — Social-Media-Feed deaktiviert'),
  ('post_comments', FALSE, 'Kommentare an Posts'),
  ('post_likes', FALSE, 'Likes auf Posts')
ON CONFLICT (key) DO UPDATE SET
  enabled = EXCLUDED.enabled,
  description = EXCLUDED.description,
  updated_at = NOW();

-- =============================================================================
-- Hilfsfunktion für RLS
-- =============================================================================
CREATE OR REPLACE FUNCTION public.is_platform_feature_enabled(p_key TEXT)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT COALESCE(
    (SELECT enabled FROM public.platform_feature_flags WHERE key = p_key),
    TRUE
  );
$$;

-- =============================================================================
-- RLS: Schreibzugriff auf Feed-Tabellen nur wenn Flag aktiv
-- =============================================================================
DROP POLICY IF EXISTS "posts_insert_authenticated" ON public.posts;
CREATE POLICY "posts_insert_when_enabled"
  ON public.posts FOR INSERT
  WITH CHECK (
    public.is_platform_feature_enabled('feed_posts')
    AND auth.uid() = author_id
    AND (
      community_id IS NULL
      OR public.is_community_member(community_id)
    )
  );

DROP POLICY IF EXISTS "comments_insert_authenticated" ON public.comments;
CREATE POLICY "comments_insert_when_enabled"
  ON public.comments FOR INSERT
  WITH CHECK (
    public.is_platform_feature_enabled('post_comments')
    AND auth.uid() = author_id
  );

DROP POLICY IF EXISTS "post_likes_insert_own" ON public.post_likes;
CREATE POLICY "post_likes_insert_when_enabled"
  ON public.post_likes FOR INSERT
  WITH CHECK (
    public.is_platform_feature_enabled('post_likes')
    AND auth.uid() = user_id
  );

-- =============================================================================
-- RLS auf Feature-Flags (nur lesen für authenticated)
-- =============================================================================
ALTER TABLE public.platform_feature_flags ENABLE ROW LEVEL SECURITY;

CREATE POLICY "feature_flags_select_authenticated"
  ON public.platform_feature_flags FOR SELECT
  TO authenticated
  USING (TRUE);

CREATE POLICY "feature_flags_select_anon"
  ON public.platform_feature_flags FOR SELECT
  TO anon
  USING (TRUE);

CREATE POLICY "feature_flags_manage_platform_admin"
  ON public.platform_feature_flags FOR ALL
  TO authenticated
  USING (public.is_platform_admin(auth.uid()))
  WITH CHECK (public.is_platform_admin(auth.uid()));


-- ========== 022_platform_core_entities.sql ==========
-- UNZE Phase 1: Events, Gruppen-Typen, Gruppen-Follow, Experte-Rolle, Bewertungen
-- Additiv — keine Tabellen löschen. Nach 021_platform_feature_flags.sql

-- =============================================================================
-- Rolle: Experte / Coach
-- =============================================================================
ALTER TYPE public.community_role ADD VALUE IF NOT EXISTS 'expert';

-- =============================================================================
-- Gruppen-Typ (group | service)
-- =============================================================================
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'community_group_type') THEN
    CREATE TYPE public.community_group_type AS ENUM ('group', 'service');
  END IF;
END $$;

ALTER TABLE public.community_groups
  ADD COLUMN IF NOT EXISTS group_type public.community_group_type NOT NULL DEFAULT 'group',
  ADD COLUMN IF NOT EXISTS cover_url TEXT,
  ADD COLUMN IF NOT EXISTS price_cents INTEGER CHECK (price_cents IS NULL OR price_cents >= 0),
  ADD COLUMN IF NOT EXISTS currency TEXT NOT NULL DEFAULT 'eur',
  ADD COLUMN IF NOT EXISTS rating_avg NUMERIC(3, 2) NOT NULL DEFAULT 0
    CHECK (rating_avg >= 0 AND rating_avg <= 5),
  ADD COLUMN IF NOT EXISTS review_count INTEGER NOT NULL DEFAULT 0
    CHECK (review_count >= 0),
  ADD COLUMN IF NOT EXISTS member_count INTEGER NOT NULL DEFAULT 0
    CHECK (member_count >= 0);

CREATE INDEX IF NOT EXISTS idx_community_groups_type
  ON public.community_groups(group_type, sort_order);

-- =============================================================================
-- Community-Events (eigene Entität — nicht Feed)
-- =============================================================================
CREATE TABLE IF NOT EXISTS public.community_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  community_id UUID NOT NULL REFERENCES public.communities(id) ON DELETE CASCADE,
  group_id UUID REFERENCES public.community_groups(id) ON DELETE SET NULL,
  slug TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  starts_at TIMESTAMPTZ NOT NULL,
  ends_at TIMESTAMPTZ,
  location TEXT,
  external_url TEXT,
  cover_url TEXT,
  is_public BOOLEAN NOT NULL DEFAULT TRUE,
  is_featured BOOLEAN NOT NULL DEFAULT FALSE,
  created_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (community_id, slug),
  CONSTRAINT community_events_slug_format CHECK (slug ~ '^[a-z0-9-]{2,60}$')
);

CREATE INDEX IF NOT EXISTS idx_community_events_starts
  ON public.community_events(starts_at DESC)
  WHERE is_public = TRUE;

CREATE INDEX IF NOT EXISTS idx_community_events_community
  ON public.community_events(community_id, starts_at DESC);

CREATE INDEX IF NOT EXISTS idx_community_events_featured
  ON public.community_events(is_featured, starts_at DESC)
  WHERE is_public = TRUE AND is_featured = TRUE;

CREATE TRIGGER community_events_updated_at
  BEFORE UPDATE ON public.community_events
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- Bestehende Event-Posts nach community_events kopieren (Daten bleiben in posts)
INSERT INTO public.community_events (
  community_id,
  group_id,
  slug,
  title,
  description,
  starts_at,
  ends_at,
  location,
  external_url,
  created_by,
  created_at,
  updated_at
)
SELECT
  p.community_id,
  p.group_id,
  'event-' || LEFT(REPLACE(p.id::TEXT, '-', ''), 12),
  COALESCE(NULLIF(TRIM(p.title), ''), 'Community-Event'),
  COALESCE(NULLIF(TRIM(p.content), ''), ''),
  COALESCE(
    NULLIF(p.metadata->>'startsAt', '')::TIMESTAMPTZ,
    p.created_at
  ),
  NULLIF(p.metadata->>'endsAt', '')::TIMESTAMPTZ,
  NULLIF(p.metadata->>'location', ''),
  NULLIF(p.metadata->>'externalUrl', ''),
  p.author_id,
  p.created_at,
  p.updated_at
FROM public.posts p
WHERE p.post_type = 'event'
  AND p.community_id IS NOT NULL
ON CONFLICT (community_id, slug) DO NOTHING;

-- =============================================================================
-- Gruppen-Follow (follows erweitern)
-- =============================================================================
ALTER TYPE public.follow_target ADD VALUE IF NOT EXISTS 'group';

ALTER TABLE public.follows
  ADD COLUMN IF NOT EXISTS target_group_id UUID
    REFERENCES public.community_groups(id) ON DELETE CASCADE;

ALTER TABLE public.follows DROP CONSTRAINT IF EXISTS follows_single_target;
ALTER TABLE public.follows ADD CONSTRAINT follows_single_target CHECK (
  (
    target_type = 'user'
    AND target_user_id IS NOT NULL
    AND target_community_id IS NULL
    AND target_group_id IS NULL
  )
  OR (
    target_type = 'community'
    AND target_community_id IS NOT NULL
    AND target_user_id IS NULL
    AND target_group_id IS NULL
  )
  OR (
    target_type = 'group'
    AND target_group_id IS NOT NULL
    AND target_user_id IS NULL
    AND target_community_id IS NULL
  )
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_follows_group
  ON public.follows(follower_id, target_group_id)
  WHERE target_type = 'group';

-- =============================================================================
-- Bewertungen & Kommentare zu Bewertungen (Community + Gruppe)
-- =============================================================================
CREATE TABLE IF NOT EXISTS public.community_reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  community_id UUID NOT NULL REFERENCES public.communities(id) ON DELETE CASCADE,
  author_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  rating SMALLINT NOT NULL CHECK (rating >= 1 AND rating <= 5),
  title TEXT,
  body TEXT NOT NULL DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (community_id, author_id)
);

CREATE TABLE IF NOT EXISTS public.group_reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  group_id UUID NOT NULL REFERENCES public.community_groups(id) ON DELETE CASCADE,
  author_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  rating SMALLINT NOT NULL CHECK (rating >= 1 AND rating <= 5),
  title TEXT,
  body TEXT NOT NULL DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (group_id, author_id)
);

CREATE TABLE IF NOT EXISTS public.review_comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  review_id UUID NOT NULL,
  review_target TEXT NOT NULL CHECK (review_target IN ('community', 'group')),
  author_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  body TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT review_comments_target_consistency CHECK (
    (review_target = 'community')
    OR (review_target = 'group')
  )
);

CREATE INDEX IF NOT EXISTS idx_community_reviews_community
  ON public.community_reviews(community_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_group_reviews_group
  ON public.group_reviews(group_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_review_comments_review
  ON public.review_comments(review_id, review_target, created_at);

CREATE TRIGGER community_reviews_updated_at
  BEFORE UPDATE ON public.community_reviews
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER group_reviews_updated_at
  BEFORE UPDATE ON public.group_reviews
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER review_comments_updated_at
  BEFORE UPDATE ON public.review_comments
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- =============================================================================
-- RLS: community_events
-- =============================================================================
ALTER TABLE public.community_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "community_events_select_public"
  ON public.community_events FOR SELECT
  USING (
    is_public = TRUE
    AND public.is_community_visible(community_id)
  );

CREATE POLICY "community_events_select_member"
  ON public.community_events FOR SELECT
  TO authenticated
  USING (public.is_community_member(community_id));

CREATE POLICY "community_events_manage"
  ON public.community_events FOR ALL
  TO authenticated
  USING (public.can_manage_community(community_id))
  WITH CHECK (public.can_manage_community(community_id));

-- =============================================================================
-- RLS: Gruppen-Follow
-- =============================================================================
DROP POLICY IF EXISTS "follows_insert_own" ON public.follows;
CREATE POLICY "follows_insert_own"
  ON public.follows FOR INSERT
  WITH CHECK (follower_id = auth.uid());

-- =============================================================================
-- RLS: Bewertungen
-- =============================================================================
ALTER TABLE public.community_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.group_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.review_comments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "community_reviews_select"
  ON public.community_reviews FOR SELECT
  USING (public.is_community_visible(community_id));

CREATE POLICY "community_reviews_insert_member"
  ON public.community_reviews FOR INSERT
  TO authenticated
  WITH CHECK (
    auth.uid() = author_id
    AND public.is_community_member(community_id)
  );

CREATE POLICY "community_reviews_update_own"
  ON public.community_reviews FOR UPDATE
  TO authenticated
  USING (author_id = auth.uid());

CREATE POLICY "group_reviews_select"
  ON public.group_reviews FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.community_groups g
      WHERE g.id = group_reviews.group_id
        AND public.is_community_visible(g.community_id)
    )
  );

CREATE POLICY "group_reviews_insert_member"
  ON public.group_reviews FOR INSERT
  TO authenticated
  WITH CHECK (
    auth.uid() = author_id
    AND EXISTS (
      SELECT 1 FROM public.community_groups g
      JOIN public.community_members m ON m.community_id = g.community_id
      WHERE g.id = group_reviews.group_id
        AND m.user_id = auth.uid()
    )
  );

CREATE POLICY "group_reviews_update_own"
  ON public.group_reviews FOR UPDATE
  TO authenticated
  USING (author_id = auth.uid());

CREATE POLICY "review_comments_select"
  ON public.review_comments FOR SELECT
  USING (TRUE);

CREATE POLICY "review_comments_insert_authenticated"
  ON public.review_comments FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = author_id);

CREATE POLICY "review_comments_update_own"
  ON public.review_comments FOR UPDATE
  TO authenticated
  USING (author_id = auth.uid());

CREATE POLICY "review_comments_delete_own"
  ON public.review_comments FOR DELETE
  TO authenticated
  USING (author_id = auth.uid());

