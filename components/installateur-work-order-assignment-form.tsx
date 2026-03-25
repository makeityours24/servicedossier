"use client";

import { useActionState } from "react";
import { FormMessage } from "@/components/form-message";
import { SubmitButton } from "@/components/submit-button";
import type { InstallateurAssignmentFormState } from "@/app/platform/[id]/installateurs/actions";

const initialState: InstallateurAssignmentFormState = {};

type WorkOrderOption = {
  id: number;
  label: string;
};

type UserOption = {
  id: number;
  naam: string;
  rol: string;
};

type InstallateurWorkOrderAssignmentFormProps = {
  salonId: number;
  workOrders: WorkOrderOption[];
  users: UserOption[];
  action: (
    state: InstallateurAssignmentFormState,
    formData: FormData
  ) => Promise<InstallateurAssignmentFormState>;
};

export function InstallateurWorkOrderAssignmentForm({
  salonId,
  workOrders,
  users,
  action
}: InstallateurWorkOrderAssignmentFormProps) {
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
              Kies een werkbon
            </option>
            {workOrders.map((workOrder) => (
              <option key={workOrder.id} value={workOrder.id}>
                {workOrder.label}
              </option>
            ))}
          </select>
        </div>

        <div className="veld">
          <label htmlFor="userId">Medewerker</label>
          <select id="userId" name="userId" defaultValue="" required>
            <option value="" disabled>
              Kies een medewerker
            </option>
            {users.map((user) => (
              <option key={user.id} value={user.id}>
                {user.naam} · {user.rol}
              </option>
            ))}
          </select>
        </div>

        <div className="veld">
          <label htmlFor="rolOpOpdracht">Rol op opdracht</label>
          <select id="rolOpOpdracht" name="rolOpOpdracht" defaultValue="HOOFDMONTEUR">
            <option value="HOOFDMONTEUR">Hoofdmonteur</option>
            <option value="ASSISTENT">Assistent</option>
          </select>
        </div>

        <div className="veld">
          <label htmlFor="status">Status</label>
          <select id="status" name="status" defaultValue="INGEPLAND">
            <option value="INGEPLAND">Ingepland</option>
            <option value="ONDERWEG">Onderweg</option>
            <option value="IN_UITVOERING">In uitvoering</option>
            <option value="AFGEROND">Afgerond</option>
            <option value="GEANNULEERD">Geannuleerd</option>
          </select>
        </div>

        <div className="veld">
          <label htmlFor="geplandStart">Gepland startmoment</label>
          <input id="geplandStart" name="geplandStart" type="datetime-local" required />
        </div>

        <div className="veld">
          <label htmlFor="geplandEinde">Gepland eindmoment</label>
          <input id="geplandEinde" name="geplandEinde" type="datetime-local" required />
        </div>
      </div>

      <SubmitButton label="Medewerker inplannen" bezigLabel="Opslaan..." />
    </form>
  );
}
