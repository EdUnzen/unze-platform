import { createClient } from "@/lib/supabase/server";

export async function insertNotificationInDb(input: {
  userId: string;
  title: string;
  body?: string;
  type?: string;
  data?: Record<string, unknown>;
}): Promise<{ error: string | null }> {
  const supabase = await createClient();
  if (!supabase) return { error: "Supabase nicht konfiguriert" };

  const { error } = await supabase.from("notifications").insert({
    user_id: input.userId,
    type: input.type ?? "system",
    title: input.title,
    body: input.body ?? null,
    data: input.data ?? {},
  });

  if (error) return { error: error.message };
  return { error: null };
}
