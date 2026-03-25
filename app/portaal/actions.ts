"use server";

import { redirect } from "next/navigation";
import { clearPortalSession } from "@/lib/installateurs/portal-auth";
import { prisma } from "@/lib/prisma";
import { appointmentRequestSchema } from "@/lib/installateurs/validation";
import { createAuditLog, getRequestIp } from "@/lib/core/security";
import { requirePortalSession } from "@/lib/installateurs/portal-auth";

export async function portalLogoutAction() {
  await clearPortalSession();
  redirect("/portaal/login?fout=uitgelogd");
}

export type PortalAppointmentRequestFormState = {
  error?: string;
  success?: string;
};

export async function submitAppointmentRequestAction(
  _: PortalAppointmentRequestFormState,
  formData: FormData
): Promise<PortalAppointmentRequestFormState> {
  const portalUser = await requirePortalSession();

  const parsed = appointmentRequestSchema.safeParse({
    serviceLocationId: formData.get("serviceLocationId"),
    assetId: formData.get("assetId"),
    type: formData.get("type") || "OVERIG",
    toelichting: formData.get("toelichting"),
    voorkeuren: [1, 2, 3].map((number) => ({
      datum: formData.get(`voorkeur${number}Datum`),
      startTijd: formData.get(`voorkeur${number}StartTijd`),
      eindTijd: formData.get(`voorkeur${number}EindTijd`)
    }))
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Controleer de aanvraag." };
  }

  const serviceLocation = await prisma.serviceLocation.findFirst({
    where: {
      id: parsed.data.serviceLocationId,
      salonId: portalUser.salonId,
      customerAccountId: portalUser.customerAccountId
    },
    select: {
      id: true
    }
  });

  if (!serviceLocation) {
    return { error: "Deze locatie hoort niet bij uw account." };
  }

  if (parsed.data.assetId) {
    const asset = await prisma.asset.findFirst({
      where: {
        id: parsed.data.assetId,
        salonId: portalUser.salonId,
        customerAccountId: portalUser.customerAccountId,
        serviceLocationId: parsed.data.serviceLocationId
      },
      select: {
        id: true
      }
    });

    if (!asset) {
      return { error: "Deze installatie hoort niet bij de gekozen locatie." };
    }
  }

  const appointmentRequest = await prisma.appointmentRequest.create({
    data: {
      salonId: portalUser.salonId,
      customerAccountId: portalUser.customerAccountId,
      serviceLocationId: parsed.data.serviceLocationId,
      assetId: parsed.data.assetId,
      portalUserId: portalUser.id,
      type: parsed.data.type,
      toelichting: parsed.data.toelichting,
      preferences: {
        create: parsed.data.voorkeuren.map((voorkeur, index) => ({
          voorkeurNummer: index + 1,
          datum: new Date(voorkeur.datum),
          startTijd: new Date(`${voorkeur.datum}T${voorkeur.startTijd}`),
          eindTijd: new Date(`${voorkeur.datum}T${voorkeur.eindTijd}`)
        }))
      }
    }
  });

  const ipAddress = await getRequestIp();

  await createAuditLog({
    salonId: portalUser.salonId,
    action: "PORTAL_APPOINTMENT_REQUEST_CREATED",
    entityType: "AppointmentRequest",
    entityId: appointmentRequest.id,
    message: "Afspraakaanvraag ingediend via klantportaal.",
    ipAddress,
    metadata: {
      portalUserId: portalUser.id,
      customerAccountId: portalUser.customerAccountId,
      type: parsed.data.type
    }
  });

  return { success: "Uw aanvraag is verstuurd. De installateur bevestigt een van uw voorkeursmomenten." };
}
