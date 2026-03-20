"use client";

import { useActionState } from "react";
import type { FormState } from "@/components/customer-form";
import { FormMessage } from "@/components/form-message";
import { SubmitButton } from "@/components/submit-button";

const initialState: FormState = {};

type CustomerPackageCorrectionFormProps = {
  customerPackageId: number;
  action: (state: FormState, formData: FormData) => Promise<FormState>;
  dictionary?: {
    correction: string;
    deductManually: string;
    restoreSession: string;
    sessionCount: string;
    correctionReason: string;
    reasonPlaceholder: string;
    save: string;
    saving: string;
  };
};

const defaultDictionary = {
  correction: "Correctie",
  deductManually: "Beurt handmatig afboeken",
  restoreSession: "Beurt terugzetten",
  sessionCount: "Aantal beurten",
  correctionReason: "Reden van correctie",
  reasonPlaceholder: "Bijvoorbeeld vergeten af te boeken op papieren kaart.",
  save: "Correctie opslaan",
  saving: "Opslaan..."
};

export function CustomerPackageCorrectionForm({
  customerPackageId,
  action,
  dictionary = defaultDictionary
}: CustomerPackageCorrectionFormProps) {
  const [state, formAction] = useActionState(action, initialState);

  return (
    <form action={formAction} className="formulier" style={{ marginTop: 14 }}>
      <input type="hidden" name="customerPackageId" value={customerPackageId} />
      <FormMessage error={state.error} success={state.success} />

      <div className="formulier-grid">
        <div className="veld">
          <label htmlFor={`richting-${customerPackageId}`}>{dictionary.correction}</label>
          <select id={`richting-${customerPackageId}`} name="richting" defaultValue="AFBOEKEN">
            <option value="AFBOEKEN">{dictionary.deductManually}</option>
            <option value="TERUGZETTEN">{dictionary.restoreSession}</option>
          </select>
        </div>

        <div className="veld">
          <label htmlFor={`aantal-${customerPackageId}`}>{dictionary.sessionCount}</label>
          <input
            id={`aantal-${customerPackageId}`}
            name="aantal"
            type="number"
            min="1"
            max="20"
            defaultValue="1"
            required
          />
        </div>

        <div className="veld-groot">
          <label htmlFor={`notitie-${customerPackageId}`}>{dictionary.correctionReason}</label>
          <textarea
            id={`notitie-${customerPackageId}`}
            name="notitie"
            placeholder={dictionary.reasonPlaceholder}
            required
          />
        </div>
      </div>

      <SubmitButton label={dictionary.save} bezigLabel={dictionary.saving} />
    </form>
  );
}
