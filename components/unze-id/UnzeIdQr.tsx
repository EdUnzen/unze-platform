"use client";

import QRCode from "qrcode";
import { useEffect, useState } from "react";

interface UnzeIdQrProps {
  payload: string;
  size?: number;
}

export function UnzeIdQr({ payload, size = 180 }: UnzeIdQrProps) {
  const [dataUrl, setDataUrl] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    QRCode.toDataURL(payload, {
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
  }, [payload, size]);

  if (!dataUrl) {
    return (
      <div
        className="flex items-center justify-center rounded-xl bg-unze-surface-muted text-xs text-unze-ink-muted"
        style={{ width: size, height: size }}
      >
        QR 
      </div>
    );
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={dataUrl}
      alt="UNZE-ID QR-Code"
      width={size}
      height={size}
      className="rounded-xl border border-unze-border bg-white p-2"
    />
  );
}
