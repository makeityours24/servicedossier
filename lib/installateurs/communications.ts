import { formatDate } from "@/lib/utils";

type WorkOrderConfirmationParams = {
  salonName: string;
  customerName: string;
  workOrderTitle: string;
  workOrderType: string;
  priority: string;
  locationLabel: string;
  plannedWindow?: string | null;
  note?: string | null;
};

type ServiceReportEmailParams = {
  salonName: string;
  customerName: string;
  workOrderTitle: string;
  completedAt: Date;
  werkzaamhedenUitgevoerd: string;
  bevindingen?: string | null;
  advies?: string | null;
  vervolgActieOmschrijving?: string | null;
};

export function buildWorkOrderConfirmationEmail(params: WorkOrderConfirmationParams) {
  return {
    subject: `Opdrachtbevestiging: ${params.workOrderTitle}`,
    text: [
      `Hoi ${params.customerName},`,
      "",
      `Hierbij bevestigen we de opdracht "${params.workOrderTitle}" vanuit ${params.salonName}.`,
      "",
      `Type werkbon: ${params.workOrderType}`,
      `Prioriteit: ${params.priority}`,
      `Locatie: ${params.locationLabel}`,
      params.plannedWindow ? `Geplande tijd: ${params.plannedWindow}` : "Geplande tijd: volgt nog",
      params.note ? `Opmerking: ${params.note}` : null,
      "",
      "Als er iets wijzigt, nemen we contact met je op.",
      "",
      `Met vriendelijke groet,`,
      params.salonName
    ]
      .filter(Boolean)
      .join("\n")
  };
}

export function buildServiceReportEmail(params: ServiceReportEmailParams) {
  return {
    subject: `Servicerapport: ${params.workOrderTitle}`,
    text: [
      `Hoi ${params.customerName},`,
      "",
      `Hierbij ontvang je het servicerapport van ${params.salonName} voor "${params.workOrderTitle}".`,
      `Afgerond op: ${formatDate(params.completedAt)}`,
      "",
      "Werkzaamheden uitgevoerd:",
      params.werkzaamhedenUitgevoerd,
      params.bevindingen ? `\nBevindingen:\n${params.bevindingen}` : null,
      params.advies ? `\nAdvies:\n${params.advies}` : null,
      params.vervolgActieOmschrijving ? `\nVervolgactie:\n${params.vervolgActieOmschrijving}` : null,
      "",
      `Met vriendelijke groet,`,
      params.salonName
    ]
      .filter(Boolean)
      .join("\n")
  };
}
