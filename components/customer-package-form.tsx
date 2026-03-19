"use client";

import { useState } from "react";
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
    weergaveType: "PAKKET" | "STEMPELKAART";
  }>;
};

export function CustomerPackageForm({
  customerId,
  action,
  packageTypes
}: CustomerPackageFormProps) {
  const [state, formAction] = useActionState(action, initialState);
  const [invoerType, setInvoerType] = useState<"NIEUW" | "OVERNAME">("NIEUW");

  return (
    <form action={formAction} className="formulier">
      <input type="hidden" name="customerId" value={customerId} />
      <FormMessage error={state.error} success={state.success} />

      <div className="formulier-grid">
        <div className="veld-groot">
          <label htmlFor="invoerType">Type invoer</label>
          <select
            id="invoerType"
            name="invoerType"
            value={invoerType}
            onChange={(event) => setInvoerType(event.target.value as "NIEUW" | "OVERNAME")}
          >
            <option value="NIEUW">Nieuw verkocht pakket</option>
            <option value="OVERNAME">Bestaande kaart overnemen</option>
          </select>
          <p className="subtitel" style={{ marginTop: 8 }}>
            Gebruik <strong>bestaande kaart overnemen</strong> als je een papieren stempelkaart of bundel
            met alleen de huidige stand wilt invoeren.
          </p>
        </div>

        <div className="veld-groot">
          <label htmlFor="packageTypeId">Pakkettype</label>
          <select id="packageTypeId" name="packageTypeId" required defaultValue="">
            <option value="" disabled>
              Kies een pakket
            </option>
            {packageTypes.map((packageType) => (
              <option key={packageType.id} value={packageType.id}>
                {packageType.naam} ({packageType.totaalBeurten} beurten,{" "}
                {packageType.weergaveType === "STEMPELKAART"
                  ? "digitale stempelkaart"
                  : "bundelpakket"}
                )
              </option>
            ))}
          </select>
        </div>

        {invoerType === "OVERNAME" ? (
          <div className="veld">
            <label htmlFor="resterendeBeurten">Nog resterende beurten</label>
            <input
              id="resterendeBeurten"
              name="resterendeBeurten"
              type="number"
              min="0"
              placeholder="Bijvoorbeeld 4"
              required
            />
          </div>
        ) : null}

        <div className="veld-groot">
          <label htmlFor="notities">Notities (optioneel)</label>
          <textarea
            id="notities"
            name="notities"
            placeholder={
              invoerType === "OVERNAME"
                ? "Bijvoorbeeld overgenomen van papieren stempelkaart."
                : "Bijvoorbeeld verkocht als bundel voor vaste klant."
            }
          />
        </div>
      </div>

      <SubmitButton
        label={invoerType === "OVERNAME" ? "Kaart overnemen" : "Pakket verkopen"}
        bezigLabel={invoerType === "OVERNAME" ? "Overnemen..." : "Verkopen..."}
      />
    </form>
  );
}
