import { NextResponse } from "next/server";

export const PUBLIC_REVALIDATE_SECONDS = 60;

export function publicJsonResponse<T>(data: T, status = 200) {
  return NextResponse.json(data, {
    status,
    headers: {
      "Cache-Control": `public, s-maxage=${PUBLIC_REVALIDATE_SECONDS}, stale-while-revalidate=120`,
    },
  });
}
