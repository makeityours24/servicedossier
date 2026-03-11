"use client";

import { useActionState } from "react";
import { FormMessage } from "@/components/form-message";
import { SubmitButton } from "@/components/submit-button";
import type { FormState } from "@/components/customer-form";

const initialState: FormState = {};

type TreatmentFormProps = {
  customerId: number;
  medewerkerNaam: string;
  action: (state: FormState, formData: FormData) => Promise<FormState>;
};

export function TreatmentForm({
  customerId,
  medewerkerNaam,
  action
}: TreatmentFormProps) {
  const [state, formAction] = useActionState(action, initialState);
  const vandaag = new Date().toISOString().slice(0, 16);

  return (
    <form action={formAction} className="formulier">
      <input type="hidden" name="customerId" value={customerId} />
      <FormMessage error={state.error} success={state.success} />

      <div className="formulier-grid">
        <div className="veld">
          <label htmlFor="datum">Datum en tijd</label>
          <input id="datum" name="datum" type="datetime-local" defaultValue={vandaag} required />
        </div>

        <div className="veld">
          <label htmlFor="behandelaar">Naam behandelaar</label>
          <input
            id="behandelaar"
            name="behandelaar"
            defaultValue={medewerkerNaam}
            required
          />
        </div>

        <div className="veld-groot">
          <label htmlFor="behandeling">Behandeling</label>
          <input id="behandeling" name="behandeling" placeholder="Bijvoorbeeld uitgroei kleuren" required />
        </div>

        <div className="veld-groot">
          <label htmlFor="recept">Recept</label>
          <textarea id="recept" name="recept" placeholder="Bijvoorbeeld 7.0 + 7.1, 3% oxidatie, 25 minuten" required />
        </div>

        <div className="veld-groot">
          <label htmlFor="notities">Notities (optioneel)</label>
          <textarea id="notities" name="notities" placeholder="Extra opmerkingen of advies" />
        </div>
      </div>

      <SubmitButton label="Behandeling opslaan" bezigLabel="Opslaan..." />
    </form>
  );
}
