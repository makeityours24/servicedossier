"use client";

import Link from "next/link";
import { useActionState } from "react";
import { completePasswordResetAction, type PasswordResetCompleteState } from "@/app/wachtwoord-reset/actions";
import { FormMessage } from "@/components/form-message";
import { SubmitButton } from "@/components/submit-button";

const initialState: PasswordResetCompleteState = {};

type PasswordResetCompleteFormProps = {
  token: string;
  dictionary: {
    newPasswordLabel: string;
    confirmPasswordLabel: string;
    completeLabel: string;
    completeBusy: string;
    backToLogin: string;
  };
};

export function PasswordResetCompleteForm({
  token,
  dictionary
}: PasswordResetCompleteFormProps) {
  const [state, formAction] = useActionState(completePasswordResetAction, initialState);

  return (
    <form action={formAction} className="formulier">
      <input type="hidden" name="token" value={token} />
      <FormMessage error={state.error} />

      <div className="veld">
        <label htmlFor="nieuwWachtwoord">{dictionary.newPasswordLabel}</label>
        <input id="nieuwWachtwoord" name="nieuwWachtwoord" type="password" required minLength={8} />
      </div>

      <div className="veld">
        <label htmlFor="bevestigWachtwoord">{dictionary.confirmPasswordLabel}</label>
        <input id="bevestigWachtwoord" name="bevestigWachtwoord" type="password" required minLength={8} />
      </div>

      <SubmitButton label={dictionary.completeLabel} bezigLabel={dictionary.completeBusy} />

      <Link href="/login" className="link-tekst">
        {dictionary.backToLogin}
      </Link>
    </form>
  );
}
