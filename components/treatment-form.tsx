"use client";

import { useActionState, useEffect, useState } from "react";
import { FormMessage } from "@/components/form-message";
import { SubmitButton } from "@/components/submit-button";
import type { FormState } from "@/components/customer-form";

const initialState: FormState = {};

type TreatmentFormProps = {
  customerId: number;
  medewerkerNaam: string;
  action: (state: FormState, formData: FormData) => Promise<FormState>;
  submitLabel?: string;
  treatment?: {
    id?: number;
    appointmentId?: number | null;
    datum: string;
    behandeling: string;
    recept: string;
    behandelaar: string;
    notities?: string | null;
    customerPackageId?: number | null;
  };
  helperText?: string;
  treatmentPresets?: readonly string[];
  activePackages?: Array<{
    id: number;
    naamSnapshot: string;
    weergaveTypeSnapshot?: "PAKKET" | "STEMPELKAART";
    resterendeBeurten: number;
    totaalBeurten: number;
  }>;
};

export function TreatmentForm({
  customerId,
  medewerkerNaam,
  action,
  submitLabel = "Behandeling opslaan",
  treatment,
  helperText,
  treatmentPresets = [],
  activePackages = []
}: TreatmentFormProps) {
  const [state, formAction] = useActionState(action, initialState);
  const vandaag = new Date().toISOString().slice(0, 16);
  const [datum, setDatum] = useState(treatment?.datum ?? vandaag);
  const [behandelaar, setBehandelaar] = useState(treatment?.behandelaar ?? medewerkerNaam);
  const [behandeling, setBehandeling] = useState(treatment?.behandeling ?? "");
  const [recept, setRecept] = useState(treatment?.recept ?? "");
  const [notities, setNotities] = useState(treatment?.notities ?? "");
  const [customerPackageId, setCustomerPackageId] = useState(
    treatment?.customerPackageId ? String(treatment.customerPackageId) : ""
  );
  const draftKey = `salondossier:treatment-form:${customerId}:${treatment?.id ?? treatment?.appointmentId ?? "new"}`;

  useEffect(() => {
    const savedDraft = window.sessionStorage.getItem(draftKey);

    if (savedDraft) {
      try {
        const parsed = JSON.parse(savedDraft) as {
          datum?: string;
          behandelaar?: string;
          behandeling?: string;
          recept?: string;
          notities?: string;
          customerPackageId?: string;
        };

        setDatum(parsed.datum ?? treatment?.datum ?? vandaag);
        setBehandelaar(parsed.behandelaar ?? treatment?.behandelaar ?? medewerkerNaam);
        setBehandeling(parsed.behandeling ?? treatment?.behandeling ?? "");
        setRecept(parsed.recept ?? treatment?.recept ?? "");
        setNotities(parsed.notities ?? treatment?.notities ?? "");
        setCustomerPackageId(
          parsed.customerPackageId ?? (treatment?.customerPackageId ? String(treatment.customerPackageId) : "")
        );
        return;
      } catch {
        window.sessionStorage.removeItem(draftKey);
      }
    }

    setDatum(treatment?.datum ?? vandaag);
    setBehandelaar(treatment?.behandelaar ?? medewerkerNaam);
    setBehandeling(treatment?.behandeling ?? "");
    setRecept(treatment?.recept ?? "");
    setNotities(treatment?.notities ?? "");
    setCustomerPackageId(treatment?.customerPackageId ? String(treatment.customerPackageId) : "");
  }, [draftKey, medewerkerNaam, treatment, vandaag]);

  useEffect(() => {
    window.sessionStorage.setItem(
      draftKey,
      JSON.stringify({
        datum,
        behandelaar,
        behandeling,
        recept,
        notities,
        customerPackageId
      })
    );
  }, [behandeling, behandelaar, customerPackageId, datum, draftKey, notities, recept]);

  useEffect(() => {
    if (state.success) {
      window.sessionStorage.removeItem(draftKey);
    }
  }, [draftKey, state.success]);

  return (
    <form action={formAction} className="formulier">
      <input type="hidden" name="customerId" value={customerId} />
      {treatment?.id ? <input type="hidden" name="treatmentId" value={treatment.id} /> : null}
      {treatment?.appointmentId ? (
        <input type="hidden" name="appointmentId" value={treatment.appointmentId} />
      ) : null}
      <FormMessage error={state.error} success={state.success} />
      {helperText ? <p className="subtitel" style={{ marginTop: 0 }}>{helperText}</p> : null}
      <div>
        <p className="meta" style={{ marginBottom: 12 }}>
          Snelle keuze voor veelgebruikte behandelingen:
        </p>
        <div className="acties">
          {treatmentPresets.map((preset) => (
            <button
              key={preset}
              type="button"
              className={behandeling === preset ? "knop" : "knop-zacht"}
              onClick={() => setBehandeling(preset)}
            >
              {preset}
            </button>
          ))}
        </div>
      </div>

      <div className="formulier-grid">
        <div className="veld">
          <label htmlFor="datum">Datum en tijd</label>
          <input
            id="datum"
            name="datum"
            type="datetime-local"
            value={datum}
            onChange={(event) => setDatum(event.target.value)}
            required
          />
        </div>

        <div className="veld">
          <label htmlFor="behandelaar">Naam behandelaar</label>
          <input
            id="behandelaar"
            name="behandelaar"
            value={behandelaar}
            onChange={(event) => setBehandelaar(event.target.value)}
            required
          />
        </div>

        <div className="veld-groot">
          <label htmlFor="behandeling">Behandeling</label>
          <input
            id="behandeling"
            name="behandeling"
            placeholder="Bijvoorbeeld uitgroei kleuren"
            value={behandeling}
            onChange={(event) => setBehandeling(event.target.value)}
            required
          />
        </div>

        <div className="veld-groot">
          <label htmlFor="recept">Recept</label>
          <textarea
            id="recept"
            name="recept"
            placeholder="Bijvoorbeeld 7.0 + 7.1, 3% oxidatie, 25 minuten"
            value={recept}
            onChange={(event) => setRecept(event.target.value)}
            required
          />
        </div>

        <div className="veld-groot">
          <label htmlFor="notities">Notities (optioneel)</label>
          <textarea
            id="notities"
            name="notities"
            placeholder="Extra opmerkingen of advies"
            value={notities}
            onChange={(event) => setNotities(event.target.value)}
          />
        </div>

        <div className="veld-groot">
          <label htmlFor="customerPackageId">Afboeken van pakket (optioneel)</label>
          <select
            id="customerPackageId"
            name="customerPackageId"
            value={customerPackageId}
            onChange={(event) => setCustomerPackageId(event.target.value)}
          >
            <option value="">Geen pakket gebruiken</option>
            {activePackages.map((customerPackage) => (
              <option key={customerPackage.id} value={customerPackage.id}>
                {customerPackage.naamSnapshot} - nog {customerPackage.resterendeBeurten} van{" "}
                {customerPackage.totaalBeurten} (
                {customerPackage.weergaveTypeSnapshot === "STEMPELKAART"
                  ? "stempelkaart"
                  : "pakket"}
                )
              </option>
            ))}
          </select>
        </div>
      </div>

      <SubmitButton label={submitLabel} bezigLabel="Opslaan..." />
    </form>
  );
}
