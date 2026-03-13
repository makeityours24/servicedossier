"use client";

import { useActionState } from "react";
import type { FormState } from "@/components/customer-form";
import { FormMessage } from "@/components/form-message";
import { SubmitButton } from "@/components/submit-button";

const initialState: FormState = {};

type TeamFormProps = {
  action: (state: FormState, formData: FormData) => Promise<FormState>;
  submitLabel?: string;
  medewerker?: {
    id: number;
    naam: string;
    email: string;
    rol: "OWNER" | "ADMIN" | "MEDEWERKER";
    status: "ACTIEF" | "UITGESCHAKELD";
  };
  wachtwoordVerplicht?: boolean;
};

export function TeamForm({
  action,
  submitLabel = "Medewerker toevoegen",
  medewerker,
  wachtwoordVerplicht = true
}: TeamFormProps) {
  const [state, formAction] = useActionState(action, initialState);

  return (
    <form action={formAction} className="formulier">
      {medewerker ? <input type="hidden" name="medewerkerId" value={medewerker.id} /> : null}
      <FormMessage error={state.error} success={state.success} />

      <div className="formulier-grid">
        <div className="veld">
          <label htmlFor="naam">Naam</label>
          <input id="naam" name="naam" defaultValue={medewerker?.naam} required />
        </div>

        <div className="veld">
          <label htmlFor="email">E-mailadres</label>
          <input id="email" name="email" type="email" defaultValue={medewerker?.email} required />
        </div>

        <div className="veld">
          <label htmlFor="wachtwoord">
            {wachtwoordVerplicht ? "Wachtwoord" : "Nieuw wachtwoord (optioneel)"}
          </label>
          <input id="wachtwoord" name="wachtwoord" type="password" required={wachtwoordVerplicht} />
        </div>

        <div className="veld">
          <label htmlFor="rol">Rol</label>
          <select id="rol" name="rol" defaultValue={medewerker?.rol ?? "MEDEWERKER"}>
            <option value="OWNER">Eigenaar</option>
            <option value="ADMIN">Admin</option>
            <option value="MEDEWERKER">Medewerker</option>
          </select>
        </div>

        <div className="veld">
          <label htmlFor="status">Status</label>
          <select id="status" name="status" defaultValue={medewerker?.status ?? "ACTIEF"}>
            <option value="ACTIEF">Actief</option>
            <option value="UITGESCHAKELD">Uitgeschakeld</option>
          </select>
        </div>
      </div>

      <SubmitButton label={submitLabel} bezigLabel="Opslaan..." />
    </form>
  );
}
