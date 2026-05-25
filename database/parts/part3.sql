-- UNZE Migration Part 3/3
-- Nacheinander part1 → part2 → part3 ausführen

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

