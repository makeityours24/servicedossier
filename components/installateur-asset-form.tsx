"use client";

import { useActionState } from "react";
import { FormMessage } from "@/components/form-message";
import { SubmitButton } from "@/components/submit-button";
import type { InstallateurAssetFormState } from "@/app/platform/[id]/installateurs/actions";

const initialState: InstallateurAssetFormState = {};

type CustomerOption = {
  id: number;
  naam: string;
  locations: Array<{
    id: number;
    label: string;
  }>;
};

type InstallateurAssetFormProps = {
  salonId: number;
  customers: CustomerOption[];
  action: (
    state: InstallateurAssetFormState,
    formData: FormData
  ) => Promise<InstallateurAssetFormState>;
};

export function InstallateurAssetForm({
  salonId,
  customers,
  action
}: InstallateurAssetFormProps) {
  const [state, formAction] = useActionState(action, initialState);
  const allLocations = customers.flatMap((customer) =>
    customer.locations.map((location) => ({
      customerId: customer.id,
      customerName: customer.naam,
      id: location.id,
      label: location.label
    }))
  );

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
          <label htmlFor="serviceLocationId">Locatie</label>
          <select id="serviceLocationId" name="serviceLocationId" defaultValue="" required>
            <option value="" disabled>
              Kies een locatie
            </option>
            {allLocations.map((location) => (
              <option key={location.id} value={location.id}>
                {location.customerName} · {location.label}
              </option>
            ))}
          </select>
        </div>

        <div className="veld">
          <label htmlFor="type">Type installatie</label>
          <select id="type" name="type" defaultValue="CV">
            <option value="CV">CV</option>
            <option value="WARMTEPOMP">Warmtepomp</option>
            <option value="AIRCO">Airco</option>
            <option value="ZONNEPANELEN">Zonnepanelen</option>
            <option value="LAADPAAL">Laadpaal</option>
            <option value="OVERIG">Overig</option>
          </select>
        </div>

        <div className="veld">
          <label htmlFor="status">Status</label>
          <select id="status" name="status" defaultValue="ACTIEF">
            <option value="ACTIEF">Actief</option>
            <option value="BUITEN_GEBRUIK">Buiten gebruik</option>
            <option value="VERVANGEN">Vervangen</option>
          </select>
        </div>

        <div className="veld">
          <label htmlFor="merk">Merk</label>
          <input id="merk" name="merk" />
        </div>

        <div className="veld">
          <label htmlFor="model">Model</label>
          <input id="model" name="model" />
        </div>

        <div className="veld">
          <label htmlFor="serienummer">Serienummer</label>
          <input id="serienummer" name="serienummer" />
        </div>

        <div className="veld">
          <label htmlFor="internNummer">Intern nummer</label>
          <input id="internNummer" name="internNummer" />
        </div>

        <div className="veld">
          <label htmlFor="plaatsingsDatum">Plaatsingsdatum</label>
          <input id="plaatsingsDatum" name="plaatsingsDatum" type="date" />
        </div>

        <div className="veld">
          <label htmlFor="garantieTot">Garantie tot</label>
          <input id="garantieTot" name="garantieTot" type="date" />
        </div>

        <div className="veld-groot">
          <label htmlFor="omschrijving">Omschrijving</label>
          <textarea id="omschrijving" name="omschrijving" rows={3} />
        </div>

        <div className="veld-groot">
          <label htmlFor="notities">Notities</label>
          <textarea id="notities" name="notities" rows={4} />
        </div>
      </div>

      <SubmitButton label="Installatie toevoegen" bezigLabel="Opslaan..." />
    </form>
  );
}
