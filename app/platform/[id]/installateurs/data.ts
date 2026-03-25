import { Prisma } from "@prisma/client";
import { notFound } from "next/navigation";
import { requirePlatformAdmin } from "@/lib/core/auth";
import { prisma } from "@/lib/prisma";
import { buildInstallateurSearchVariants } from "@/lib/installateurs/search";

export const installateurCustomerInclude = Prisma.validator<Prisma.CustomerAccountInclude>()({
  locations: {
    include: {
      assets: {
        orderBy: [{ createdAt: "desc" }]
      }
    },
    orderBy: [{ createdAt: "desc" }]
  },
  assets: {
    orderBy: [{ createdAt: "desc" }]
  },
  customerPortalUsers: {
    orderBy: [{ createdAt: "desc" }]
  },
  workOrders: {
    include: {
      assignments: {
        include: {
          user: {
            select: {
              id: true,
              naam: true,
              rol: true
            }
          }
        },
        orderBy: [{ geplandStart: "asc" }]
      },
      serviceLocation: {
        select: {
          naam: true,
          adresregel1: true,
          plaats: true
        }
      },
      asset: {
        select: {
          id: true,
          type: true,
          merk: true,
          model: true
        }
      },
      attachments: {
        include: {
          uploadedByUser: {
            select: {
              id: true,
              naam: true
            }
          }
        },
        orderBy: [{ createdAt: "desc" }]
      },
      serviceReport: {
        include: {
          ingevuldDoorUser: {
            select: {
              id: true,
              naam: true,
              rol: true
            }
          },
          attachments: {
            include: {
              uploadedByUser: {
                select: {
                  id: true,
                  naam: true
                }
              }
            },
            orderBy: [{ createdAt: "desc" }]
          }
        }
      }
    },
    orderBy: [{ createdAt: "desc" }],
    take: 12
  }
});

export const appointmentRequestInclude = Prisma.validator<Prisma.AppointmentRequestInclude>()({
  portalUser: {
    select: {
      id: true,
      naam: true,
      email: true
    }
  },
  customerAccount: {
    select: {
      id: true,
      naam: true
    }
  },
  serviceLocation: {
    select: {
      id: true,
      naam: true,
      adresregel1: true,
      plaats: true
    }
  },
  asset: {
    select: {
      id: true,
      type: true,
      merk: true,
      model: true
    }
  },
  gekozenVoorkeur: true,
  workOrder: {
    select: {
      id: true,
      titel: true
    }
  },
  preferences: {
    orderBy: [{ voorkeurNummer: "asc" }]
  }
});

export type InstallateurAppointmentRequestWithRelations = Prisma.AppointmentRequestGetPayload<{
  include: typeof appointmentRequestInclude;
}>;

export type InstallateurCustomerAccountWithRelations = Prisma.CustomerAccountGetPayload<{
  include: typeof installateurCustomerInclude;
}>;

export function isMissingInstallateurSchemaError(error: unknown) {
  return (
    error instanceof Error &&
    (
      error.message.includes("customeraccount") ||
      error.message.includes("servicelocation") ||
      error.message.includes("asset") ||
      error.message.includes("workorder") ||
      error.message.includes("workorderassignment") ||
      error.message.includes("servicereport") ||
      error.message.includes("installateurattachment") ||
      error.message.includes("customerportaluser") ||
      error.message.includes("appointmentrequest")
    )
  );
}

