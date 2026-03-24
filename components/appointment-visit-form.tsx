"use client";

import { useActionState, useEffect, useMemo, useState } from "react";
import type { FormState } from "@/components/customer-form";
import { FormMessage } from "@/components/form-message";
import { SubmitButton } from "@/components/submit-button";

const initialState: FormState = {};

type VisitSegmentFormState = {
  id: number;
  userId: string;
  datumStart: string;
  duurMinuten: string;
  behandeling: string;
  behandelingKleur: string;
  notities: string;
  status: "GEPLAND" | "VOLTOOID" | "GEANNULEERD" | "NIET_GEKOMEN";
};

type AppointmentVisitFormProps = {
  action: (state: FormState, formData: FormData) => Promise<FormState>;
  submitLabel?: string;
  busyLabel?: string;
  dictionary: {
    customer: string;
    chooseCustomer: string;
    stylistOptional: string;
    startTime: string;
    duration: string;
    treatment: string;
    treatmentPlaceholder: string;
    agendaColor: string;
    status: string;
    unassigned: string;
    notesOptional: string;
    notesPlaceholder: string;
    saveVisit: string;
    savingVisit: string;
    visitStatus: string;
    visitNotes: string;
    visitNotesPlaceholder: string;
    addSegment: string;
    removeSegment: string;
    segmentLabel: string;
    segmentHelp: string;
    visitHelp: string;
    segmentCount: string;
    statusOptions: Record<"GEPLAND" | "VOLTOOID" | "GEANNULEERD" | "NIET_GEKOMEN", string>;
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
  visit?: {
    id: number;
    customerId: number;
    datum: string;
    notities?: string | null;
    status: "GEPLAND" | "VOLTOOID" | "GEANNULEERD" | "NIET_GEKOMEN";
    segments: Array<{
      id: number;
      userId?: number | null;
      datumStart: string;
      duurMinuten: number;
      behandeling: string;
      behandelingKleur: string;
      notities?: string | null;
      status: "GEPLAND" | "VOLTOOID" | "GEANNULEERD" | "NIET_GEKOMEN";
    }>;
  };
};

function createSegment(id: number, overrides?: Partial<VisitSegmentFormState>): VisitSegmentFormState {
  return {
    id,
    userId: "",
    datumStart: "",
    duurMinuten: "30",
    behandeling: "",
    behandelingKleur: "#B42323",
    notities: "",
    status: "GEPLAND",
    ...overrides
  };
}

function toVisitDateValue(segments: VisitSegmentFormState[]) {
  const firstWithStart = [...segments]
    .filter((segment) => segment.datumStart)
    .sort((left, right) => left.datumStart.localeCompare(right.datumStart))[0];

  return firstWithStart?.datumStart ?? "";
}

export function AppointmentVisitForm({
  action,
  submitLabel,
  busyLabel,
  dictionary,
  customers,
  medewerkers,
  visit
}: AppointmentVisitFormProps) {
  const [state, formAction] = useActionState(action, initialState);
  const [selectedCustomerId, setSelectedCustomerId] = useState(String(visit?.customerId ?? ""));
  const [visitStatus, setVisitStatus] = useState<VisitSegmentFormState["status"]>(visit?.status ?? "GEPLAND");
  const [visitNotes, setVisitNotes] = useState(visit?.notities ?? "");
  const [nextSegmentId, setNextSegmentId] = useState(
    visit?.segments?.length ? Math.max(...visit.segments.map((segment) => segment.id)) + 1 : 2
  );
  const [segments, setSegments] = useState<VisitSegmentFormState[]>(
    visit?.segments?.length
      ? visit.segments.map((segment) =>
          createSegment(segment.id, {
            id: segment.id,
            userId: segment.userId ? String(segment.userId) : "",
            datumStart: segment.datumStart,
            duurMinuten: String(segment.duurMinuten),
            behandeling: segment.behandeling,
            behandelingKleur: segment.behandelingKleur,
            notities: segment.notities ?? "",
            status: segment.status
          })
        )
      : [createSegment(1)]
  );

  useEffect(() => {
    if (!state.success || visit) {
      return;
    }

    setSelectedCustomerId("");
    setVisitStatus("GEPLAND");
    setVisitNotes("");
    setNextSegmentId(2);
    setSegments([createSegment(1)]);
  }, [state.success, visit]);

  const visitDateValue = useMemo(() => toVisitDateValue(segments), [segments]);
  const segmentsJson = useMemo(
    () =>
      JSON.stringify(
        segments.map((segment) => ({
          userId: segment.userId ? Number(segment.userId) : null,
          datumStart: segment.datumStart,
          duurMinuten: Number(segment.duurMinuten),
          behandeling: segment.behandeling,
          behandelingKleur: segment.behandelingKleur,
          notities: segment.notities,
          status: segment.status
        }))
      ),
    [segments]
  );

  function updateSegment(id: number, patch: Partial<VisitSegmentFormState>) {
    setSegments((current) =>
      current.map((segment) => (segment.id === id ? { ...segment, ...patch } : segment))
    );
  }

  function addSegment() {
    setSegments((current) => {
      const lastSegment = current[current.length - 1];
      return [
        ...current,
        createSegment(
          nextSegmentId,
          lastSegment
            ? {
                datumStart: lastSegment.datumStart,
                behandelingKleur: lastSegment.behandelingKleur
              }
            : undefined
        )
      ];
    });
    setNextSegmentId((current) => current + 1);
  }

  function removeSegment(id: number) {
    setSegments((current) => (current.length === 1 ? current : current.filter((segment) => segment.id !== id)));
  }

  return (
    <form action={formAction} className="formulier">
      {visit ? <input type="hidden" name="visitId" value={visit.id} /> : null}
      <FormMessage error={state.error} success={state.success} />
      <p className="melding-info">{dictionary.visitHelp}</p>
      <input type="hidden" name="datum" value={visitDateValue} />
      <input type="hidden" name="segmentsJson" value={segmentsJson} />

      <div className="formulier-grid">
        <div className="veld">
          <label htmlFor="visit-customerId">{dictionary.customer}</label>
          <select
            id="visit-customerId"
            name="customerId"
            value={selectedCustomerId}
            onChange={(event) => setSelectedCustomerId(event.target.value)}
            required
          >
            <option value="" disabled>
              {dictionary.chooseCustomer}
            </option>
            {customers.map((customer) => (
              <option key={customer.id} value={customer.id}>
                {customer.naam}
              </option>
            ))}
          </select>
        </div>

        <div className="veld">
          <label htmlFor="visit-status">{dictionary.visitStatus}</label>
          <select
            id="visit-status"
            name="status"
            value={visitStatus}
            onChange={(event) => setVisitStatus(event.target.value as VisitSegmentFormState["status"])}
          >
            <option value="GEPLAND">{dictionary.statusOptions.GEPLAND}</option>
            <option value="GEANNULEERD">{dictionary.statusOptions.GEANNULEERD}</option>
            <option value="NIET_GEKOMEN">{dictionary.statusOptions.NIET_GEKOMEN}</option>
          </select>
        </div>

        <div className="veld-groot">
          <label htmlFor="visit-notities">{dictionary.visitNotes}</label>
          <textarea
            id="visit-notities"
            name="notities"
            value={visitNotes}
            onChange={(event) => setVisitNotes(event.target.value)}
            placeholder={dictionary.visitNotesPlaceholder}
          />
        </div>
      </div>

      <div className="visit-segments">
        <div className="acties" style={{ justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <h4 style={{ marginBottom: 6 }}>{dictionary.segmentLabel}</h4>
            <p className="subtitel">{dictionary.segmentCount.replace("{count}", String(segments.length))}</p>
          </div>
          <button type="button" className="knop-zacht" onClick={addSegment}>
            {dictionary.addSegment}
          </button>
        </div>

        {segments.map((segment, index) => (
          <section className="kaart visit-segment-card" key={segment.id}>
            <div className="acties" style={{ justifyContent: "space-between", alignItems: "center" }}>
              <div>
                <strong>{dictionary.segmentLabel} {index + 1}</strong>
                <p className="subtitel" style={{ marginTop: 6 }}>
                  {dictionary.segmentHelp}
                </p>
              </div>
              <button
                type="button"
                className="knop-secundair"
                onClick={() => removeSegment(segment.id)}
                disabled={segments.length === 1}
              >
                {dictionary.removeSegment}
              </button>
            </div>

            <div className="formulier-grid" style={{ marginTop: 18 }}>
              <div className="veld">
                <label htmlFor={`segment-user-${segment.id}`}>{dictionary.stylistOptional}</label>
                <select
                  id={`segment-user-${segment.id}`}
                  value={segment.userId}
                  onChange={(event) => updateSegment(segment.id, { userId: event.target.value })}
                >
                  <option value="">{dictionary.unassigned}</option>
                  {medewerkers.map((medewerker) => (
                    <option key={medewerker.id} value={medewerker.id}>
                      {medewerker.naam}
                    </option>
                  ))}
                </select>
              </div>

              <div className="veld">
                <label htmlFor={`segment-start-${segment.id}`}>{dictionary.startTime}</label>
                <input
                  id={`segment-start-${segment.id}`}
                  type="datetime-local"
                  value={segment.datumStart}
                  onChange={(event) => updateSegment(segment.id, { datumStart: event.target.value })}
                  required
                />
              </div>

              <div className="veld">
                <label htmlFor={`segment-duration-${segment.id}`}>{dictionary.duration}</label>
                <select
                  id={`segment-duration-${segment.id}`}
                  value={segment.duurMinuten}
                  onChange={(event) => updateSegment(segment.id, { duurMinuten: event.target.value })}
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
                <label htmlFor={`segment-status-${segment.id}`}>{dictionary.status}</label>
                <select
                  id={`segment-status-${segment.id}`}
                  value={segment.status}
                  onChange={(event) =>
                    updateSegment(segment.id, { status: event.target.value as VisitSegmentFormState["status"] })
                  }
                >
                  <option value="GEPLAND">{dictionary.statusOptions.GEPLAND}</option>
                  <option value="GEANNULEERD">{dictionary.statusOptions.GEANNULEERD}</option>
                  <option value="NIET_GEKOMEN">{dictionary.statusOptions.NIET_GEKOMEN}</option>
                </select>
              </div>

              <div className="veld-groot">
                <label htmlFor={`segment-treatment-${segment.id}`}>{dictionary.treatment}</label>
                <input
                  id={`segment-treatment-${segment.id}`}
                  value={segment.behandeling}
                  onChange={(event) => updateSegment(segment.id, { behandeling: event.target.value })}
                  placeholder={dictionary.treatmentPlaceholder}
                  required
                />
              </div>

              <div className="veld">
                <label htmlFor={`segment-color-${segment.id}`}>{dictionary.agendaColor}</label>
                <input
                  id={`segment-color-${segment.id}`}
                  type="color"
                  value={segment.behandelingKleur}
                  onChange={(event) => updateSegment(segment.id, { behandelingKleur: event.target.value })}
                />
              </div>

              <div className="veld-groot">
                <label htmlFor={`segment-notes-${segment.id}`}>{dictionary.notesOptional}</label>
                <textarea
                  id={`segment-notes-${segment.id}`}
                  value={segment.notities}
                  onChange={(event) => updateSegment(segment.id, { notities: event.target.value })}
                  placeholder={dictionary.notesPlaceholder}
                />
              </div>
            </div>
          </section>
        ))}
      </div>

      <SubmitButton label={submitLabel ?? dictionary.saveVisit} bezigLabel={busyLabel ?? dictionary.savingVisit} />
    </form>
  );
}
