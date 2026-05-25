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
