"use client";

import { useState } from "react";
import { buildWhatsAppReminderUrl } from "@/lib/utils";

type ReminderCopyButtonProps = {
  message: string;
  phoneNumber?: string | null;
  labels?: {
    copied: string;
    copy: string;
    openWhatsApp: string;
    copiedHint: string;
  };
};

export function ReminderCopyButton({
  message,
  phoneNumber,
  labels = {
    copied: "Herinnering gekopieerd",
    copy: "Herinnering kopiëren",
    openWhatsApp: "Open in WhatsApp",
    copiedHint: "De herinnering staat nu op je klembord. Plak hem in WhatsApp of e-mail."
  }
}: ReminderCopyButtonProps) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(message);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2200);
    } catch {
      setCopied(false);
    }
  }

  return (
    <div style={{ display: "grid", gap: 10 }}>
      <div className="acties">
        <button type="button" className="knop-zacht" onClick={handleCopy}>
          {copied ? labels.copied : labels.copy}
        </button>
        <a
          href={buildWhatsAppReminderUrl(message, phoneNumber)}
          target="_blank"
          rel="noreferrer"
          className="knop-secundair"
        >
          {labels.openWhatsApp}
        </a>
      </div>
      {copied ? (
        <p className="meta" aria-live="polite" style={{ margin: 0 }}>
          {labels.copiedHint}
        </p>
      ) : null}
    </div>
  );
}
