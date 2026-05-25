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
