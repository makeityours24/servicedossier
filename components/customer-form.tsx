"use client";

import Link from "next/link";
import { useActionState } from "react";
import { FormMessage } from "@/components/form-message";
import { SubmitButton } from "@/components/submit-button";
import { formatDateInput } from "@/lib/utils";

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
    geboortedatum?: Date | string | null;
    allergieen?: string | null;
    haartype?: string | null;
    haarkleur?: string | null;
    stylistNotities?: string | null;
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

        <div className="veld">
          <label htmlFor="geboortedatum">Geboortedatum</label>
          <input
            id="geboortedatum"
            name="geboortedatum"
            type="date"
            defaultValue={customer?.geboortedatum ? formatDateInput(customer.geboortedatum) : ""}
          />
        </div>

        <div className="veld">
          <label htmlFor="haartype">Haartype</label>
          <input
            id="haartype"
            name="haartype"
            defaultValue={customer?.haartype ?? ""}
            placeholder="Bijvoorbeeld krullend, fijn, dik"
          />
        </div>

        <div className="veld">
          <label htmlFor="haarkleur">Haarkleur</label>
          <input
            id="haarkleur"
            name="haarkleur"
            defaultValue={customer?.haarkleur ?? ""}
            placeholder="Bijvoorbeeld donkerblond, koper, zwart"
          />
        </div>

        <div className="veld-groot">
          <label htmlFor="adres">Adres</label>
          <textarea id="adres" name="adres" defaultValue={customer?.adres} required />
        </div>

        <div className="veld-groot">
          <label htmlFor="allergieen">Allergieen</label>
          <textarea
            id="allergieen"
            name="allergieen"
            defaultValue={customer?.allergieen ?? ""}
            placeholder="Bijvoorbeeld gevoelig voor blondering, parfum of specifieke producten"
          />
        </div>

        <div className="veld-groot">
          <label htmlFor="stylistNotities">Notities stylist</label>
          <textarea
            id="stylistNotities"
            name="stylistNotities"
            defaultValue={customer?.stylistNotities ?? ""}
            placeholder="Bijvoorbeeld aandachtspunten, voorkeuren of belangrijke observaties"
          />
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
