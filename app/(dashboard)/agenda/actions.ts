"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import type { FormState } from "@/components/customer-form";
import { requireSalonSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { createAuditLog, getRequestIp } from "@/lib/security";
import { formatDateParamLocal } from "@/lib/utils";
import { appointmentSchema, appointmentUpdateSchema } from "@/lib/validation";

function toDateParam(value: Date) {
  return formatDateParamLocal(value);
}

function buildAppointmentEndDate(datumStart: string, duurMinuten: number) {
  const start = new Date(datumStart);
  return new Date(start.getTime() + duurMinuten * 60000);
}

export async function createAppointmentAction(
  _: FormState,
  formData: FormData
): Promise<FormState> {
  const user = await requireSalonSession();
  const ipAddress = await getRequestIp();

  const parsed = appointmentSchema.safeParse({
    customerId: formData.get("customerId"),
    userId: formData.get("userId"),
    datumStart: formData.get("datumStart"),
    duurMinuten: formData.get("duurMinuten"),
    behandeling: formData.get("behandeling"),
    behandelingKleur: formData.get("behandelingKleur"),
    notities: formData.get("notities") || undefined,
    status: formData.get("status")
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Controleer de afspraakgegevens." };
  }

  try {
    const [customer, medewerker] = await Promise.all([
      prisma.customer.findFirst({
        where: {
          id: parsed.data.customerId,
          salonId: user.salonId
        },
        select: {
          id: true,
          naam: true
        }
      }),
      parsed.data.userId
        ? prisma.user.findFirst({
            where: {
              id: parsed.data.userId,
              salonId: user.salonId,
              isPlatformAdmin: false
            },
            select: {
              id: true,
              naam: true
            }
          })
        : Promise.resolve(null)
    ]);

    if (!customer) {
      return { error: "Deze klant hoort niet bij deze salon." };
    }

    if (parsed.data.userId && !medewerker) {
      return { error: "Deze behandelaar hoort niet bij deze salon." };
    }

    const datumStart = new Date(parsed.data.datumStart);
    const datumEinde = buildAppointmentEndDate(parsed.data.datumStart, parsed.data.duurMinuten);

    const afspraak = await prisma.appointment.create({
      data: {
        salonId: user.salonId,
        customerId: customer.id,
        userId: parsed.data.userId,
        datumStart,
        datumEinde,
        duurMinuten: parsed.data.duurMinuten,
        behandeling: parsed.data.behandeling,
        behandelingKleur: parsed.data.behandelingKleur,
        notities: parsed.data.notities || null,
        status: parsed.data.status
      }
    });

    await createAuditLog({
      salonId: user.salonId,
      actorUserId: user.id,
      action: "APPOINTMENT_CREATED",
      entityType: "Appointment",
      entityId: afspraak.id,
      message: `Afspraak aangemaakt voor ${customer.naam}.`,
      ipAddress,
      metadata: {
        customerId: customer.id,
        customerName: customer.naam,
        medewerkerId: medewerker?.id ?? null,
        medewerkerNaam: medewerker?.naam ?? null,
        datumStart: afspraak.datumStart.toISOString(),
        datumEinde: afspraak.datumEinde.toISOString(),
        duurMinuten: afspraak.duurMinuten,
        behandelingKleur: afspraak.behandelingKleur
      }
    });

    const dateParam = toDateParam(afspraak.datumStart);
    revalidatePath(`/agenda?datum=${dateParam}`);
    revalidatePath("/dashboard");
    return { success: "Afspraak is toegevoegd." };
  } catch {
    return { error: "Opslaan van de afspraak is mislukt." };
  }
}

export async function updateAppointmentAction(
  _: FormState,
  formData: FormData
): Promise<FormState> {
  const user = await requireSalonSession();
  const ipAddress = await getRequestIp();

  const parsed = appointmentUpdateSchema.safeParse({
    appointmentId: formData.get("appointmentId"),
    customerId: formData.get("customerId"),
    userId: formData.get("userId"),
    datumStart: formData.get("datumStart"),
    duurMinuten: formData.get("duurMinuten"),
    behandeling: formData.get("behandeling"),
    behandelingKleur: formData.get("behandelingKleur"),
    notities: formData.get("notities") || undefined,
    status: formData.get("status")
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Controleer de afspraakgegevens." };
  }

  try {
    const [appointment, customer, medewerker] = await Promise.all([
      prisma.appointment.findFirst({
        where: {
          id: parsed.data.appointmentId,
          salonId: user.salonId
        },
        select: {
          id: true,
          datumStart: true,
          convertedTreatment: {
            select: {
              id: true
            }
          }
        }
      }),
      prisma.customer.findFirst({
        where: {
          id: parsed.data.customerId,
          salonId: user.salonId
        },
        select: {
          id: true,
          naam: true
        }
      }),
      parsed.data.userId
        ? prisma.user.findFirst({
            where: {
              id: parsed.data.userId,
              salonId: user.salonId,
              isPlatformAdmin: false
            },
            select: {
              id: true,
              naam: true
            }
          })
        : Promise.resolve(null)
    ]);

    if (!appointment) {
      return { error: "Deze afspraak hoort niet bij deze salon." };
    }

    if (!customer) {
      return { error: "Deze klant hoort niet bij deze salon." };
    }

    if (parsed.data.userId && !medewerker) {
      return { error: "Deze behandelaar hoort niet bij deze salon." };
    }

    if (parsed.data.status === "VOLTOOID" && !appointment.convertedTreatment) {
      return {
        error:
          "Voltooi deze afspraak via Behandeling registreren en afboeken, zodat de behandeling en eventuele stempelkaart correct worden verwerkt."
      };
    }

    const datumStart = new Date(parsed.data.datumStart);
    const datumEinde = buildAppointmentEndDate(parsed.data.datumStart, parsed.data.duurMinuten);

    const updated = await prisma.appointment.update({
      where: { id: parsed.data.appointmentId },
      data: {
        customerId: customer.id,
        userId: parsed.data.userId,
        datumStart,
        datumEinde,
        duurMinuten: parsed.data.duurMinuten,
        behandeling: parsed.data.behandeling,
        behandelingKleur: parsed.data.behandelingKleur,
        notities: parsed.data.notities || null,
        status: parsed.data.status
      }
    });

    await createAuditLog({
      salonId: user.salonId,
      actorUserId: user.id,
      action: "APPOINTMENT_UPDATED",
      entityType: "Appointment",
      entityId: updated.id,
      message: `Afspraak bijgewerkt voor ${customer.naam}.`,
      ipAddress,
      metadata: {
        customerId: customer.id,
        customerName: customer.naam,
        medewerkerId: medewerker?.id ?? null,
        medewerkerNaam: medewerker?.naam ?? null,
        datumStart: updated.datumStart.toISOString(),
        datumEinde: updated.datumEinde.toISOString(),
        duurMinuten: updated.duurMinuten,
        behandelingKleur: updated.behandelingKleur,
        status: updated.status
      }
    });

    revalidatePath(`/agenda?datum=${toDateParam(appointment.datumStart)}`);
    revalidatePath(`/agenda?datum=${toDateParam(updated.datumStart)}`);
    revalidatePath(`/agenda/${updated.id}/bewerken`);
    return { success: "Afspraak is bijgewerkt." };
  } catch {
    return { error: "Bijwerken van de afspraak is mislukt." };
  }
}

export async function deleteAppointmentAction(formData: FormData): Promise<void> {
  const user = await requireSalonSession();
  const ipAddress = await getRequestIp();
  const appointmentId = Number(formData.get("appointmentId"));

  if (!Number.isInteger(appointmentId)) {
    throw new Error("Ongeldige afspraak geselecteerd.");
  }

  const appointment = await prisma.appointment.findFirst({
    where: {
      id: appointmentId,
      salonId: user.salonId
    },
    select: {
      id: true,
      customer: {
        select: {
          id: true,
          naam: true
        }
      },
      datumStart: true
    }
  });

  if (!appointment) {
    throw new Error("Afspraak niet gevonden.");
  }

  await prisma.appointment.delete({
    where: { id: appointmentId }
  });

  await createAuditLog({
    salonId: user.salonId,
    actorUserId: user.id,
    action: "APPOINTMENT_DELETED",
    entityType: "Appointment",
    entityId: appointmentId,
    message: `Afspraak verwijderd voor ${appointment.customer.naam}.`,
    ipAddress,
    metadata: {
      customerId: appointment.customer.id,
      customerName: appointment.customer.naam,
      datumStart: appointment.datumStart.toISOString()
    }
  });

  revalidatePath(`/agenda?datum=${toDateParam(appointment.datumStart)}`);
  redirect(`/agenda?datum=${toDateParam(appointment.datumStart)}`);
}
