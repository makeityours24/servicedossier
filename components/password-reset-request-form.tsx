"use client";

import Link from "next/link";
import { useActionState } from "react";
import { requestPasswordResetAction, type PasswordResetRequestState } from "@/app/wachtwoord-vergeten/actions";
import { FormMessage } from "@/components/form-message";
import { SubmitButton } from "@/components/submit-button";

const initialState: PasswordResetRequestState = {};

type PasswordResetRequestFormProps = {
  dictionary: {
    emailLabel: string;
    requestLabel: string;
    requestBusy: string;
    requestBack: string;
  };
};

export function PasswordResetRequestForm({ dictionary }: PasswordResetRequestFormProps) {
  const [state, formAction] = useActionState(requestPasswordResetAction, initialState);

  return (
    <form action={formAction} className="formulier">
      <FormMessage error={state.error} success={state.success} />

      <div className="veld">
        <label htmlFor="email">{dictionary.emailLabel}</label>
        <input id="email" name="email" type="email" required />
      </div>

      <SubmitButton label={dictionary.requestLabel} bezigLabel={dictionary.requestBusy} />

      <Link href="/login" className="link-tekst">
        {dictionary.requestBack}
      </Link>
    </form>
  );
}
