"use client";

import { useActionState } from "react";
import { FormMessage } from "@/components/form-message";
import { SubmitButton } from "@/components/submit-button";
import type { InstallateurLocationFormState } from "@/app/platform/[id]/installateurs/actions";

const initialState: InstallateurLocationFormState = {};

type CustomerOption = {
  id: number;
  naam: string;
};

type InstallateurServiceLocationFormProps = {
  salonId: number;
  customers: CustomerOption[];
  action: (
    state: InstallateurLocationFormState,
    formData: FormData
  ) => Promise<InstallateurLocationFormState>;
};

export function InstallateurServiceLocationForm({
  salonId,
  customers,
  action
}: InstallateurServiceLocationFormProps) {
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
          <label htmlFor="naam">Locatienaam</label>
          <input id="naam" name="naam" placeholder="Bijv. Hoofdlocatie Arnhem" />
        </div>

        <div className="veld-groot">
          <label htmlFor="adresregel1">Adres</label>
          <input id="adresregel1" name="adresregel1" required />
        </div>

        <div className="veld">
          <label htmlFor="adresregel2">Adresregel 2</label>
          <input id="adresregel2" name="adresregel2" />
        </div>

        <div className="veld">
          <label htmlFor="postcode">Postcode</label>
          <input id="postcode" name="postcode" required />
        </div>

        <div className="veld">
          <label htmlFor="plaats">Plaats</label>
          <input id="plaats" name="plaats" required />
        </div>

        <div className="veld">
          <label htmlFor="land">Landcode</label>
          <input id="land" name="land" defaultValue="NL" maxLength={2} required />
        </div>

        <div className="veld-groot">
          <label htmlFor="toegangsinstructies">Toegangsinstructies</label>
          <textarea id="toegangsinstructies" name="toegangsinstructies" rows={3} />
        </div>

        <div className="veld-groot">
          <label htmlFor="locatieNotities">Locatienotities</label>
          <textarea id="locatieNotities" name="locatieNotities" rows={4} />
        </div>
      </div>

      <SubmitButton label="Servicelocatie toevoegen" bezigLabel="Opslaan..." />
    </form>
  );
}
