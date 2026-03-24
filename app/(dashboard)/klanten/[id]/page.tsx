import Link from "next/link";
import { notFound } from "next/navigation";
import {
  correctCustomerPackageAction,
  createCustomerPackageAction,
  createTreatmentAction,
  deleteCustomerAction,
  deleteTreatmentAction
} from "@/app/(dashboard)/klanten/actions";
import { CustomerPackageCorrectionForm } from "@/components/customer-package-correction-form";
import { CustomerPackageForm } from "@/components/customer-package-form";
import { DeleteCustomerButton } from "@/components/delete-customer-button";
import { ReminderCopyButton } from "@/components/reminder-copy-button";
import { TreatmentForm } from "@/components/treatment-form";
import { TreatmentPhotoGallery } from "@/components/treatment-photo-gallery";
import { requireSalonSession } from "@/lib/auth";
import { getBranchProfileCopy, normalizeBranchType } from "@/lib/branch-profile";
import { customerDictionary, getCurrentLocale } from "@/lib/i18n";
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
    afspraakSegmentId?: string;
  }>;
};

export default async function KlantDetailPage({
  params,
  searchParams
}: KlantDetailPageProps) {
  const locale = await getCurrentLocale();
  const copy = customerDictionary[locale];
  const replace = (text: string, values: Record<string, string | number>) =>
    Object.entries(values).reduce(
      (result, [key, value]) => result.replaceAll(`{${key}}`, String(value)),
      text
    );
  const { id } = await params;
  const filters = await searchParams;
  const klantId = Number(id);
  const herhaalId = filters.herhaalId ? Number(filters.herhaalId) : null;
  const templateId = filters.templateId ? Number(filters.templateId) : null;
  const afspraakId = filters.afspraakId ? Number(filters.afspraakId) : null;
  const afspraakSegmentId = filters.afspraakSegmentId ? Number(filters.afspraakSegmentId) : null;
  const user = await requireSalonSession();
  const branchType = normalizeBranchType(user.salon.instellingen?.branchType);
  const branchProfile = getBranchProfileCopy(locale, branchType);

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

  const geselecteerdAfspraakSegment =
    !herhaalBehandeling && !geselecteerdSjabloon && !geselecteerdeAfspraak && afspraakSegmentId && Number.isInteger(afspraakSegmentId)
      ? await prisma.appointmentSegment.findFirst({
          where: {
            id: afspraakSegmentId,
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
            notitie: true,
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
  const totaalOpenBeurten = actieveKlantPakketten.reduce(
    (total, customerPackage) => total + customerPackage.resterendeBeurten,
    0
  );
  const aantalActieveStempelkaarten = actieveKlantPakketten.filter(
    (customerPackage) => customerPackage.weergaveTypeSnapshot === "STEMPELKAART"
  ).length;
  const aantalActieveBundels = actieveKlantPakketten.filter(
    (customerPackage) => customerPackage.weergaveTypeSnapshot !== "STEMPELKAART"
  ).length;
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
      : geselecteerdAfspraakSegment && !geselecteerdAfspraakSegment.convertedTreatment
        ? {
            appointmentSegmentId: geselecteerdAfspraakSegment.id,
            behandelaarUserId: geselecteerdAfspraakSegment.userId ?? null,
            behandeling: geselecteerdAfspraakSegment.behandeling,
            recept: "",
            behandelaar: geselecteerdAfspraakSegment.user?.naam ?? user.naam,
            notities: geselecteerdAfspraakSegment.notities ?? "",
            datum: new Date(
              geselecteerdAfspraakSegment.datumStart.getTime() -
                geselecteerdAfspraakSegment.datumStart.getTimezoneOffset() * 60000
            )
              .toISOString()
              .slice(0, 16)
          }
      : undefined);

  return (
    <div className="rooster">
      <section className="bovenbalk">
        <div className="klant-kop">
          <span className="logo-label">{copy.customerRecord}</span>
          <h2 className="pagina-titel" style={{ fontSize: "2.2rem" }}>
            {klant.naam}
          </h2>
          <p className="subtitel">
            {klant.adres}
            <br />
            {klant.telefoonnummer}
          </p>
          <div className="package-banner">
            <div>
              <strong>{copy.packageBannerTitle}</strong>
              <p>
                {actieveKlantPakketten.length > 0
                  ? replace(copy.packageBannerText, {
                      cards: actieveKlantPakketten.length,
                      sessions: totaalOpenBeurten
                    })
                  : copy.packageBannerEmpty}
              </p>
              <div className="package-banner-actions">
                <Link href="#pakket-overzicht" className="knop-secundair">
                  {copy.packageBannerView}
                </Link>
                <Link href="#pakket-toevoegen" className="knop-zacht">
                  {copy.packageBannerAdd}
                </Link>
              </div>
            </div>
            <span className="status-badge" data-inactive={actieveKlantPakketten.length === 0 ? "true" : undefined}>
              {actieveKlantPakketten.length > 0
                ? replace(copy.remainingCounter, {
                    remaining: totaalOpenBeurten,
                    total: actieveKlantPakketten.reduce(
                      (total, customerPackage) => total + customerPackage.totaalBeurten,
                      0
                    )
                  })
                : copy.packageSummaryNone}
            </span>
          </div>
        </div>

        <div className="acties">
          <Link href={`/klanten/${klant.id}/bewerken`} className="knop-secundair">
            {copy.editCustomer}
          </Link>
          <Link href={`/agenda?customerId=${klant.id}`} className="knop-zacht">
            {copy.scheduleAppointment}
          </Link>
          <Link href={`/klanten/${klant.id}/print`} className="knop-zacht">
            {copy.print}
          </Link>
          <a href={`/api/export?customerId=${klant.id}`} className="knop">
            {copy.exportCsv}
          </a>
          <form action={deleteCustomerAction}>
            <input type="hidden" name="customerId" value={klant.id} />
            <DeleteCustomerButton
              naam={klant.naam}
              confirmMessage={copy.deleteCustomerConfirm}
              label={copy.deleteCustomer}
              busyLabel={copy.deletingCustomer}
            />
          </form>
        </div>
      </section>

      <section className="detail-grid">
        <article className="kaart">
          <div className="info-kaart" style={{ marginBottom: 18 }}>
            <div className="acties" style={{ justifyContent: "space-between", alignItems: "flex-start" }}>
              <div>
                <h3>{copy.packageSummaryTitle}</h3>
                <p className="meta" style={{ marginTop: 8 }}>
                  {copy.packageSummaryText}
                </p>
              </div>
              <span className="status-badge">
                {actieveKlantPakketten.length > 0 ? copy.active : copy.packageSummaryNone}
              </span>
            </div>
            <div className="info-grid" style={{ marginTop: 16 }}>
              <article className="info-kaart package-summary-card">
                <h3>{copy.activeCards}</h3>
                <strong>{actieveKlantPakketten.length}</strong>
                <p className="meta">
                  {aantalActieveStempelkaarten} {copy.stampCardsLabel} · {aantalActieveBundels}{" "}
                  {copy.bundlePackagesLabel}
                </p>
              </article>
              <article className="info-kaart package-summary-card">
                <h3>{copy.openSessionsTotal}</h3>
                <strong>{totaalOpenBeurten}</strong>
                <p className="meta">{copy.openSessionsHint}</p>
              </article>
              <article className="info-kaart package-summary-card">
                <h3>{copy.activePackageTypes}</h3>
                <strong>
                  {
                    new Set(
                      actieveKlantPakketten.map((customerPackage) => customerPackage.naamSnapshot)
                    ).size
                  }
                </strong>
                <p className="meta">{copy.packagesTitle}</p>
              </article>
            </div>
          </div>

          {aankomendeAfspraken.length > 0 ? (
            <div className="info-kaart" style={{ marginBottom: 18 }}>
              <div className="acties" style={{ justifyContent: "space-between", alignItems: "flex-start" }}>
                <div>
                  <h3>{copy.upcomingAppointments}</h3>
                  <p className="meta" style={{ marginTop: 8 }}>
                    {copy.upcomingAppointmentsText}
                  </p>
                </div>
                <Link href={`/agenda?customerId=${klant.id}`} className="knop-secundair">
                  {copy.newAppointment}
                </Link>
              </div>

              <div className="lijst" style={{ marginTop: 16 }}>
                {aankomendeAfspraken.map((afspraak) => (
                  <div key={afspraak.id} className="lijst-item">
                    <div className="acties" style={{ justifyContent: "space-between", alignItems: "flex-start" }}>
                      <div>
                        <h4>{afspraak.behandeling}</h4>
                        <p className="meta">
                          {formatDate(afspraak.datumStart, locale)}
                          <br />
                          {afspraak.user?.naam ?? copy.notAssigned}
                        </p>
                      </div>
                      <div className="acties">
                        <Link href={`/agenda/${afspraak.id}/bewerken`} className="knop-zacht">
                          {copy.openAppointment}
                        </Link>
                        <ReminderCopyButton
                          phoneNumber={klant.telefoonnummer}
                          message={buildAppointmentReminderMessage({
                            customerName: klant.naam,
                            salonName: user.salon.instellingen?.weergavenaam ?? user.salon.naam,
                            treatmentName: afspraak.behandeling,
                            startAt: afspraak.datumStart,
                            contactPhone:
                              user.salon.instellingen?.contactTelefoon ?? user.salon.telefoonnummer ?? null
                          })}
                          labels={copy.reminderLabels}
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
                  <h3>{copy.upcomingAppointments}</h3>
                  <p className="meta" style={{ marginTop: 8 }}>
                    {copy.noUpcomingAppointments}
                  </p>
                </div>
                <Link href={`/agenda?customerId=${klant.id}`} className="knop-secundair">
                  {copy.scheduleAppointment}
                </Link>
              </div>
            </div>
          )}

          <div className="info-kaart" style={{ marginBottom: 18 }}>
            <div className="acties" style={{ justifyContent: "space-between", alignItems: "flex-start" }}>
              <div>
                <h3>{branchProfile.profileTitle}</h3>
                <p className="meta" style={{ marginTop: 8 }}>
                  {branchProfile.profileText}
                </p>
              </div>
              <Link href={`/klanten/${klant.id}/bewerken#profiel`} className="knop-secundair">
                {copy.editProfile}
              </Link>
            </div>
          </div>

          <div className="info-grid" style={{ marginBottom: 18 }}>
            <article className="info-kaart">
              <h3>{copy.birthDate}</h3>
              <p className="meta">
                {klant.geboortedatum ? formatDateOnly(klant.geboortedatum, locale) : copy.notFilledInYet}
              </p>
            </article>
            <article className="info-kaart">
              <h3>{branchProfile.fieldOneLabel}</h3>
              <p className="meta">{klant.haartype || copy.notFilledInYet}</p>
            </article>
            <article className="info-kaart">
              <h3>{branchProfile.fieldTwoLabel}</h3>
              <p className="meta">{klant.haarkleur || copy.notFilledInYet}</p>
            </article>
            <article className="info-kaart">
              <h3>{branchProfile.allergiesLabel}</h3>
              <p className="meta">{klant.allergieen || copy.notFilledInYet}</p>
            </article>
          </div>

          {klant.stylistNotities ? (
            <div className="info-kaart" style={{ marginBottom: 18 }}>
              <h3>{branchProfile.notesLabel}</h3>
              <p className="meta">{klant.stylistNotities}</p>
            </div>
          ) : null}

          {laatsteBehandeling ? (
            <div className="lijst-item" style={{ marginBottom: 18 }}>
              <div className="acties" style={{ justifyContent: "space-between" }}>
                <div>
                  <span className="logo-label" style={{ marginBottom: 12 }}>
                    {copy.latestTreatment}
                  </span>
                  <h3 style={{ margin: 0 }}>{laatsteBehandeling.behandeling}</h3>
                </div>
                <span className="badge">{formatDate(laatsteBehandeling.datum, locale)}</span>
              </div>

              <p className="meta" style={{ marginTop: 14 }}>
                <strong>{copy.stylist}:</strong> {laatsteBehandeling.behandelaar}
                <br />
                <strong>{copy.recipe}:</strong> {laatsteBehandeling.recept}
                {laatsteBehandeling.notities ? (
                  <>
                    <br />
                    <strong>{copy.notes}:</strong> {laatsteBehandeling.notities}
                  </>
                ) : null}
              </p>

              <div className="acties" style={{ marginTop: 16 }}>
                <Link
                  href={`/klanten/${klant.id}?herhaalId=${laatsteBehandeling.id}#nieuwe-behandeling`}
                  className="knop"
                >
                  {copy.loadLatestRecipe}
                </Link>
                <Link
                  href={`/klanten/${klant.id}/behandelingen/${laatsteBehandeling.id}/bewerken`}
                  className="knop-secundair"
                >
                  {copy.editLatestTreatment}
                </Link>
              </div>
            </div>
          ) : null}

          <div className="print-balk">
            <div>
              <h3>{copy.historyTitle}</h3>
              <p className="subtitel" style={{ marginTop: 6 }}>
                {copy.historyText}
              </p>
            </div>
          </div>

          <form className="filters" style={{ marginBottom: 18 }}>
            <div className="veld">
              <label htmlFor="van">{copy.fromDate}</label>
              <input id="van" name="van" type="date" defaultValue={filters.van} />
            </div>

            <div className="veld">
              <label htmlFor="tot">{copy.toDate}</label>
              <input id="tot" name="tot" type="date" defaultValue={filters.tot} />
            </div>

            <div className="veld">
              <label htmlFor="medewerker">{copy.employee}</label>
              <input
                id="medewerker"
                name="medewerker"
                defaultValue={filters.medewerker}
                placeholder={copy.employeePlaceholder}
              />
            </div>

            <button type="submit" className="knop-secundair">
              {copy.filter}
            </button>
          </form>

          {klant.behandelingen.length === 0 ? (
            <div className="leeg">{copy.noTreatmentsForFilters}</div>
          ) : (
            <div className="lijst">
              {klant.behandelingen.map((behandeling) => (
                <article className="lijst-item" key={behandeling.id}>
                  <div className="acties" style={{ justifyContent: "space-between" }}>
                    <span className="badge">{formatDate(behandeling.datum, locale)}</span>
                    <span className="badge">{behandeling.behandelaar}</span>
                  </div>
                  <h4 style={{ marginTop: 14 }}>{behandeling.behandeling}</h4>
                  <p className="meta">
                    <strong>{copy.recipe}:</strong> {behandeling.recept}
                  </p>
                  {behandeling.notities ? (
                    <p className="meta">
                      <strong>{copy.notes}:</strong> {behandeling.notities}
                    </p>
                  ) : null}
                  {behandeling.photos.length > 0 ? (
                    <div style={{ marginTop: 16 }}>
                      <h4 style={{ marginBottom: 10 }}>{copy.treatmentPhotos}</h4>
                      <TreatmentPhotoGallery
                        customerId={klant.id}
                        treatmentId={behandeling.id}
                        photos={behandeling.photos}
                        dictionary={copy.photoGallery}
                      />
                    </div>
                  ) : null}
                  <div className="acties" style={{ marginTop: 16 }}>
                    <Link
                      href={`/klanten/${klant.id}?herhaalId=${behandeling.id}#nieuwe-behandeling`}
                      className="knop-zacht"
                    >
                      {copy.loadRecipeIntoForm}
                    </Link>
                    <Link
                      href={`/klanten/${klant.id}/behandelingen/${behandeling.id}/bewerken`}
                      className="knop-secundair"
                    >
                      {copy.editTreatment}
                    </Link>
                    <form action={deleteTreatmentAction}>
                      <input type="hidden" name="customerId" value={klant.id} />
                      <input type="hidden" name="treatmentId" value={behandeling.id} />
                      <DeleteCustomerButton
                        naam={behandeling.behandeling}
                        confirmMessage={copy.deleteTreatmentConfirm}
                        label={copy.deleteTreatment}
                        busyLabel={copy.deletingTreatment}
                      />
                    </form>
                  </div>
                </article>
              ))}
            </div>
          )}
        </article>

        <aside className="kaart" id="pakket-overzicht" style={{ scrollMarginTop: 24 }}>
          <h3>{copy.packagesTitle}</h3>
          <p className="subtitel" style={{ marginTop: 8 }}>
            {copy.packagesText}
          </p>

          <div className="lijst" style={{ marginTop: 18 }}>
            {customerPackages.length === 0 ? (
              <div className="leeg">{copy.noPackages}</div>
            ) : (
              <>
                {actieveKlantPakketten.map((customerPackage) => (
                  <article className="lijst-item active-package-card" key={customerPackage.id}>
                    <div className="acties" style={{ justifyContent: "space-between", alignItems: "flex-start" }}>
                      <div>
                        <span className="logo-label" style={{ marginBottom: 10 }}>
                          {copy.activePackageCardLabel}
                        </span>
                        <h4>{customerPackage.naamSnapshot}</h4>
                        <p className="meta">
                          <strong>{copy.packageTreatment}:</strong> {customerPackage.standaardBehandelingSnapshot}
                          <br />
                          <strong>{copy.packageType}:</strong>{" "}
                          {customerPackage.weergaveTypeSnapshot === "STEMPELKAART"
                            ? copy.digitalStampCard
                            : copy.bundlePackage}
                          <br />
                          <strong>{copy.soldOn}:</strong> {formatDate(customerPackage.gekochtOp, locale)}
                          <br />
                          <strong>{copy.packagePrice}:</strong> {formatCurrencyFromCents(customerPackage.pakketPrijsCents)}
                          <br />
                          <strong>{copy.singlePrice}:</strong> {formatCurrencyFromCents(customerPackage.lossePrijsCents)}{" "}
                          {copy.perSession}
                          {customerPackage.notities ? (
                            <>
                              <br />
                              <strong>{copy.notes}:</strong> {customerPackage.notities}
                            </>
                          ) : null}
                        </p>
                      </div>
                      <div className="package-counter-card">
                        <span className="status-badge">{copy.active}</span>
                        <strong>{customerPackage.resterendeBeurten}</strong>
                        <p>{replace(copy.remainingCounter, {
                          remaining: customerPackage.resterendeBeurten,
                          total: customerPackage.totaalBeurten
                        })}</p>
                      </div>
                    </div>

                    {customerPackage.weergaveTypeSnapshot === "STEMPELKAART" ? (
                      <div className="stempelkaart-paneel" style={{ marginTop: 14 }}>
                        <div className="stempelkaart-kop">
                          <div>
                            <strong>{copy.digitalStampCardTitle}</strong>
                            <p className="meta" style={{ marginTop: 6 }}>
                              {replace(copy.stampedSummary, {
                                used: customerPackage.totaalBeurten - customerPackage.resterendeBeurten,
                                remaining: customerPackage.resterendeBeurten
                              })}
                            </p>
                          </div>
                          <span className="status-badge">
                            {replace(copy.remainingShort, { count: customerPackage.resterendeBeurten })}
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
                                title={gebruikt ? copy.usedSession : copy.openSession}
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
                        <h4 style={{ marginBottom: 10 }}>{copy.usageHistory}</h4>
                        <div className="lijst">
                          {customerPackage.usages.map((usage) => (
                            <div className="lijst-item" key={usage.id}>
                              <p className="meta">
                                <strong>{formatDate(usage.datum, locale)}</strong>
                                <br />
                                <strong>
                                  {usage.aantalAfgeboekt < 0 ? `${copy.restored}:` : `${copy.deducted}:`}
                                </strong>{" "}
                                {Math.abs(usage.aantalAfgeboekt)}{" "}
                                {Math.abs(usage.aantalAfgeboekt) > 1 ? copy.sessionsWord : copy.sessionWord}
                                <br />
                                <strong>{copy.packageTreatment}:</strong>{" "}
                                {usage.treatment?.behandeling ?? copy.manualCorrection}
                                <br />
                                <strong>{copy.stylist}:</strong> {usage.user?.naam ?? copy.unknown}
                                {usage.notitie ? (
                                  <>
                                    <br />
                                    <strong>{copy.reason}:</strong> {usage.notitie}
                                  </>
                                ) : null}
                              </p>
                              {usage.treatment ? (
                                <div className="acties" style={{ marginTop: 12 }}>
                                  <Link
                                  href={`/klanten/${klant.id}/behandelingen/${usage.treatment.id}/bewerken`}
                                  className="knop-secundair"
                                >
                                  {copy.viewLinkedTreatment}
                                </Link>
                              </div>
                            ) : null}
                            </div>
                          ))}
                        </div>
                      </div>
                    ) : (
                      <div className="leeg" style={{ marginTop: 14 }}>
                        {copy.noUsageYet}
                      </div>
                    )}

                    <div className="kaart" style={{ marginTop: 14, padding: 16 }}>
                      <h4 style={{ marginBottom: 8 }}>{copy.correctionTitle}</h4>
                      <p className="subtitel" style={{ marginBottom: 12 }}>
                        {copy.correctionText}
                      </p>
                      <CustomerPackageCorrectionForm
                        customerPackageId={customerPackage.id}
                        action={correctCustomerPackageAction}
                        dictionary={copy.correctionForm}
                      />
                    </div>
                  </article>
                ))}

                {overigeKlantPakketten.length > 0 ? (
                  <details className="kaart collapsible-panel" style={{ marginTop: 12, padding: 20 }}>
                    <summary className="collapsible-summary">
                      <div>
                        <h4>{copy.previousPackages}</h4>
                        <p className="subtitel" style={{ marginTop: 6 }}>
                          {copy.previousPackagesSummary}
                        </p>
                      </div>
                      <span className="status-badge" data-inactive="true">
                        {overigeKlantPakketten.length}
                      </span>
                    </summary>
                    <div className="lijst" style={{ marginTop: 16 }}>
                      {overigeKlantPakketten.map((customerPackage) => (
                        <article className="lijst-item" key={customerPackage.id}>
                          <div className="acties" style={{ justifyContent: "space-between", alignItems: "flex-start" }}>
                            <div>
                              <h4>{customerPackage.naamSnapshot}</h4>
                              <p className="meta">
                                <strong>{copy.status}:</strong> {copy.packageStatus[customerPackage.status]}
                                <br />
                                <strong>{copy.packageType}:</strong>{" "}
                                {customerPackage.weergaveTypeSnapshot === "STEMPELKAART"
                                  ? copy.digitalStampCard
                                  : copy.bundlePackage}
                                <br />
                                <strong>{copy.used}:</strong> {customerPackage.totaalBeurten - customerPackage.resterendeBeurten} /{" "}
                                {customerPackage.totaalBeurten}
                                <br />
                                <strong>{copy.soldOn}:</strong> {formatDate(customerPackage.gekochtOp, locale)}
                              </p>
                            </div>
                            <span className="status-badge" data-inactive="true">
                              {customerPackage.status === "VOLLEDIG_GEBRUIKT"
                                ? copy.fullyUsed
                                : copy.packageStatus[customerPackage.status]}
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
                                      title={gebruikt ? copy.usedSession : copy.openSession}
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
                              <h4 style={{ marginBottom: 10 }}>{copy.usageHistory}</h4>
                              <div className="lijst">
                                {customerPackage.usages.map((usage) => (
                                  <div className="lijst-item" key={usage.id}>
                                    <p className="meta">
                                      <strong>{formatDate(usage.datum, locale)}</strong>
                                      <br />
                                      <strong>
                                        {usage.aantalAfgeboekt < 0 ? `${copy.restored}:` : `${copy.deducted}:`}
                                      </strong>{" "}
                                      {Math.abs(usage.aantalAfgeboekt)}{" "}
                                      {Math.abs(usage.aantalAfgeboekt) > 1 ? copy.sessionsWord : copy.sessionWord}
                                      <br />
                                      <strong>{copy.packageTreatment}:</strong>{" "}
                                      {usage.treatment?.behandeling ?? copy.manualCorrection}
                                      <br />
                                      <strong>{copy.stylist}:</strong> {usage.user?.naam ?? copy.unknown}
                                      {usage.notitie ? (
                                        <>
                                          <br />
                                          <strong>{copy.reason}:</strong> {usage.notitie}
                                        </>
                                      ) : null}
                                    </p>
                                  </div>
                                ))}
                              </div>
                            </div>
                          ) : null}
                        </article>
                      ))}
                    </div>
                  </details>
                ) : null}
              </>
            )}
          </div>

          <div
            className="kaart"
            id="pakket-toevoegen"
            style={{ marginTop: 18, padding: 20, scrollMarginTop: 24 }}
          >
            <h4>{copy.sellPackageTitle}</h4>
            <p className="subtitel" style={{ marginTop: 8 }}>
              {copy.sellPackageText}
            </p>
            {availablePackageTypes.length === 0 ? (
              <div className="leeg" style={{ marginTop: 16 }}>
                {copy.noActivePackageTypes}
              </div>
            ) : (
              <CustomerPackageForm
                customerId={klant.id}
                action={createCustomerPackageAction}
                packageTypes={availablePackageTypes}
                dictionary={copy.packageForm}
              />
            )}
          </div>

          <div className="kaart" id="nieuwe-behandeling" style={{ marginTop: 18, padding: 20, scrollMarginTop: 24 }}>
          <h3>{copy.treatmentFormTitle}</h3>
          <p className="subtitel" style={{ marginTop: 8 }}>
            {copy.treatmentFormText}
          </p>
          {sjablonen.length > 0 ? (
            <div style={{ marginTop: 16 }}>
              <p className="meta" style={{ marginBottom: 12 }}>
                {copy.quickStartFromTemplate}
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
                {replace(copy.recipeLoadedFromTreatment, {
                  date: formatDate(herhaalBehandeling.datum, locale)
                })}
              </span>
              <Link href={`/klanten/${klant.id}`} className="knop-secundair">
                {copy.clearForm}
              </Link>
            </div>
          ) : geselecteerdSjabloon ? (
            <div className="acties" style={{ marginTop: 16 }}>
              <span className="badge">
                {replace(copy.templateLoaded, { name: geselecteerdSjabloon.naam })}
              </span>
              <Link href={`/klanten/${klant.id}`} className="knop-secundair">
                {copy.clearForm}
              </Link>
            </div>
          ) : geselecteerdeAfspraak ? (
            <div className="acties" style={{ marginTop: 16 }}>
              <span className="badge">
                {geselecteerdeAfspraak.convertedTreatment
                  ? copy.appointmentAlreadyConverted
                  : replace(copy.appointmentLoaded, {
                      date: formatDate(geselecteerdeAfspraak.datumStart, locale)
                    })}
              </span>
              <Link href={`/klanten/${klant.id}`} className="knop-secundair">
                {copy.clearForm}
              </Link>
              {geselecteerdeAfspraak.convertedTreatment ? (
                <Link
                  href={`/klanten/${klant.id}/behandelingen/${geselecteerdeAfspraak.convertedTreatment.id}/bewerken`}
                  className="knop-zacht"
                >
                  {copy.openCompletedTreatment}
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
                ? copy.treatmentHelperFromPrevious
                : geselecteerdSjabloon
                  ? copy.treatmentHelperFromTemplate
                  : undefined
            }
            activePackages={activePackagesForTreatment}
            dictionary={copy.treatmentFormFields}
          />
          </div>
        </aside>
      </section>
    </div>
  );
}
