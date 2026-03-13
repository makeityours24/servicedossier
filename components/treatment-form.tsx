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
    datum: string;
    behandeling: string;
    recept: string;
    behandelaar: string;
    notities?: string | null;
  };
  helperText?: string;
  treatmentPresets?: readonly string[];
};

export function TreatmentForm({
  customerId,
  medewerkerNaam,
  action,
  submitLabel = "Behandeling opslaan",
  treatment,
  helperText,
  treatmentPresets = []
}: TreatmentFormProps) {
  const [state, formAction] = useActionState(action, initialState);
  const vandaag = new Date().toISOString().slice(0, 16);
  const [datum, setDatum] = useState(treatment?.datum ?? vandaag);
  const [behandelaar, setBehandelaar] = useState(treatment?.behandelaar ?? medewerkerNaam);
  const [behandeling, setBehandeling] = useState(treatment?.behandeling ?? "");
  const [recept, setRecept] = useState(treatment?.recept ?? "");
  const [notities, setNotities] = useState(treatment?.notities ?? "");

  useEffect(() => {
    setDatum(treatment?.datum ?? vandaag);
    setBehandelaar(treatment?.behandelaar ?? medewerkerNaam);
    setBehandeling(treatment?.behandeling ?? "");
    setRecept(treatment?.recept ?? "");
    setNotities(treatment?.notities ?? "");
  }, [medewerkerNaam, treatment, vandaag]);

  return (
    <form action={formAction} className="formulier">
      <input type="hidden" name="customerId" value={customerId} />
      {treatment?.id ? <input type="hidden" name="treatmentId" value={treatment.id} /> : null}
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
      </div>

      <SubmitButton label={submitLabel} bezigLabel="Opslaan..." />
    </form>
  );
}
