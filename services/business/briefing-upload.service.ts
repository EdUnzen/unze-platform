import { createAdminClient } from "@/lib/supabase/admin";
import { STORAGE_BUCKETS } from "@/lib/storage/buckets";
import { uploadBuffer } from "@/services/storage/storage.service";

const MAX_FILE_BYTES = 10 * 1024 * 1024;
const MAX_FILES = 8;

export async function uploadBriefingFiles(input: {
  referenceId: string;
  files: File[];
}): Promise<{ uploaded: string[]; errors: string[] }> {
  const admin = createAdminClient();
  if (!admin) {
    return { uploaded: [], errors: ["Storage nicht konfiguriert — Material per E-Mail nachreichen."] };
  }

  const uploaded: string[] = [];
  const errors: string[] = [];

  for (const file of input.files.slice(0, MAX_FILES)) {
    if (file.size > MAX_FILE_BYTES) {
      errors.push(`${file.name}: zu groß (max. 10 MB)`);
      continue;
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const path = `business-inquiries/${input.referenceId}/${Date.now()}-${file.name.replace(/[^\w.\-]+/g, "_")}`;

    const result = await uploadBuffer({
      bucket: STORAGE_BUCKETS.PRIVATE_MEDIA,
      path,
      buffer,
      contentType: file.type || "application/octet-stream",
    });

    if (result.error) {
      errors.push(`${file.name}: ${result.error}`);
    } else {
      uploaded.push(path);
    }
  }

  return { uploaded, errors };
}
