"use server";

import { put } from "@vercel/blob";
import { revalidatePath } from "next/cache";
import { requirePlatformAdmin } from "@/lib/core/auth";
import { sendTransactionalEmail } from "@/lib/email";
import {
  buildServiceReportEmail,
  buildWorkOrderConfirmationEmail
} from "@/lib/installateurs/communications";
import { prisma } from "@/lib/prisma";
import { formatDate } from "@/lib/utils";
import { hashPassword } from "@/lib/password";
import {
  createAuditLog,
  getRequestIp
} from "@/lib/core/security";
import {
  assetSchema,
  appointmentRequestReviewSchema,
  customerAccountSchema,
  customerPortalUserSchema,
  installateurAttachmentSchema,
  installateurDocumentTargetSchema,
  serviceReportSchema,
  serviceLocationSchema,
  workOrderAssignmentSchema,
  workOrderSchema
} from "@/lib/installateurs/validation";

const MAX_IMAGE_FILE_SIZE = 8 * 1024 * 1024;
const MAX_VIDEO_FILE_SIZE = 50 * 1024 * 1024;
const ALLOWED_IMAGE_TYPES = new Set(["image/jpeg", "image/png", "image/webp"]);
const ALLOWED_VIDEO_TYPES = new Set(["video/mp4", "video/webm", "video/quicktime"]);

