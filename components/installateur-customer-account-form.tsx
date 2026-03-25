"use client";

import { useActionState } from "react";
import { FormMessage } from "@/components/form-message";
import { SubmitButton } from "@/components/submit-button";
import type { InstallateurCustomerFormState } from "@/app/platform/[id]/installateurs/actions";

const initialState: InstallateurCustomerFormState = {};

type InstallateurCustomerAccountFormProps = {
  salonId: number;
  action: (
    state: InstallateurCustomerFormState,
    formData: FormData
  ) => Promise<InstallateurCustomerFormState>;
};

export function InstallateurCustomerAccountForm({
  salonId,
  action
}: InstallateurCustomerAccountFormProps) {
  const [state, formAction] = useActionState(action, initialState);

  return (
    <form action={formAction} className="formulier">
      <input type="hidden" name="salonId" value={salonId} />
      <FormMessage error={state.error} success={state.success} />

      <div className="formulier-grid">
        <div className="veld">
          <label htmlFor="type">Klanttype</label>
          <select id="type" name="type" defaultValue="PARTICULIER">
            <option value="PARTICULIER">Particulier</option>
            <option value="BEDRIJF">Bedrijf</option>
          </select>
        </div>

        <div className="veld">
          <label htmlFor="naam">Naam</label>
          <input id="naam" name="naam" required />
        </div>

        <div className="veld">
          <label htmlFor="telefoon">Telefoon</label>
          <input id="telefoon" name="telefoon" />
        </div>

        <div className="veld">
          <label htmlFor="email">E-mail</label>
          <input id="email" name="email" type="email" />
        </div>

        <div className="veld">
          <label htmlFor="klantnummer">Klantnummer</label>
          <input id="klantnummer" name="klantnummer" />
        </div>

        <div className="veld">
          <label htmlFor="factuurEmail">Factuur e-mail</label>
          <input id="factuurEmail" name="factuurEmail" type="email" />
        </div>

        <div className="veld">
          <label htmlFor="kvkNummer">KvK-nummer</label>
          <input id="kvkNummer" name="kvkNummer" />
        </div>

        <div className="veld">
          <label htmlFor="btwNummer">BTW-nummer</label>
          <input id="btwNummer" name="btwNummer" />
        </div>

        <div className="veld-groot">
          <label htmlFor="notities">Notities</label>
          <textarea id="notities" name="notities" rows={4} />
        </div>
      </div>

      <SubmitButton label="Installateurklant toevoegen" bezigLabel="Opslaan..." />
    </form>
  );
}
