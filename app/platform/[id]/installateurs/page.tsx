import Link from "next/link";
import { notFound } from "next/navigation";
import { Prisma } from "@prisma/client";
import { requirePlatformAdmin } from "@/lib/core/auth";
import { prisma } from "@/lib/prisma";
import { formatDate, formatDateOnly } from "@/lib/utils";
import { buildInstallateurSearchVariants } from "@/lib/installateurs/search";
import {
  createAssetAction,
  createWorkOrderAssignmentAction,
  createCustomerAccountAction,
  createServiceReportAction,
  createServiceLocationAction,
  sendServiceReportEmailAction,
  sendWorkOrderConfirmationAction,
  createWorkOrderAction,
  uploadInstallateurAttachmentAction
} from "@/app/platform/[id]/installateurs/actions";
import { InstallateurAttachmentForm } from "@/components/installateur-attachment-form";
import { InstallateurAssetForm } from "@/components/installateur-asset-form";
import { InstallateurCustomerAccountForm } from "@/components/installateur-customer-account-form";
import { InstallateurDocumentSendForm } from "@/components/installateur-document-send-form";
import { InstallateurServiceReportForm } from "@/components/installateur-service-report-form";
import { InstallateurServiceLocationForm } from "@/components/installateur-service-location-form";
import { InstallateurWorkOrderAssignmentForm } from "@/components/installateur-work-order-assignment-form";
import { InstallateurWorkOrderForm } from "@/components/installateur-work-order-form";

type PlatformInstallateursPageProps = {
  params: Promise<{ id: string }>;
  searchParams?: Promise<{ zoek?: string }>;
};

