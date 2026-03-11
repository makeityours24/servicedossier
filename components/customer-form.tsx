"use client";

import Link from "next/link";
import { useActionState } from "react";
import { FormMessage } from "@/components/form-message";
import { SubmitButton } from "@/components/submit-button";

export type FormState = {
  error?: string;
  success?: string;
};

const initialState: FormState = {};

type CustomerFormProps = {
  action: (state: FormState, formData: FormData) => Promise<FormState>;
  submitLabel: string;
  customer?: {
    id?: number;
    naam: string;
    adres: string;
    telefoonnummer: string;
  };
};

export function CustomerForm({ action, submitLabel, customer }: CustomerFormProps) {
  const [state, formAction] = useActionState(action, initialState);

  return (
    <form action={formAction} className="formulier">
      {customer?.id ? <input type="hidden" name="customerId" value={customer.id} /> : null}
      <FormMessage error={state.error} success={state.success} />

      <div className="formulier-grid">
        <div className="veld">
          <label htmlFor="naam">Naam</label>
          <input id="naam" name="naam" defaultValue={customer?.naam} required />
        </div>

        <div className="veld">
          <label htmlFor="telefoonnummer">Telefoonnummer</label>
          <input
            id="telefoonnummer"
            name="telefoonnummer"
            defaultValue={customer?.telefoonnummer}
            required
          />
        </div>

        <div className="veld-groot">
          <label htmlFor="adres">Adres</label>
          <textarea id="adres" name="adres" defaultValue={customer?.adres} required />
        </div>
      </div>

      <div className="knoppenrij">
        <SubmitButton label={submitLabel} bezigLabel="Opslaan..." />
        <Link href="/klanten" className="knop-secundair">
          Annuleren
        </Link>
      </div>
    </form>
  );
}
