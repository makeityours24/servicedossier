"use client";

import { useEffect, useState } from "react";
import { useActionState } from "react";
import type { FormState } from "@/components/customer-form";
import { FormMessage } from "@/components/form-message";
import { SubmitButton } from "@/components/submit-button";

const initialState: FormState = {};

type AppointmentFormProps = {
  action: (state: FormState, formData: FormData) => Promise<FormState>;
  submitLabel?: string;
  preselectedCustomerId?: number | null;
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
    duurMinuten: number;
    behandeling: string;
    behandelingKleur: string;
    notities?: string | null;
    status: "GEPLAND" | "VOLTOOID" | "GEANNULEERD" | "NIET_GEKOMEN";
  };
};

function toDateTimeLocalValue(date: Date) {
  return new Date(date.getTime() - date.getTimezoneOffset() * 60000).toISOString().slice(0, 16);
}

function buildEndDateTimeValue(startValue: string, duurMinuten: number) {
  if (!startValue) {
    return "";
  }

  const start = new Date(startValue);
  if (Number.isNaN(start.getTime())) {
    return "";
  }

  return toDateTimeLocalValue(new Date(start.getTime() + duurMinuten * 60000));
}

export function AppointmentForm({
  action,
  submitLabel = "Afspraak opslaan",
  preselectedCustomerId,
  customers,
  medewerkers,
  appointment
}: AppointmentFormProps) {
  const [state, formAction] = useActionState(action, initialState);
  const [datumStart, setDatumStart] = useState(appointment?.datumStart ?? "");
  const [duurMinuten, setDuurMinuten] = useState(String(appointment?.duurMinuten ?? 30));
  const [datumEindePreview, setDatumEindePreview] = useState(
    buildEndDateTimeValue(appointment?.datumStart ?? "", appointment?.duurMinuten ?? 30)
  );

  useEffect(() => {
    const duur = Number(duurMinuten) || 0;
    setDatumEindePreview(buildEndDateTimeValue(datumStart, duur));
  }, [datumStart, duurMinuten]);

  return (
    <form action={formAction} className="formulier">
      {appointment ? <input type="hidden" name="appointmentId" value={appointment.id} /> : null}
      <FormMessage error={state.error} success={state.success} />

      <div className="formulier-grid">
        <div className="veld">
          <label htmlFor="customerId">Klant</label>
          <select
            id="customerId"
            name="customerId"
            defaultValue={appointment?.customerId ?? preselectedCustomerId ?? ""}
            required
          >
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
            onChange={(event) => setDatumStart(event.target.value)}
            required
          />
        </div>

        <div className="veld">
          <label htmlFor="duurMinuten">Duur</label>
          <select
            id="duurMinuten"
            name="duurMinuten"
            defaultValue={String(appointment?.duurMinuten ?? 30)}
            onChange={(event) => setDuurMinuten(event.target.value)}
          >
            <option value="15">15 minuten</option>
            <option value="30">30 minuten</option>
            <option value="45">45 minuten</option>
            <option value="60">60 minuten</option>
            <option value="90">90 minuten</option>
            <option value="120">120 minuten</option>
            <option value="150">150 minuten</option>
            <option value="180">180 minuten</option>
          </select>
        </div>

        <div className="veld">
          <label htmlFor="datumEindePreview">Eindtijd</label>
          <input
            id="datumEindePreview"
            type="datetime-local"
            value={datumEindePreview}
            readOnly
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
          <label htmlFor="behandelingKleur">Kleur in agenda</label>
          <input
            id="behandelingKleur"
            name="behandelingKleur"
            type="color"
            defaultValue={appointment?.behandelingKleur ?? "#B42323"}
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
