"use client";

import { Eye, EyeOff } from "lucide-react";
import { useState } from "react";

type PasswordInputProps = {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  autoComplete?: string;
  minLength?: number;
  required?: boolean;
  placeholder?: string;
  /** Passwort beim Tippen sichtbar (z. B. Erstlogin / Eintrittskarte) */
  defaultVisible?: boolean;
};

export function PasswordInput({
  id,
  label,
  value,
  onChange,
  autoComplete = "current-password",
  minLength = 8,
  required = true,
  placeholder = "••••••••",
  defaultVisible = false,
}: PasswordInputProps) {
  const [visible, setVisible] = useState(defaultVisible);

  return (
    <div>
      <label htmlFor={id} className="mb-1 block text-sm font-medium text-gray-700">
        {label}
      </label>
      <div className="relative">
        <input
          id={id}
          type={visible ? "text" : "password"}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          required={required}
          minLength={minLength}
          autoComplete={autoComplete}
          placeholder={placeholder}
          className="w-full rounded-lg border border-gray-300 py-2 pl-3 pr-10 text-sm"
        />
        <button
          type="button"
          onClick={() => setVisible((v) => !v)}
          className="absolute right-2 top-1/2 -translate-y-1/2 rounded p-1 text-gray-500 hover:text-gray-800"
          aria-label={visible ? "Passwort verbergen" : "Passwort anzeigen"}
          tabIndex={-1}
        >
          {visible ? <EyeOff className="h-4 w-4" aria-hidden /> : <Eye className="h-4 w-4" aria-hidden />}
        </button>
      </div>
    </div>
  );
}
