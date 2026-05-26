"use client";

import { recordShareAction } from "@/app/share/actions";
import { cn } from "@/lib/utils/cn";
import type { ShareTarget } from "@/types/engagement";
import { Check, Copy, Link2, MessageCircle, Send, Share2 } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";

interface ShareMenuProps {
  target: ShareTarget;
  className?: string;
  label?: string;
  variant?: "icon" | "inline";
}

export function ShareMenu({
  target,
  className,
  label = "Teilen",
  variant = "icon",
}: ShareMenuProps) {
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    function onPointerDown(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("pointerdown", onPointerDown);
    return () => document.removeEventListener("pointerdown", onPointerDown);
  }, [open]);

  const trackShare = useCallback(
    (channel: string) => {
      void recordShareAction({
        type: target.type,
        communityId: target.communityId,
        groupId: target.groupId,
        postId: target.postId,
        channel,
      });
    },
    [target],
  );

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(target.url);
      setCopied(true);
      trackShare("copy");
      setTimeout(() => setCopied(false), 2000);
    } catch {
      /* ignore */
    }
  }

  async function nativeShare() {
    if (typeof navigator !== "undefined" && navigator.share) {
      try {
        await navigator.share({
          title: target.title,
          text: `Schau dir „${target.title}“ auf UNZE an`,
          url: target.url,
        });
        trackShare("native");
        setOpen(false);
      } catch {
        /* user cancelled */
      }
    }
  }

  function openExternal(url: string, channel: string) {
    window.open(url, "_blank", "noopener,noreferrer");
    trackShare(channel);
    setOpen(false);
  }

  const encodedUrl = encodeURIComponent(target.url);
  const encodedText = encodeURIComponent(`Schau dir „${target.title}“ auf UNZE an`);

  return (
    <div ref={ref} className={cn("relative", className)}>
      <button
        type="button"
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          setOpen((v) => !v);
        }}
        className={cn(
          variant === "inline"
            ? "inline-flex items-center gap-1 rounded-full bg-unze-surface-muted px-2.5 py-1 text-xs font-medium text-unze-ink-secondary"
            : cn(
                "flex h-8 w-8 items-center justify-center rounded-full",
                "bg-white/90 text-unze-ink shadow-sm backdrop-blur-md",
                "transition active:scale-95 hover:bg-white",
              ),
          className,
        )}
        aria-label={label}
        aria-expanded={open}
      >
        <Share2 className={cn(variant === "inline" ? "h-3.5 w-3.5" : "h-4 w-4")} aria-hidden />
        {variant === "inline" && "Teilen"}
      </button>

      {open && (
        <div
          className="absolute right-0 top-full z-30 mt-1.5 min-w-[200px] overflow-hidden rounded-2xl border border-unze-border bg-white py-1 shadow-lg"
          onClick={(e) => e.stopPropagation()}
          role="menu"
        >
          <button
            type="button"
            role="menuitem"
            onClick={() => void copyLink()}
            className="flex w-full items-center gap-2.5 px-3 py-2.5 text-left text-sm text-unze-ink hover:bg-unze-surface-muted"
          >
            {copied ? (
              <Check className="h-4 w-4 text-unze-green" aria-hidden />
            ) : (
              <Copy className="h-4 w-4 text-unze-ink-secondary" aria-hidden />
            )}
            {copied ? "Link kopiert" : "Link kopieren"}
          </button>

          {typeof navigator !== "undefined" && "share" in navigator && (
            <button
              type="button"
              role="menuitem"
              onClick={() => void nativeShare()}
              className="flex w-full items-center gap-2.5 px-3 py-2.5 text-left text-sm text-unze-ink hover:bg-unze-surface-muted"
            >
              <Send className="h-4 w-4 text-unze-ink-secondary" aria-hidden />
              Teilen…
            </button>
          )}

          <div className="my-1 border-t border-unze-border/80" />

          <button
            type="button"
            role="menuitem"
            onClick={() =>
              openExternal(
                `https://wa.me/?text=${encodedText}%20${encodedUrl}`,
                "whatsapp",
              )
            }
            className="flex w-full items-center gap-2.5 px-3 py-2.5 text-left text-sm text-unze-ink hover:bg-unze-surface-muted"
          >
            <MessageCircle className="h-4 w-4 text-emerald-600" aria-hidden />
            WhatsApp
          </button>

          <button
            type="button"
            role="menuitem"
            onClick={() =>
              openExternal(
                `https://t.me/share/url?url=${encodedUrl}&text=${encodedText}`,
                "telegram",
              )
            }
            className="flex w-full items-center gap-2.5 px-3 py-2.5 text-left text-sm text-unze-ink hover:bg-unze-surface-muted"
          >
            <Send className="h-4 w-4 text-sky-500" aria-hidden />
            Telegram
          </button>

          <button
            type="button"
            role="menuitem"
            onClick={() =>
              openExternal(
                `https://twitter.com/intent/tweet?text=${encodedText}&url=${encodedUrl}`,
                "twitter",
              )
            }
            className="flex w-full items-center gap-2.5 px-3 py-2.5 text-left text-sm text-unze-ink hover:bg-unze-surface-muted"
          >
            <Link2 className="h-4 w-4 text-unze-ink-secondary" aria-hidden />
            X / Twitter
          </button>
        </div>
      )}
    </div>
  );
}
