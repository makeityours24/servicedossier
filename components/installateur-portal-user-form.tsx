"use client";

import { useActionState } from "react";
import { FormMessage } from "@/components/form-message";
import { SubmitButton } from "@/components/submit-button";
import type { InstallateurPortalUserFormState } from "@/app/platform/[id]/installateurs/actions";

const initialState: InstallateurPortalUserFormState = {};

type CustomerOption = {
  id: number;
  naam: string;
};

type InstallateurPortalUserFormProps = {
  salonId: number;
  customers: CustomerOption[];
  action: (
    state: InstallateurPortalUserFormState,
    formData: FormData
  ) => Promise<InstallateurPortalUserFormState>;
};

export function InstallateurPortalUserForm({
  salonId,
  customers,
  action
}: InstallateurPortalUserFormProps) {
  const [state, formAction] = useActionState(action, initialState);

  return (
    <form action={formAction} className="formulier">
      <input type="hidden" name="salonId" value={salonId} />
      <FormMessage error={state.error} success={state.success} />

      <div className="formulier-grid">
        <div className="veld">
          <label htmlFor="customerAccountId">Klant</label>
          <select id="customerAccountId" name="customerAccountId" defaultValue="" required>
            <option value="" disabled>
              Kies een klant
            </option>
            {customers.map((customer) => (
              <option key={customer.id} value={customer.id}>
                {customer.naam}
              </option>
            ))}
          </select>
        </div>

        <div className="veld">
          <label htmlFor="naam">Naam portalgebruiker</label>
          <input id="naam" name="naam" required />
        </div>

        <div className="veld">
          <label htmlFor="email">E-mailadres</label>
          <input id="email" name="email" type="email" required />
        </div>

        <div className="veld">
          <label htmlFor="wachtwoord">Tijdelijk wachtwoord</label>
          <input id="wachtwoord" name="wachtwoord" type="password" minLength={8} required />
        </div>
      </div>

      <SubmitButton label="Portalaccount toevoegen" bezigLabel="Opslaan..." />
    </form>
  );
}
