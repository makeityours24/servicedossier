"use client";

import { useActionState } from "react";
import { FormMessage } from "@/components/form-message";
import { SubmitButton } from "@/components/submit-button";
import type { InstallateurServiceReportFormState } from "@/app/platform/[id]/installateurs/actions";

const initialState: InstallateurServiceReportFormState = {};

type WorkOrderOption = {
  id: number;
  label: string;
};

type UserOption = {
  id: number;
  naam: string;
  rol: string;
};

type InstallateurServiceReportFormProps = {
  salonId: number;
  openWorkOrders: WorkOrderOption[];
  users: UserOption[];
  action: (
    state: InstallateurServiceReportFormState,
    formData: FormData
  ) => Promise<InstallateurServiceReportFormState>;
};

function createDefaultCompletedAtValue() {
  return new Date().toISOString().slice(0, 16);
}

export function InstallateurServiceReportForm({
  salonId,
  openWorkOrders,
  users,
  action
}: InstallateurServiceReportFormProps) {
  const [state, formAction] = useActionState(action, initialState);

  return (
    <form action={formAction} className="formulier">
      <input type="hidden" name="salonId" value={salonId} />
      <FormMessage error={state.error} success={state.success} />

      <div className="formulier-grid">
        <div className="veld">
          <label htmlFor="workOrderId">Werkbon</label>
          <select id="workOrderId" name="workOrderId" defaultValue="" required>
            <option value="" disabled>
              Kies een werkbon zonder rapport
            </option>
            {openWorkOrders.map((workOrder) => (
              <option key={workOrder.id} value={workOrder.id}>
                {workOrder.label}
              </option>
            ))}
          </select>
        </div>

        <div className="veld">
          <label htmlFor="ingevuldDoorUserId">Ingevuld door</label>
          <select id="ingevuldDoorUserId" name="ingevuldDoorUserId" defaultValue="">
            <option value="">Kies een medewerker</option>
            {users.map((user) => (
              <option key={user.id} value={user.id}>
                {user.naam} · {user.rol}
              </option>
            ))}
          </select>
        </div>

        <div className="veld">
          <label htmlFor="afgerondOp">Afgerond op</label>
          <input id="afgerondOp" name="afgerondOp" type="datetime-local" defaultValue={createDefaultCompletedAtValue()} required />
        </div>

        <div className="veld">
          <label htmlFor="vervolgActieNodig">Vervolgactie nodig</label>
          <select id="vervolgActieNodig" name="vervolgActieNodig" defaultValue="false">
            <option value="false">Nee</option>
            <option value="true">Ja</option>
          </select>
        </div>

        <div className="veld-groot">
          <label htmlFor="werkzaamhedenUitgevoerd">Werkzaamheden uitgevoerd</label>
          <textarea id="werkzaamhedenUitgevoerd" name="werkzaamhedenUitgevoerd" rows={4} required />
        </div>

        <div className="veld-groot">
          <label htmlFor="bevindingen">Bevindingen</label>
          <textarea id="bevindingen" name="bevindingen" rows={4} />
        </div>

        <div className="veld-groot">
          <label htmlFor="advies">Advies</label>
          <textarea id="advies" name="advies" rows={4} />
        </div>

        <div className="veld-groot">
          <label htmlFor="vervolgActieOmschrijving">Omschrijving vervolgactie</label>
          <textarea id="vervolgActieOmschrijving" name="vervolgActieOmschrijving" rows={3} />
        </div>
      </div>

      <SubmitButton label="Servicerapport opslaan" bezigLabel="Opslaan..." />
    </form>
  );
}
