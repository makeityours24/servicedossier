import Link from "next/link";
import { notFound } from "next/navigation";
import {
  createCustomerPackageAction,
  createTreatmentAction,
  deleteCustomerAction,
  deleteTreatmentAction
} from "@/app/(dashboard)/klanten/actions";
import { CustomerPackageForm } from "@/components/customer-package-form";
import { DeleteCustomerButton } from "@/components/delete-customer-button";
import { ReminderCopyButton } from "@/components/reminder-copy-button";
import { TreatmentForm } from "@/components/treatment-form";
import { TreatmentPhotoGallery } from "@/components/treatment-photo-gallery";
import { requireSalonSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { buildAppointmentReminderMessage, formatCurrencyFromCents, formatDate, formatDateOnly } from "@/lib/utils";
import { treatmentPresets as defaultTreatmentPresets } from "@/lib/treatment-presets";

type KlantDetailPageProps = {
  params: Promise<{ id: string }>;
  searchParams: Promise<{
    van?: string;
    tot?: string;
    medewerker?: string;
    herhaalId?: string;
    templateId?: string;
    afspraakId?: string;
  }>;
};

export default async function KlantDetailPage({
  params,
  searchParams
}: KlantDetailPageProps) {
  const { id } = await params;
  const filters = await searchParams;
  const klantId = Number(id);
  const herhaalId = filters.herhaalId ? Number(filters.herhaalId) : null;
  const templateId = filters.templateId ? Number(filters.templateId) : null;
  const afspraakId = filters.afspraakId ? Number(filters.afspraakId) : null;
  const user = await requireSalonSession();

  if (!Number.isInteger(klantId)) {
    notFound();
  }

  const klant = await prisma.customer.findFirst({
    where: {
      id: klantId,
      salonId: user.salonId
    },
    include: {
      behandelingen: {
        where: {
          salonId: user.salonId,
          datum: {
            gte: filters.van ? new Date(`${filters.van}T00:00:00`) : undefined,
            lte: filters.tot ? new Date(`${filters.tot}T23:59:59`) : undefined
          },
          behandelaar: filters.medewerker
            ? {
                contains: filters.medewerker,
                mode: "insensitive"
              }
            : undefined
        },
        orderBy: { datum: "asc" },
        include: {
          photos: {
            orderBy: { createdAt: "desc" },
            select: {
              id: true,
              url: true,
              bestandNaam: true,
              soort: true,
              notitie: true,
              createdAt: true,
              uploadedByUser: {
                select: {
                  naam: true
                }
              }
            }
          }
        }
      }
    }
  });

  if (!klant) {
    notFound();
  }

  const laatsteBehandeling = await prisma.treatment.findFirst({
    where: {
      customerId: klant.id,
      salonId: user.salonId
    },
    orderBy: { datum: "desc" },
    select: {
      id: true,
      datum: true,
      behandeling: true,
      recept: true,
      behandelaar: true,
      notities: true
    }
  });

  const herhaalBehandeling =
    herhaalId && Number.isInteger(herhaalId)
      ? await prisma.treatment.findFirst({
          where: {
            id: herhaalId,
            customerId: klant.id,
            salonId: user.salonId
          },
          select: {
            id: true,
            datum: true,
            behandeling: true,
            recept: true,
            behandelaar: true,
            notities: true
          }
        })
      : null;

  const voorgeselecteerdeBehandeling = herhaalBehandeling
    ? {
        ...herhaalBehandeling,
        id: undefined,
        datum: new Date(
          herhaalBehandeling.datum.getTime() - herhaalBehandeling.datum.getTimezoneOffset() * 60000
        )
          .toISOString()
          .slice(0, 16)
      }
    : undefined;

  const geselecteerdSjabloon =
    !herhaalBehandeling && templateId && Number.isInteger(templateId)
      ? await prisma.recipeTemplate.findFirst({
          where: {
            id: templateId,
            salonId: user.salonId
          },
          select: {
            naam: true,
            behandeling: true,
            recept: true,
            notities: true
          }
        })
      : null;

  const geselecteerdeAfspraak =
    !herhaalBehandeling && !geselecteerdSjabloon && afspraakId && Number.isInteger(afspraakId)
      ? await prisma.appointment.findFirst({
          where: {
            id: afspraakId,
            customerId: klant.id,
            salonId: user.salonId
          },
          select: {
            id: true,
            datumStart: true,
            behandeling: true,
            notities: true,
            userId: true,
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
        })
      : null;

  const sjablonen = await prisma.recipeTemplate.findMany({
    where: { salonId: user.salonId },
    orderBy: { naam: "asc" },
    take: 6,
    select: {
      id: true,
      naam: true,
      behandeling: true
    }
  });

  const [customerPackages, availablePackageTypes] = await Promise.all([
    prisma.customerPackage.findMany({
      where: {
        customerId: klant.id,
        salonId: user.salonId
      },
      orderBy: [{ status: "asc" }, { gekochtOp: "desc" }],
      select: {
        id: true,
        naamSnapshot: true,
        standaardBehandelingSnapshot: true,
        weergaveTypeSnapshot: true,
        totaalBeurten: true,
        resterendeBeurten: true,
        status: true,
        pakketPrijsCents: true,
        lossePrijsCents: true,
        gekochtOp: true,
        notities: true,
        usages: {
          orderBy: { datum: "desc" },
          select: {
            id: true,
            datum: true,
            aantalAfgeboekt: true,
            treatment: {
              select: {
                id: true,
                behandeling: true
              }
            },
            user: {
              select: {
                naam: true
              }
            }
          }
        }
      }
    }),
    prisma.packageType.findMany({
      where: {
        salonId: user.salonId,
        isActief: true
      },
      orderBy: { naam: "asc" },
      select: {
        id: true,
        naam: true,
        totaalBeurten: true,
        weergaveType: true
      }
    })
  ]);

  const medewerkers = await prisma.user.findMany({
    where: {
      salonId: user.salonId,
      isPlatformAdmin: false,
      status: "ACTIEF"
    },
    orderBy: { naam: "asc" },
    select: {
      id: true,
      naam: true
    }
  });

  const aankomendeAfspraken = await prisma.appointment.findMany({
    where: {
      salonId: user.salonId,
      customerId: klant.id,
      datumStart: {
        gte: new Date()
      },
      status: {
        in: ["GEPLAND", "NIET_GEKOMEN"]
      }
    },
    orderBy: { datumStart: "asc" },
    take: 4,
    include: {
      user: {
        select: {
          naam: true
        }
      }
    }
  });

  const actieveKlantPakketten = customerPackages.filter((customerPackage) => customerPackage.status === "ACTIEF");
  const overigeKlantPakketten = customerPackages.filter((customerPackage) => customerPackage.status !== "ACTIEF");
  const activePackagesForTreatment = actieveKlantPakketten.map((customerPackage) => ({
    id: customerPackage.id,
    naamSnapshot: customerPackage.naamSnapshot,
    weergaveTypeSnapshot: customerPackage.weergaveTypeSnapshot,
    resterendeBeurten: customerPackage.resterendeBeurten,
    totaalBeurten: customerPackage.totaalBeurten
  }));

  const treatmentVoorFormulier =
    voorgeselecteerdeBehandeling ??
    (geselecteerdSjabloon
      ? {
          behandeling: geselecteerdSjabloon.behandeling,
          recept: geselecteerdSjabloon.recept,
          behandelaarUserId: medewerkers.find((medewerker) => medewerker.naam === user.naam)?.id ?? null,
          behandelaar: user.naam,
          notities: geselecteerdSjabloon.notities ?? "",
          datum: new Date().toISOString().slice(0, 16)
        }
      : geselecteerdeAfspraak && !geselecteerdeAfspraak.convertedTreatment
        ? {
            appointmentId: geselecteerdeAfspraak.id,
            behandelaarUserId: geselecteerdeAfspraak.userId ?? null,
            behandeling: geselecteerdeAfspraak.behandeling,
            recept: "",
            behandelaar: geselecteerdeAfspraak.user?.naam ?? user.naam,
            notities: geselecteerdeAfspraak.notities ?? "",
            datum: new Date(
              geselecteerdeAfspraak.datumStart.getTime() -
                geselecteerdeAfspraak.datumStart.getTimezoneOffset() * 60000
            )
              .toISOString()
              .slice(0, 16)
          }
      : undefined);

  return (
    <div className="rooster">
      <section className="bovenbalk">
        <div className="klant-kop">
          <span className="logo-label">Klantdossier</span>
          <h2 className="pagina-titel" style={{ fontSize: "2.2rem" }}>
            {klant.naam}
          </h2>
          <p className="subtitel">
            {klant.adres}
            <br />
            {klant.telefoonnummer}
          </p>
        </div>

        <div className="acties">
          <Link href={`/klanten/${klant.id}/bewerken`} className="knop-secundair">
            Klant bewerken
          </Link>
          <Link href={`/agenda?customerId=${klant.id}`} className="knop-zacht">
            Afspraak plannen
          </Link>
          <Link href={`/klanten/${klant.id}/print`} className="knop-zacht">
            Afdrukken
          </Link>
          <a href={`/api/export?customerId=${klant.id}`} className="knop">
            CSV export
          </a>
          <form action={deleteCustomerAction}>
            <input type="hidden" name="customerId" value={klant.id} />
            <DeleteCustomerButton
              naam={klant.naam}
              confirmMessage="Weet je zeker dat je {naam} wilt verwijderen? Alle behandelingen van deze klant worden ook verwijderd."
            />
          </form>
        </div>
      </section>

      <section className="detail-grid">
        <article className="kaart">
          {aankomendeAfspraken.length > 0 ? (
            <div className="info-kaart" style={{ marginBottom: 18 }}>
              <div className="acties" style={{ justifyContent: "space-between", alignItems: "flex-start" }}>
                <div>
                  <h3>Komende afspraken</h3>
                  <p className="meta" style={{ marginTop: 8 }}>
                    Snel zicht op wat er voor deze klant al gepland staat.
                  </p>
                </div>
                <Link href={`/agenda?customerId=${klant.id}`} className="knop-secundair">
                  Nieuwe afspraak
                </Link>
              </div>

              <div className="lijst" style={{ marginTop: 16 }}>
                {aankomendeAfspraken.map((afspraak) => (
                  <div key={afspraak.id} className="lijst-item">
                    <div className="acties" style={{ justifyContent: "space-between", alignItems: "flex-start" }}>
                      <div>
                        <h4>{afspraak.behandeling}</h4>
                        <p className="meta">
                          {formatDate(afspraak.datumStart)}
                          <br />
                          {afspraak.user?.naam ?? "Nog niet toegewezen"}
                        </p>
                      </div>
                      <div className="acties">
                        <Link href={`/agenda/${afspraak.id}/bewerken`} className="knop-zacht">
                          Open afspraak
                        </Link>
                        <ReminderCopyButton
                          message={buildAppointmentReminderMessage({
                            customerName: klant.naam,
                            salonName: user.salon.instellingen?.weergavenaam ?? user.salon.naam,
                            treatmentName: afspraak.behandeling,
                            startAt: afspraak.datumStart,
                            contactPhone:
                              user.salon.instellingen?.contactTelefoon ?? user.salon.telefoonnummer ?? null
                          })}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="info-kaart" style={{ marginBottom: 18 }}>
              <div className="acties" style={{ justifyContent: "space-between", alignItems: "flex-start" }}>
                <div>
                  <h3>Komende afspraken</h3>
                  <p className="meta" style={{ marginTop: 8 }}>
                    Voor deze klant staan nog geen komende afspraken gepland.
                  </p>
                </div>
                <Link href={`/agenda?customerId=${klant.id}`} className="knop-secundair">
                  Afspraak plannen
                </Link>
              </div>
            </div>
          )}

          <div className="info-kaart" style={{ marginBottom: 18 }}>
            <div className="acties" style={{ justifyContent: "space-between", alignItems: "flex-start" }}>
              <div>
                <h3>Profiel en haarinfo</h3>
                <p className="meta" style={{ marginTop: 8 }}>
                  Werk hier snel geboortedatum, haartype, haarkleur, allergieen en stylistnotities bij.
                </p>
              </div>
              <Link href={`/klanten/${klant.id}/bewerken#profiel`} className="knop-secundair">
                Profiel bewerken
              </Link>
            </div>
          </div>

          <div className="info-grid" style={{ marginBottom: 18 }}>
            <article className="info-kaart">
              <h3>Geboortedatum</h3>
              <p className="meta">
                {klant.geboortedatum ? formatDateOnly(klant.geboortedatum) : "Nog niet ingevuld"}
              </p>
            </article>
            <article className="info-kaart">
              <h3>Haartype</h3>
              <p className="meta">{klant.haartype || "Nog niet ingevuld"}</p>
            </article>
            <article className="info-kaart">
              <h3>Haarkleur</h3>
              <p className="meta">{klant.haarkleur || "Nog niet ingevuld"}</p>
            </article>
            <article className="info-kaart">
              <h3>Allergieen</h3>
              <p className="meta">{klant.allergieen || "Nog niet ingevuld"}</p>
            </article>
          </div>

          {klant.stylistNotities ? (
            <div className="info-kaart" style={{ marginBottom: 18 }}>
              <h3>Notities stylist</h3>
              <p className="meta">{klant.stylistNotities}</p>
            </div>
          ) : null}

          {laatsteBehandeling ? (
            <div className="lijst-item" style={{ marginBottom: 18 }}>
              <div className="acties" style={{ justifyContent: "space-between" }}>
                <div>
                  <span className="logo-label" style={{ marginBottom: 12 }}>
                    Laatste behandeling
                  </span>
                  <h3 style={{ margin: 0 }}>{laatsteBehandeling.behandeling}</h3>
                </div>
                <span className="badge">{formatDate(laatsteBehandeling.datum)}</span>
              </div>

              <p className="meta" style={{ marginTop: 14 }}>
                <strong>Behandelaar:</strong> {laatsteBehandeling.behandelaar}
                <br />
                <strong>Recept:</strong> {laatsteBehandeling.recept}
                {laatsteBehandeling.notities ? (
                  <>
                    <br />
                    <strong>Notities:</strong> {laatsteBehandeling.notities}
                  </>
                ) : null}
              </p>

              <div className="acties" style={{ marginTop: 16 }}>
                <Link
                  href={`/klanten/${klant.id}?herhaalId=${laatsteBehandeling.id}#nieuwe-behandeling`}
                  className="knop"
                >
                  Laatste recept in formulier laden
                </Link>
                <Link
                  href={`/klanten/${klant.id}/behandelingen/${laatsteBehandeling.id}/bewerken`}
                  className="knop-secundair"
                >
                  Laatste behandeling bewerken
                </Link>
              </div>
            </div>
          ) : null}

          <div className="print-balk">
            <div>
              <h3>Behandelgeschiedenis</h3>
              <p className="subtitel" style={{ marginTop: 6 }}>
                Chronologisch overzicht met filter op datum of medewerker.
              </p>
            </div>
          </div>

          <form className="filters" style={{ marginBottom: 18 }}>
            <div className="veld">
              <label htmlFor="van">Van datum</label>
              <input id="van" name="van" type="date" defaultValue={filters.van} />
            </div>

            <div className="veld">
              <label htmlFor="tot">Tot datum</label>
              <input id="tot" name="tot" type="date" defaultValue={filters.tot} />
            </div>

            <div className="veld">
              <label htmlFor="medewerker">Medewerker</label>
              <input
                id="medewerker"
                name="medewerker"
                defaultValue={filters.medewerker}
                placeholder="Bijvoorbeeld Sanne"
              />
            </div>

            <button type="submit" className="knop-secundair">
              Filteren
            </button>
          </form>

          {klant.behandelingen.length === 0 ? (
            <div className="leeg">Er zijn nog geen behandelingen gevonden voor deze filters.</div>
          ) : (
            <div className="lijst">
              {klant.behandelingen.map((behandeling) => (
                <article className="lijst-item" key={behandeling.id}>
                  <div className="acties" style={{ justifyContent: "space-between" }}>
                    <span className="badge">{formatDate(behandeling.datum)}</span>
                    <span className="badge">{behandeling.behandelaar}</span>
                  </div>
                  <h4 style={{ marginTop: 14 }}>{behandeling.behandeling}</h4>
                  <p className="meta">
                    <strong>Recept:</strong> {behandeling.recept}
                  </p>
                  {behandeling.notities ? (
                    <p className="meta">
                      <strong>Notities:</strong> {behandeling.notities}
                    </p>
                  ) : null}
                  {behandeling.photos.length > 0 ? (
                    <div style={{ marginTop: 16 }}>
                      <h4 style={{ marginBottom: 10 }}>Foto&apos;s bij deze behandeling</h4>
                      <TreatmentPhotoGallery
                        customerId={klant.id}
                        treatmentId={behandeling.id}
                        photos={behandeling.photos}
                      />
                    </div>
                  ) : null}
                  <div className="acties" style={{ marginTop: 16 }}>
                    <Link
                      href={`/klanten/${klant.id}?herhaalId=${behandeling.id}#nieuwe-behandeling`}
                      className="knop-zacht"
                    >
                      Recept in formulier laden
                    </Link>
                    <Link
                      href={`/klanten/${klant.id}/behandelingen/${behandeling.id}/bewerken`}
                      className="knop-secundair"
                    >
                      Behandeling bewerken
                    </Link>
                    <form action={deleteTreatmentAction}>
                      <input type="hidden" name="customerId" value={klant.id} />
                      <input type="hidden" name="treatmentId" value={behandeling.id} />
                      <DeleteCustomerButton
                        naam={behandeling.behandeling}
                        confirmMessage="Weet je zeker dat je behandeling {naam} wilt verwijderen?"
                        label="Behandeling verwijderen"
                      />
                    </form>
                  </div>
                </article>
              ))}
            </div>
          )}
        </article>

        <aside className="kaart">
          <h3>Pakketten</h3>
          <p className="subtitel" style={{ marginTop: 8 }}>
            Verkoop hier bundels of digitale stempelkaarten aan deze klant. Afboeken per behandeling koppelen we in de volgende stap aan deze actieve pakketten.
          </p>

          <div className="lijst" style={{ marginTop: 18 }}>
            {customerPackages.length === 0 ? (
              <div className="leeg">Deze klant heeft nog geen actieve of eerdere pakketten.</div>
            ) : (
              <>
                {actieveKlantPakketten.map((customerPackage) => (
                  <article className="lijst-item" key={customerPackage.id}>
                    <div className="acties" style={{ justifyContent: "space-between", alignItems: "flex-start" }}>
                      <div>
                        <h4>{customerPackage.naamSnapshot}</h4>
                        <p className="meta">
                          <strong>Behandeling:</strong> {customerPackage.standaardBehandelingSnapshot}
                          <br />
                          <strong>Type:</strong>{" "}
                          {customerPackage.weergaveTypeSnapshot === "STEMPELKAART"
                            ? "Digitale stempelkaart"
                            : "Bundelpakket"}
                          <br />
                          <strong>Nog over:</strong> {customerPackage.resterendeBeurten} van {customerPackage.totaalBeurten}
                          <br />
                          <strong>Verkocht op:</strong> {formatDate(customerPackage.gekochtOp)}
                          <br />
                          <strong>Pakketprijs:</strong> {formatCurrencyFromCents(customerPackage.pakketPrijsCents)}
                          <br />
                          <strong>Losse prijs:</strong> {formatCurrencyFromCents(customerPackage.lossePrijsCents)} per beurt
                          {customerPackage.notities ? (
                            <>
                              <br />
                              <strong>Notities:</strong> {customerPackage.notities}
                            </>
                          ) : null}
                        </p>
                      </div>
                      <span className="status-badge">Actief</span>
                    </div>

                    {customerPackage.weergaveTypeSnapshot === "STEMPELKAART" ? (
                      <div className="stempelkaart-paneel" style={{ marginTop: 14 }}>
                        <div className="stempelkaart-kop">
                          <div>
                            <strong>Digitale stempelkaart</strong>
                            <p className="meta" style={{ marginTop: 6 }}>
                              {customerPackage.totaalBeurten - customerPackage.resterendeBeurten} afgestempeld,{" "}
                              {customerPackage.resterendeBeurten} open
                            </p>
                          </div>
                          <span className="status-badge">
                            {customerPackage.resterendeBeurten} over
                          </span>
                        </div>
                        <div className="stempelkaart">
                          {Array.from({ length: customerPackage.totaalBeurten }, (_, index) => {
                            const gebruikt =
                              index < customerPackage.totaalBeurten - customerPackage.resterendeBeurten;

                            return (
                              <span
                                key={`${customerPackage.id}-${index}`}
                                className="stempel"
                                data-gebruikt={gebruikt ? "true" : "false"}
                                title={gebruikt ? "Gebruikte beurt" : "Nog open"}
                              >
                                {index + 1}
                              </span>
                            );
                          })}
                        </div>
                      </div>
                    ) : null}

                    {customerPackage.usages.length > 0 ? (
                      <div className="kaart" style={{ marginTop: 14, padding: 16 }}>
                        <h4 style={{ marginBottom: 10 }}>Gebruiksgeschiedenis</h4>
                        <div className="lijst">
                          {customerPackage.usages.map((usage) => (
                            <div className="lijst-item" key={usage.id}>
                              <p className="meta">
                                <strong>{formatDate(usage.datum)}</strong>
                                <br />
                                <strong>Afgeboekt:</strong> {usage.aantalAfgeboekt} beurt
                                {usage.aantalAfgeboekt > 1 ? "en" : ""}
                                <br />
                                <strong>Behandeling:</strong> {usage.treatment?.behandeling ?? "Handmatige correctie"}
                                <br />
                                <strong>Behandelaar:</strong> {usage.user?.naam ?? "Onbekend"}
                              </p>
                              {usage.treatment ? (
                                <div className="acties" style={{ marginTop: 12 }}>
                                  <Link
                                    href={`/klanten/${klant.id}/behandelingen/${usage.treatment.id}/bewerken`}
                                    className="knop-secundair"
                                  >
                                    Gekoppelde behandeling bekijken
                                  </Link>
                                </div>
                              ) : null}
                            </div>
                          ))}
                        </div>
                      </div>
                    ) : (
                      <div className="leeg" style={{ marginTop: 14 }}>
                        Nog geen beurten van dit pakket afgeboekt.
                      </div>
                    )}
                  </article>
                ))}

                {overigeKlantPakketten.length > 0 ? (
                  <div className="kaart" style={{ marginTop: 12, padding: 20 }}>
                    <h4>Eerdere pakketten</h4>
                    <div className="lijst" style={{ marginTop: 16 }}>
                      {overigeKlantPakketten.map((customerPackage) => (
                        <article className="lijst-item" key={customerPackage.id}>
                          <div className="acties" style={{ justifyContent: "space-between", alignItems: "flex-start" }}>
                            <div>
                              <h4>{customerPackage.naamSnapshot}</h4>
                              <p className="meta">
                                <strong>Status:</strong> {customerPackage.status.replaceAll("_", " ")}
                                <br />
                                <strong>Type:</strong> {customerPackage.weergaveTypeSnapshot === "STEMPELKAART" ? "Digitale stempelkaart" : "Bundelpakket"}
                                <br />
                                <strong>Verbruikt:</strong> {customerPackage.totaalBeurten - customerPackage.resterendeBeurten} van {customerPackage.totaalBeurten}
                                <br />
                                <strong>Verkocht op:</strong> {formatDate(customerPackage.gekochtOp)}
                              </p>
                            </div>
                            <span className="status-badge" data-inactive="true">
                              {customerPackage.status === "VOLLEDIG_GEBRUIKT" ? "Volledig gebruikt" : customerPackage.status.replaceAll("_", " ")}
                            </span>
                          </div>

                          {customerPackage.weergaveTypeSnapshot === "STEMPELKAART" ? (
                            <div className="stempelkaart-paneel" style={{ marginTop: 14 }}>
                              <div className="stempelkaart">
                                {Array.from({ length: customerPackage.totaalBeurten }, (_, index) => {
                                  const gebruikt =
                                    index <
                                    customerPackage.totaalBeurten - customerPackage.resterendeBeurten;

                                  return (
                                    <span
                                      key={`${customerPackage.id}-${index}`}
                                      className="stempel"
                                      data-gebruikt={gebruikt ? "true" : "false"}
                                      title={gebruikt ? "Gebruikte beurt" : "Nog open"}
                                    >
                                      {index + 1}
                                    </span>
                                  );
                                })}
                              </div>
                            </div>
                          ) : null}

                          {customerPackage.usages.length > 0 ? (
                            <div className="kaart" style={{ marginTop: 14, padding: 16 }}>
                              <h4 style={{ marginBottom: 10 }}>Gebruiksgeschiedenis</h4>
                              <div className="lijst">
                                {customerPackage.usages.map((usage) => (
                                  <div className="lijst-item" key={usage.id}>
                                    <p className="meta">
                                      <strong>{formatDate(usage.datum)}</strong>
                                      <br />
                                      <strong>Afgeboekt:</strong> {usage.aantalAfgeboekt} beurt
                                      {usage.aantalAfgeboekt > 1 ? "en" : ""}
                                      <br />
                                      <strong>Behandeling:</strong> {usage.treatment?.behandeling ?? "Handmatige correctie"}
                                      <br />
                                      <strong>Behandelaar:</strong> {usage.user?.naam ?? "Onbekend"}
                                    </p>
                                  </div>
                                ))}
                              </div>
                            </div>
                          ) : null}
                        </article>
                      ))}
                    </div>
                  </div>
                ) : null}
              </>
            )}
          </div>

          <div
            className="kaart"
            id="nieuwe-behandeling"
            style={{ marginTop: 18, padding: 20, scrollMarginTop: 24 }}
          >
            <h4>Pakket verkopen</h4>
            <p className="subtitel" style={{ marginTop: 8 }}>
              Kies een actief pakkettype van deze salon en koppel het direct aan deze klant.
            </p>
            {availablePackageTypes.length === 0 ? (
              <div className="leeg" style={{ marginTop: 16 }}>
                Er zijn nog geen actieve pakkettypes. Voeg eerst een pakket toe via Pakketten.
              </div>
            ) : (
              <CustomerPackageForm
                customerId={klant.id}
                action={createCustomerPackageAction}
                packageTypes={availablePackageTypes}
              />
            )}
          </div>

          <div className="kaart" style={{ marginTop: 18, padding: 20 }}>
          <h3>Nieuwe behandeling registreren</h3>
          <p className="subtitel" style={{ marginTop: 8 }}>
            Voeg direct een nieuwe kleurbehandeling of andere behandeling toe aan dit dossier.
          </p>
          {sjablonen.length > 0 ? (
            <div style={{ marginTop: 16 }}>
              <p className="meta" style={{ marginBottom: 12 }}>
                Snel starten vanuit een receptsjabloon:
              </p>
              <div className="acties">
                {sjablonen.map((template) => (
                  <Link
                    key={template.id}
                    href={`/klanten/${klant.id}?templateId=${template.id}#nieuwe-behandeling`}
                    className="knop-zacht"
                  >
                    {template.naam}
                  </Link>
                ))}
              </div>
            </div>
          ) : null}
          {herhaalBehandeling ? (
            <div className="acties" style={{ marginTop: 16 }}>
              <span className="badge">
                Recept geladen uit {formatDate(herhaalBehandeling.datum)}. Controleer de velden en sla daarna als nieuwe behandeling op.
              </span>
              <Link href={`/klanten/${klant.id}`} className="knop-secundair">
                Formulier leegmaken
              </Link>
            </div>
          ) : geselecteerdSjabloon ? (
            <div className="acties" style={{ marginTop: 16 }}>
              <span className="badge">
                Sjabloon geladen: {geselecteerdSjabloon.naam}. Controleer de velden en sla daarna als nieuwe behandeling op.
              </span>
              <Link href={`/klanten/${klant.id}`} className="knop-secundair">
                Formulier leegmaken
              </Link>
            </div>
          ) : geselecteerdeAfspraak ? (
            <div className="acties" style={{ marginTop: 16 }}>
              <span className="badge">
                {geselecteerdeAfspraak.convertedTreatment
                  ? "Van deze afspraak is al een behandeling gemaakt."
                  : `Afspraak geladen uit ${formatDate(geselecteerdeAfspraak.datumStart)}. Sla op om deze afspraak als behandeling vast te leggen.`}
              </span>
              <Link href={`/klanten/${klant.id}`} className="knop-secundair">
                Formulier leegmaken
              </Link>
              {geselecteerdeAfspraak.convertedTreatment ? (
                <Link
                  href={`/klanten/${klant.id}/behandelingen/${geselecteerdeAfspraak.convertedTreatment.id}/bewerken`}
                  className="knop-zacht"
                >
                  Bestaande behandeling openen
                </Link>
              ) : null}
            </div>
          ) : null}

          <TreatmentForm
            customerId={klant.id}
            medewerkerNaam={user.naam}
            medewerkers={medewerkers}
            action={createTreatmentAction}
            treatment={treatmentVoorFormulier}
            treatmentPresets={
              user.salon.instellingen?.treatmentPresets?.length
                ? user.salon.instellingen.treatmentPresets
                : defaultTreatmentPresets
            }
            helperText={
              herhaalBehandeling
                ? "De velden zijn vooringevuld vanuit een eerdere behandeling. Pas ze aan waar nodig en sla de nieuwe behandeling op."
                : geselecteerdSjabloon
                  ? "De velden zijn vooringevuld vanuit een receptsjabloon. Pas ze aan waar nodig en sla de nieuwe behandeling op."
                : undefined
            }
            activePackages={activePackagesForTreatment}
          />
          </div>
        </aside>
      </section>
    </div>
  );
}
