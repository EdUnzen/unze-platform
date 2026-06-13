"use client";

import QRCode from "qrcode";
import { useEffect, useState } from "react";

interface EventTicketQrProps {
  ticketCode: string;
  size?: number;
}

export function EventTicketQr({ ticketCode, size = 160 }: EventTicketQrProps) {
  const [dataUrl, setDataUrl] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    QRCode.toDataURL(ticketCode, {
      width: size,
      margin: 1,
      color: { dark: "#0f172a", light: "#ffffff" },
    })
      .then((url) => {
        if (active) setDataUrl(url);
      })
      .catch(() => {
        if (active) setDataUrl(null);
      });
    return () => {
      active = false;
    };
  }, [ticketCode, size]);

  if (!dataUrl) {
    return (
      <div
        className="flex items-center justify-center rounded-xl bg-unze-surface-muted text-xs text-unze-ink-muted"
        style={{ width: size, height: size }}
      >
        QR…
      </div>
    );
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={dataUrl}
      alt={`QR-Code für Ticket ${ticketCode}`}
      width={size}
      height={size}
      className="rounded-xl border border-unze-border bg-white p-2"
    />
  );
}
