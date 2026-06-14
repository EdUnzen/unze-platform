"use client";

import { recordShareAction } from "@/app/share/actions";
import { PlatformIcon } from "@/components/platform/PlatformIcon";
import { cn } from "@/lib/utils/cn";
import type { ShareTarget } from "@/types/engagement";
import { Check, Copy, Send, Share2, X } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";

interface ShareMenuProps {
  target: ShareTarget;
  className?: string;
  label?: string;
  variant?: "icon" | "inline";
}

async function writeToClipboard(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    try {
      const textarea = document.createElement("textarea");
      textarea.value = text;
      textarea.style.position = "fixed";
      textarea.style.opacity = "0";
      document.body.appendChild(textarea);
      textarea.select();
      const ok = document.execCommand("copy");
      document.body.removeChild(textarea);
      return ok;
    } catch {
      return false;
    }
  }
}

function useIsMobile(): boolean {
  const [mobile, setMobile] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(max-width: 640px)");
    setMobile(mq.matches);
    const handler = (e: MediaQueryListEvent) => setMobile(e.matches);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);
  return mobile;
}

export function ShareMenu({
  target,
  className,
  label = "Teilen",
  variant = "icon",
}: ShareMenuProps) {
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [discordCopied, setDiscordCopied] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const isMobile = useIsMobile();

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

  useEffect(() => {
    if (!open) return;
    document.body.style.overflow = isMobile ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open, isMobile]);

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

  const shareText = `Schau dir „${target.title}" auf UNZE an`;

  async function copyLink() {
    const ok = await writeToClipboard(target.url);
    if (!ok) return;
    setCopied(true);
    trackShare("copy");
    setTimeout(() => setCopied(false), 2000);
  }

  async function copyForDiscord() {
    const text = `${shareText}\n${target.url}`;
    const ok = await writeToClipboard(text);
    if (!ok) return;
    setDiscordCopied(true);
    trackShare("discord");
    setTimeout(() => setDiscordCopied(false), 2000);
    setOpen(false);
  }

  async function nativeShare() {
    if (typeof navigator !== "undefined" && navigator.share) {
      try {
        await navigator.share({
          title: target.title,
          text: shareText,
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
  const encodedText = encodeURIComponent(shareText);
  const whatsAppText = encodeURIComponent(`${shareText} ${target.url}`);

  const menuItemClass =
    "flex min-h-[52px] w-full items-center gap-3 px-4 py-3.5 text-left text-sm font-semibold text-unze-ink hover:bg-unze-surface-muted active:bg-unze-green-muted/30";

  const menuItems = (
    <>
      <button
        type="button"
        role="menuitem"
        onClick={() => void copyLink()}
        className={menuItemClass}
      >
        {copied ? (
          <Check className="h-5 w-5 text-unze-green" aria-hidden />
        ) : (
          <Copy className="h-5 w-5 text-unze-ink-secondary" aria-hidden />
        )}
        {copied ? "Link kopiert" : "Link kopieren"}
      </button>

      {typeof navigator !== "undefined" && "share" in navigator && (
        <button
          type="button"
          role="menuitem"
          onClick={() => void nativeShare()}
          className={menuItemClass}
        >
          <Send className="h-5 w-5 text-unze-ink-secondary" aria-hidden />
          Teilen… (iOS / Android)
        </button>
      )}

      <div className="my-1 border-t border-unze-border/80" />

      <button
        type="button"
        role="menuitem"
        onClick={() =>
          openExternal(`https://wa.me/?text=${whatsAppText}`, "whatsapp")
        }
        className={menuItemClass}
      >
        <PlatformIcon platform="whatsapp" size="sm" className="shrink-0" />
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
        className={menuItemClass}
      >
        <PlatformIcon platform="telegram" size="sm" className="shrink-0" />
        Telegram
      </button>

      <button
        type="button"
        role="menuitem"
        onClick={() => void copyForDiscord()}
        className={menuItemClass}
      >
        {discordCopied ? (
          <Check className="h-5 w-5 text-unze-green" aria-hidden />
        ) : (
          <PlatformIcon platform="discord" size="sm" className="shrink-0" />
        )}
        {discordCopied ? "Für Discord kopiert" : "Discord (Link kopieren)"}
      </button>

      <button
        type="button"
        role="menuitem"
        onClick={() =>
          openExternal(
            `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
            "facebook",
          )
        }
        className={menuItemClass}
      >
        <PlatformIcon platform="facebook" size="sm" className="shrink-0" />
        Facebook
      </button>
    </>
  );

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
            ? "inline-flex min-h-[44px] items-center gap-2 rounded-full bg-unze-surface-muted px-3 py-2 text-sm font-semibold text-unze-ink-secondary"
            : cn(
                "touch-target flex h-11 w-11 items-center justify-center rounded-full",
                "bg-white/95 text-unze-ink shadow-md backdrop-blur-md",
                "transition active:scale-95 hover:bg-white",
              ),
          className,
        )}
        aria-label={label}
        aria-expanded={open}
      >
        <Share2
          className={cn(variant === "inline" ? "h-4 w-4" : "h-[18px] w-[18px]")}
          aria-hidden
        />
        {variant === "inline" && "Teilen"}
      </button>

      {open && isMobile && (
        <div
          className="fixed inset-0 z-50 flex items-end justify-center bg-black/40"
          onClick={() => setOpen(false)}
          role="presentation"
        >
          <div
            className="w-full max-w-lg rounded-t-3xl bg-white px-4 pb-[calc(env(safe-area-inset-bottom,0px)+1rem)] pt-3 shadow-xl"
            onClick={(e) => e.stopPropagation()}
            role="menu"
          >
            <div className="mb-3 flex items-center justify-between">
              <p className="text-base font-bold text-unze-ink">Teilen</p>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="rounded-xl p-2 text-unze-ink-muted"
                aria-label="Schließen"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            {menuItems}
          </div>
        </div>
      )}

      {open && !isMobile && (
        <div
          className="absolute right-0 top-full z-30 mt-2 min-w-[240px] overflow-hidden rounded-2xl border border-unze-border bg-white py-1.5 shadow-xl"
          onClick={(e) => e.stopPropagation()}
          role="menu"
        >
          {menuItems}
        </div>
      )}
    </div>
  );
}
