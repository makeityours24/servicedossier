import { prisma } from "@/lib/prisma";
import { groupAppointmentSegmentsByVisit } from "@/lib/appointment-visits";
import { isMissingVisitSchemaError } from "@/lib/visit-schema-support";

function getTodayRange() {
  const now = new Date();
  const start = new Date(now);
  start.setHours(0, 0, 0, 0);

  const end = new Date(now);
  end.setHours(23, 59, 59, 999);

  return { start, end };
}

export function formatTime(date: Date | string, locale?: string) {
  const intlLocale = locale === "en" ? "en-GB" : locale === "de" ? "de-DE" : "nl-NL";

  return new Intl.DateTimeFormat(intlLocale, {
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

export async function getDashboardVisitData(salonId: number) {
  const { start: vandaagStart, end: vandaagEinde } = getTodayRange();

  try {
    const [
      aantalBezoekenVandaag,
      openBezoekenVandaag,
      aantalSegmentenVandaag,
      openSegmentenVandaag,
      segmentenVandaag
    ] = await Promise.all([
      prisma.appointmentVisit.count({
        where: {
          salonId,
          datum: {
            gte: vandaagStart,
            lte: vandaagEinde
          }
        }
      }),
      prisma.appointmentVisit.count({
        where: {
          salonId,
          status: "GEPLAND",
          datum: {
            gte: vandaagStart,
            lte: vandaagEinde
          }
        }
      }),
      prisma.appointmentSegment.count({
        where: {
          salonId,
          datumStart: {
            gte: vandaagStart,
            lte: vandaagEinde
          }
        }
      }),
      prisma.appointmentSegment.count({
        where: {
          salonId,
          status: "GEPLAND",
          datumStart: {
            gte: vandaagStart,
            lte: vandaagEinde
          }
        }
      }),
      prisma.appointmentSegment.findMany({
        where: {
          salonId,
          datumStart: {
            gte: vandaagStart,
            lte: vandaagEinde
          }
        },
        orderBy: [{ datumStart: "asc" }, { id: "asc" }],
        take: 8,
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
      })
    ]);

    return {
      aantalBezoekenVandaag,
      openBezoekenVandaag,
      aantalSegmentenVandaag,
      openSegmentenVandaag,
      segmentenVandaag,
      bezoekenVandaag: groupAppointmentSegmentsByVisit(segmentenVandaag)
    };
  } catch (error) {
    if (!isMissingVisitSchemaError(error)) {
      throw error;
    }

    console.error("Dashboard visit data skipped because the production database is missing the visit schema.", error);

    return {
      aantalBezoekenVandaag: 0,
      openBezoekenVandaag: 0,
      aantalSegmentenVandaag: 0,
      openSegmentenVandaag: 0,
      segmentenVandaag: [],
      bezoekenVandaag: []
    };
  }
}
