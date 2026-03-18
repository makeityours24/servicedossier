"use client";

import { useState } from "react";
import { buildWhatsAppReminderUrl } from "@/lib/utils";

type ReminderCopyButtonProps = {
  message: string;
  phoneNumber?: string | null;
};

export function ReminderCopyButton({ message, phoneNumber }: ReminderCopyButtonProps) {
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
    <div className="acties">
      <button type="button" className="knop-zacht" onClick={handleCopy}>
        {copied ? "Herinnering gekopieerd" : "Herinnering kopiëren"}
      </button>
      <a
        href={buildWhatsAppReminderUrl(message, phoneNumber)}
        target="_blank"
        rel="noreferrer"
        className="knop-secundair"
      >
        Open in WhatsApp
      </a>
    </div>
  );
}
