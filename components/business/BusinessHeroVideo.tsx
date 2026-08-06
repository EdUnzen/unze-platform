"use client";

import { useEffect, useRef, useState } from "react";
import { BUSINESS_VIDEO_SRC } from "@/lib/constants/business-site";
import { BUSINESS_IMAGERY } from "@/lib/constants/business-imagery";

type Mode = "side" | "cinematic";

export function BusinessHeroVideo({ mode = "side" }: { mode?: Mode }) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [ready, setReady] = useState(false);

  const markReady = () => setReady(true);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    video.muted = true;
    video.play().catch(() => undefined);

    if (video.readyState >= 2) {
      setReady(true);
    }
  }, []);

  if (mode === "cinematic") {
    return (
      <div className="absolute inset-0 overflow-hidden">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={BUSINESS_IMAGERY.hero.poster}
          alt=""
          className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-700 ${
            ready ? "opacity-0" : "opacity-100"
          }`}
          aria-hidden
        />
        <video
          ref={videoRef}
          className="absolute inset-0 z-[1] h-full w-full object-cover"
          autoPlay
          muted
          loop
          playsInline
          preload="auto"
          onLoadedData={markReady}
          onCanPlay={markReady}
          onPlaying={markReady}
          aria-hidden
        >
          <source src={BUSINESS_VIDEO_SRC} type="video/mp4" />
        </video>
        {!ready ? (
          <div className="absolute inset-0 z-[2] animate-pulse bg-gray-900/40" aria-hidden />
        ) : null}
      </div>
    );
  }

  return (
    <div className="group relative overflow-hidden rounded-2xl border border-white/10 bg-black/40 shadow-2xl shadow-black/40 ring-1 ring-white/10">
      <div className="absolute inset-0 bg-gradient-to-tr from-[#00C853]/10 via-transparent to-indigo-500/10 opacity-80" />
      {!ready ? (
        <div className="absolute inset-0 animate-pulse bg-gradient-to-br from-gray-800 to-gray-900" aria-hidden />
      ) : null}
      <video
        ref={videoRef}
        className="relative aspect-[16/10] w-full object-cover transition duration-700 motion-safe:group-hover:scale-[1.02]"
        autoPlay
        muted
        loop
        playsInline
        preload="auto"
        onLoadedData={markReady}
        onCanPlay={markReady}
        onPlaying={markReady}
        aria-label="UNZE Business Präsentation"
      >
        <source src={BUSINESS_VIDEO_SRC} type="video/mp4" />
      </video>
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-black/50 to-transparent" />
    </div>
  );
}
