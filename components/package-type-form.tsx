"use client";

import { useActionState } from "react";
import type { FormState } from "@/components/customer-form";
import { FormMessage } from "@/components/form-message";
import { SubmitButton } from "@/components/submit-button";

const initialState: FormState = {};

type PackageTypeFormProps = {
  action: (state: FormState, formData: FormData) => Promise<FormState>;
  submitLabel?: string;
  dictionary?: {
    packageName: string;
    packageNamePlaceholder: string;
    defaultTreatment: string;
    defaultTreatmentPlaceholder: string;
    sessionCount: string;
    packagePrice: string;
    packagePricePlaceholder: string;
    singlePrice: string;
    singlePricePlaceholder: string;
    status: string;
    active: string;
    inactive: string;
    displayType: string;
    bundlePackage: string;
    stampCard: string;
    descriptionOptional: string;
    descriptionPlaceholder: string;
    saving: string;
  };
  packageType?: {
    id: number;
    naam: string;
    omschrijving?: string | null;
    totaalBeurten: number;
    pakketPrijsCents: number;
    lossePrijsCents: number;
    standaardBehandeling: string;
    weergaveType: "PAKKET" | "STEMPELKAART";
    isActief: boolean;
  };
};

const defaultDictionary = {
  packageName: "Naam pakket",
  packageNamePlaceholder: "Bijvoorbeeld 5x epileren",
  defaultTreatment: "Standaardbehandeling",
  defaultTreatmentPlaceholder: "Bijvoorbeeld Epileren",
  sessionCount: "Aantal beurten",
  packagePrice: "Pakketprijs",
  packagePricePlaceholder: "Bijvoorbeeld 30,00",
  singlePrice: "Losse prijs",
  singlePricePlaceholder: "Bijvoorbeeld 7,50",
  status: "Status",
  active: "Actief",
  inactive: "Inactief",
  displayType: "Weergavetype",
  bundlePackage: "Bundelpakket",
  stampCard: "Digitale stempelkaart",
  descriptionOptional: "Omschrijving (optioneel)",
  descriptionPlaceholder: "Bijvoorbeeld voordeliger bundelpakket voor vaste klanten.",
  saving: "Opslaan..."
};

function centsToEuroValue(value: number) {
  return (value / 100).toFixed(2);
}

export function PackageTypeForm({
  action,
  submitLabel = "Pakket opslaan",
  dictionary = defaultDictionary,
  packageType
}: PackageTypeFormProps) {
  const [state, formAction] = useActionState(action, initialState);

  return (
    <form action={formAction} className="formulier">
      {packageType ? <input type="hidden" name="packageTypeId" value={packageType.id} /> : null}
      <FormMessage error={state.error} success={state.success} />

      <div className="formulier-grid">
        <div className="veld">
          <label htmlFor="naam">{dictionary.packageName}</label>
          <input
            id="naam"
            name="naam"
            defaultValue={packageType?.naam}
            placeholder={dictionary.packageNamePlaceholder}
            required
          />
        </div>

        <div className="veld">
          <label htmlFor="standaardBehandeling">{dictionary.defaultTreatment}</label>
          <input
            id="standaardBehandeling"
            name="standaardBehandeling"
            defaultValue={packageType?.standaardBehandeling}
            placeholder={dictionary.defaultTreatmentPlaceholder}
            required
          />
        </div>

        <div className="veld">
          <label htmlFor="totaalBeurten">{dictionary.sessionCount}</label>
          <input
            id="totaalBeurten"
            name="totaalBeurten"
            type="number"
            min="1"
            step="1"
            defaultValue={packageType?.totaalBeurten ?? 5}
            required
          />
        </div>

        <div className="veld">
          <label htmlFor="pakketPrijs">{dictionary.packagePrice}</label>
          <input
            id="pakketPrijs"
            name="pakketPrijs"
            type="number"
            min="0.01"
            step="0.01"
            defaultValue={packageType ? centsToEuroValue(packageType.pakketPrijsCents) : ""}
            placeholder={dictionary.packagePricePlaceholder}
            required
          />
        </div>

        <div className="veld">
          <label htmlFor="lossePrijs">{dictionary.singlePrice}</label>
          <input
            id="lossePrijs"
            name="lossePrijs"
            type="number"
            min="0.01"
            step="0.01"
            defaultValue={packageType ? centsToEuroValue(packageType.lossePrijsCents) : ""}
            placeholder={dictionary.singlePricePlaceholder}
            required
          />
        </div>

        <div className="veld">
          <label htmlFor="isActief">{dictionary.status}</label>
          <select
            id="isActief"
            name="isActief"
            defaultValue={packageType ? String(packageType.isActief) : "true"}
          >
            <option value="true">{dictionary.active}</option>
            <option value="false">{dictionary.inactive}</option>
          </select>
        </div>

        <div className="veld">
          <label htmlFor="weergaveType">{dictionary.displayType}</label>
          <select
            id="weergaveType"
            name="weergaveType"
            defaultValue={packageType?.weergaveType ?? "PAKKET"}
          >
            <option value="PAKKET">{dictionary.bundlePackage}</option>
            <option value="STEMPELKAART">{dictionary.stampCard}</option>
          </select>
        </div>

        <div className="veld-groot">
          <label htmlFor="omschrijving">{dictionary.descriptionOptional}</label>
          <textarea
            id="omschrijving"
            name="omschrijving"
            defaultValue={packageType?.omschrijving ?? ""}
            placeholder={dictionary.descriptionPlaceholder}
          />
        </div>
      </div>

      <SubmitButton label={submitLabel} bezigLabel={dictionary.saving} />
    </form>
  );
}
