"use client";

import { useActionState } from "react";
import { FormMessage } from "@/components/form-message";
import { SubmitButton } from "@/components/submit-button";
import type { FormState } from "@/components/customer-form";

const initialState: FormState = {};

type SalonSettingsFormProps = {
  action: (state: FormState, formData: FormData) => Promise<FormState>;
  submitLabel?: string;
  dictionary?: {
    salonName: string;
    primaryColor: string;
    email: string;
    phone: string;
    address: string;
    logoUrl: string;
    logoUrlPlaceholder: string;
    quickTreatments: string;
    quickTreatmentsPlaceholder: string;
    saving: string;
  };
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

const defaultDictionary = {
  salonName: "Salonnaam",
  primaryColor: "Primaire kleur",
  email: "E-mailadres",
  phone: "Telefoonnummer",
  address: "Adres",
  logoUrl: "Logo URL",
  logoUrlPlaceholder: "Bijvoorbeeld /logo-salon.svg of https://...",
  quickTreatments: "Snelle behandelingen",
  quickTreatmentsPlaceholder:
    "Eén behandeling per regel\nUitgroei kleuren\nVolledige kleuring\nToner",
  saving: "Opslaan..."
};

export function SalonSettingsForm({
  action,
  submitLabel = "Instellingen opslaan",
  dictionary = defaultDictionary,
  settings
}: SalonSettingsFormProps) {
  const [state, formAction] = useActionState(action, initialState);

  return (
    <form action={formAction} className="formulier">
      <FormMessage error={state.error} success={state.success} />

      <div className="formulier-grid">
        <div className="veld">
          <label htmlFor="weergavenaam">{dictionary.salonName}</label>
          <input id="weergavenaam" name="weergavenaam" defaultValue={settings.weergavenaam} required />
        </div>

        <div className="veld">
          <label htmlFor="primaireKleur">{dictionary.primaryColor}</label>
          <input id="primaireKleur" name="primaireKleur" defaultValue={settings.primaireKleur} required />
        </div>

        <div className="veld">
          <label htmlFor="contactEmail">{dictionary.email}</label>
          <input id="contactEmail" name="contactEmail" type="email" defaultValue={settings.contactEmail} />
        </div>

        <div className="veld">
          <label htmlFor="contactTelefoon">{dictionary.phone}</label>
          <input id="contactTelefoon" name="contactTelefoon" defaultValue={settings.contactTelefoon} />
        </div>

        <div className="veld-groot">
          <label htmlFor="adres">{dictionary.address}</label>
          <textarea id="adres" name="adres" defaultValue={settings.adres} />
        </div>

        <div className="veld-groot">
          <label htmlFor="logoUrl">{dictionary.logoUrl}</label>
          <input
            id="logoUrl"
            name="logoUrl"
            defaultValue={settings.logoUrl}
            placeholder={dictionary.logoUrlPlaceholder}
          />
        </div>

        <div className="veld-groot">
          <label htmlFor="treatmentPresets">{dictionary.quickTreatments}</label>
          <textarea
            id="treatmentPresets"
            name="treatmentPresets"
            defaultValue={settings.treatmentPresets}
            placeholder={dictionary.quickTreatmentsPlaceholder}
          />
        </div>
      </div>

      <SubmitButton label={submitLabel} bezigLabel={dictionary.saving} />
    </form>
  );
}
