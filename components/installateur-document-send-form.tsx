"use client";

import { useActionState } from "react";
import { FormMessage } from "@/components/form-message";
import { SubmitButton } from "@/components/submit-button";
import type { InstallateurDocumentFormState } from "@/app/platform/[id]/installateurs/actions";

const initialState: InstallateurDocumentFormState = {};

type Option = {
  id: number;
  label: string;
};

type InstallateurDocumentSendFormProps = {
  salonId: number;
  fieldName: string;
  label: string;
  emptyLabel: string;
  submitLabel: string;
  submitBusyLabel: string;
  options: Option[];
  action: (
    state: InstallateurDocumentFormState,
    formData: FormData
  ) => Promise<InstallateurDocumentFormState>;
};

export function InstallateurDocumentSendForm({
  salonId,
  fieldName,
  label,
  emptyLabel,
  submitLabel,
  submitBusyLabel,
  options,
  action
}: InstallateurDocumentSendFormProps) {
  const [state, formAction] = useActionState(action, initialState);

  return (
    <form action={formAction} className="formulier">
      <input type="hidden" name="salonId" value={salonId} />
      <FormMessage error={state.error} success={state.success} />

      <div className="formulier-grid">
        <div className="veld-groot">
          <label htmlFor={fieldName}>{label}</label>
          <select id={fieldName} name={fieldName} defaultValue="" required>
            <option value="" disabled>
              {emptyLabel}
            </option>
            {options.map((option) => (
              <option key={option.id} value={option.id}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      <SubmitButton label={submitLabel} bezigLabel={submitBusyLabel} />
    </form>
  );
}
