"use client";

import { useActionState } from "react";
import type { FormState } from "@/components/customer-form";
import { FormMessage } from "@/components/form-message";
import { SubmitButton } from "@/components/submit-button";

const initialState: FormState = {};

type AppointmentFormProps = {
  action: (state: FormState, formData: FormData) => Promise<FormState>;
  submitLabel?: string;
  customers: Array<{
    id: number;
    naam: string;
  }>;
  medewerkers: Array<{
    id: number;
    naam: string;
  }>;
  appointment?: {
    id: number;
    customerId: number;
    userId?: number | null;
    datumStart: string;
    datumEinde: string;
    behandeling: string;
    notities?: string | null;
    status: "GEPLAND" | "VOLTOOID" | "GEANNULEERD" | "NIET_GEKOMEN";
  };
};

export function AppointmentForm({
  action,
  submitLabel = "Afspraak opslaan",
  customers,
  medewerkers,
  appointment
}: AppointmentFormProps) {
  const [state, formAction] = useActionState(action, initialState);

  return (
    <form action={formAction} className="formulier">
      {appointment ? <input type="hidden" name="appointmentId" value={appointment.id} /> : null}
      <FormMessage error={state.error} success={state.success} />

      <div className="formulier-grid">
        <div className="veld">
          <label htmlFor="customerId">Klant</label>
          <select id="customerId" name="customerId" defaultValue={appointment?.customerId ?? ""} required>
            <option value="" disabled>
              Kies een klant
            </option>
            {customers.map((customer) => (
              <option key={customer.id} value={customer.id}>
                {customer.naam}
              </option>
            ))}
          </select>
        </div>

        <div className="veld">
          <label htmlFor="userId">Behandelaar (optioneel)</label>
          <select id="userId" name="userId" defaultValue={appointment?.userId ?? ""}>
            <option value="">Nog niet toegewezen</option>
            {medewerkers.map((medewerker) => (
              <option key={medewerker.id} value={medewerker.id}>
                {medewerker.naam}
              </option>
            ))}
          </select>
        </div>

        <div className="veld">
          <label htmlFor="datumStart">Starttijd</label>
          <input
            id="datumStart"
            name="datumStart"
            type="datetime-local"
            defaultValue={appointment?.datumStart}
            required
          />
        </div>

        <div className="veld">
          <label htmlFor="datumEinde">Eindtijd</label>
          <input
            id="datumEinde"
            name="datumEinde"
            type="datetime-local"
            defaultValue={appointment?.datumEinde}
            required
          />
        </div>

        <div className="veld-groot">
          <label htmlFor="behandeling">Behandeling</label>
          <input
            id="behandeling"
            name="behandeling"
            defaultValue={appointment?.behandeling}
            placeholder="Bijvoorbeeld Uitgroei kleuren"
            required
          />
        </div>

        <div className="veld">
          <label htmlFor="status">Status</label>
          <select id="status" name="status" defaultValue={appointment?.status ?? "GEPLAND"}>
            <option value="GEPLAND">Gepland</option>
            <option value="VOLTOOID">Voltooid</option>
            <option value="GEANNULEERD">Geannuleerd</option>
            <option value="NIET_GEKOMEN">Niet gekomen</option>
          </select>
        </div>

        <div className="veld-groot">
          <label htmlFor="notities">Notities (optioneel)</label>
          <textarea
            id="notities"
            name="notities"
            defaultValue={appointment?.notities ?? ""}
            placeholder="Bijvoorbeeld klant wil iets warmer resultaat of liever in de ochtend."
          />
        </div>
      </div>

      <SubmitButton label={submitLabel} bezigLabel="Opslaan..." />
    </form>
  );
}
