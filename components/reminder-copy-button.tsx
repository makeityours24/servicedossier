"use client";

import { useState } from "react";

type ReminderCopyButtonProps = {
  message: string;
};

export function ReminderCopyButton({ message }: ReminderCopyButtonProps) {
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
    <button type="button" className="knop-zacht" onClick={handleCopy}>
      {copied ? "Herinnering gekopieerd" : "Herinnering kopiëren"}
    </button>
  );
}
