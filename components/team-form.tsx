"use client";

import { useActionState } from "react";
import type { FormState } from "@/components/customer-form";
import { FormMessage } from "@/components/form-message";
import { SubmitButton } from "@/components/submit-button";

const initialState: FormState = {};

type TeamFormProps = {
  action: (state: FormState, formData: FormData) => Promise<FormState>;
  submitLabel?: string;
  dictionary?: {
    name: string;
    email: string;
    password: string;
    newPasswordOptional: string;
    role: string;
    status: string;
    owner: string;
    admin: string;
    staff: string;
    active: string;
    disabled: string;
    saving: string;
  };
  medewerker?: {
    id: number;
    naam: string;
    email: string;
    rol: "OWNER" | "ADMIN" | "MEDEWERKER";
    status: "ACTIEF" | "UITGESCHAKELD";
  };
  wachtwoordVerplicht?: boolean;
};

const defaultDictionary = {
  name: "Naam",
  email: "E-mailadres",
  password: "Wachtwoord",
  newPasswordOptional: "Nieuw wachtwoord (optioneel)",
  role: "Rol",
  status: "Status",
  owner: "Eigenaar",
  admin: "Admin",
  staff: "Medewerker",
  active: "Actief",
  disabled: "Uitgeschakeld",
  saving: "Opslaan..."
};

export function TeamForm({
  action,
  submitLabel = "Medewerker toevoegen",
  dictionary = defaultDictionary,
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
          <label htmlFor="naam">{dictionary.name}</label>
          <input id="naam" name="naam" defaultValue={medewerker?.naam} required />
        </div>

        <div className="veld">
          <label htmlFor="email">{dictionary.email}</label>
          <input id="email" name="email" type="email" defaultValue={medewerker?.email} required />
        </div>

        <div className="veld">
          <label htmlFor="wachtwoord">
            {wachtwoordVerplicht ? dictionary.password : dictionary.newPasswordOptional}
          </label>
          <input id="wachtwoord" name="wachtwoord" type="password" required={wachtwoordVerplicht} />
        </div>

        <div className="veld">
          <label htmlFor="rol">{dictionary.role}</label>
          <select id="rol" name="rol" defaultValue={medewerker?.rol ?? "MEDEWERKER"}>
            <option value="OWNER">{dictionary.owner}</option>
            <option value="ADMIN">{dictionary.admin}</option>
            <option value="MEDEWERKER">{dictionary.staff}</option>
          </select>
        </div>

        <div className="veld">
          <label htmlFor="status">{dictionary.status}</label>
          <select id="status" name="status" defaultValue={medewerker?.status ?? "ACTIEF"}>
            <option value="ACTIEF">{dictionary.active}</option>
            <option value="UITGESCHAKELD">{dictionary.disabled}</option>
          </select>
        </div>
      </div>

      <SubmitButton label={submitLabel} bezigLabel={dictionary.saving} />
    </form>
  );
}
