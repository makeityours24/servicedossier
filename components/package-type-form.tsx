"use client";

import { useActionState } from "react";
import type { FormState } from "@/components/customer-form";
import { FormMessage } from "@/components/form-message";
import { SubmitButton } from "@/components/submit-button";

const initialState: FormState = {};

type PackageTypeFormProps = {
  action: (state: FormState, formData: FormData) => Promise<FormState>;
  submitLabel?: string;
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

function centsToEuroValue(value: number) {
  return (value / 100).toFixed(2);
}

export function PackageTypeForm({
  action,
  submitLabel = "Pakket opslaan",
  packageType
}: PackageTypeFormProps) {
  const [state, formAction] = useActionState(action, initialState);

  return (
    <form action={formAction} className="formulier">
      {packageType ? <input type="hidden" name="packageTypeId" value={packageType.id} /> : null}
      <FormMessage error={state.error} success={state.success} />

      <div className="formulier-grid">
        <div className="veld">
          <label htmlFor="naam">Naam pakket</label>
          <input
            id="naam"
            name="naam"
            defaultValue={packageType?.naam}
            placeholder="Bijvoorbeeld 5x epileren"
            required
          />
        </div>

        <div className="veld">
          <label htmlFor="standaardBehandeling">Standaardbehandeling</label>
          <input
            id="standaardBehandeling"
            name="standaardBehandeling"
            defaultValue={packageType?.standaardBehandeling}
            placeholder="Bijvoorbeeld Epileren"
            required
          />
        </div>

        <div className="veld">
          <label htmlFor="totaalBeurten">Aantal beurten</label>
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
          <label htmlFor="pakketPrijs">Pakketprijs</label>
          <input
            id="pakketPrijs"
            name="pakketPrijs"
            type="number"
            min="0.01"
            step="0.01"
            defaultValue={packageType ? centsToEuroValue(packageType.pakketPrijsCents) : ""}
            placeholder="Bijvoorbeeld 30,00"
            required
          />
        </div>

        <div className="veld">
          <label htmlFor="lossePrijs">Losse prijs</label>
          <input
            id="lossePrijs"
            name="lossePrijs"
            type="number"
            min="0.01"
            step="0.01"
            defaultValue={packageType ? centsToEuroValue(packageType.lossePrijsCents) : ""}
            placeholder="Bijvoorbeeld 7,50"
            required
          />
        </div>

        <div className="veld">
          <label htmlFor="isActief">Status</label>
          <select
            id="isActief"
            name="isActief"
            defaultValue={packageType ? String(packageType.isActief) : "true"}
          >
            <option value="true">Actief</option>
            <option value="false">Inactief</option>
          </select>
        </div>

        <div className="veld">
          <label htmlFor="weergaveType">Weergavetype</label>
          <select
            id="weergaveType"
            name="weergaveType"
            defaultValue={packageType?.weergaveType ?? "PAKKET"}
          >
            <option value="PAKKET">Bundelpakket</option>
            <option value="STEMPELKAART">Digitale stempelkaart</option>
          </select>
        </div>

        <div className="veld-groot">
          <label htmlFor="omschrijving">Omschrijving (optioneel)</label>
          <textarea
            id="omschrijving"
            name="omschrijving"
            defaultValue={packageType?.omschrijving ?? ""}
            placeholder="Bijvoorbeeld voordeliger bundelpakket voor vaste klanten."
          />
        </div>
      </div>

      <SubmitButton label={submitLabel} bezigLabel="Opslaan..." />
    </form>
  );
}
