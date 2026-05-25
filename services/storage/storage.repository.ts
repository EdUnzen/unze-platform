import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import {
  BUCKET_DEFINITIONS,
  PROOF_SIGNED_URL_TTL,
  STORAGE_BUCKETS,
  type StorageBucketId,
} from "@/lib/storage/buckets";

export async function uploadObjectInDb(input: {
  bucket: StorageBucketId;
  path: string;
  body: Buffer | ArrayBuffer;
  contentType: string;
  upsert?: boolean;
}): Promise<{ error: string | null; path?: string }> {
  const supabase = await createClient();
  if (!supabase) return { error: "Supabase nicht konfiguriert" };

  const def = BUCKET_DEFINITIONS[input.bucket];
  const data =
    input.body instanceof Buffer
      ? input.body
      : Buffer.from(new Uint8Array(input.body));

  if (data.byteLength > def.maxBytes) {
    return { error: `Datei überschreitet Bucket-Limit (${def.maxBytes} Bytes)` };
  }

  const { error } = await supabase.storage
    .from(input.bucket)
    .upload(input.path, data, {
      contentType: input.contentType,
      upsert: input.upsert ?? false,
      cacheControl: input.bucket === STORAGE_BUCKETS.PUBLIC_MEDIA ? "3600" : "private",
    });

  if (error) return { error: error.message };
  return { error: null, path: input.path };
}

export async function createSignedUrlInDb(input: {
  bucket: StorageBucketId;
  path: string;
  expiresIn?: number;
}): Promise<{ error: string | null; signedUrl?: string }> {
  const supabase = await createClient();
  if (!supabase) return { error: "Supabase nicht konfiguriert" };

  const { data, error } = await supabase.storage
    .from(input.bucket)
    .createSignedUrl(input.path, input.expiresIn ?? PROOF_SIGNED_URL_TTL);

  if (error) return { error: error.message };
  return { error: null, signedUrl: data.signedUrl };
}

/** Fallback mit Service Role wenn Session-RLS fehlschlägt */
export async function createSignedUrlAdmin(input: {
  bucket: StorageBucketId;
  path: string;
  expiresIn?: number;
}): Promise<{ error: string | null; signedUrl?: string }> {
  const admin = createAdminClient();
  if (!admin) {
    return createSignedUrlInDb(input);
  }

  const { data, error } = await admin.storage
    .from(input.bucket)
    .createSignedUrl(input.path, input.expiresIn ?? PROOF_SIGNED_URL_TTL);

  if (error) return { error: error.message };
  return { error: null, signedUrl: data.signedUrl };
}

export async function deleteObjectInDb(input: {
  bucket: StorageBucketId;
  paths: string[];
}): Promise<{ error: string | null }> {
  const supabase = await createClient();
  if (!supabase) return { error: "Supabase nicht konfiguriert" };

  const { error } = await supabase.storage.from(input.bucket).remove(input.paths);
  if (error) return { error: error.message };
  return { error: null };
}

export async function registerStorageAssetInDb(input: {
  bucketId: string;
  storagePath: string;
  ownerId: string;
  communityId?: string | null;
  assetCategory: string;
  visibility?: string;
  mimeType?: string;
  fileSizeBytes?: number;
  originalName?: string;
  checksum?: string;
  metadata?: Record<string, unknown>;
}): Promise<{ error: string | null; id?: string }> {
  const supabase = await createClient();
  if (!supabase) return { error: "Supabase nicht konfiguriert" };

  const { data, error } = await supabase
    .from("storage_assets")
    .insert({
      bucket_id: input.bucketId,
      storage_path: input.storagePath,
      owner_id: input.ownerId,
      community_id: input.communityId ?? null,
      asset_category: input.assetCategory,
      visibility: input.visibility ?? "private",
      mime_type: input.mimeType ?? null,
      file_size_bytes: input.fileSizeBytes ?? null,
      original_name: input.originalName ?? null,
      checksum: input.checksum ?? null,
      metadata: input.metadata ?? {},
    })
    .select("id")
    .single();

  if (error) return { error: error.message };
  return { error: null, id: data.id as string };
}