export async function loadInstallateursData(salonId: number, zoekterm = "") {
  await requirePlatformAdmin();

  if (!Number.isInteger(salonId)) {
    notFound();
  }

  const search = buildInstallateurSearchVariants(zoekterm);

  const salon = await prisma.salon.findUnique({
    where: { id: salonId },
    select: {
      id: true,
      naam: true,
      slug: true,
      instellingen: {
        select: {
          weergavenaam: true
        }
      }
    }
  });

  if (!salon) {
    notFound();
  }

  const [customerAccounts, medewerkers, appointmentRequests] = await Promise.all([
    prisma.customerAccount.findMany({
      where: {
        salonId,
        OR: zoekterm
          ? [
              { naam: { contains: zoekterm, mode: "insensitive" } },
              { telefoon: { contains: search.compact, mode: "insensitive" } },
              { email: { contains: zoekterm, mode: "insensitive" } },
              { klantnummer: { contains: zoekterm, mode: "insensitive" } },
              {
                locations: {
                  some: {
                    OR: [
                      { naam: { contains: zoekterm, mode: "insensitive" } },
                      { adresregel1: { contains: zoekterm, mode: "insensitive" } },
                      { plaats: { contains: zoekterm, mode: "insensitive" } },
                      { postcode: { contains: search.postcodeCandidate, mode: "insensitive" } }
                    ]
                  }
                }
              }
            ]
          : undefined
      },
      include: installateurCustomerInclude,
      orderBy: [{ updatedAt: "desc" }, { naam: "asc" }]
    }) as Promise<InstallateurCustomerAccountWithRelations[]>,
    prisma.user.findMany({
      where: {
        salonId,
        isPlatformAdmin: false,
        status: "ACTIEF"
      },
      select: {
        id: true,
        naam: true,
        rol: true
      },
      orderBy: [{ rol: "asc" }, { naam: "asc" }]
    }),
    prisma.appointmentRequest.findMany({
      where: {
        salonId
      },
      include: appointmentRequestInclude,
      orderBy: [{ createdAt: "desc" }]
    }) as Promise<InstallateurAppointmentRequestWithRelations[]>
  ]);

  const totalLocations = customerAccounts.reduce((count, customer) => count + customer.locations.length, 0);
  const totalAssets = customerAccounts.reduce((count, customer) => count + customer.assets.length, 0);
  const totalWorkOrders = customerAccounts.reduce((count, customer) => count + customer.workOrders.length, 0);
  const totalAssignments = customerAccounts.reduce(
    (count, customer) => count + customer.workOrders.reduce((inner, workOrder) => inner + workOrder.assignments.length, 0),
    0
  );
  const totalServiceReports = customerAccounts.reduce(
    (count, customer) => count + customer.workOrders.filter((workOrder) => workOrder.serviceReport).length,
    0
  );
  const totalAttachments = customerAccounts.reduce(
    (count, customer) =>
      count +
      customer.workOrders.reduce(
        (inner, workOrder) =>
          inner + workOrder.attachments.filter((attachment) => !attachment.serviceReportId).length + (workOrder.serviceReport?.attachments.length ?? 0),
        0
      ),
    0
  );
  const customerOptions = customerAccounts.map((customer) => ({
    id: customer.id,
    naam: customer.naam,
    locations: customer.locations.map((location) => ({
      id: location.id,
      label: location.naam ?? `${location.adresregel1}, ${location.plaats}`,
      assets: location.assets.map((asset) => ({
        id: asset.id,
        label: asset.merk || asset.model
          ? `${asset.type} · ${[asset.merk, asset.model].filter(Boolean).join(" ")}`
          : asset.type
      }))
    }))
  }));

  return {
    salon,
    salonNaam: salon.instellingen?.weergavenaam ?? salon.naam,
    zoekterm,
    customerAccounts,
    medewerkers,
    appointmentRequests,
    totalLocations,
    totalAssets,
    totalWorkOrders,
    totalAssignments,
    totalServiceReports,
    totalAttachments,
    totalAppointmentRequests: appointmentRequests.length,
    customerOptions,
    workOrderOptions: customerAccounts.flatMap((customer) =>
      customer.workOrders.map((workOrder) => ({
        id: workOrder.id,
        label: `${customer.naam} · ${workOrder.titel}`
      }))
    ),
    openWorkOrderOptions: customerAccounts.flatMap((customer) =>
      customer.workOrders
        .filter((workOrder) => !workOrder.serviceReport)
        .map((workOrder) => ({
          id: workOrder.id,
          label: `${customer.naam} · ${workOrder.titel}`
        }))
    ),
    attachmentWorkOrderOptions: customerAccounts.flatMap((customer) =>
      customer.workOrders.map((workOrder) => ({
        id: workOrder.id,
        label: `${customer.naam} · ${workOrder.titel}`,
        serviceReportId: workOrder.serviceReport?.id ?? null
      }))
    ),
    workOrderConfirmationOptions: customerAccounts.flatMap((customer) =>
      customer.email
        ? customer.workOrders.map((workOrder) => ({
            id: workOrder.id,
            label: `${customer.naam} · ${workOrder.titel}`
          }))
        : []
    ),
    serviceReportEmailOptions: customerAccounts.flatMap((customer) =>
      customer.email
        ? customer.workOrders
            .filter((workOrder) => workOrder.serviceReport)
            .map((workOrder) => ({
              id: workOrder.serviceReport!.id,
              label: `${customer.naam} · ${workOrder.titel}`
            }))
        : []
    ),
    portalBaseUrl: `/portaal/login?salon=${encodeURIComponent(salon.slug)}`
  };
}
