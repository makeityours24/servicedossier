"use client";

import { useActionState } from "react";
import { FormMessage } from "@/components/form-message";
import { SubmitButton } from "@/components/submit-button";
import type { FormState } from "@/components/customer-form";

const initialState: FormState = {};

type SalonSettingsFormProps = {
  action: (state: FormState, formData: FormData) => Promise<FormState>;
  settings: {
    weergavenaam: string;
    contactEmail: string;
    contactTelefoon: string;
    adres: string;
    primaireKleur: string;
    logoUrl: string;
    treatmentPresets: string;
  };
};

export function SalonSettingsForm({ action, settings }: SalonSettingsFormProps) {
  const [state, formAction] = useActionState(action, initialState);

  return (
    <form action={formAction} className="formulier">
      <FormMessage error={state.error} success={state.success} />

      <div className="formulier-grid">
        <div className="veld">
          <label htmlFor="weergavenaam">Salonnaam</label>
          <input id="weergavenaam" name="weergavenaam" defaultValue={settings.weergavenaam} required />
        </div>

        <div className="veld">
          <label htmlFor="primaireKleur">Primaire kleur</label>
          <input id="primaireKleur" name="primaireKleur" defaultValue={settings.primaireKleur} required />
        </div>

        <div className="veld">
          <label htmlFor="contactEmail">E-mailadres</label>
          <input id="contactEmail" name="contactEmail" type="email" defaultValue={settings.contactEmail} />
        </div>

        <div className="veld">
          <label htmlFor="contactTelefoon">Telefoonnummer</label>
          <input id="contactTelefoon" name="contactTelefoon" defaultValue={settings.contactTelefoon} />
        </div>

        <div className="veld-groot">
          <label htmlFor="adres">Adres</label>
          <textarea id="adres" name="adres" defaultValue={settings.adres} />
        </div>

        <div className="veld-groot">
          <label htmlFor="logoUrl">Logo URL</label>
          <input
            id="logoUrl"
            name="logoUrl"
            defaultValue={settings.logoUrl}
            placeholder="Bijvoorbeeld /logo-salon.svg of https://..."
          />
        </div>

        <div className="veld-groot">
          <label htmlFor="treatmentPresets">Snelle behandelingen</label>
          <textarea
            id="treatmentPresets"
            name="treatmentPresets"
            defaultValue={settings.treatmentPresets}
            placeholder={"Eén behandeling per regel\nUitgroei kleuren\nVolledige kleuring\nToner"}
          />
        </div>
      </div>

      <SubmitButton label="Instellingen opslaan" bezigLabel="Opslaan..." />
    </form>
  );
}
