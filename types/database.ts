/**
 * Supabase-Datenbanktypen — bei Schema-Änderung synchron halten
 */

export type PlatformType =
  | "discord"
  | "whatsapp"
  | "telegram"
  | "facebook"
  | "instagram"
  | "tiktok"
  | "youtube"
  | "website"
  | "unze"
  | "other";

export type CommunityVisibility = "public" | "private" | "premium" | "hidden";
export type CommunityRole =
  | "creator"
  | "admin"
  | "moderator"
  | "expert"
  | "member"
  | "verified_member";

export type CommunityGroupType = "group" | "service";

export type FollowTarget = "user" | "community" | "group";

export type CommunityAccessStatus =
  | "open"
  | "closed"
  | "paused"
  | "invite_only"
  | "member_limit_reached"
  | "archived";

export type JoinApprovalMode =
  | "auto_accept"
  | "manual_review"
  | "auto_reject"
  | "waitlist"
  | "invite_required"
  | "paid_unlock";

export type JoinQuestionType =
  | "text"
  | "checkbox"
  | "rules_consent"
  | "age_verification"
  | "file_upload"
  | "image_upload"
  | "age_proof"
  | "identity_proof";

export type PlatformIdentityType =
  | "discord"
  | "whatsapp"
  | "telegram"
  | "facebook"
  | "psn"
  | "epic"
  | "phone"
  | "linkedin"
  | "instagram"
  | "x"
  | "tiktok"
  | "other";

export type JoinApplicationStatus =
  | "pending"
  | "accepted"
  | "rejected"
  | "waitlisted"
  | "withdrawn";
export type PostType =
  | "text"
  | "image"
  | "gallery"
  | "video"
  | "clip"
  | "poll"
  | "event"
  | "community_update"
  | "highlight"
  | "question"
  | "request";
export type PostVisibility = "public" | "followers" | "community" | "private";
export type SubscriptionStatus =
  | "inactive"
  | "trialing"
  | "active"
  | "past_due"
  | "canceled"
  | "unpaid";
export type BadgeType = "permanent" | "temporary" | "event";
export type PlatformRole = "user" | "creator" | "platform_admin";