const installateurCustomerInclude = Prisma.validator<Prisma.CustomerAccountInclude>()({
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

type InstallateurCustomerAccountWithRelations = Prisma.CustomerAccountGetPayload<{
  include: typeof installateurCustomerInclude;
}>;

function isMissingInstallateurSchemaError(error: unknown) {
  return (
    error instanceof Error &&
    (
      error.message.includes("customeraccount") ||
      error.message.includes("servicelocation") ||
      error.message.includes("asset") ||
      error.message.includes("workorder") ||
      error.message.includes("workorderassignment") ||
      error.message.includes("servicereport") ||
      error.message.includes("installateurattachment")
    )
  );
}

export default async function PlatformInstallateursPage({
  params,
  searchParams
}: PlatformInstallateursPageProps) {
  await requirePlatformAdmin();

  const { id } = await params;
  const salonId = Number(id);

  if (!Number.isInteger(salonId)) {
    notFound();
  }

  const resolvedSearchParams = searchParams ? await searchParams : undefined;
  const zoekterm = resolvedSearchParams?.zoek?.trim() ?? "";
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

  try {
    const [customerAccounts, medewerkers] = await Promise.all([
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
      })
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
    const workOrderOptions = customerAccounts.flatMap((customer) =>
      customer.workOrders.map((workOrder) => ({
        id: workOrder.id,
        label: `${customer.naam} · ${workOrder.titel}`
      }))
    );
    const openWorkOrderOptions = customerAccounts.flatMap((customer) =>
      customer.workOrders
        .filter((workOrder) => !workOrder.serviceReport)
        .map((workOrder) => ({
          id: workOrder.id,
          label: `${customer.naam} · ${workOrder.titel}`
        }))
    );
    const attachmentWorkOrderOptions = customerAccounts.flatMap((customer) =>
      customer.workOrders.map((workOrder) => ({
        id: workOrder.id,
        label: `${customer.naam} · ${workOrder.titel}`,
        serviceReportId: workOrder.serviceReport?.id ?? null
      }))
    );
    const workOrderConfirmationOptions = customerAccounts.flatMap((customer) =>
      customer.email
        ? customer.workOrders.map((workOrder) => ({
            id: workOrder.id,
            label: `${customer.naam} · ${workOrder.titel}`
          }))
        : []
    );
    const serviceReportEmailOptions = customerAccounts.flatMap((customer) =>
      customer.email
        ? customer.workOrders
            .filter((workOrder) => workOrder.serviceReport)
            .map((workOrder) => ({
              id: workOrder.serviceReport!.id,
              label: `${customer.naam} · ${workOrder.titel}`
            }))
        : []
    );
    const salonNaam = salon.instellingen?.weergavenaam ?? salon.naam;

    return (
      <div className="rooster">
        <section className="bovenbalk">
          <div>
            <span className="logo-label">Installateurs pilot</span>
            <h2 className="pagina-titel" style={{ fontSize: "2.2rem" }}>
              {salonNaam}
            </h2>
            <p className="subtitel">
              Eerste backoffice-module voor installateurklanten, servicelocaties en zoeken op naam, adres en postcode.
            </p>
          </div>

          <div className="acties">
            <Link href={`/platform/${salonId}`} className="knop-zacht">
              Terug naar tenantdetail
            </Link>
            <Link href="/platform" className="knop-secundair">
              Terug naar platform
            </Link>
          </div>
        </section>

        <section className="statistieken">
          <article className="stat-kaart">
            <h3>Installateurklanten</h3>
            <strong>{customerAccounts.length}</strong>
          </article>
          <article className="stat-kaart">
            <h3>Servicelocaties</h3>
            <strong>{totalLocations}</strong>
          </article>
          <article className="stat-kaart">
            <h3>Zoekmodus</h3>
            <strong>{zoekterm ? "Gefilterd" : "Alles"}</strong>
          </article>
          <article className="stat-kaart">
            <h3>Installaties</h3>
            <strong>{totalAssets}</strong>
          </article>
          <article className="stat-kaart">
            <h3>Werkbonnen</h3>
            <strong>{totalWorkOrders}</strong>
          </article>
          <article className="stat-kaart">
            <h3>Inplanningen</h3>
            <strong>{totalAssignments}</strong>
          </article>
          <article className="stat-kaart">
            <h3>Servicerapporten</h3>
            <strong>{totalServiceReports}</strong>
          </article>
          <article className="stat-kaart">
            <h3>Media</h3>
            <strong>{totalAttachments}</strong>
          </article>
        </section>

        <section className="kaart">
          <form className="acties" method="get" style={{ alignItems: "end", gap: 12 }}>
            <div className="veld" style={{ flex: 1, minWidth: 280 }}>
              <label htmlFor="zoek">Zoeken</label>
              <input
                id="zoek"
                name="zoek"
                defaultValue={zoekterm}
                placeholder="Zoek op naam, telefoon, adres, postcode of plaats"
              />
            </div>
            <button type="submit" className="knop">
              Zoek
            </button>
            {zoekterm ? (
              <Link href={`/platform/${salonId}/installateurs`} className="knop-zacht">
                Wis filter
              </Link>
            ) : null}
          </form>
        </section>

        <section className="twee-kolommen">
          <article className="kaart">
            <h3>Nieuwe installateurklant</h3>
            <p className="meta" style={{ marginTop: 10 }}>
              Gebruik deze klantstructuur voor bedrijven en particulieren. Later koppelen we hier installaties, werkbonnen en portalgebruikers aan.
            </p>
            <div style={{ marginTop: 18 }}>
              <InstallateurCustomerAccountForm salonId={salonId} action={createCustomerAccountAction} />
            </div>
          </article>

          <article className="kaart">
            <h3>Nieuwe servicelocatie</h3>
            <p className="meta" style={{ marginTop: 10 }}>
              Locaties zijn los van de klant, zodat zoeken op postcode en adres straks net zo snel werkt als zoeken op naam.
            </p>
            <div style={{ marginTop: 18 }}>
              <InstallateurServiceLocationForm
                salonId={salonId}
                customers={customerOptions}
                action={createServiceLocationAction}
              />
            </div>
          </article>
        </section>

        <section className="kaart">
          <h3>Nieuwe installatie</h3>
          <p className="meta" style={{ marginTop: 10 }}>
            Koppel installaties aan een servicelocatie zodat we hierna werkbonnen, servicehistorie en portalinzage op objectniveau kunnen bouwen.
          </p>
          <div style={{ marginTop: 18 }}>
            <InstallateurAssetForm salonId={salonId} customers={customerOptions} action={createAssetAction} />
          </div>
        </section>

        <section className="kaart">
          <h3>Nieuwe werkbon</h3>
          <p className="meta" style={{ marginTop: 10 }}>
            Maak storingen, onderhoud, montage en inspecties direct aan op klant-, locatie- en installatieniveau. De planning bouwen we hierna bovenop deze werkbonnen.
          </p>
          <div style={{ marginTop: 18 }}>
            <InstallateurWorkOrderForm salonId={salonId} customers={customerOptions} action={createWorkOrderAction} />
          </div>
        </section>

        <section className="kaart">
          <h3>Monteur koppelen aan werkbon</h3>
          <p className="meta" style={{ marginTop: 10 }}>
            Plan medewerkers nu al op werkbonniveau in. Dit vormt de basis voor de dag- en weekplanning die hierna volgt.
          </p>
          <div style={{ marginTop: 18 }}>
            <InstallateurWorkOrderAssignmentForm
              salonId={salonId}
              workOrders={workOrderOptions}
              users={medewerkers.map((user) => ({
                id: user.id,
                naam: user.naam,
                rol: user.rol
              }))}
              action={createWorkOrderAssignmentAction}
            />
          </div>
        </section>

        <section className="kaart">
          <h3>Servicerapport toevoegen</h3>
          <p className="meta" style={{ marginTop: 10 }}>
            Rond een werkbon inhoudelijk af met uitgevoerde werkzaamheden, bevindingen en eventueel een vervolgactie. De werkbonstatus loopt hier automatisch in mee.
          </p>
          <div style={{ marginTop: 18 }}>
            <InstallateurServiceReportForm
              salonId={salonId}
              openWorkOrders={openWorkOrderOptions}
              users={medewerkers.map((user) => ({
                id: user.id,
                naam: user.naam,
                rol: user.rol
              }))}
              action={createServiceReportAction}
            />
          </div>
        </section>

        <section className="kaart">
          <h3>Foto of video toevoegen</h3>
          <p className="meta" style={{ marginTop: 10 }}>
            Voeg bewijs, schadebeelden of situatievideo&apos;s toe aan een werkbon. Als er al een servicerapport is, kun je het bestand daar ook direct aan koppelen.
          </p>
          <div style={{ marginTop: 18 }}>
            <InstallateurAttachmentForm
              salonId={salonId}
              workOrders={attachmentWorkOrderOptions}
              action={uploadInstallateurAttachmentAction}
            />
          </div>
        </section>

        <section className="twee-kolommen">
          <article className="kaart">
            <h3>Opdrachtbevestiging versturen</h3>
            <p className="meta" style={{ marginTop: 10 }}>
              Verstuur een nette bevestiging naar klanten met een e-mailadres. De inhoud gebruikt direct de werkbongegevens en geplande tijden.
            </p>
            <div style={{ marginTop: 18 }}>
              <InstallateurDocumentSendForm
                salonId={salonId}
                fieldName="workOrderId"
                label="Werkbon"
                emptyLabel="Kies een werkbon"
                submitLabel="Bevestiging versturen"
                submitBusyLabel="Versturen..."
                options={workOrderConfirmationOptions}
                action={sendWorkOrderConfirmationAction}
              />
            </div>
          </article>

          <article className="kaart">
            <h3>Servicerapport versturen</h3>
            <p className="meta" style={{ marginTop: 10 }}>
              Stuur afgeronde servicerapporten rechtstreeks naar de klant. Dit is de eerste documentlaag; pdf-uitwerking kan hier later bovenop komen.
            </p>
            <div style={{ marginTop: 18 }}>
              <InstallateurDocumentSendForm
                salonId={salonId}
                fieldName="serviceReportId"
                label="Servicerapport"
                emptyLabel="Kies een servicerapport"
                submitLabel="Servicerapport versturen"
                submitBusyLabel="Versturen..."
                options={serviceReportEmailOptions}
                action={sendServiceReportEmailAction}
              />
            </div>
          </article>
        </section>

        <section className="kaart">
          <div className="acties" style={{ justifyContent: "space-between", alignItems: "center" }}>
            <div>
              <h3>Installateurklanten en locaties</h3>
              <p className="meta" style={{ marginTop: 8 }}>
                {zoekterm
                  ? `Resultaten voor "${zoekterm}".`
                  : "Overzicht van de eerste installateursdata binnen deze tenant."}
              </p>
            </div>
            <span className="badge">{customerAccounts.length} klantaccounts</span>
          </div>

          <div className="lijst" style={{ marginTop: 18 }}>
            {customerAccounts.length === 0 ? (
              <div className="leeg">
                {zoekterm
                  ? "Geen installateurklanten gevonden met deze zoekterm."
                  : "Er zijn nog geen installateurklanten toegevoegd aan deze tenant."}
              </div>
            ) : (
              customerAccounts.map((customer) => (
                <div className="lijst-item" key={customer.id}>
                  <div className="acties" style={{ justifyContent: "space-between", alignItems: "center" }}>
                    <div>
                      <h4>{customer.naam}</h4>
                      <p className="meta">
                        {customer.type === "BEDRIJF" ? "Bedrijf" : "Particulier"}
                        {customer.telefoon ? ` · ${customer.telefoon}` : ""}
                        {customer.email ? ` · ${customer.email}` : ""}
                      </p>
                    </div>
                    <span className="badge">{customer.locations.length} locatie(s) · {customer.assets.length} installatie(s)</span>
                  </div>

                  {customer.locations.length === 0 ? (
                    <p className="meta" style={{ marginTop: 12 }}>
                      Nog geen servicelocaties gekoppeld.
                    </p>
                  ) : (
                    <div className="lijst" style={{ marginTop: 14 }}>
                      {customer.locations.map((location) => (
                        <div className="lijst-item" key={location.id}>
                          <h4>{location.naam ?? `${location.adresregel1}, ${location.plaats}`}</h4>
                          <p className="meta">
                            {location.adresregel1}
                            {location.adresregel2 ? `, ${location.adresregel2}` : ""}
                            <br />
                            {location.postcode} {location.plaats} · {location.land}
                            <br />
                            Toegevoegd op {formatDateOnly(location.createdAt)}
                          </p>
                          {location.assets.length > 0 ? (
                            <div className="lijst" style={{ marginTop: 12 }}>
                              {location.assets.map((asset) => (
                                <div className="lijst-item" key={asset.id}>
                                  <h4>
                                    {asset.type}
                                    {asset.merk || asset.model
                                      ? ` · ${[asset.merk, asset.model].filter(Boolean).join(" ")}`
                                      : ""}
                                  </h4>
                                  <p className="meta">
                                    Status: {asset.status}
                                    {asset.serienummer ? ` · Serienummer: ${asset.serienummer}` : ""}
                                    {asset.plaatsingsDatum ? ` · Geplaatst op ${formatDateOnly(asset.plaatsingsDatum)}` : ""}
                                  </p>
                                </div>
                              ))}
                            </div>
                          ) : null}
                        </div>
                      ))}
                    </div>
                  )}

                  <p className="meta" style={{ marginTop: 12 }}>
                    Laatst bijgewerkt: {formatDate(customer.updatedAt)}
                  </p>

                  {customer.workOrders.length > 0 ? (
                    <div style={{ marginTop: 16 }}>
                      <h4 style={{ marginBottom: 10 }}>Recente werkbonnen</h4>
                      <div className="lijst">
                        {customer.workOrders.map((workOrder) => (
                          <div className="lijst-item" key={workOrder.id}>
                            <div className="acties" style={{ justifyContent: "space-between", alignItems: "center" }}>
                              <h4>{workOrder.titel}</h4>
                              <span className="badge">
                                {workOrder.type} · {workOrder.status}
                              </span>
                            </div>
                            <p className="meta">
                              Locatie: {workOrder.serviceLocation.naam ?? `${workOrder.serviceLocation.adresregel1}, ${workOrder.serviceLocation.plaats}`}
                              <br />
                              Prioriteit: {workOrder.prioriteit}
                              {workOrder.asset
                                ? ` · Installatie: ${workOrder.asset.type}${workOrder.asset.merk || workOrder.asset.model ? ` (${[workOrder.asset.merk, workOrder.asset.model].filter(Boolean).join(" ")})` : ""}`
                                : ""}
                              <br />
                              Aangemaakt op {formatDate(workOrder.createdAt)}
                            </p>
                            {workOrder.assignments.length > 0 ? (
                              <div className="lijst" style={{ marginTop: 12 }}>
                                {workOrder.assignments.map((assignment) => (
                                  <div className="lijst-item" key={assignment.id}>
                                    <h4>{assignment.user.naam}</h4>
                                    <p className="meta">
                                      {assignment.rolOpOpdracht} · {assignment.status}
                                      <br />
                                      {formatDate(assignment.geplandStart)} - {formatDate(assignment.geplandEinde)}
                                    </p>
                                  </div>
                                ))}
                              </div>
                            ) : null}
                            {workOrder.attachments.filter((attachment) => !attachment.serviceReportId).length > 0 ? (
                              <div className="lijst" style={{ marginTop: 12 }}>
                                {workOrder.attachments.filter((attachment) => !attachment.serviceReportId).map((attachment) => {
                                  const attachmentUrl = `/api/installateur-attachments/${attachment.id}`;
                                  return (
                                    <div className="lijst-item" key={attachment.id}>
                                      <div className="acties" style={{ justifyContent: "space-between", alignItems: "center" }}>
                                        <h4>{attachment.bestandNaam}</h4>
                                        <span className="badge">{attachment.type}</span>
                                      </div>
                                      {attachment.type === "FOTO" ? (
                                        <img
                                          src={attachmentUrl}
                                          alt={attachment.bestandNaam}
                                          style={{ width: "100%", maxWidth: 320, borderRadius: 12, marginTop: 10 }}
                                        />
                                      ) : (
                                        <video
                                          controls
                                          preload="metadata"
                                          style={{ width: "100%", maxWidth: 320, borderRadius: 12, marginTop: 10 }}
                                        >
                                          <source src={attachmentUrl} type={attachment.mimeType} />
                                        </video>
                                      )}
                                      <p className="meta" style={{ marginTop: 8 }}>
                                        Toegevoegd op {formatDate(attachment.createdAt)}
                                        {attachment.uploadedByUser?.naam ? ` · Door ${attachment.uploadedByUser.naam}` : ""}
                                      </p>
                                      {attachment.notitie ? (
                                        <p className="meta" style={{ marginTop: 8 }}>
                                          <strong>Notitie:</strong> {attachment.notitie}
                                        </p>
                                      ) : null}
                                    </div>
                                  );
                                })}
                              </div>
                            ) : null}
                            {workOrder.serviceReport ? (
                              <div className="lijst" style={{ marginTop: 12 }}>
                                <div className="lijst-item">
                                  <div className="acties" style={{ justifyContent: "space-between", alignItems: "center" }}>
                                    <h4>Servicerapport</h4>
                                    <span className="badge">
                                      {workOrder.serviceReport.vervolgActieNodig ? "Vervolgactie nodig" : "Afgerond"}
                                    </span>
                                  </div>
                                  <p className="meta">
                                    Afgerond op {formatDate(workOrder.serviceReport.afgerondOp)}
                                    {workOrder.serviceReport.ingevuldDoorUser ? ` · Door ${workOrder.serviceReport.ingevuldDoorUser.naam}` : ""}
                                  </p>
                                  <p className="meta" style={{ marginTop: 8 }}>
                                    <strong>Werkzaamheden:</strong> {workOrder.serviceReport.werkzaamhedenUitgevoerd}
                                  </p>
                                  {workOrder.serviceReport.bevindingen ? (
                                    <p className="meta" style={{ marginTop: 8 }}>
                                      <strong>Bevindingen:</strong> {workOrder.serviceReport.bevindingen}
                                    </p>
                                  ) : null}
                                  {workOrder.serviceReport.advies ? (
                                    <p className="meta" style={{ marginTop: 8 }}>
                                      <strong>Advies:</strong> {workOrder.serviceReport.advies}
                                    </p>
                                  ) : null}
                                  {workOrder.serviceReport.vervolgActieOmschrijving ? (
                                    <p className="meta" style={{ marginTop: 8 }}>
                                      <strong>Vervolgactie:</strong> {workOrder.serviceReport.vervolgActieOmschrijving}
                                    </p>
                                  ) : null}
                                  {workOrder.serviceReport.attachments.length > 0 ? (
                                    <div className="lijst" style={{ marginTop: 12 }}>
                                      {workOrder.serviceReport.attachments.map((attachment) => {
                                        const attachmentUrl = `/api/installateur-attachments/${attachment.id}`;
                                        return (
                                          <div className="lijst-item" key={attachment.id}>
                                            <div className="acties" style={{ justifyContent: "space-between", alignItems: "center" }}>
                                              <h4>{attachment.bestandNaam}</h4>
                                              <span className="badge">Bij rapport · {attachment.type}</span>
                                            </div>
                                            {attachment.type === "FOTO" ? (
                                              <img
                                                src={attachmentUrl}
                                                alt={attachment.bestandNaam}
                                                style={{ width: "100%", maxWidth: 320, borderRadius: 12, marginTop: 10 }}
                                              />
                                            ) : (
                                              <video
                                                controls
                                                preload="metadata"
                                                style={{ width: "100%", maxWidth: 320, borderRadius: 12, marginTop: 10 }}
                                              >
                                                <source src={attachmentUrl} type={attachment.mimeType} />
                                              </video>
                                            )}
                                            <p className="meta" style={{ marginTop: 8 }}>
                                              Toegevoegd op {formatDate(attachment.createdAt)}
                                              {attachment.uploadedByUser?.naam ? ` · Door ${attachment.uploadedByUser.naam}` : ""}
                                            </p>
                                            {attachment.notitie ? (
                                              <p className="meta" style={{ marginTop: 8 }}>
                                                <strong>Notitie:</strong> {attachment.notitie}
                                              </p>
                                            ) : null}
                                          </div>
                                        );
                                      })}
                                    </div>
                                  ) : null}
                                </div>
                              </div>
                            ) : null}
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : null}
                </div>
              ))
            )}
          </div>
        </section>
      </div>
    );
  } catch (error) {
    if (!isMissingInstallateurSchemaError(error)) {
      throw error;
    }

    return (
      <div className="rooster">
        <section className="kaart">
          <h2 className="pagina-titel" style={{ fontSize: "2rem" }}>
            Installateurs pilot nog niet actief
          </h2>
          <p className="meta" style={{ marginTop: 14 }}>
            De eerste installateurs-tabellen staan al in de code, maar de database is nog niet bijgewerkt. Voer eerst de Prisma database-update uit voordat je klanten en servicelocaties kunt beheren.
          </p>
        </section>
      </div>
    );
  }
}
