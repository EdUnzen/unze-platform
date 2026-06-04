/** Führt Promise aus; bei Fehler Fallback + Log (kein Page-Crash). */
export async function settle<T>(
  label: string,
  promise: Promise<T>,
  fallback: T,
): Promise<T> {
  try {
    return await promise;
  } catch (error) {
    console.error(`[settle:${label}]`, error);
    return fallback;
  }
}
