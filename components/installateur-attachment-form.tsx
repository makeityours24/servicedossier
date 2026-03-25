"use client";

import { useActionState } from "react";
import { FormMessage } from "@/components/form-message";
import { SubmitButton } from "@/components/submit-button";
import type { InstallateurAttachmentFormState } from "@/app/platform/[id]/installateurs/actions";

const initialState: InstallateurAttachmentFormState = {};

type WorkOrderOption = {
  id: number;
  label: string;
  serviceReportId: number | null;
};

type InstallateurAttachmentFormProps = {
  salonId: number;
  workOrders: WorkOrderOption[];
  action: (
    state: InstallateurAttachmentFormState,
    formData: FormData
  ) => Promise<InstallateurAttachmentFormState>;
};

export function InstallateurAttachmentForm({
  salonId,
  workOrders,
  action
}: InstallateurAttachmentFormProps) {
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
          <label htmlFor="serviceReportId">Koppel aan servicerapport</label>
          <select id="serviceReportId" name="serviceReportId" defaultValue="">
            <option value="">Alleen op werkbonniveau</option>
            {workOrders
              .filter((workOrder) => workOrder.serviceReportId)
              .map((workOrder) => (
                <option key={workOrder.id} value={workOrder.serviceReportId ?? ""}>
                  {workOrder.label}
                </option>
              ))}
          </select>
        </div>

        <div className="veld-groot">
          <label htmlFor="bestand">Foto of video</label>
          <input
            id="bestand"
            name="bestand"
            type="file"
            accept="image/jpeg,image/png,image/webp,video/mp4,video/webm,video/quicktime"
            required
          />
        </div>

        <div className="veld-groot">
          <label htmlFor="notitie">Notitie (optioneel)</label>
          <textarea
            id="notitie"
            name="notitie"
            rows={3}
            placeholder="Bijvoorbeeld foutcode, schadebeeld of situatie voor aankomst."
          />
        </div>
      </div>

      <p className="subtitel" style={{ marginTop: 0 }}>
        Toegestane formaten: JPG, PNG, WEBP, MP4, WEBM en MOV. Foto&apos;s tot 8 MB en video&apos;s tot 50 MB.
      </p>

      <SubmitButton label="Media uploaden" bezigLabel="Uploaden..." />
    </form>
  );
}
