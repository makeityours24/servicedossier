"use client";

import { useActionState } from "react";
import type { FormState } from "@/components/customer-form";
import { FormMessage } from "@/components/form-message";
import { SubmitButton } from "@/components/submit-button";

const initialState: FormState = {};

type RecipeTemplateFormProps = {
  action: (state: FormState, formData: FormData) => Promise<FormState>;
  submitLabel?: string;
  template?: {
    id: number;
    naam: string;
    behandeling: string;
    recept: string;
    notities?: string | null;
  };
};

export function RecipeTemplateForm({
  action,
  submitLabel = "Sjabloon opslaan",
  template
}: RecipeTemplateFormProps) {
  const [state, formAction] = useActionState(action, initialState);

  return (
    <form action={formAction} className="formulier">
      {template ? <input type="hidden" name="templateId" value={template.id} /> : null}
      <FormMessage error={state.error} success={state.success} />

      <div className="formulier-grid">
        <div className="veld">
          <label htmlFor="naam">Naam sjabloon</label>
          <input
            id="naam"
            name="naam"
            defaultValue={template?.naam}
            placeholder="Bijvoorbeeld Uitgroei basis blond"
            required
          />
        </div>

        <div className="veld-groot">
          <label htmlFor="behandeling">Behandeling</label>
          <input
            id="behandeling"
            name="behandeling"
            defaultValue={template?.behandeling}
            placeholder="Bijvoorbeeld Uitgroei kleuren"
            required
          />
        </div>

        <div className="veld-groot">
          <label htmlFor="recept">Recept</label>
          <textarea
            id="recept"
            name="recept"
            defaultValue={template?.recept}
            placeholder="Bijvoorbeeld 7.0 + 7.1, 3% oxidatie, 25 minuten"
            required
          />
        </div>

        <div className="veld-groot">
          <label htmlFor="notities">Notities (optioneel)</label>
          <textarea
            id="notities"
            name="notities"
            defaultValue={template?.notities ?? ""}
            placeholder="Extra uitleg of wanneer dit sjabloon handig is"
          />
        </div>
      </div>

      <SubmitButton label={submitLabel} bezigLabel="Opslaan..." />
    </form>
  );
}
