"use client";

import { useActionState } from "react";
import type { FormState } from "@/components/customer-form";
import { FormMessage } from "@/components/form-message";
import { SubmitButton } from "@/components/submit-button";

const initialState: FormState = {};

type PasswordChangeFormProps = {
  action: (state: FormState, formData: FormData) => Promise<FormState>;
  eersteLogin: boolean;
};

export function PasswordChangeForm({ action, eersteLogin }: PasswordChangeFormProps) {
  const [state, formAction] = useActionState(action, initialState);

  return (
    <form action={formAction} className="formulier">
      <FormMessage error={state.error} success={state.success} />

      {!eersteLogin ? (
        <div className="veld">
          <label htmlFor="huidigWachtwoord">Huidig wachtwoord</label>
          <input id="huidigWachtwoord" name="huidigWachtwoord" type="password" required />
        </div>
      ) : null}

      <div className="veld">
        <label htmlFor="nieuwWachtwoord">Nieuw wachtwoord</label>
        <input id="nieuwWachtwoord" name="nieuwWachtwoord" type="password" required />
      </div>

      <div className="veld">
        <label htmlFor="bevestigWachtwoord">Bevestig nieuw wachtwoord</label>
        <input id="bevestigWachtwoord" name="bevestigWachtwoord" type="password" required />
      </div>

      <SubmitButton
        label={eersteLogin ? "Eerste wachtwoord opslaan" : "Wachtwoord wijzigen"}
        bezigLabel="Opslaan..."
      />
    </form>
  );
}
