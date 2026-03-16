"use client";

import { useActionState } from "react";
import type { FormState } from "@/components/customer-form";
import { FormMessage } from "@/components/form-message";
import { SubmitButton } from "@/components/submit-button";

const initialState: FormState = {};

type CustomerPackageFormProps = {
  customerId: number;
  action: (state: FormState, formData: FormData) => Promise<FormState>;
  packageTypes: Array<{
    id: number;
    naam: string;
    totaalBeurten: number;
  }>;
};

export function CustomerPackageForm({
  customerId,
  action,
  packageTypes
}: CustomerPackageFormProps) {
  const [state, formAction] = useActionState(action, initialState);

  return (
    <form action={formAction} className="formulier">
      <input type="hidden" name="customerId" value={customerId} />
      <FormMessage error={state.error} success={state.success} />

      <div className="formulier-grid">
        <div className="veld-groot">
          <label htmlFor="packageTypeId">Pakkettype</label>
          <select id="packageTypeId" name="packageTypeId" required defaultValue="">
            <option value="" disabled>
              Kies een pakket
            </option>
            {packageTypes.map((packageType) => (
              <option key={packageType.id} value={packageType.id}>
                {packageType.naam} ({packageType.totaalBeurten} beurten)
              </option>
            ))}
          </select>
        </div>

        <div className="veld-groot">
          <label htmlFor="notities">Notities (optioneel)</label>
          <textarea
            id="notities"
            name="notities"
            placeholder="Bijvoorbeeld verkocht als bundel voor vaste klant."
          />
        </div>
      </div>

      <SubmitButton label="Pakket verkopen" bezigLabel="Verkopen..." />
    </form>
  );
}
