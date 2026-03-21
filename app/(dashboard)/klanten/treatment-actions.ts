"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import type { FormState } from "@/components/customer-form";
import { requireSalonSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { createAuditLog, getRequestIp } from "@/lib/security";
import {
  applyPackageUsage,
  getPackageStatusForRemainingSessions,
  rollbackPackageUsage,
  validateAppointmentConversion
} from "@/lib/treatment-workflows";
import { treatmentSchema } from "@/lib/validation";

async function rollbackTreatmentPackageUsage(params: {
  treatmentId: number;
  salonId: number;
}) {
  const existingUsage = await prisma.customerPackageUsage.findFirst({
    where: {
      treatmentId: params.treatmentId,
      salonId: params.salonId
    },
    select: {
      id: true,
      aantalAfgeboekt: true,
      customerPackageId: true,
      customerPackage: {
        select: {
          resterendeBeurten: true
        }
      }
    }
  });

  if (!existingUsage) {
    return null;
  }

  const rollbackResult = rollbackPackageUsage({
    resterendeBeurten: existingUsage.customerPackage.resterendeBeurten,
    aantalAfgeboekt: existingUsage.aantalAfgeboekt
  });

  await prisma.customerPackage.update({
    where: { id: existingUsage.customerPackageId },
    data: {
      resterendeBeurten: rollbackResult.resterendeBeurten,
      status: rollbackResult.status
    }
  });

  await prisma.customerPackageUsage.delete({
    where: { id: existingUsage.id }
  });

  return existingUsage;
}

async function attachTreatmentPackageUsage(params: {
  salonId: number;
  customerId: number;
  treatmentId: number;
  customerPackageId: number | null;
  userId: number;
  datum: Date;
}) {
  if (!params.customerPackageId) {
    return null;
  }

  const customerPackage = await prisma.customerPackage.findFirst({
    where: {
      id: params.customerPackageId,
      salonId: params.salonId,
      customerId: params.customerId,
      status: "ACTIEF"
    },
    select: {
      id: true,
      naamSnapshot: true,
      resterendeBeurten: true
    }
  });

  if (!customerPackage) {
    throw new Error("Het gekozen pakket hoort niet bij deze klant of is niet actief.");
  }

  const usageResult = applyPackageUsage({
    resterendeBeurten: customerPackage.resterendeBeurten,
    aantalAfgeboekt: 1
  });

  await prisma.customerPackageUsage.create({
    data: {
      salonId: params.salonId,
      customerPackageId: customerPackage.id,
      customerId: params.customerId,
      treatmentId: params.treatmentId,
      userId: params.userId,
      datum: params.datum,
      aantalAfgeboekt: 1
    }
  });

  await prisma.customerPackage.update({
    where: { id: customerPackage.id },
    data: {
      resterendeBeurten: usageResult.resterendeBeurten,
      status: usageResult.status
    }
  });

  return {
    customerPackageId: customerPackage.id,
    packageName: customerPackage.naamSnapshot,
    resterendeBeurten: usageResult.resterendeBeurten,
    status: usageResult.status
  };
}

export async function createTreatmentAction(
  _: FormState,
  formData: FormData
): Promise<FormState> {
  const user = await requireSalonSession();

  const parsed = treatmentSchema.safeParse({
    customerId: formData.get("customerId"),
    appointmentId: formData.get("appointmentId"),
    datum: formData.get("datum"),
    behandelaarUserId: formData.get("behandelaarUserId"),
    behandeling: formData.get("behandeling"),
    recept: formData.get("recept"),
    behandelaar: formData.get("behandelaar"),
    notities: formData.get("notities") || undefined,
    customerPackageId: formData.get("customerPackageId")
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Controleer de behandelgegevens." };
  }

  try {
    const datum = new Date(parsed.data.datum);
    let appointmentMetadata:
      | {
          id: number;
          datumStart: Date;
          behandeling: string;
        }
      | null = null;

    if (parsed.data.appointmentId) {
      const appointment = await prisma.appointment.findFirst({
        where: {
          id: parsed.data.appointmentId,
          salonId: user.salonId,
          customerId: parsed.data.customerId
        },
        select: {
          id: true,
          datumStart: true,
          behandeling: true,
          convertedTreatment: {
            select: {
              id: true
            }
          }
        }
      });

      const appointmentError = validateAppointmentConversion({
        appointmentExists: Boolean(appointment),
        alreadyConverted: Boolean(appointment?.convertedTreatment)
      });

      if (appointmentError) {
        return { error: appointmentError };
      }

      if (!appointment) {
        return { error: "Deze afspraak hoort niet bij deze klant of salon." };
      }

      appointmentMetadata = {
        id: appointment.id,
        datumStart: appointment.datumStart,
        behandeling: appointment.behandeling
      };
    }

    const behandelaarGebruiker = parsed.data.behandelaarUserId
      ? await prisma.user.findFirst({
          where: {
            id: parsed.data.behandelaarUserId,
            salonId: user.salonId,
            isPlatformAdmin: false,
            status: "ACTIEF"
          },
          select: {
            id: true,
            naam: true
          }
        })
      : null;

    if (parsed.data.behandelaarUserId && !behandelaarGebruiker) {
      return { error: "Deze behandelaar hoort niet bij deze salon." };
    }

    const treatment = await prisma.treatment.create({
      data: {
        salonId: user.salonId,
        customerId: parsed.data.customerId,
        userId: behandelaarGebruiker?.id ?? user.id,
        sourceAppointmentId: appointmentMetadata?.id ?? null,
        datum,
        behandeling: parsed.data.behandeling,
        recept: parsed.data.recept,
        behandelaar: behandelaarGebruiker?.naam ?? parsed.data.behandelaar,
        notities: parsed.data.notities
      }
    });

    const packageUsage = await attachTreatmentPackageUsage({
      salonId: user.salonId,
      customerId: parsed.data.customerId,
      treatmentId: treatment.id,
      customerPackageId: parsed.data.customerPackageId,
      userId: user.id,
      datum
    });

    if (appointmentMetadata) {
      await prisma.appointment.update({
        where: { id: appointmentMetadata.id },
        data: {
          status: "VOLTOOID"
        }
      });
    }

    revalidatePath(`/klanten/${parsed.data.customerId}`);
    revalidatePath("/dashboard");
    revalidatePath("/agenda");
    const nextState: FormState = { success: "Behandeling is opgeslagen." };

    if (packageUsage?.status === getPackageStatusForRemainingSessions(0)) {
      nextState.suggestionHref = `/klanten/${parsed.data.customerId}#pakket-toevoegen`;
      nextState.suggestionLabel = "Nieuwe kaart toevoegen";
    }

    return nextState;
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : "Opslaan van de behandeling is mislukt."
    };
  }
}

export async function updateTreatmentAction(
  _: FormState,
  formData: FormData
): Promise<FormState> {
  const user = await requireSalonSession();
  const treatmentId = Number(formData.get("treatmentId"));

  if (!Number.isInteger(treatmentId)) {
    return { error: "Ongeldige behandeling geselecteerd." };
  }

  const parsed = treatmentSchema.safeParse({
    customerId: formData.get("customerId"),
    datum: formData.get("datum"),
    behandelaarUserId: formData.get("behandelaarUserId"),
    behandeling: formData.get("behandeling"),
    recept: formData.get("recept"),
    behandelaar: formData.get("behandelaar"),
    notities: formData.get("notities") || undefined,
    customerPackageId: formData.get("customerPackageId")
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Controleer de behandelgegevens." };
  }

  try {
    const bestaandeBehandeling = await prisma.treatment.findFirst({
      where: {
        id: treatmentId,
        salonId: user.salonId,
        customerId: parsed.data.customerId
      },
      select: { id: true }
    });

    if (!bestaandeBehandeling) {
      return { error: "Deze behandeling hoort niet bij deze salon of klant." };
    }

    const behandelaarGebruiker = parsed.data.behandelaarUserId
      ? await prisma.user.findFirst({
          where: {
            id: parsed.data.behandelaarUserId,
            salonId: user.salonId,
            isPlatformAdmin: false,
            status: "ACTIEF"
          },
          select: {
            id: true,
            naam: true
          }
        })
      : null;

    if (parsed.data.behandelaarUserId && !behandelaarGebruiker) {
      return { error: "Deze behandelaar hoort niet bij deze salon." };
    }

    await rollbackTreatmentPackageUsage({
      treatmentId,
      salonId: user.salonId
    });

    const datum = new Date(parsed.data.datum);

    await prisma.treatment.update({
      where: { id: treatmentId },
      data: {
        datum,
        userId: behandelaarGebruiker?.id ?? user.id,
        behandeling: parsed.data.behandeling,
        recept: parsed.data.recept,
        behandelaar: behandelaarGebruiker?.naam ?? parsed.data.behandelaar,
        notities: parsed.data.notities
      }
    });

    const packageUsage = await attachTreatmentPackageUsage({
      salonId: user.salonId,
      customerId: parsed.data.customerId,
      treatmentId,
      customerPackageId: parsed.data.customerPackageId,
      userId: user.id,
      datum
    });

    revalidatePath(`/klanten/${parsed.data.customerId}`);
    revalidatePath(`/klanten/${parsed.data.customerId}/print`);
    const nextState: FormState = { success: "Behandeling is bijgewerkt." };

    if (packageUsage?.status === getPackageStatusForRemainingSessions(0)) {
      nextState.suggestionHref = `/klanten/${parsed.data.customerId}#pakket-toevoegen`;
      nextState.suggestionLabel = "Nieuwe kaart toevoegen";
    }

    return nextState;
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : "Bijwerken van de behandeling is mislukt."
    };
  }
}

export async function deleteTreatmentAction(formData: FormData): Promise<void> {
  const user = await requireSalonSession();
  const ipAddress = await getRequestIp();
  const treatmentId = Number(formData.get("treatmentId"));
  const customerId = Number(formData.get("customerId"));

  if (!Number.isInteger(treatmentId) || !Number.isInteger(customerId)) {
    throw new Error("Ongeldige behandeling geselecteerd.");
  }

  const behandeling = await prisma.treatment.findFirst({
    where: {
      id: treatmentId,
      salonId: user.salonId,
      customerId
    },
    select: { id: true }
  });

  if (!behandeling) {
    throw new Error("Behandeling niet gevonden.");
  }

  await rollbackTreatmentPackageUsage({
    treatmentId,
    salonId: user.salonId
  });

  await prisma.treatment.delete({
    where: { id: treatmentId }
  });

  await createAuditLog({
    salonId: user.salonId,
    actorUserId: user.id,
    action: "TREATMENT_DELETED",
    entityType: "TREATMENT",
    entityId: treatmentId,
    message: "Behandeling verwijderd.",
    ipAddress,
    metadata: {
      customerId
    }
  });

  revalidatePath(`/klanten/${customerId}`);
  revalidatePath(`/klanten/${customerId}/print`);
  revalidatePath("/dashboard");
  redirect(`/klanten/${customerId}`);
}
