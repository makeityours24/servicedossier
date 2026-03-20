"use client";

import { useFormStatus } from "react-dom";

type DeleteCustomerButtonProps = {
  naam: string;
  confirmMessage: string;
  label?: string;
  busyLabel?: string;
};

export function DeleteCustomerButton({
  naam,
  confirmMessage,
  label = "Verwijderen",
  busyLabel = "Verwijderen..."
}: DeleteCustomerButtonProps) {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      className="knop-gevaar"
      disabled={pending}
      onClick={(event) => {
        const bevestigd = window.confirm(confirmMessage.replace("{naam}", naam));

        if (!bevestigd) {
          event.preventDefault();
        }
      }}
    >
      {pending ? busyLabel : label}
    </button>
  );
}
