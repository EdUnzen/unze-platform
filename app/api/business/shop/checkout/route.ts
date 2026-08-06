import { createShopCheckout, ShopCheckoutError } from "@/lib/business/shop-checkout.service";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as {
      productSlug?: string;
      customerName?: string;
      customerEmail?: string;
      company?: string;
      message?: string;
      source?: string;
      honeypot?: string;
    };

    if (body.honeypot) {
      return NextResponse.json({ error: "Invalid submission" }, { status: 400 });
    }

    if (!body.productSlug?.trim()) {
      return NextResponse.json({ error: "Produkt fehlt" }, { status: 400 });
    }

    const result = await createShopCheckout({
      productSlug: body.productSlug.trim(),
      customerName: body.customerName?.trim() ?? "",
      customerEmail: body.customerEmail?.trim() ?? "",
      company: body.company?.trim() || null,
      message: body.message?.trim() || null,
      source: body.source?.trim() || null,
    });

    if (result.error || !result.url) {
      return NextResponse.json(
        { error: result.error ?? "Checkout fehlgeschlagen" },
        { status: 400 },
      );
    }

    return NextResponse.json({
      checkoutUrl: result.url,
      referenceId: result.orderReferenceId,
    });
  } catch (e) {
    const message =
      e instanceof ShopCheckoutError ? e.message : "Checkout fehlgeschlagen";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
