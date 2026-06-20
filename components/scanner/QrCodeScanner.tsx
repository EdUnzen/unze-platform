"use client";

import { cn } from "@/lib/utils/cn";
import { Html5Qrcode } from "html5-qrcode";
import { Camera, CameraOff } from "lucide-react";
import { useEffect, useId, useRef, useState } from "react";

interface QrCodeScannerProps {
  onScan: (value: string) => void;
  onError?: (message: string) => void;
  className?: string;
  paused?: boolean;
}

export function QrCodeScanner({
  onScan,
  onError,
  className,
  paused = false,
}: QrCodeScannerProps) {
  const regionId = useId().replace(/:/g, "");
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const lastScanRef = useRef("");
  const [cameraOn, setCameraOn] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);

  useEffect(() => {
    if (paused || !cameraOn) return;

    let active = true;
    const scanner = new Html5Qrcode(regionId);
    scannerRef.current = scanner;

    scanner
      .start(
        { facingMode: "environment" },
        { fps: 10, qrbox: { width: 220, height: 220 }, aspectRatio: 1 },
        (decoded) => {
          if (!active || paused) return;
          if (decoded === lastScanRef.current) return;
          lastScanRef.current = decoded;
          onScan(decoded);
          setTimeout(() => {
            lastScanRef.current = "";
          }, 2500);
        },
        () => {},
      )
      .catch((err: unknown) => {
        const message =
          err instanceof Error
            ? err.message
            : "Kamera konnte nicht gestartet werden";
        setCameraError(message);
        onError?.(message);
        setCameraOn(false);
      });

    return () => {
      active = false;
      void scanner
        .stop()
        .then(() => scanner.clear())
        .catch(() => {});
      scannerRef.current = null;
    };
  }, [cameraOn, paused, regionId, onScan, onError]);

  return (
    <div className={cn("overflow-hidden rounded-2xl border border-unze-border bg-unze-ink", className)}>
      <div
        id={regionId}
        className={cn("min-h-[240px] w-full [&_video]:object-cover", !cameraOn && "hidden")}
      />

      {!cameraOn && (
        <div className="flex min-h-[240px] flex-col items-center justify-center gap-3 bg-unze-surface-muted px-4 py-8 text-center">
          {cameraError ? (
            <CameraOff className="h-10 w-10 text-unze-ink-muted" aria-hidden />
          ) : (
            <Camera className="h-10 w-10 text-unze-green" aria-hidden />
          )}
          <p className="max-w-xs text-sm text-unze-ink-secondary">
            {cameraError ??
              "Kamera starten, um QR- oder Matrix-Codes zu scannen. Alternativ Code unten eingeben."}
          </p>
          {!cameraError && (
            <button
              type="button"
              onClick={() => {
                setCameraError(null);
                setCameraOn(true);
              }}
              className="rounded-xl bg-unze-green px-5 py-2.5 text-sm font-semibold text-white active:scale-[0.98]"
            >
              Kamera starten
            </button>
          )}
        </div>
      )}

      {cameraOn && (
        <div className="border-t border-white/10 bg-unze-ink px-3 py-2 text-center">
          <button
            type="button"
            onClick={() => setCameraOn(false)}
            className="text-xs font-medium text-white/80"
          >
            Kamera stoppen
          </button>
        </div>
      )}
    </div>
  );
}
