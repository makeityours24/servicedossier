"use client";

export function PrintButton() {
  return (
    <button className="knop" type="button" onClick={() => window.print()}>
      Afdrukken
    </button>
  );
}
