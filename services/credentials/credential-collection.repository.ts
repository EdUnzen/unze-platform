import { createClient } from "@/lib/supabase/server";
import type { CredentialCollectionView } from "@/types/requirement-dashboard";

export async function fetchCredentialCollectionsForCommunity(
  communityId: string,
): Promise<CredentialCollectionView[]> {
  const supabase = await createClient();
  if (!supabase) return [];

  const { data: collections, error } = await supabase
    .from("credential_collections")
    .select("id, community_id, name, description")
    .eq("community_id", communityId)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("[credential-collection.repository] fetch:", error.message);
    return [];
  }

  if (!collections?.length) return [];

  const ids = collections.map((c) => c.id as string);
  const { data: items, error: itemsError } = await supabase
    .from("credential_collection_items")
    .select("collection_id, credential_id, sort_order")
    .in("collection_id", ids)
    .order("sort_order", { ascending: true });

  if (itemsError) {
    console.error("[credential-collection.repository] items:", itemsError.message);
  }

  const itemsByCollection = new Map<string, string[]>();
  for (const row of items ?? []) {
    const collectionId = row.collection_id as string;
    if (!itemsByCollection.has(collectionId)) itemsByCollection.set(collectionId, []);
    itemsByCollection.get(collectionId)!.push(row.credential_id as string);
  }

  return collections.map((row) => ({
    id: row.id as string,
    communityId: row.community_id as string,
    name: row.name as string,
    description: (row.description as string) ?? null,
    credentialIds: itemsByCollection.get(row.id as string) ?? [],
  }));
}

export async function saveCredentialCollectionInDb(input: {
  communityId: string;
  name: string;
  description?: string | null;
  credentialIds: string[];
  collectionId?: string;
}): Promise<{ error: string | null; id?: string }> {
  const supabase = await createClient();
  if (!supabase) return { error: "Supabase nicht konfiguriert" };

  let collectionId = input.collectionId;

  if (collectionId) {
    const { error } = await supabase
      .from("credential_collections")
      .update({
        name: input.name,
        description: input.description ?? null,
      })
      .eq("id", collectionId);

    if (error) return { error: error.message };

    await supabase
      .from("credential_collection_items")
      .delete()
      .eq("collection_id", collectionId);
  } else {
    const { data, error } = await supabase
      .from("credential_collections")
      .insert({
        community_id: input.communityId,
        name: input.name,
        description: input.description ?? null,
      })
      .select("id")
      .single();

    if (error || !data) {
      return { error: error?.message ?? "Sammlung konnte nicht erstellt werden" };
    }
    collectionId = data.id as string;
  }

  const uniqueIds = [...new Set(input.credentialIds.filter(Boolean))];
  if (uniqueIds.length > 0) {
    const rows = uniqueIds.map((credentialId, index) => ({
      collection_id: collectionId,
      credential_id: credentialId,
      sort_order: index,
    }));

    const { error: itemError } = await supabase
      .from("credential_collection_items")
      .insert(rows);

    if (itemError) return { error: itemError.message };
  }

  return { error: null, id: collectionId };
}

export async function deleteCredentialCollectionInDb(
  collectionId: string,
): Promise<{ error: string | null }> {
  const supabase = await createClient();
  if (!supabase) return { error: "Supabase nicht konfiguriert" };

  const { error } = await supabase
    .from("credential_collections")
    .delete()
    .eq("id", collectionId);

  if (error) return { error: error.message };
  return { error: null };
}
