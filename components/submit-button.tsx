"use client";

import { useFormStatus } from "react-dom";

type SubmitButtonProps = {
  label: string;
  bezigLabel?: string;
  className?: string;
};

export function SubmitButton({
  label,
  bezigLabel = "Bezig...",
  className = "knop"
}: SubmitButtonProps) {
  const { pending } = useFormStatus();

  return (
    <button className={className} type="submit" disabled={pending}>
      {pending ? bezigLabel : label}
    </button>
  );
}
