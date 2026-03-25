"use client";

import { useActionState } from "react";
import { FormMessage } from "@/components/form-message";
import { SubmitButton } from "@/components/submit-button";
import type { InstallateurWorkOrderFormState } from "@/app/platform/[id]/installateurs/actions";

const initialState: InstallateurWorkOrderFormState = {};

type CustomerOption = {
  id: number;
  naam: string;
  locations: Array<{
    id: number;
    label: string;
    assets: Array<{
      id: number;
      label: string;
    }>;
  }>;
};

type InstallateurWorkOrderFormProps = {
  salonId: number;
  customers: CustomerOption[];
  action: (
    state: InstallateurWorkOrderFormState,
    formData: FormData
  ) => Promise<InstallateurWorkOrderFormState>;
};

export function InstallateurWorkOrderForm({
  salonId,
  customers,
  action
}: InstallateurWorkOrderFormProps) {
  const [state, formAction] = useActionState(action, initialState);
  const allLocations = customers.flatMap((customer) =>
    customer.locations.map((location) => ({
      customerName: customer.naam,
      customerId: customer.id,
      id: location.id,
      label: location.label,
      assets: location.assets
    }))
  );

  const allAssets = allLocations.flatMap((location) =>
    location.assets.map((asset) => ({
      id: asset.id,
      label: `${location.customerName} · ${location.label} · ${asset.label}`
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
          <label htmlFor="assetId">Installatie</label>
          <select id="assetId" name="assetId" defaultValue="">
            <option value="">Geen specifieke installatie</option>
            {allAssets.map((asset) => (
              <option key={asset.id} value={asset.id}>
                {asset.label}
              </option>
            ))}
          </select>
        </div>

        <div className="veld">
          <label htmlFor="type">Type werkbon</label>
          <select id="type" name="type" defaultValue="STORING">
            <option value="STORING">Storing</option>
            <option value="ONDERHOUD">Onderhoud</option>
            <option value="MONTAGE">Montage</option>
            <option value="INSPECTIE">Inspectie</option>
            <option value="OPNAME">Opname</option>
          </select>
        </div>

        <div className="veld">
          <label htmlFor="prioriteit">Prioriteit</label>
          <select id="prioriteit" name="prioriteit" defaultValue="NORMAAL">
            <option value="LAAG">Laag</option>
            <option value="NORMAAL">Normaal</option>
            <option value="HOOG">Hoog</option>
            <option value="SPOED">Spoed</option>
          </select>
        </div>

        <div className="veld">
          <label htmlFor="status">Status</label>
          <select id="status" name="status" defaultValue="NIEUW">
            <option value="NIEUW">Nieuw</option>
            <option value="INGEPLAND">Ingepland</option>
            <option value="ONDERWEG">Onderweg</option>
            <option value="IN_UITVOERING">In uitvoering</option>
            <option value="AFGEROND">Afgerond</option>
            <option value="VERVOLG_NODIG">Vervolg nodig</option>
            <option value="GEANNULEERD">Geannuleerd</option>
          </select>
        </div>

        <div className="veld-groot">
          <label htmlFor="titel">Titel</label>
          <input id="titel" name="titel" required />
        </div>

        <div className="veld-groot">
          <label htmlFor="melding">Melding</label>
          <textarea id="melding" name="melding" rows={4} required />
        </div>

        <div className="veld">
          <label htmlFor="geplandStart">Gepland startmoment</label>
          <input id="geplandStart" name="geplandStart" type="datetime-local" />
        </div>

        <div className="veld">
          <label htmlFor="geplandEinde">Gepland eindmoment</label>
          <input id="geplandEinde" name="geplandEinde" type="datetime-local" />
        </div>

        <div className="veld-groot">
          <label htmlFor="klantNotities">Klantnotities</label>
          <textarea id="klantNotities" name="klantNotities" rows={3} />
        </div>

        <div className="veld-groot">
          <label htmlFor="interneNotities">Interne notities</label>
          <textarea id="interneNotities" name="interneNotities" rows={4} />
        </div>
      </div>

      <SubmitButton label="Werkbon toevoegen" bezigLabel="Opslaan..." />
    </form>
  );
}