export interface ProfileRow {
  id: string;
  username: string | null;
  display_name: string | null;
  avatar_url: string | null;
  bio: string | null;
  reputation_score: number;
  is_creator: boolean;
  is_verified: boolean;
  platform_role: PlatformRole;
  settings: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

export interface CommunityRow {
  id: string;
  slug: string;
  title: string;
  description: string;
  banner_gradient: string;
  banner_url: string | null;
  platform_type: PlatformType;
  external_url: string | null;
  category: string;
  tags: string[];
  visibility: CommunityVisibility;
  creator_id: string;
  is_verified: boolean;
  is_trending: boolean;
  member_count: number;
  rating_avg: number;
  review_count: number;
  monetization_enabled: boolean;
  stripe_product_id: string | null;
  stripe_default_price_id: string | null;
  discover_enabled?: boolean;
  access_status: CommunityAccessStatus;
  admissions_paused: boolean;
  member_limit: number | null;
  join_approval_mode: JoinApprovalMode;
  community_rules: string | null;
  require_rules_consent: boolean;
  require_age_verification: boolean;
  min_age: number | null;
  required_platform_ids: PlatformIdentityType[];
  created_at: string;
  updated_at: string;
}

export interface CommunityWithCreator extends CommunityRow {
  creator?: Pick<
    ProfileRow,
    "id" | "display_name" | "username" | "avatar_url" | "is_verified"
  > | null;
}

export interface PostRow {
  id: string;
  author_id: string;
  community_id: string | null;
  group_id?: string | null;
  post_type: PostType;
  title: string | null;
  content: string;
  visibility: PostVisibility;
  is_pinned: boolean;
  like_count: number;
  comment_count: number;
  media?: import("@/types/post").PostMediaItem[] | null;
  metadata?: import("@/types/post").PostMetadata | null;
  view_count?: number;
  share_count?: number;
  created_at: string;
  updated_at: string;
}

export interface FollowRow {
  id: string;
  follower_id: string;
  target_type: FollowTarget;
  target_user_id: string | null;
  target_community_id: string | null;
  created_at: string;
}

export interface SubscriptionRow {
  id: string;
  user_id: string;
  community_id: string;
  status: SubscriptionStatus;
  stripe_customer_id: string | null;
  stripe_subscription_id: string | null;
  stripe_price_id: string | null;
  plan_interval: string | null;
  amount_cents: number | null;
  currency: string | null;
  current_period_start: string | null;
  current_period_end: string | null;
  canceled_at: string | null;
  created_at: string;
  updated_at: string;
}

type Tables = {
  profiles: {
    Row: ProfileRow;
    Insert: {
      id: string;
      username?: string | null;
      display_name?: string | null;
      avatar_url?: string | null;
      bio?: string | null;
      is_creator?: boolean;
      platform_role?: PlatformRole;
      settings?: Record<string, unknown>;
    };
    Update: Partial<Omit<ProfileRow, "id" | "created_at">>;
    Relationships: [];
  };
  communities: {
    Row: CommunityRow;
    Insert: {
      slug: string;
      title: string;
      creator_id: string;
      description?: string;
      banner_gradient?: string;
      platform_type?: PlatformType;
      category?: string;
      tags?: string[];
      visibility?: CommunityVisibility;
      is_verified?: boolean;
      is_trending?: boolean;
    };
    Update: Partial<Omit<CommunityRow, "id" | "created_at">>;
    Relationships: [];
  };
  community_members: {
    Row: {
      id: string;
      community_id: string;
      user_id: string;
      role: CommunityRole;
      joined_at: string;
    };
    Insert: {
      community_id: string;
      user_id: string;
      role?: CommunityRole;
    };
    Update: { role?: CommunityRole };
    Relationships: [];
  };
  follows: {
    Row: FollowRow;
    Insert: {
      follower_id: string;
      target_type: FollowTarget;
      target_user_id?: string | null;
      target_community_id?: string | null;
    };
    Update: never;
    Relationships: [];
  };
  posts: {
    Row: PostRow;
    Insert: {
      author_id: string;
      content: string;
      community_id?: string | null;
      post_type?: PostType;
      title?: string | null;
      visibility?: PostVisibility;
      is_pinned?: boolean;
    };
    Update: Partial<Omit<PostRow, "id" | "created_at">>;
    Relationships: [];
  };
  comments: {
    Row: {
      id: string;
      post_id: string;
      author_id: string;
      parent_id: string | null;
      content: string;
      created_at: string;
      updated_at: string;
    };
    Insert: {
      post_id: string;
      author_id: string;
      content: string;
      parent_id?: string | null;
    };
    Update: { content?: string };
    Relationships: [];
  };
  subscriptions: {
    Row: SubscriptionRow;
    Insert: {
      user_id: string;
      community_id: string;
      status?: SubscriptionStatus;
      stripe_customer_id?: string | null;
      stripe_subscription_id?: string | null;
    };
    Update: Partial<Omit<SubscriptionRow, "id" | "created_at">>;
    Relationships: [];
  };
  notifications: {
    Row: {
      id: string;
      user_id: string;
      type: string;
      title: string;
      body: string | null;
      data: Record<string, unknown>;
      read_at: string | null;
      created_at: string;
    };
    Insert: {
      user_id: string;
      title: string;
      type?: string;
      body?: string | null;
      data?: Record<string, unknown>;
    };
    Update: { read_at?: string | null };
    Relationships: [];
  };
  push_subscriptions: {
    Row: {
      id: string;
      user_id: string;
      endpoint: string;
      p256dh: string;
      auth: string;
      user_agent: string | null;
      created_at: string;
    };
    Insert: {
      user_id: string;
      endpoint: string;
      p256dh: string;
      auth: string;
      user_agent?: string | null;
    };
    Update: never;
    Relationships: [];
  };
  creator_profiles: {
    Row: {
      user_id: string;
      headline: string | null;
      platform_links: unknown[];
      stripe_connect_account_id: string | null;
      stripe_connect_onboarding_complete: boolean;
      total_communities: number;
      created_at: string;
      updated_at: string;
    };
    Insert: {
      user_id: string;
      headline?: string | null;
      platform_links?: unknown[];
    };
    Update: Partial<{
      headline: string | null;
      platform_links: unknown[];
      stripe_connect_account_id: string | null;
    }>;
    Relationships: [];
  };
};

export type Database = {
  public: {
    Tables: Tables;
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      [_ in never]: never;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
};
