"use client";

import { useActionState } from "react";
import type { FormState } from "@/components/customer-form";
import { FormMessage } from "@/components/form-message";
import { SubmitButton } from "@/components/submit-button";

const initialState: FormState = {};

type TreatmentPhotoFormProps = {
  customerId: number;
  treatmentId: number;
  action: (state: FormState, formData: FormData) => Promise<FormState>;
};

export function TreatmentPhotoForm({
  customerId,
  treatmentId,
  action
}: TreatmentPhotoFormProps) {
  const [state, formAction] = useActionState(action, initialState);

  return (
    <form action={formAction} className="formulier">
      <input type="hidden" name="customerId" value={customerId} />
      <input type="hidden" name="treatmentId" value={treatmentId} />
      <FormMessage error={state.error} success={state.success} />

      <div className="formulier-grid">
        <div className="veld-groot">
          <label htmlFor="bestand">Foto</label>
          <input
            id="bestand"
            name="bestand"
            type="file"
            accept="image/jpeg,image/png,image/webp"
            required
          />
        </div>

        <div className="veld">
          <label htmlFor="soort">Soort foto</label>
          <select id="soort" name="soort" defaultValue="ALGEMEEN">
            <option value="VOOR">Voor</option>
            <option value="NA">Na</option>
            <option value="ALGEMEEN">Algemeen</option>
          </select>
        </div>

        <div className="veld-groot">
          <label htmlFor="notitie">Notitie (optioneel)</label>
          <textarea
            id="notitie"
            name="notitie"
            placeholder="Bijvoorbeeld frontaal resultaat of beginsituatie bij intake."
          />
        </div>
      </div>

      <p className="subtitel" style={{ marginTop: 0 }}>
        Upload alleen foto&apos;s waarvoor de klant toestemming heeft gegeven. Toegestane formaten:
        JPG, PNG en WEBP tot 5 MB.
      </p>

      <SubmitButton label="Foto uploaden" bezigLabel="Uploaden..." />
    </form>
  );
}
