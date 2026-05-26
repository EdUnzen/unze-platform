"use client";

import {
  removeAvatarAction,
  uploadAvatarAction,
} from "@/app/profile/actions";
import { UserAvatar } from "@/components/ui/UserAvatar";
import { cn } from "@/lib/utils/cn";
import { Camera, Trash2 } from "lucide-react";
import { useRef, useState, useTransition } from "react";

interface ProfileAvatarUploadProps {
  displayName: string;
  userId: string;
  avatarUrl?: string | null;
}

export function ProfileAvatarUpload({
  displayName,
  userId,
  avatarUrl: initialUrl,
}: ProfileAvatarUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [avatarUrl, setAvatarUrl] = useState(initialUrl);
  const [message, setMessage] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const upload = (file: File) => {
    startTransition(async () => {
      setMessage(null);
      const fd = new FormData();
      fd.set("avatar", file);
      const result = await uploadAvatarAction(fd);
      if (result.error) {
        setMessage(result.error);
        return;
      }
      if (result.avatarUrl) setAvatarUrl(result.avatarUrl);
      setMessage("Profilbild aktualisiert.");
    });
  };

  const remove = () => {
    startTransition(async () => {
      setMessage(null);
      const result = await removeAvatarAction();
      if (result.error) {
        setMessage(result.error);
        return;
      }
      setAvatarUrl(null);
      setMessage("Profilbild entfernt.");
    });
  };

  return (
    <div className="flex flex-col items-center gap-3">
      <div className="relative">
        <UserAvatar
          name={displayName}
          seed={userId}
          avatarUrl={avatarUrl}
          size="xl"
          className="border-4 border-white shadow-md"
        />
        <button
          type="button"
          disabled={pending}
          onClick={() => inputRef.current?.click()}
          className="absolute bottom-0 right-0 flex h-9 w-9 items-center justify-center rounded-full bg-unze-green text-white shadow-lg active:scale-95 disabled:opacity-60"
          aria-label="Profilbild ändern"
        >
          <Camera className="h-4 w-4" />
        </button>
        <input
          ref={inputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) upload(file);
            e.target.value = "";
          }}
        />
      </div>

      <div className="flex gap-2">
        <button
          type="button"
          disabled={pending || !avatarUrl}
          onClick={remove}
          className={cn(
            "inline-flex items-center gap-1 rounded-xl border border-unze-border px-3 py-1.5 text-xs font-medium text-unze-ink-muted",
            "disabled:opacity-40",
          )}
        >
          <Trash2 className="h-3.5 w-3.5" />
          Entfernen
        </button>
      </div>

      <p className="text-center text-[11px] text-unze-ink-muted">
        Optional · JPG, PNG, WebP · max. 5 MB
      </p>
      {message && (
        <p
          className={cn(
            "text-xs",
            message.includes("Fehler") || message.includes("Nur") || message.includes("max")
              ? "text-red-600"
              : "text-unze-green-dark",
          )}
        >
          {message}
        </p>
      )}
    </div>
  );
}
