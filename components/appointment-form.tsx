"use client";

import { useEffect, useState } from "react";
import { useActionState } from "react";
import type { FormState } from "@/components/customer-form";
import { FormMessage } from "@/components/form-message";
import { SubmitButton } from "@/components/submit-button";

const initialState: FormState = {};

type AppointmentFormProps = {
  action: (state: FormState, formData: FormData) => Promise<FormState>;
  quickCreateCustomerAction?: (state: FormState, formData: FormData) => Promise<FormState>;
  submitLabel?: string;
  busyLabel?: string;
  preselectedCustomerId?: number | null;
  dictionary: {
    addCustomerInlineTitle: string;
    addCustomerInlineText: string;
    quickCustomerUnavailable: string;
    name: string;
    phone: string;
    address: string;
    addressPlaceholder: string;
    addCustomer: string;
    addingCustomer: string;
    customer: string;
    close: string;
    newCustomer: string;
    chooseCustomer: string;
    customerHint: string;
    stylistOptional: string;
    startTime: string;
    duration: string;
    endTime: string;
    treatment: string;
    treatmentPlaceholder: string;
    agendaColor: string;
    status: string;
    unassigned: string;
    statusOptions: Record<"GEPLAND" | "VOLTOOID" | "GEANNULEERD" | "NIET_GEKOMEN", string>;
    completeHint: string;
    notesOptional: string;
    notesPlaceholder: string;
    durations: Record<string, string>;
  };
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
    hasConvertedTreatment?: boolean;
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
  quickCreateCustomerAction,
  submitLabel = "Afspraak opslaan",
  busyLabel = "Opslaan...",
  preselectedCustomerId,
  dictionary,
  customers,
  medewerkers,
  appointment
}: AppointmentFormProps) {
  const [state, formAction] = useActionState(action, initialState);
  const [quickCustomerState, quickCustomerAction] = useActionState(
    quickCreateCustomerAction ?? (async () => ({ error: dictionary.quickCustomerUnavailable })),
    initialState
  );
  const [showQuickCustomerForm, setShowQuickCustomerForm] = useState(false);
  const [customerOptions, setCustomerOptions] = useState(customers);
  const [selectedCustomerId, setSelectedCustomerId] = useState(
    String(appointment?.customerId ?? preselectedCustomerId ?? "")
  );
  const [datumStart, setDatumStart] = useState(appointment?.datumStart ?? "");
  const [duurMinuten, setDuurMinuten] = useState(String(appointment?.duurMinuten ?? 30));
  const [datumEindePreview, setDatumEindePreview] = useState(
    buildEndDateTimeValue(appointment?.datumStart ?? "", appointment?.duurMinuten ?? 30)
  );

  useEffect(() => {
    const duur = Number(duurMinuten) || 0;
    setDatumEindePreview(buildEndDateTimeValue(datumStart, duur));
  }, [datumStart, duurMinuten]);

  useEffect(() => {
    setCustomerOptions(customers);
  }, [customers]);

  useEffect(() => {
    setSelectedCustomerId(String(appointment?.customerId ?? preselectedCustomerId ?? ""));
  }, [appointment?.customerId, preselectedCustomerId]);

  useEffect(() => {
    const createdCustomerId = quickCustomerState.createdCustomerId;
    const createdCustomerName = quickCustomerState.createdCustomerName;

    if (!createdCustomerId || !createdCustomerName) {
      return;
    }

    setCustomerOptions((current) => {
      if (current.some((customer) => customer.id === createdCustomerId)) {
        return current;
      }

      return [...current, { id: createdCustomerId, naam: createdCustomerName }].sort((a, b) =>
        a.naam.localeCompare(b.naam, "nl")
      );
    });
    setSelectedCustomerId(String(createdCustomerId));
    setShowQuickCustomerForm(false);
  }, [quickCustomerState.createdCustomerId, quickCustomerState.createdCustomerName]);

  const canMarkCompleted = Boolean(appointment?.hasConvertedTreatment);

  return (
    <div>
      {showQuickCustomerForm && !appointment && quickCreateCustomerAction ? (
        <section className="kaart" style={{ marginBottom: 18 }}>
          <h4 style={{ marginBottom: 8 }}>{dictionary.addCustomerInlineTitle}</h4>
          <p className="subtitel" style={{ marginBottom: 16 }}>
            {dictionary.addCustomerInlineText}
          </p>
          <form action={quickCustomerAction} className="formulier">
            <FormMessage error={quickCustomerState.error} success={quickCustomerState.success} />
            <div className="formulier-grid">
              <div className="veld">
                <label htmlFor="quick-customer-naam">{dictionary.name}</label>
                <input id="quick-customer-naam" name="naam" required />
              </div>
              <div className="veld">
                <label htmlFor="quick-customer-telefoonnummer">{dictionary.phone}</label>
                <input id="quick-customer-telefoonnummer" name="telefoonnummer" required />
              </div>
              <div className="veld-groot">
                <label htmlFor="quick-customer-adres">{dictionary.address}</label>
                <textarea
                  id="quick-customer-adres"
                  name="adres"
                  placeholder={dictionary.addressPlaceholder}
                  required
                />
              </div>
            </div>
            <SubmitButton label={dictionary.addCustomer} bezigLabel={dictionary.addingCustomer} />
          </form>
        </section>
      ) : null}

      <form action={formAction} className="formulier">
        {appointment ? <input type="hidden" name="appointmentId" value={appointment.id} /> : null}
        <FormMessage error={state.error} success={state.success} />

        <div className="formulier-grid">
          <div className="veld">
            <div className="acties" style={{ justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
              <label htmlFor="customerId" style={{ marginBottom: 0 }}>
                {dictionary.customer}
              </label>
              {!appointment && quickCreateCustomerAction ? (
                <button
                  type="button"
                  className="knop-zacht"
                  onClick={() => setShowQuickCustomerForm((current) => !current)}
                >
                  {showQuickCustomerForm ? dictionary.close : dictionary.newCustomer}
                </button>
              ) : null}
            </div>
            <select
              id="customerId"
              name="customerId"
              value={selectedCustomerId}
              onChange={(event) => setSelectedCustomerId(event.target.value)}
              required
            >
              <option value="" disabled>
                {dictionary.chooseCustomer}
              </option>
              {customerOptions.map((customer) => (
                <option key={customer.id} value={customer.id}>
                  {customer.naam}
                </option>
              ))}
            </select>
            {!appointment && quickCreateCustomerAction ? (
              <p className="subtitel" style={{ marginTop: 8 }}>
                {dictionary.customerHint}
              </p>
            ) : null}
          </div>

          <div className="veld">
            <label htmlFor="userId">{dictionary.stylistOptional}</label>
            <select id="userId" name="userId" defaultValue={appointment?.userId ?? ""}>
              <option value="">{dictionary.unassigned}</option>
              {medewerkers.map((medewerker) => (
                <option key={medewerker.id} value={medewerker.id}>
                  {medewerker.naam}
                </option>
              ))}
            </select>
          </div>

          <div className="veld">
            <label htmlFor="datumStart">{dictionary.startTime}</label>
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
            <label htmlFor="duurMinuten">{dictionary.duration}</label>
            <select
              id="duurMinuten"
              name="duurMinuten"
              defaultValue={String(appointment?.duurMinuten ?? 30)}
              onChange={(event) => setDuurMinuten(event.target.value)}
            >
              <option value="15">{dictionary.durations["15"]}</option>
              <option value="30">{dictionary.durations["30"]}</option>
              <option value="45">{dictionary.durations["45"]}</option>
              <option value="60">{dictionary.durations["60"]}</option>
              <option value="90">{dictionary.durations["90"]}</option>
              <option value="120">{dictionary.durations["120"]}</option>
              <option value="150">{dictionary.durations["150"]}</option>
              <option value="180">{dictionary.durations["180"]}</option>
            </select>
          </div>

          <div className="veld">
            <label htmlFor="datumEindePreview">{dictionary.endTime}</label>
            <input
              id="datumEindePreview"
              type="datetime-local"
              value={datumEindePreview}
              readOnly
            />
          </div>

          <div className="veld-groot">
            <label htmlFor="behandeling">{dictionary.treatment}</label>
            <input
              id="behandeling"
              name="behandeling"
              defaultValue={appointment?.behandeling}
              placeholder={dictionary.treatmentPlaceholder}
              required
            />
          </div>

          <div className="veld">
            <label htmlFor="behandelingKleur">{dictionary.agendaColor}</label>
            <input
              id="behandelingKleur"
              name="behandelingKleur"
              type="color"
              defaultValue={appointment?.behandelingKleur ?? "#B42323"}
            />
          </div>

          <div className="veld">
            <label htmlFor="status">{dictionary.status}</label>
            <select id="status" name="status" defaultValue={appointment?.status ?? "GEPLAND"}>
              <option value="GEPLAND">{dictionary.statusOptions.GEPLAND}</option>
              {canMarkCompleted ? <option value="VOLTOOID">{dictionary.statusOptions.VOLTOOID}</option> : null}
              <option value="GEANNULEERD">{dictionary.statusOptions.GEANNULEERD}</option>
              <option value="NIET_GEKOMEN">{dictionary.statusOptions.NIET_GEKOMEN}</option>
            </select>
            {!canMarkCompleted && appointment ? (
              <p className="subtitel" style={{ marginTop: 8 }}>
                {dictionary.completeHint}
              </p>
            ) : null}
          </div>

          <div className="veld-groot">
            <label htmlFor="notities">{dictionary.notesOptional}</label>
            <textarea
              id="notities"
              name="notities"
              defaultValue={appointment?.notities ?? ""}
              placeholder={dictionary.notesPlaceholder}
            />
          </div>
        </div>

        <SubmitButton label={submitLabel} bezigLabel={busyLabel} />
      </form>
    </div>
  );
}
