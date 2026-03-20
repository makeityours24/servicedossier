import Link from "next/link";
import { requireSalonSession } from "@/lib/auth";
import { formatTime, getDashboardData } from "@/lib/dashboard-queries";
import { dashboardDictionary, getCurrentLocale } from "@/lib/i18n";
import { formatDate } from "@/lib/utils";

export default async function DashboardPage() {
  const locale = await getCurrentLocale();
  const dict = dashboardDictionary[locale];
  const user = await requireSalonSession();
  const {
    aantalAfsprakenVandaag,
    openAfsprakenVandaag,
    behandelingenVandaag,
    nieuweKlantenVandaag,
    actievePakketten,
    actieveMedewerkers,
    afsprakenVandaag,
    laatsteBehandelingen,
    openPakketten
  } = await getDashboardData(user.salonId);

  return (
    <div className="rooster">
      <section className="bovenbalk">
        <div>
          <span className="logo-label">{dict.label}</span>
          <h2 className="pagina-titel" style={{ fontSize: "2.4rem" }}>
            {dict.title}
          </h2>
          <p className="subtitel">
            {dict.subtitle.replace("{salonNaam}", user.salon.instellingen?.weergavenaam ?? user.salon.naam)}
          </p>
        </div>

        <div className="acties">
          <Link href="/agenda" className="knop">
            {dict.openAgenda}
          </Link>
          <Link href="/klanten/nieuwe" className="knop-secundair">
            {dict.newCustomer}
          </Link>
        </div>
      </section>

      <section className="statistieken">
        <article className="kaart stat-kaart">
          <h3>{dict.stats.appointmentsToday}</h3>
          <strong>{aantalAfsprakenVandaag}</strong>
        </article>

        <article className="kaart stat-kaart">
          <h3>{dict.stats.openAppointments}</h3>
          <strong>{openAfsprakenVandaag}</strong>
        </article>

        <article className="kaart stat-kaart">
          <h3>{dict.stats.treatmentsToday}</h3>
          <strong>{behandelingenVandaag}</strong>
        </article>

        <article className="kaart stat-kaart">
          <h3>{dict.stats.newCustomersToday}</h3>
          <strong>{nieuweKlantenVandaag}</strong>
        </article>

        <article className="kaart stat-kaart">
          <h3>{dict.stats.activePackages}</h3>
          <strong>{actievePakketten}</strong>
        </article>

        <article className="kaart stat-kaart">
          <h3>{dict.stats.activeStaff}</h3>
          <strong>{actieveMedewerkers}</strong>
        </article>
      </section>

      <section className="twee-kolommen">
        <article className="kaart">
          <div className="print-balk">
            <div>
              <h3>{dict.todayAppointmentsTitle}</h3>
              <p className="subtitel" style={{ marginTop: 6 }}>
                {dict.todayAppointmentsText}
              </p>
            </div>
            <Link href="/agenda" className="knop-zacht">
              {dict.fullAgenda}
            </Link>
          </div>

          <div className="lijst">
            {afsprakenVandaag.length === 0 ? (
              <div className="leeg">{dict.noAppointments}</div>
            ) : (
              afsprakenVandaag.map((afspraak) => (
                <div className="lijst-item" key={afspraak.id}>
                  <div className="acties" style={{ justifyContent: "space-between", alignItems: "flex-start" }}>
                    <div>
                      <h4>{afspraak.customer.naam}</h4>
                      <p className="meta">
                        {afspraak.behandeling}
                        <br />
                        {formatTime(afspraak.datumStart, locale)} - {formatTime(afspraak.datumEinde, locale)}
                        <br />
                        {afspraak.user?.naam ?? dict.unassigned}
                      </p>
                    </div>
                    <span
                      className="status-badge"
                      data-inactive={
                        afspraak.status === "GEANNULEERD" || afspraak.status === "NIET_GEKOMEN"
                          ? "true"
                          : undefined
                      }
                    >
                      {dict.status[afspraak.status]}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </article>

        <article className="kaart">
          <div className="print-balk">
            <div>
              <h3>{dict.openPackagesTitle}</h3>
              <p className="subtitel" style={{ marginTop: 6 }}>
                {dict.openPackagesText}
              </p>
            </div>
            <Link href="/pakketten" className="knop-zacht">
              {dict.packagesButton}
            </Link>
          </div>

          <div className="lijst">
            {openPakketten.length === 0 ? (
              <div className="leeg">{dict.noOpenPackages}</div>
            ) : (
              openPakketten.map((pakket) => (
                <div className="lijst-item" key={pakket.id}>
                  <div className="acties" style={{ justifyContent: "space-between", alignItems: "flex-start" }}>
                    <div>
                      <h4>{pakket.customer.naam}</h4>
                      <p className="meta">
                        {pakket.naamSnapshot}
                        <br />
                        {dict.remaining
                          .replace("{remaining}", String(pakket.resterendeBeurten))
                          .replace("{total}", String(pakket.totaalBeurten))}
                        <br />
                        {dict.soldOn.replace("{date}", formatDate(pakket.gekochtOp, locale))}
                      </p>
                    </div>
                    <Link href={`/klanten/${pakket.customer.id}`} className="knop-secundair">
                      {dict.openDossier}
                    </Link>
                  </div>
                </div>
              ))
            )}
          </div>
        </article>
      </section>

      <section className="twee-kolommen">
        <article className="kaart">
          <h3>{dict.latestTreatments}</h3>
          <div className="lijst" style={{ marginTop: 18 }}>
            {laatsteBehandelingen.length === 0 ? (
              <div className="leeg">{dict.noTreatments}</div>
            ) : (
              laatsteBehandelingen.map((behandeling) => (
                <div className="lijst-item" key={behandeling.id}>
                  <h4>{behandeling.customer.naam}</h4>
                  <p className="meta">
                    {behandeling.behandeling}
                    <br />
                    {formatDate(behandeling.datum, locale)} {dict.by} {behandeling.behandelaar}
                  </p>
                </div>
              ))
            )}
          </div>
        </article>

        <article className="kaart">
          <h3>{dict.quickActions}</h3>
          <div className="lijst" style={{ marginTop: 18 }}>
            <Link href="/klanten/nieuwe" className="lijst-item">
              <h4>{dict.quickActionCards.newCustomer.title}</h4>
              <p className="meta">{dict.quickActionCards.newCustomer.text}</p>
            </Link>
            <Link href="/agenda" className="lijst-item">
              <h4>{dict.quickActionCards.newAppointment.title}</h4>
              <p className="meta">{dict.quickActionCards.newAppointment.text}</p>
            </Link>
            <a href="/api/export" className="lijst-item">
              <h4>{dict.quickActionCards.export.title}</h4>
              <p className="meta">{dict.quickActionCards.export.text}</p>
            </a>
          </div>
        </article>
      </section>
    </div>
  );
}
