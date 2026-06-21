import {
  deleteCredentialCollectionInDb,
  fetchCredentialCollectionsForCommunity,
  saveCredentialCollectionInDb,
} from "./credential-collection.repository";

export async function getCredentialCollections(communityId: string) {
  return fetchCredentialCollectionsForCommunity(communityId);
}

export async function saveCredentialCollection(input: {
  communityId: string;
  name: string;
  description?: string | null;
  credentialIds: string[];
  collectionId?: string;
}) {
  return saveCredentialCollectionInDb(input);
}

export async function deleteCredentialCollection(collectionId: string) {
  return deleteCredentialCollectionInDb(collectionId);
}
