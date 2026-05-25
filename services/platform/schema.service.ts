import { createClient } from "@/lib/supabase/server";

/** Prüft ob das UNZE-Schema in Supabase existiert (Migrationen ausgeführt). */
export async function isPlatformSchemaReady(): Promise<boolean> {
  const supabase = await createClient();
  if (!supabase) return false;

  const { error } = await supabase.from("communities").select("id").limit(1);
  if (!error) return true;
  if (error.code === "PGRST205") return false;

  const msg = error.message.toLowerCase();
  return !(
    msg.includes("does not exist") ||
    msg.includes("could not find")
  );
}
