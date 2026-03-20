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
  dictionary?: {
    inputType: string;
    newSoldPackage: string;
    carryOverCard: string;
    carryOverHelp: string;
    packageType: string;
    choosePackage: string;
    stampCard: string;
    bundlePackage: string;
    remainingSessions: string;
    remainingSessionsPlaceholder: string;
    notesOptional: string;
    carryOverNotesPlaceholder: string;
    soldNotesPlaceholder: string;
    takeOverCard: string;
    takingOver: string;
    sellPackage: string;
    selling: string;
  };
  packageTypes: Array<{
    id: number;
    naam: string;
    totaalBeurten: number;
    weergaveType: "PAKKET" | "STEMPELKAART";
  }>;
};

const defaultDictionary = {
  inputType: "Type invoer",
  newSoldPackage: "Nieuw verkocht pakket",
  carryOverCard: "Bestaande kaart overnemen",
  carryOverHelp:
    "Gebruik bestaande kaart overnemen als je een papieren stempelkaart of bundel met alleen de huidige stand wilt invoeren.",
  packageType: "Pakkettype",
  choosePackage: "Kies een pakket",
  stampCard: "digitale stempelkaart",
  bundlePackage: "bundelpakket",
  remainingSessions: "Nog resterende beurten",
  remainingSessionsPlaceholder: "Bijvoorbeeld 4",
  notesOptional: "Notities (optioneel)",
  carryOverNotesPlaceholder: "Bijvoorbeeld overgenomen van papieren stempelkaart.",
  soldNotesPlaceholder: "Bijvoorbeeld verkocht als bundel voor vaste klant.",
  takeOverCard: "Kaart overnemen",
  takingOver: "Overnemen...",
  sellPackage: "Pakket verkopen",
  selling: "Verkopen..."
};

export function CustomerPackageForm({
  customerId,
  action,
  dictionary = defaultDictionary,
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
          <label htmlFor="invoerType">{dictionary.inputType}</label>
          <select
            id="invoerType"
            name="invoerType"
            value={invoerType}
            onChange={(event) => setInvoerType(event.target.value as "NIEUW" | "OVERNAME")}
          >
            <option value="NIEUW">{dictionary.newSoldPackage}</option>
            <option value="OVERNAME">{dictionary.carryOverCard}</option>
          </select>
          <p className="subtitel" style={{ marginTop: 8 }}>
            {dictionary.carryOverHelp}
          </p>
        </div>

        <div className="veld-groot">
          <label htmlFor="packageTypeId">{dictionary.packageType}</label>
          <select id="packageTypeId" name="packageTypeId" required defaultValue="">
            <option value="" disabled>
              {dictionary.choosePackage}
            </option>
            {packageTypes.map((packageType) => (
              <option key={packageType.id} value={packageType.id}>
                {packageType.naam} ({packageType.totaalBeurten} beurten,{" "}
                {packageType.weergaveType === "STEMPELKAART"
                  ? dictionary.stampCard
                  : dictionary.bundlePackage}
                )
              </option>
            ))}
          </select>
        </div>

        {invoerType === "OVERNAME" ? (
          <div className="veld">
            <label htmlFor="resterendeBeurten">{dictionary.remainingSessions}</label>
            <input
              id="resterendeBeurten"
              name="resterendeBeurten"
              type="number"
              min="0"
              placeholder={dictionary.remainingSessionsPlaceholder}
              required
            />
          </div>
        ) : null}

        <div className="veld-groot">
          <label htmlFor="notities">{dictionary.notesOptional}</label>
          <textarea
            id="notities"
            name="notities"
            placeholder={
              invoerType === "OVERNAME"
                ? dictionary.carryOverNotesPlaceholder
                : dictionary.soldNotesPlaceholder
            }
          />
        </div>
      </div>

      <SubmitButton
        label={invoerType === "OVERNAME" ? dictionary.takeOverCard : dictionary.sellPackage}
        bezigLabel={invoerType === "OVERNAME" ? dictionary.takingOver : dictionary.selling}
      />
    </form>
  );
}