function sanitizeFileName(value: string) {
  return value
    .normalize("NFKD")
    .replace(/[^\w.-]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
    .toLowerCase();
}

function buildInstallateurAttachmentBlobPath(params: {
  salonId: number;
  workOrderId: number;
  serviceReportId?: number | null;
  originalName: string;
}) {
  const sanitized = sanitizeFileName(params.originalName || "installateur-bijlage");
  const reportSegment = params.serviceReportId ? `/service-reports/${params.serviceReportId}` : "";
  return `salons/${params.salonId}/installateurs/work-orders/${params.workOrderId}${reportSegment}/${Date.now()}-${sanitized}`;
}

export type InstallateurCustomerFormState = {
  error?: string;
  success?: string;
};

export type InstallateurLocationFormState = {
  error?: string;
  success?: string;
};

export type InstallateurAssetFormState = {
  error?: string;
  success?: string;
};

export type InstallateurWorkOrderFormState = {
  error?: string;
  success?: string;
};

export type InstallateurAssignmentFormState = {
  error?: string;
  success?: string;
};

export type InstallateurServiceReportFormState = {
  error?: string;
  success?: string;
};

export type InstallateurAttachmentFormState = {
  error?: string;
  success?: string;
};

export type InstallateurDocumentFormState = {
  error?: string;
  success?: string;
};

export type InstallateurPortalUserFormState = {
  error?: string;
  success?: string;
};

export async function confirmAppointmentRequestAction(formData: FormData): Promise<void> {
  const actor = await requirePlatformAdmin();
  const salonId = Number(formData.get("salonId"));

  if (!Number.isInteger(salonId)) {
    throw new Error("Ongeldige installateur-tenant geselecteerd.");
  }

  const parsed = appointmentRequestReviewSchema.safeParse({
    appointmentRequestId: formData.get("appointmentRequestId"),
    preferenceId: formData.get("preferenceId")
  });

  if (!parsed.success) {
    throw new Error(parsed.error.issues[0]?.message ?? "Controleer de aanvraagkeuze.");
  }

  const confirmation = await prisma.$transaction(async (tx) => {
    const appointmentRequest = await tx.appointmentRequest.findFirst({
      where: {
        id: parsed.data.appointmentRequestId,
        salonId
      },
      include: {
        customerAccount: {
          select: {
            naam: true
          }
        },
        serviceLocation: {
          select: {
            naam: true,
            adresregel1: true,
            plaats: true
          }
        },
        preferences: {
          where: {
            id: parsed.data.preferenceId
          },
          take: 1
        }
      }
    });

    if (!appointmentRequest) {
      throw new Error("Aanvraag niet gevonden voor deze tenant.");
    }

    if (appointmentRequest.status === "BEVESTIGD" || appointmentRequest.workOrderId) {
      return {
        alreadyConfirmed: true as const
      };
    }

    const chosenPreference = appointmentRequest.preferences[0];

    if (!chosenPreference) {
      throw new Error("De gekozen voorkeur hoort niet bij deze aanvraag.");
    }

    const reservation = await tx.appointmentRequest.updateMany({
      where: {
        id: appointmentRequest.id,
        salonId,
        workOrderId: null,
        status: {
          not: "BEVESTIGD"
        }
      },
      data: {
        status: "IN_BEOORDELING",
        gekozenVoorkeurId: chosenPreference.id,
        plannerNotitie: `Bevestiging gestart door planner op ${new Date().toISOString()}`
      }
    });

    if (reservation.count !== 1) {
      return {
        alreadyConfirmed: true as const
      };
    }

    const workOrderType =
      appointmentRequest.type === "ONDERHOUD"
        ? "ONDERHOUD"
        : appointmentRequest.type === "STORING"
          ? "STORING"
          : appointmentRequest.type === "INSPECTIE"
            ? "INSPECTIE"
            : "OPNAME";

    const workOrder = await tx.workOrder.create({
      data: {
        salonId,
        customerAccountId: appointmentRequest.customerAccountId,
        serviceLocationId: appointmentRequest.serviceLocationId,
        assetId: appointmentRequest.assetId,
        type: workOrderType,
        status: "INGEPLAND",
        prioriteit: appointmentRequest.type === "STORING" ? "HOOG" : "NORMAAL",
        titel: `Portaalafspraak ${appointmentRequest.type.toLowerCase()}`,
        melding: appointmentRequest.toelichting,
        klantNotities: "Aangemaakt vanuit klantportaal.",
        geplandStart: chosenPreference.startTijd,
        geplandEinde: chosenPreference.eindTijd
      }
    });

    await tx.appointmentRequest.update({
      where: {
        id: appointmentRequest.id
      },
      data: {
        status: "BEVESTIGD",
        gekozenVoorkeurId: chosenPreference.id,
        workOrderId: workOrder.id,
        plannerNotitie: `Bevestigd door planner op ${new Date().toISOString()}`
      }
    });

    return {
      alreadyConfirmed: false as const,
      appointmentRequest,
      chosenPreference,
      workOrder
    };
  });

  if (confirmation.alreadyConfirmed) {
    revalidatePath(`/platform/${salonId}/installateurs`);
    revalidatePath("/portaal");
    return;
  }

  const ipAddress = await getRequestIp();

  await createAuditLog({
    salonId,
    actorUserId: actor.id,
    action: "INSTALLATEUR_APPOINTMENT_REQUEST_CONFIRMED",
    entityType: "AppointmentRequest",
    entityId: confirmation.appointmentRequest.id,
    message: "Portaalaanvraag bevestigd en omgezet naar werkbon.",
    ipAddress,
    metadata: {
      customerName: confirmation.appointmentRequest.customerAccount.naam,
      locationName:
        confirmation.appointmentRequest.serviceLocation.naam ??
        `${confirmation.appointmentRequest.serviceLocation.adresregel1}, ${confirmation.appointmentRequest.serviceLocation.plaats}`,
      workOrderId: confirmation.workOrder.id,
      preferenceId: confirmation.chosenPreference.id
    }
  });

  revalidatePath(`/platform/${salonId}/installateurs`);
  revalidatePath("/portaal");
}

export async function createCustomerAccountAction(
  _: InstallateurCustomerFormState,
  formData: FormData
): Promise<InstallateurCustomerFormState> {
  const actor = await requirePlatformAdmin();
  const salonId = Number(formData.get("salonId"));

  if (!Number.isInteger(salonId)) {
    return { error: "Ongeldige installateur-tenant geselecteerd." };
  }

  const parsed = customerAccountSchema.safeParse({
    type: formData.get("type") || "PARTICULIER",
    naam: formData.get("naam"),
    klantnummer: formData.get("klantnummer") || undefined,
    email: formData.get("email") || "",
    telefoon: formData.get("telefoon") || undefined,
    factuurEmail: formData.get("factuurEmail") || "",
    kvkNummer: formData.get("kvkNummer") || undefined,
    btwNummer: formData.get("btwNummer") || undefined,
    notities: formData.get("notities") || undefined
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Controleer de klantgegevens." };
  }

  const salon = await prisma.salon.findUnique({
    where: { id: salonId },
    select: { id: true, naam: true }
  });

  if (!salon) {
    return { error: "De geselecteerde tenant bestaat niet meer." };
  }

  const ipAddress = await getRequestIp();

  await prisma.customerAccount.create({
    data: {
      salonId,
      type: parsed.data.type,
      naam: parsed.data.naam,
      klantnummer: parsed.data.klantnummer || null,
      email: parsed.data.email || null,
      telefoon: parsed.data.telefoon || null,
      factuurEmail: parsed.data.factuurEmail || null,
      kvkNummer: parsed.data.kvkNummer || null,
      btwNummer: parsed.data.btwNummer || null,
      notities: parsed.data.notities || null
    }
  });

  await createAuditLog({
    salonId,
    actorUserId: actor.id,
    action: "INSTALLATEUR_CUSTOMER_ACCOUNT_CREATED",
    entityType: "CustomerAccount",
    message: "Installateurklant aangemaakt vanuit het platform.",
    ipAddress,
    metadata: {
      salonNaam: salon.naam,
      customerName: parsed.data.naam
    }
  });

  revalidatePath(`/platform/${salonId}/installateurs`);

  return { success: `${parsed.data.naam} is toegevoegd aan de installateursmodule.` };
}

export async function createCustomerPortalUserAction(
  _: InstallateurPortalUserFormState,
  formData: FormData
): Promise<InstallateurPortalUserFormState> {
  const actor = await requirePlatformAdmin();
  const salonId = Number(formData.get("salonId"));

  if (!Number.isInteger(salonId)) {
    return { error: "Ongeldige installateur-tenant geselecteerd." };
  }

  const parsed = customerPortalUserSchema.safeParse({
    customerAccountId: formData.get("customerAccountId"),
    naam: formData.get("naam"),
    email: formData.get("email"),
    wachtwoord: formData.get("wachtwoord")
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Controleer de portalgebruiker." };
  }

  const customerAccount = await prisma.customerAccount.findFirst({
    where: {
      id: parsed.data.customerAccountId,
      salonId
    },
    select: {
      id: true,
      naam: true
    }
  });

  if (!customerAccount) {
    return { error: "Deze klant hoort niet bij de geselecteerde tenant." };
  }

  const existingUser = await prisma.customerPortalUser.findFirst({
    where: {
      salonId,
      email: parsed.data.email.toLowerCase()
    },
    select: {
      id: true
    }
  });

  if (existingUser) {
    return { error: "Er bestaat al een portalaccount met dit e-mailadres." };
  }

  await prisma.customerPortalUser.create({
    data: {
      salonId,
      customerAccountId: customerAccount.id,
      naam: parsed.data.naam,
      email: parsed.data.email.toLowerCase(),
      wachtwoord: await hashPassword(parsed.data.wachtwoord)
    }
  });

  const ipAddress = await getRequestIp();

  await createAuditLog({
    salonId,
    actorUserId: actor.id,
    action: "INSTALLATEUR_PORTAL_USER_CREATED",
    entityType: "CustomerPortalUser",
    message: "Portalgebruiker aangemaakt voor installateursklant.",
    ipAddress,
    metadata: {
      customerName: customerAccount.naam,
      email: parsed.data.email.toLowerCase()
    }
  });

  revalidatePath(`/platform/${salonId}/installateurs`);

  return { success: `Portalaccount toegevoegd voor ${customerAccount.naam}.` };
}

export async function createServiceLocationAction(
  _: InstallateurLocationFormState,
  formData: FormData
): Promise<InstallateurLocationFormState> {
  const actor = await requirePlatformAdmin();
  const salonId = Number(formData.get("salonId"));
  const customerAccountId = Number(formData.get("customerAccountId"));

  if (!Number.isInteger(salonId) || !Number.isInteger(customerAccountId)) {
    return { error: "Ongeldige klant of tenant geselecteerd." };
  }

  const parsed = serviceLocationSchema.safeParse({
    naam: formData.get("naam") || undefined,
    adresregel1: formData.get("adresregel1"),
    adresregel2: formData.get("adresregel2") || undefined,
    postcode: formData.get("postcode"),
    plaats: formData.get("plaats"),
    land: formData.get("land") || "NL",
    toegangsinstructies: formData.get("toegangsinstructies") || undefined,
    locatieNotities: formData.get("locatieNotities") || undefined
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Controleer de locatiegegevens." };
  }

  const customerAccount = await prisma.customerAccount.findFirst({
    where: {
      id: customerAccountId,
      salonId
    },
    select: {
      id: true,
      naam: true
    }
  });

  if (!customerAccount) {
    return { error: "Deze klant hoort niet bij de geselecteerde tenant." };
  }

  const ipAddress = await getRequestIp();

  await prisma.serviceLocation.create({
    data: {
      salonId,
      customerAccountId,
      naam: parsed.data.naam || null,
      adresregel1: parsed.data.adresregel1,
      adresregel2: parsed.data.adresregel2 || null,
      postcode: parsed.data.postcode,
      plaats: parsed.data.plaats,
      land: parsed.data.land,
      toegangsinstructies: parsed.data.toegangsinstructies || null,
      locatieNotities: parsed.data.locatieNotities || null
    }
  });

  await createAuditLog({
    salonId,
    actorUserId: actor.id,
    action: "INSTALLATEUR_SERVICE_LOCATION_CREATED",
    entityType: "ServiceLocation",
    message: "Servicelocatie aangemaakt vanuit het platform.",
    ipAddress,
    metadata: {
      customerAccountId,
      customerName: customerAccount.naam,
      postcode: parsed.data.postcode,
      plaats: parsed.data.plaats
    }
  });

  revalidatePath(`/platform/${salonId}/installateurs`);

  return { success: `Locatie voor ${customerAccount.naam} is toegevoegd.` };
}

export async function createAssetAction(
  _: InstallateurAssetFormState,
  formData: FormData
): Promise<InstallateurAssetFormState> {
  const actor = await requirePlatformAdmin();
  const salonId = Number(formData.get("salonId"));
  const customerAccountId = Number(formData.get("customerAccountId"));
  const serviceLocationId = Number(formData.get("serviceLocationId"));

  if (!Number.isInteger(salonId) || !Number.isInteger(customerAccountId) || !Number.isInteger(serviceLocationId)) {
    return { error: "Ongeldige klant of locatie geselecteerd." };
  }

  const parsed = assetSchema.safeParse({
    type: formData.get("type"),
    merk: formData.get("merk") || undefined,
    model: formData.get("model") || undefined,
    serienummer: formData.get("serienummer") || undefined,
    internNummer: formData.get("internNummer") || undefined,
    status: formData.get("status") || "ACTIEF",
    plaatsingsDatum: formData.get("plaatsingsDatum") || "",
    garantieTot: formData.get("garantieTot") || "",
    omschrijving: formData.get("omschrijving") || undefined,
    notities: formData.get("notities") || undefined
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Controleer de installatiegegevens." };
  }

  const location = await prisma.serviceLocation.findFirst({
    where: {
      id: serviceLocationId,
      salonId,
      customerAccountId
    },
    select: {
      naam: true,
      adresregel1: true,
      plaats: true,
      customerAccount: {
        select: {
          naam: true
        }
      }
    }
  });

  if (!location) {
    return { error: "Deze locatie hoort niet bij de geselecteerde klant." };
  }

  const ipAddress = await getRequestIp();

  await prisma.asset.create({
    data: {
      salonId,
      customerAccountId,
      serviceLocationId,
      type: parsed.data.type,
      merk: parsed.data.merk || null,
      model: parsed.data.model || null,
      serienummer: parsed.data.serienummer || null,
      internNummer: parsed.data.internNummer || null,
      status: parsed.data.status,
      plaatsingsDatum: parsed.data.plaatsingsDatum ? new Date(parsed.data.plaatsingsDatum) : null,
      garantieTot: parsed.data.garantieTot ? new Date(parsed.data.garantieTot) : null,
      omschrijving: parsed.data.omschrijving || null,
      notities: parsed.data.notities || null
    }
  });

  await createAuditLog({
    salonId,
    actorUserId: actor.id,
    action: "INSTALLATEUR_ASSET_CREATED",
    entityType: "Asset",
    message: "Installatie aangemaakt vanuit het platform.",
    ipAddress,
    metadata: {
      customerName: location.customerAccount.naam,
      locationName: location.naam ?? `${location.adresregel1}, ${location.plaats}`,
      assetType: parsed.data.type,
      serienummer: parsed.data.serienummer ?? null
    }
  });

  revalidatePath(`/platform/${salonId}/installateurs`);

  return { success: `${parsed.data.type} toegevoegd voor ${location.customerAccount.naam}.` };
}

export async function createWorkOrderAction(
  _: InstallateurWorkOrderFormState,
  formData: FormData
): Promise<InstallateurWorkOrderFormState> {
  const actor = await requirePlatformAdmin();
  const salonId = Number(formData.get("salonId"));

  if (!Number.isInteger(salonId)) {
    return { error: "Ongeldige installateur-tenant geselecteerd." };
  }

  const parsed = workOrderSchema.safeParse({
    customerAccountId: formData.get("customerAccountId"),
    serviceLocationId: formData.get("serviceLocationId"),
    assetId: formData.get("assetId"),
    type: formData.get("type"),
    status: formData.get("status") || "NIEUW",
    prioriteit: formData.get("prioriteit") || "NORMAAL",
    titel: formData.get("titel"),
    melding: formData.get("melding"),
    interneNotities: formData.get("interneNotities") || undefined,
    klantNotities: formData.get("klantNotities") || undefined,
    geplandStart: formData.get("geplandStart") || "",
    geplandEinde: formData.get("geplandEinde") || ""
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Controleer de werkbongegevens." };
  }

  const location = await prisma.serviceLocation.findFirst({
    where: {
      id: parsed.data.serviceLocationId,
      salonId,
      customerAccountId: parsed.data.customerAccountId
    },
    select: {
      id: true,
      naam: true,
      adresregel1: true,
      plaats: true,
      customerAccount: {
        select: {
          naam: true
        }
      }
    }
  });

  if (!location) {
    return { error: "Deze locatie hoort niet bij de geselecteerde klant." };
  }

  if (parsed.data.assetId) {
    const asset = await prisma.asset.findFirst({
      where: {
        id: parsed.data.assetId,
        salonId,
        customerAccountId: parsed.data.customerAccountId,
        serviceLocationId: parsed.data.serviceLocationId
      },
      select: { id: true }
    });

    if (!asset) {
      return { error: "Deze installatie hoort niet bij de geselecteerde locatie." };
    }
  }

  const ipAddress = await getRequestIp();

  await prisma.workOrder.create({
    data: {
      salonId,
      customerAccountId: parsed.data.customerAccountId,
      serviceLocationId: parsed.data.serviceLocationId,
      assetId: parsed.data.assetId,
      type: parsed.data.type,
      status: parsed.data.status,
      prioriteit: parsed.data.prioriteit,
      titel: parsed.data.titel,
      melding: parsed.data.melding,
      interneNotities: parsed.data.interneNotities || null,
      klantNotities: parsed.data.klantNotities || null,
      geplandStart: parsed.data.geplandStart ? new Date(parsed.data.geplandStart) : null,
      geplandEinde: parsed.data.geplandEinde ? new Date(parsed.data.geplandEinde) : null
    }
  });

  await createAuditLog({
    salonId,
    actorUserId: actor.id,
    action: "INSTALLATEUR_WORK_ORDER_CREATED",
    entityType: "WorkOrder",
    message: "Werkbon aangemaakt vanuit het platform.",
    ipAddress,
    metadata: {
      customerName: location.customerAccount.naam,
      locationName: location.naam ?? `${location.adresregel1}, ${location.plaats}`,
      type: parsed.data.type,
      prioriteit: parsed.data.prioriteit
    }
  });

  revalidatePath(`/platform/${salonId}/installateurs`);

  return { success: `Werkbon "${parsed.data.titel}" is toegevoegd.` };
}

export async function createWorkOrderAssignmentAction(
  _: InstallateurAssignmentFormState,
  formData: FormData
): Promise<InstallateurAssignmentFormState> {
  const actor = await requirePlatformAdmin();
  const salonId = Number(formData.get("salonId"));

  if (!Number.isInteger(salonId)) {
    return { error: "Ongeldige installateur-tenant geselecteerd." };
  }

  const parsed = workOrderAssignmentSchema.safeParse({
    workOrderId: formData.get("workOrderId"),
    userId: formData.get("userId"),
    rolOpOpdracht: formData.get("rolOpOpdracht") || "HOOFDMONTEUR",
    status: formData.get("status") || "INGEPLAND",
    geplandStart: formData.get("geplandStart"),
    geplandEinde: formData.get("geplandEinde")
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Controleer de inplangegevens." };
  }

  const [workOrder, user] = await Promise.all([
    prisma.workOrder.findFirst({
      where: {
        id: parsed.data.workOrderId,
        salonId
      },
      select: {
        id: true,
        titel: true
      }
    }),
    prisma.user.findFirst({
      where: {
        id: parsed.data.userId,
        salonId,
        isPlatformAdmin: false,
        status: "ACTIEF"
      },
      select: {
        id: true,
        naam: true
      }
    })
  ]);

  if (!workOrder) {
    return { error: "Deze werkbon hoort niet bij de geselecteerde tenant." };
  }

  if (!user) {
    return { error: "Deze medewerker is niet beschikbaar voor deze tenant." };
  }

  const ipAddress = await getRequestIp();

  await prisma.workOrderAssignment.create({
    data: {
      workOrderId: parsed.data.workOrderId,
      userId: parsed.data.userId,
      rolOpOpdracht: parsed.data.rolOpOpdracht,
      status: parsed.data.status,
      geplandStart: new Date(parsed.data.geplandStart),
      geplandEinde: new Date(parsed.data.geplandEinde)
    }
  });

  await createAuditLog({
    salonId,
    actorUserId: actor.id,
    action: "INSTALLATEUR_WORK_ORDER_ASSIGNMENT_CREATED",
    entityType: "WorkOrderAssignment",
    message: "Werkbon gekoppeld aan medewerker.",
    ipAddress,
    metadata: {
      workOrderId: workOrder.id,
      workOrderTitle: workOrder.titel,
      userId: user.id,
      userName: user.naam,
      rolOpOpdracht: parsed.data.rolOpOpdracht
    }
  });

  revalidatePath(`/platform/${salonId}/installateurs`);

  return { success: `${user.naam} is ingepland op "${workOrder.titel}".` };
}

export async function createServiceReportAction(
  _: InstallateurServiceReportFormState,
  formData: FormData
): Promise<InstallateurServiceReportFormState> {
  const actor = await requirePlatformAdmin();
  const salonId = Number(formData.get("salonId"));

  if (!Number.isInteger(salonId)) {
    return { error: "Ongeldige installateur-tenant geselecteerd." };
  }

  const parsed = serviceReportSchema.safeParse({
    workOrderId: formData.get("workOrderId"),
    ingevuldDoorUserId: formData.get("ingevuldDoorUserId"),
    werkzaamhedenUitgevoerd: formData.get("werkzaamhedenUitgevoerd"),
    bevindingen: formData.get("bevindingen") || undefined,
    advies: formData.get("advies") || undefined,
    vervolgActieNodig: formData.get("vervolgActieNodig") || "false",
    vervolgActieOmschrijving: formData.get("vervolgActieOmschrijving") || undefined,
    afgerondOp: formData.get("afgerondOp")
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Controleer de servicerapportgegevens." };
  }

  const workOrder = await prisma.workOrder.findFirst({
    where: {
      id: parsed.data.workOrderId,
      salonId
    },
    select: {
      id: true,
      titel: true,
      customerAccountId: true,
      serviceLocationId: true,
      assetId: true,
      customerAccount: {
        select: {
          naam: true
        }
      },
      serviceReport: {
        select: {
          id: true
        }
      }
    }
  });

  if (!workOrder) {
    return { error: "Deze werkbon hoort niet bij de geselecteerde tenant." };
  }

  if (workOrder.serviceReport) {
    return { error: "Voor deze werkbon bestaat al een servicerapport." };
  }

  let ingevuldDoorUser:
    | {
        id: number;
        naam: string;
      }
    | null = null;

  if (parsed.data.ingevuldDoorUserId) {
    ingevuldDoorUser = await prisma.user.findFirst({
      where: {
        id: parsed.data.ingevuldDoorUserId,
        salonId,
        isPlatformAdmin: false,
        status: "ACTIEF"
      },
      select: {
        id: true,
        naam: true
      }
    });

    if (!ingevuldDoorUser) {
      return { error: "De gekozen medewerker is niet beschikbaar voor deze tenant." };
    }
  }

  const ipAddress = await getRequestIp();
  const vervolgActieNodig = parsed.data.vervolgActieNodig === "true";

  await prisma.serviceReport.create({
    data: {
      salonId,
      workOrderId: workOrder.id,
      customerAccountId: workOrder.customerAccountId,
      serviceLocationId: workOrder.serviceLocationId,
      assetId: workOrder.assetId,
      ingevuldDoorUserId: parsed.data.ingevuldDoorUserId,
      werkzaamhedenUitgevoerd: parsed.data.werkzaamhedenUitgevoerd,
      bevindingen: parsed.data.bevindingen || null,
      advies: parsed.data.advies || null,
      vervolgActieNodig,
      vervolgActieOmschrijving: vervolgActieNodig ? parsed.data.vervolgActieOmschrijving || null : null,
      afgerondOp: new Date(parsed.data.afgerondOp)
    }
  });

  await prisma.workOrder.update({
    where: {
      id: workOrder.id
    },
    data: {
      status: vervolgActieNodig ? "VERVOLG_NODIG" : "AFGEROND"
    }
  });

  await createAuditLog({
    salonId,
    actorUserId: actor.id,
    action: "INSTALLATEUR_SERVICE_REPORT_CREATED",
    entityType: "ServiceReport",
    message: "Servicerapport aangemaakt vanuit het platform.",
    ipAddress,
    metadata: {
      workOrderId: workOrder.id,
      workOrderTitle: workOrder.titel,
      customerName: workOrder.customerAccount.naam,
      ingevuldDoor: ingevuldDoorUser?.naam ?? null,
      vervolgActieNodig
    }
  });

  revalidatePath(`/platform/${salonId}/installateurs`);

  return { success: `Servicerapport voor "${workOrder.titel}" is opgeslagen.` };
}

export async function uploadInstallateurAttachmentAction(
  _: InstallateurAttachmentFormState,
  formData: FormData
): Promise<InstallateurAttachmentFormState> {
  const actor = await requirePlatformAdmin();
  const salonId = Number(formData.get("salonId"));

  if (!Number.isInteger(salonId)) {
    return { error: "Ongeldige installateur-tenant geselecteerd." };
  }

  const parsed = installateurAttachmentSchema.safeParse({
    workOrderId: formData.get("workOrderId"),
    serviceReportId: formData.get("serviceReportId"),
    notitie: formData.get("notitie") || undefined
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Controleer de mediagegevens." };
  }

  const file = formData.get("bestand");

  if (!(file instanceof File) || file.size === 0) {
    return { error: "Kies eerst een foto of video om te uploaden." };
  }

  const isImage = ALLOWED_IMAGE_TYPES.has(file.type);
  const isVideo = ALLOWED_VIDEO_TYPES.has(file.type);

  if (!isImage && !isVideo) {
    return { error: "Gebruik JPG, PNG, WEBP, MP4, WEBM of MOV." };
  }

  if (isImage && file.size > MAX_IMAGE_FILE_SIZE) {
    return { error: "De foto is te groot. Gebruik een bestand tot maximaal 8 MB." };
  }

  if (isVideo && file.size > MAX_VIDEO_FILE_SIZE) {
    return { error: "De video is te groot. Gebruik een bestand tot maximaal 50 MB." };
  }

  if (!process.env.BLOB_READ_WRITE_TOKEN) {
    return {
      error:
        "Media-opslag is nog niet geconfigureerd. Voeg eerst Vercel Blob toe en zet BLOB_READ_WRITE_TOKEN in je omgeving."
    };
  }

  const workOrder = await prisma.workOrder.findFirst({
    where: {
      id: parsed.data.workOrderId,
      salonId
    },
    select: {
      id: true,
      titel: true,
      customerAccountId: true,
      serviceLocationId: true,
      assetId: true,
      customerAccount: {
        select: {
          naam: true
        }
      }
    }
  });

  if (!workOrder) {
    return { error: "Deze werkbon hoort niet bij de geselecteerde tenant." };
  }

  let serviceReportId: number | null = null;

  if (parsed.data.serviceReportId) {
    const serviceReport = await prisma.serviceReport.findFirst({
      where: {
        id: parsed.data.serviceReportId,
        salonId,
        workOrderId: workOrder.id
      },
      select: {
        id: true
      }
    });

    if (!serviceReport) {
      return { error: "Het gekozen servicerapport hoort niet bij deze werkbon." };
    }

    serviceReportId = serviceReport.id;
  }

  try {
    const blob = await put(
      buildInstallateurAttachmentBlobPath({
        salonId,
        workOrderId: workOrder.id,
        serviceReportId,
        originalName: file.name
      }),
      file,
      {
        access: "private",
        addRandomSuffix: true,
        contentType: file.type
      }
    );

    const attachment = await prisma.installateurAttachment.create({
      data: {
        salonId,
        customerAccountId: workOrder.customerAccountId,
        serviceLocationId: workOrder.serviceLocationId,
        assetId: workOrder.assetId,
        workOrderId: workOrder.id,
        serviceReportId,
        uploadedByUserId: actor.id,
        type: isVideo ? "VIDEO" : "FOTO",
        url: blob.url,
        blobPath: blob.pathname,
        bestandNaam: file.name,
        mimeType: file.type,
        bestandGrootte: file.size,
        notitie: parsed.data.notitie || null
      }
    });

    const ipAddress = await getRequestIp();

    await createAuditLog({
      salonId,
      actorUserId: actor.id,
      action: "INSTALLATEUR_ATTACHMENT_UPLOADED",
      entityType: "InstallateurAttachment",
      entityId: attachment.id,
      message: "Media toegevoegd aan installateurswerkbon.",
      ipAddress,
      metadata: {
        workOrderId: workOrder.id,
        workOrderTitle: workOrder.titel,
        customerName: workOrder.customerAccount.naam,
        type: attachment.type,
        serviceReportId
      }
    });
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : "Uploaden van het mediabestand is mislukt."
    };
  }

  revalidatePath(`/platform/${salonId}/installateurs`);

  return { success: `${isVideo ? "Video" : "Foto"} is toegevoegd aan "${workOrder.titel}".` };
}

export async function sendWorkOrderConfirmationAction(
  _: InstallateurDocumentFormState,
  formData: FormData
): Promise<InstallateurDocumentFormState> {
  const actor = await requirePlatformAdmin();
  const salonId = Number(formData.get("salonId"));

  if (!Number.isInteger(salonId)) {
    return { error: "Ongeldige installateur-tenant geselecteerd." };
  }

  const parsed = installateurDocumentTargetSchema.safeParse({
    id: formData.get("workOrderId")
  });

  if (!parsed.success) {
    return { error: "Kies eerst een werkbon." };
  }

  const workOrder = await prisma.workOrder.findFirst({
    where: {
      id: parsed.data.id,
      salonId
    },
    select: {
      id: true,
      titel: true,
      type: true,
      prioriteit: true,
      klantNotities: true,
      geplandStart: true,
      geplandEinde: true,
      customerAccount: {
        select: {
          naam: true,
          email: true
        }
      },
      serviceLocation: {
        select: {
          naam: true,
          adresregel1: true,
          plaats: true
        }
      },
      salon: {
        select: {
          naam: true,
          instellingen: {
            select: {
              weergavenaam: true
            }
          }
        }
      }
    }
  });

  if (!workOrder) {
    return { error: "Deze werkbon hoort niet bij de geselecteerde tenant." };
  }

  if (!workOrder.customerAccount.email) {
    return { error: "Deze klant heeft nog geen e-mailadres voor bevestigingen." };
  }

  const salonName = workOrder.salon.instellingen?.weergavenaam ?? workOrder.salon.naam;
  const locationLabel = workOrder.serviceLocation.naam ?? `${workOrder.serviceLocation.adresregel1}, ${workOrder.serviceLocation.plaats}`;
  const plannedWindow =
    workOrder.geplandStart && workOrder.geplandEinde
      ? `${formatDate(workOrder.geplandStart)} - ${formatDate(workOrder.geplandEinde)}`
      : null;

  const delivery = await sendTransactionalEmail({
    to: workOrder.customerAccount.email,
    ...buildWorkOrderConfirmationEmail({
      salonName,
      customerName: workOrder.customerAccount.naam,
      workOrderTitle: workOrder.titel,
      workOrderType: workOrder.type,
      priority: workOrder.prioriteit,
      locationLabel,
      plannedWindow,
      note: workOrder.klantNotities
    })
  });

  if (!delivery.delivered) {
    return { error: "Bevestigingsmail kon niet worden verstuurd. Controleer de e-mailconfiguratie." };
  }

  const ipAddress = await getRequestIp();

  await createAuditLog({
    salonId,
    actorUserId: actor.id,
    action: "INSTALLATEUR_WORK_ORDER_CONFIRMATION_SENT",
    entityType: "WorkOrder",
    entityId: workOrder.id,
    message: "Opdrachtbevestiging verstuurd naar klant.",
    ipAddress,
    metadata: {
      workOrderTitle: workOrder.titel,
      email: workOrder.customerAccount.email
    }
  });

  return { success: `Opdrachtbevestiging verstuurd naar ${workOrder.customerAccount.email}.` };
}

export async function sendServiceReportEmailAction(
  _: InstallateurDocumentFormState,
  formData: FormData
): Promise<InstallateurDocumentFormState> {
  const actor = await requirePlatformAdmin();
  const salonId = Number(formData.get("salonId"));

  if (!Number.isInteger(salonId)) {
    return { error: "Ongeldige installateur-tenant geselecteerd." };
  }

  const parsed = installateurDocumentTargetSchema.safeParse({
    id: formData.get("serviceReportId")
  });

  if (!parsed.success) {
    return { error: "Kies eerst een servicerapport." };
  }

  const serviceReport = await prisma.serviceReport.findFirst({
    where: {
      id: parsed.data.id,
      salonId
    },
    select: {
      id: true,
      werkzaamhedenUitgevoerd: true,
      bevindingen: true,
      advies: true,
      vervolgActieOmschrijving: true,
      afgerondOp: true,
      workOrder: {
        select: {
          titel: true
        }
      },
      customerAccount: {
        select: {
          naam: true,
          email: true
        }
      },
      salon: {
        select: {
          naam: true,
          instellingen: {
            select: {
              weergavenaam: true
            }
          }
        }
      }
    }
  });

  if (!serviceReport) {
    return { error: "Dit servicerapport hoort niet bij de geselecteerde tenant." };
  }

  if (!serviceReport.customerAccount.email) {
    return { error: "Deze klant heeft nog geen e-mailadres voor rapporten." };
  }

  const salonName = serviceReport.salon.instellingen?.weergavenaam ?? serviceReport.salon.naam;

  const delivery = await sendTransactionalEmail({
    to: serviceReport.customerAccount.email,
    ...buildServiceReportEmail({
      salonName,
      customerName: serviceReport.customerAccount.naam,
      workOrderTitle: serviceReport.workOrder.titel,
      completedAt: serviceReport.afgerondOp,
      werkzaamhedenUitgevoerd: serviceReport.werkzaamhedenUitgevoerd,
      bevindingen: serviceReport.bevindingen,
      advies: serviceReport.advies,
      vervolgActieOmschrijving: serviceReport.vervolgActieOmschrijving
    })
  });

  if (!delivery.delivered) {
    return { error: "Servicerapport kon niet worden verstuurd. Controleer de e-mailconfiguratie." };
  }

  const ipAddress = await getRequestIp();

  await createAuditLog({
    salonId,
    actorUserId: actor.id,
    action: "INSTALLATEUR_SERVICE_REPORT_SENT",
    entityType: "ServiceReport",
    entityId: serviceReport.id,
    message: "Servicerapport verstuurd naar klant.",
    ipAddress,
    metadata: {
      workOrderTitle: serviceReport.workOrder.titel,
      email: serviceReport.customerAccount.email
    }
  });

  return { success: `Servicerapport verstuurd naar ${serviceReport.customerAccount.email}.` };
}
