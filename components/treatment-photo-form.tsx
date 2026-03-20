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
  dictionary?: {
    photo: string;
    photoType: string;
    before: string;
    after: string;
    general: string;
    noteOptional: string;
    notePlaceholder: string;
    consentHint: string;
    upload: string;
    uploading: string;
  };
};

const defaultDictionary = {
  photo: "Foto",
  photoType: "Soort foto",
  before: "Voor",
  after: "Na",
  general: "Algemeen",
  noteOptional: "Notitie (optioneel)",
  notePlaceholder: "Bijvoorbeeld frontaal resultaat of beginsituatie bij intake.",
  consentHint:
    "Upload alleen foto's waarvoor de klant toestemming heeft gegeven. Toegestane formaten: JPG, PNG en WEBP tot 5 MB.",
  upload: "Foto uploaden",
  uploading: "Uploaden..."
};

export function TreatmentPhotoForm({
  customerId,
  treatmentId,
  action,
  dictionary = defaultDictionary
}: TreatmentPhotoFormProps) {
  const [state, formAction] = useActionState(action, initialState);

  return (
    <form action={formAction} className="formulier">
      <input type="hidden" name="customerId" value={customerId} />
      <input type="hidden" name="treatmentId" value={treatmentId} />
      <FormMessage error={state.error} success={state.success} />

      <div className="formulier-grid">
        <div className="veld-groot">
          <label htmlFor="bestand">{dictionary.photo}</label>
          <input
            id="bestand"
            name="bestand"
            type="file"
            accept="image/jpeg,image/png,image/webp"
            required
          />
        </div>

        <div className="veld">
          <label htmlFor="soort">{dictionary.photoType}</label>
          <select id="soort" name="soort" defaultValue="ALGEMEEN">
            <option value="VOOR">{dictionary.before}</option>
            <option value="NA">{dictionary.after}</option>
            <option value="ALGEMEEN">{dictionary.general}</option>
          </select>
        </div>

        <div className="veld-groot">
          <label htmlFor="notitie">{dictionary.noteOptional}</label>
          <textarea
            id="notitie"
            name="notitie"
            placeholder={dictionary.notePlaceholder}
          />
        </div>
      </div>

      <p className="subtitel" style={{ marginTop: 0 }}>{dictionary.consentHint}</p>

      <SubmitButton label={dictionary.upload} bezigLabel={dictionary.uploading} />
    </form>
  );
}
