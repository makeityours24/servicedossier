"use client";

import { useFormStatus } from "react-dom";

type DeleteCustomerButtonProps = {
  naam: string;
  confirmMessage: string;
  label?: string;
};

export function DeleteCustomerButton({
  naam,
  confirmMessage,
  label = "Verwijderen"
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
      {pending ? "Verwijderen..." : label}
    </button>
  );
}
