import { prisma } from "@/lib/prisma";
import { groupAppointmentSegmentsByVisit } from "@/lib/appointment-visits";
import { formatDateParamLocal } from "@/lib/utils";

export function getDayRange(datum?: string) {
  const baseDate = datum ? new Date(`${datum}T00:00:00`) : new Date();
  const dayStart = new Date(baseDate);
  dayStart.setHours(0, 0, 0, 0);

  const dayEnd = new Date(baseDate);
  dayEnd.setHours(23, 59, 59, 999);

  return { dayStart, dayEnd };
}

export function getAdjacentAgendaDates(dayStart: Date) {
  const vorigeDag = new Date(dayStart);
  vorigeDag.setDate(vorigeDag.getDate() - 1);

  const volgendeDag = new Date(dayStart);
  volgendeDag.setDate(volgendeDag.getDate() + 1);

  return {
    vorigeDag,
    volgendeDag,
    vorigeDagParam: formatDateParamLocal(vorigeDag),
    volgendeDagParam: formatDateParamLocal(volgendeDag)
  };
}

export async function getAgendaData(params: {
  salonId: number;
  dayStart: Date;
  dayEnd: Date;
  medewerkerFilter?: string;
}) {
  const medewerkerId = params.medewerkerFilter ? Number(params.medewerkerFilter) || undefined : undefined;

  const [appointments, customers, medewerkers] = await Promise.all([
    prisma.appointment.findMany({
      where: {
        salonId: params.salonId,
        datumStart: {
          gte: params.dayStart,
          lte: params.dayEnd
        },
        userId: medewerkerId
      },
      orderBy: { datumStart: "asc" },
      include: {
        customer: {
          select: {
            id: true,
            naam: true,
            telefoonnummer: true
          }
        },
        user: {
          select: {
            naam: true
          }
        },
        convertedTreatment: {
          select: {
            id: true
          }
        }
      }
    }),
    prisma.customer.findMany({
      where: { salonId: params.salonId },
      orderBy: { naam: "asc" },
      select: {
        id: true,
        naam: true
      }
    }),
    prisma.user.findMany({
      where: {
        salonId: params.salonId,
        isPlatformAdmin: false,
        status: "ACTIEF"
      },
      orderBy: { naam: "asc" },
      select: {
        id: true,
        naam: true
      }
    })
  ]);

  return {
    appointments,
    customers,
    medewerkers
  };
}

export async function getAgendaVisitData(params: {
  salonId: number;
  dayStart: Date;
  dayEnd: Date;
  medewerkerFilter?: string;
}) {
  const medewerkerId = params.medewerkerFilter ? Number(params.medewerkerFilter) || undefined : undefined;

  const [segments, customers, medewerkers] = await Promise.all([
    prisma.appointmentSegment.findMany({
      where: {
        salonId: params.salonId,
        datumStart: {
          gte: params.dayStart,
          lte: params.dayEnd
        },
        userId: medewerkerId
      },
      orderBy: [{ datumStart: "asc" }, { id: "asc" }],
      include: {
        visit: {
          select: {
            id: true,
            datum: true,
            notities: true,
            status: true
          }
        },
        customer: {
          select: {
            id: true,
            naam: true,
            telefoonnummer: true
          }
        },
        user: {
          select: {
            id: true,
            naam: true
          }
        },
        convertedTreatment: {
          select: {
            id: true
          }
        }
      }
    }),
    prisma.customer.findMany({
      where: { salonId: params.salonId },
      orderBy: { naam: "asc" },
      select: {
        id: true,
        naam: true
      }
    }),
    prisma.user.findMany({
      where: {
        salonId: params.salonId,
        isPlatformAdmin: false,
        status: "ACTIEF"
      },
      orderBy: { naam: "asc" },
      select: {
        id: true,
        naam: true
      }
    })
  ]);

  return {
    segments,
    visits: groupAppointmentSegmentsByVisit(segments),
    customers,
    medewerkers
  };
}
