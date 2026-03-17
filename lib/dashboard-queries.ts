import { prisma } from "@/lib/prisma";

function getTodayRange() {
  const now = new Date();
  const start = new Date(now);
  start.setHours(0, 0, 0, 0);

  const end = new Date(now);
  end.setHours(23, 59, 59, 999);

  return { start, end };
}

export function formatTime(date: Date | string) {
  return new Intl.DateTimeFormat("nl-NL", {
    hour: "2-digit",
    minute: "2-digit"
  }).format(new Date(date));
}

export async function getDashboardData(salonId: number) {
  const { start: vandaagStart, end: vandaagEinde } = getTodayRange();

  const [
    aantalAfsprakenVandaag,
    openAfsprakenVandaag,
    behandelingenVandaag,
    nieuweKlantenVandaag,
    actievePakketten,
    actieveMedewerkers,
    afsprakenVandaag,
    laatsteBehandelingen,
    openPakketten
  ] = await Promise.all([
    prisma.appointment.count({
      where: {
        salonId,
        datumStart: {
          gte: vandaagStart,
          lte: vandaagEinde
        }
      }
    }),
    prisma.appointment.count({
      where: {
        salonId,
        status: "GEPLAND",
        datumStart: {
          gte: vandaagStart,
          lte: vandaagEinde
        }
      }
    }),
    prisma.treatment.count({
      where: {
        salonId,
        datum: {
          gte: vandaagStart,
          lte: vandaagEinde
        }
      }
    }),
    prisma.customer.count({
      where: {
        salonId,
        createdAt: {
          gte: vandaagStart,
          lte: vandaagEinde
        }
      }
    }),
    prisma.customerPackage.count({
      where: {
        salonId,
        status: "ACTIEF"
      }
    }),
    prisma.user.count({
      where: {
        salonId,
        status: "ACTIEF",
        isPlatformAdmin: false
      }
    }),
    prisma.appointment.findMany({
      where: {
        salonId,
        datumStart: {
          gte: vandaagStart,
          lte: vandaagEinde
        }
      },
      orderBy: { datumStart: "asc" },
      take: 6,
      include: {
        customer: {
          select: {
            id: true,
            naam: true
          }
        },
        user: {
          select: {
            naam: true
          }
        }
      }
    }),
    prisma.treatment.findMany({
      where: { salonId },
      orderBy: { datum: "desc" },
      take: 5,
      include: {
        customer: {
          select: { naam: true }
        }
      }
    }),
    prisma.customerPackage.findMany({
      where: {
        salonId,
        status: "ACTIEF"
      },
      orderBy: [{ resterendeBeurten: "asc" }, { gekochtOp: "asc" }],
      take: 5,
      include: {
        customer: {
          select: {
            id: true,
            naam: true
          }
        }
      }
    })
  ]);

  return {
    aantalAfsprakenVandaag,
    openAfsprakenVandaag,
    behandelingenVandaag,
    nieuweKlantenVandaag,
    actievePakketten,
    actieveMedewerkers,
    afsprakenVandaag,
    laatsteBehandelingen,
    openPakketten
  };
}
