"use client";

export function PrintHandoutButton({ label }: { label: string }) {
  return (
    <button type="button" className="knop-secundair handout-print-knop" onClick={() => window.print()}>
      {label}
    </button>
  );
}
