"use client";

import { useActionState } from "react";
import type { FormState } from "@/components/customer-form";
import { FormMessage } from "@/components/form-message";
import { SubmitButton } from "@/components/submit-button";

const initialState: FormState = {};

type CustomerPackageCorrectionFormProps = {
  customerPackageId: number;
  action: (state: FormState, formData: FormData) => Promise<FormState>;
};

export function CustomerPackageCorrectionForm({
  customerPackageId,
  action
}: CustomerPackageCorrectionFormProps) {
  const [state, formAction] = useActionState(action, initialState);

  return (
    <form action={formAction} className="formulier" style={{ marginTop: 14 }}>
      <input type="hidden" name="customerPackageId" value={customerPackageId} />
      <FormMessage error={state.error} success={state.success} />

      <div className="formulier-grid">
        <div className="veld">
          <label htmlFor={`richting-${customerPackageId}`}>Correctie</label>
          <select id={`richting-${customerPackageId}`} name="richting" defaultValue="AFBOEKEN">
            <option value="AFBOEKEN">Beurt handmatig afboeken</option>
            <option value="TERUGZETTEN">Beurt terugzetten</option>
          </select>
        </div>

        <div className="veld">
          <label htmlFor={`aantal-${customerPackageId}`}>Aantal beurten</label>
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
          <label htmlFor={`notitie-${customerPackageId}`}>Reden van correctie</label>
          <textarea
            id={`notitie-${customerPackageId}`}
            name="notitie"
            placeholder="Bijvoorbeeld vergeten af te boeken op papieren kaart."
            required
          />
        </div>
      </div>

      <SubmitButton label="Correctie opslaan" bezigLabel="Opslaan..." />
    </form>
  );
}
