"use client";

import { useActionState } from "react";
import { FormMessage } from "@/components/form-message";
import { SubmitButton } from "@/components/submit-button";
import type { PortalAppointmentRequestFormState } from "@/app/portaal/actions";

const initialState: PortalAppointmentRequestFormState = {};

type LocationOption = {
  id: number;
  label: string;
  assets: Array<{
    id: number;
    label: string;
  }>;
};

type PortalAppointmentRequestFormProps = {
  locations: LocationOption[];
  action: (
    state: PortalAppointmentRequestFormState,
    formData: FormData
  ) => Promise<PortalAppointmentRequestFormState>;
};

const timeBlockOptions = [
  { value: "08:00", label: "08:00 - 10:00", end: "10:00" },
  { value: "10:00", label: "10:00 - 12:00", end: "12:00" },
  { value: "13:00", label: "13:00 - 15:00", end: "15:00" },
  { value: "15:00", label: "15:00 - 17:00", end: "17:00" }
];

export function PortalAppointmentRequestForm({
  locations,
  action
}: PortalAppointmentRequestFormProps) {
  const [state, formAction] = useActionState(action, initialState);
  const allAssets = locations.flatMap((location) =>
    location.assets.map((asset) => ({
      id: asset.id,
      label: `${location.label} · ${asset.label}`
    }))
  );

  return (
    <form action={formAction} className="formulier">
      <FormMessage error={state.error} success={state.success} />

      <div className="formulier-grid">
        <div className="veld">
          <label htmlFor="serviceLocationId">Locatie</label>
          <select id="serviceLocationId" name="serviceLocationId" defaultValue="" required>
            <option value="" disabled>
              Kies een locatie
            </option>
            {locations.map((location) => (
              <option key={location.id} value={location.id}>
                {location.label}
              </option>
            ))}
          </select>
        </div>

        <div className="veld">
          <label htmlFor="assetId">Installatie</label>
          <select id="assetId" name="assetId" defaultValue="">
            <option value="">Geen specifieke installatie</option>
            {allAssets.map((asset) => (
              <option key={asset.id} value={asset.id}>
                {asset.label}
              </option>
            ))}
          </select>
        </div>

        <div className="veld">
          <label htmlFor="type">Type aanvraag</label>
          <select id="type" name="type" defaultValue="ONDERHOUD">
            <option value="ONDERHOUD">Onderhoud</option>
            <option value="STORING">Storing</option>
            <option value="INSPECTIE">Inspectie</option>
            <option value="OVERIG">Overig</option>
          </select>
        </div>

        <div className="veld-groot">
          <label htmlFor="toelichting">Toelichting</label>
          <textarea id="toelichting" name="toelichting" rows={4} required />
        </div>

        {[1, 2, 3].map((number) => (
          <div className="veld-groot" key={number}>
            <label htmlFor={`voorkeur${number}Datum`}>Voorkeur {number}</label>
            <div className="acties" style={{ gap: 12 }}>
              <input id={`voorkeur${number}Datum`} name={`voorkeur${number}Datum`} type="date" required />
              <select
                id={`voorkeur${number}StartTijd`}
                name={`voorkeur${number}StartTijd`}
                defaultValue={timeBlockOptions[0].value}
                required
              >
                {timeBlockOptions.map((timeBlock) => (
                  <option key={timeBlock.value} value={timeBlock.value}>
                    {timeBlock.label}
                  </option>
                ))}
              </select>
              <select
                id={`voorkeur${number}EindTijd`}
                name={`voorkeur${number}EindTijd`}
                defaultValue={timeBlockOptions[0].end}
                required
              >
                {timeBlockOptions.map((timeBlock) => (
                  <option key={timeBlock.end} value={timeBlock.end}>
                    {timeBlock.end}
                  </option>
                ))}
              </select>
            </div>
          </div>
        ))}
      </div>

      <p className="subtitel" style={{ marginTop: 0 }}>
        Geef precies 3 voorkeuren op, elk op een andere dag. Elk blok duurt 2 uur en wordt daarna door de installateur bevestigd.
      </p>

      <SubmitButton label="Afspraak aanvragen" bezigLabel="Versturen..." />
    </form>
  );
}
