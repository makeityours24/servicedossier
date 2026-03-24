"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import type { FormState } from "@/components/customer-form";
import { requireSalonSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { createAuditLog, getRequestIp } from "@/lib/security";
import { buildAppointmentSegmentEnd } from "@/lib/appointment-visits";
import { formatDateParamLocal } from "@/lib/utils";
import { appointmentSchema, appointmentUpdateSchema, appointmentVisitSchema } from "@/lib/validation";

function toDateParam(value: Date) {
  return formatDateParamLocal(value);
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
    const datumEinde = buildAppointmentSegmentEnd(parsed.data.datumStart, parsed.data.duurMinuten);

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
    const datumEinde = buildAppointmentSegmentEnd(parsed.data.datumStart, parsed.data.duurMinuten);

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

export async function createAppointmentVisitAction(
  _: FormState,
  formData: FormData
): Promise<FormState> {
  const user = await requireSalonSession();
  const ipAddress = await getRequestIp();

  const segmentsJson = formData.get("segmentsJson");
  let parsedSegments: unknown = [];

  if (typeof segmentsJson === "string" && segmentsJson.trim()) {
    try {
      parsedSegments = JSON.parse(segmentsJson);
    } catch {
      return { error: "Controleer de onderdelen van dit bezoek." };
    }
  }

  const parsed = appointmentVisitSchema.safeParse({
    customerId: formData.get("customerId"),
    datum: formData.get("datum"),
    notities: formData.get("notities") || undefined,
    status: formData.get("status"),
    segments: parsedSegments
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Controleer de gegevens van dit bezoek." };
  }

  try {
    const customer = await prisma.customer.findFirst({
      where: {
        id: parsed.data.customerId,
        salonId: user.salonId
      },
      select: {
        id: true,
        naam: true
      }
    });

    if (!customer) {
      return { error: "Deze klant hoort niet bij deze salon." };
    }

    const userIds = Array.from(
      new Set(parsed.data.segments.map((segment) => segment.userId).filter((value): value is number => Boolean(value)))
    );

    if (userIds.length > 0) {
      const medewerkerCount = await prisma.user.count({
        where: {
          id: { in: userIds },
          salonId: user.salonId,
          isPlatformAdmin: false
        }
      });

      if (medewerkerCount !== userIds.length) {
        return { error: "Een of meer behandelaars horen niet bij deze salon." };
      }
    }

    const visit = await prisma.appointmentVisit.create({
      data: {
        salonId: user.salonId,
        customerId: customer.id,
        datum: new Date(parsed.data.datum),
        notities: parsed.data.notities || null,
        status: parsed.data.status,
        segments: {
          create: parsed.data.segments.map((segment) => ({
            salonId: user.salonId,
            customerId: customer.id,
            userId: segment.userId,
            datumStart: new Date(segment.datumStart),
            datumEinde: buildAppointmentSegmentEnd(segment.datumStart, segment.duurMinuten),
            duurMinuten: segment.duurMinuten,
            behandeling: segment.behandeling,
            behandelingKleur: segment.behandelingKleur,
            notities: segment.notities || null,
            status: segment.status
          }))
        }
      },
      include: {
        segments: {
          select: {
            id: true,
            userId: true,
            datumStart: true,
            datumEinde: true,
            duurMinuten: true,
            behandeling: true,
            behandelingKleur: true,
            status: true
          }
        }
      }
    });

    await createAuditLog({
      salonId: user.salonId,
      actorUserId: user.id,
      action: "APPOINTMENT_VISIT_CREATED",
      entityType: "AppointmentVisit",
      entityId: visit.id,
      message: `Samengesteld bezoek aangemaakt voor ${customer.naam}.`,
      ipAddress,
      metadata: {
        customerId: customer.id,
        customerName: customer.naam,
        datum: visit.datum.toISOString(),
        segmentCount: visit.segments.length,
        segments: visit.segments.map((segment) => ({
          id: segment.id,
          userId: segment.userId,
          datumStart: segment.datumStart.toISOString(),
          datumEinde: segment.datumEinde.toISOString(),
          duurMinuten: segment.duurMinuten,
          behandeling: segment.behandeling,
          behandelingKleur: segment.behandelingKleur,
          status: segment.status
        }))
      }
    });

    const dateParam = toDateParam(visit.datum);
    revalidatePath(`/agenda?datum=${dateParam}`);
    revalidatePath("/dashboard");
    return { success: "Samengesteld bezoek is toegevoegd." };
  } catch {
    return { error: "Opslaan van het samengestelde bezoek is mislukt." };
  }
}

export async function updateAppointmentVisitAction(
  _: FormState,
  formData: FormData
): Promise<FormState> {
  const user = await requireSalonSession();
  const ipAddress = await getRequestIp();
  const visitId = Number(formData.get("visitId"));

  if (!Number.isInteger(visitId)) {
    return { error: "Ongeldig bezoek geselecteerd." };
  }

  const segmentsJson = formData.get("segmentsJson");
  let parsedSegments: unknown = [];

  if (typeof segmentsJson === "string" && segmentsJson.trim()) {
    try {
      parsedSegments = JSON.parse(segmentsJson);
    } catch {
      return { error: "Controleer de onderdelen van dit bezoek." };
    }
  }

  const parsed = appointmentVisitSchema.safeParse({
    customerId: formData.get("customerId"),
    datum: formData.get("datum"),
    notities: formData.get("notities") || undefined,
    status: formData.get("status"),
    segments: parsedSegments
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Controleer de gegevens van dit bezoek." };
  }

  try {
    const [existingVisit, customer] = await Promise.all([
      prisma.appointmentVisit.findFirst({
        where: {
          id: visitId,
          salonId: user.salonId
        },
        select: {
          id: true,
          datum: true
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
      })
    ]);

    if (!existingVisit) {
      return { error: "Dit bezoek hoort niet bij deze salon." };
    }

    if (!customer) {
      return { error: "Deze klant hoort niet bij deze salon." };
    }

    const userIds = Array.from(
      new Set(parsed.data.segments.map((segment) => segment.userId).filter((value): value is number => Boolean(value)))
    );

    if (userIds.length > 0) {
      const medewerkerCount = await prisma.user.count({
        where: {
          id: { in: userIds },
          salonId: user.salonId,
          isPlatformAdmin: false
        }
      });

      if (medewerkerCount !== userIds.length) {
        return { error: "Een of meer behandelaars horen niet bij deze salon." };
      }
    }

    const updatedVisit = await prisma.$transaction(async (tx) => {
      await tx.appointmentSegment.deleteMany({
        where: {
          visitId,
          salonId: user.salonId
        }
      });

      return tx.appointmentVisit.update({
        where: { id: visitId },
        data: {
          customerId: customer.id,
          datum: new Date(parsed.data.datum),
          notities: parsed.data.notities || null,
          status: parsed.data.status,
          segments: {
            create: parsed.data.segments.map((segment) => ({
              salonId: user.salonId,
              customerId: customer.id,
              userId: segment.userId,
              datumStart: new Date(segment.datumStart),
              datumEinde: buildAppointmentSegmentEnd(segment.datumStart, segment.duurMinuten),
              duurMinuten: segment.duurMinuten,
              behandeling: segment.behandeling,
              behandelingKleur: segment.behandelingKleur,
              notities: segment.notities || null,
              status: segment.status
            }))
          }
        },
        include: {
          segments: {
            select: {
              id: true,
              userId: true,
              datumStart: true,
              datumEinde: true,
              duurMinuten: true,
              behandeling: true,
              behandelingKleur: true,
              status: true
            }
          }
        }
      });
    });

    await createAuditLog({
      salonId: user.salonId,
      actorUserId: user.id,
      action: "APPOINTMENT_VISIT_UPDATED",
      entityType: "AppointmentVisit",
      entityId: updatedVisit.id,
      message: `Samengesteld bezoek bijgewerkt voor ${customer.naam}.`,
      ipAddress,
      metadata: {
        customerId: customer.id,
        customerName: customer.naam,
        datum: updatedVisit.datum.toISOString(),
        segmentCount: updatedVisit.segments.length,
        segments: updatedVisit.segments.map((segment) => ({
          id: segment.id,
          userId: segment.userId,
          datumStart: segment.datumStart.toISOString(),
          datumEinde: segment.datumEinde.toISOString(),
          duurMinuten: segment.duurMinuten,
          behandeling: segment.behandeling,
          behandelingKleur: segment.behandelingKleur,
          status: segment.status
        }))
      }
    });

    revalidatePath(`/agenda?datum=${toDateParam(existingVisit.datum)}`);
    revalidatePath(`/agenda?datum=${toDateParam(updatedVisit.datum)}`);
    revalidatePath(`/agenda/bezoeken/${updatedVisit.id}/bewerken`);
    revalidatePath("/dashboard");
    return { success: "Samengesteld bezoek is bijgewerkt." };
  } catch {
    return { error: "Bijwerken van het samengestelde bezoek is mislukt." };
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

export async function deleteAppointmentVisitAction(formData: FormData): Promise<void> {
  const user = await requireSalonSession();
  const ipAddress = await getRequestIp();
  const visitId = Number(formData.get("visitId"));

  if (!Number.isInteger(visitId)) {
    throw new Error("Ongeldig bezoek geselecteerd.");
  }

  const visit = await prisma.appointmentVisit.findFirst({
    where: {
      id: visitId,
      salonId: user.salonId
    },
    select: {
      id: true,
      datum: true,
      customer: {
        select: {
          id: true,
          naam: true
        }
      }
    }
  });

  if (!visit) {
    throw new Error("Samengesteld bezoek niet gevonden.");
  }

  await prisma.appointmentVisit.delete({
    where: { id: visitId }
  });

  await createAuditLog({
    salonId: user.salonId,
    actorUserId: user.id,
    action: "APPOINTMENT_VISIT_DELETED",
    entityType: "AppointmentVisit",
    entityId: visitId,
    message: `Samengesteld bezoek verwijderd voor ${visit.customer.naam}.`,
    ipAddress,
    metadata: {
      customerId: visit.customer.id,
      customerName: visit.customer.naam,
      datum: visit.datum.toISOString()
    }
  });

  revalidatePath(`/agenda?datum=${toDateParam(visit.datum)}`);
  revalidatePath("/dashboard");
  redirect(`/agenda?datum=${toDateParam(visit.datum)}`);
}
