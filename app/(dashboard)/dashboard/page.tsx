import Link from "next/link";
import { requireSalonSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { formatDate } from "@/lib/utils";

function getTodayRange() {
  const now = new Date();
  const start = new Date(now);
  start.setHours(0, 0, 0, 0);

  const end = new Date(now);
  end.setHours(23, 59, 59, 999);

  return { start, end };
}

function formatTime(date: Date | string) {
  return new Intl.DateTimeFormat("nl-NL", {
    hour: "2-digit",
    minute: "2-digit"
  }).format(new Date(date));
}

export default async function DashboardPage() {
  const user = await requireSalonSession();
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
        salonId: user.salonId,
        datumStart: {
          gte: vandaagStart,
          lte: vandaagEinde
        }
      }
    }),
    prisma.appointment.count({
      where: {
        salonId: user.salonId,
        status: "GEPLAND",
        datumStart: {
          gte: vandaagStart,
          lte: vandaagEinde
        }
      }
    }),
    prisma.treatment.count({
      where: {
        salonId: user.salonId,
        datum: {
          gte: vandaagStart,
          lte: vandaagEinde
        }
      }
    }),
    prisma.customer.count({
      where: {
        salonId: user.salonId,
        createdAt: {
          gte: vandaagStart,
          lte: vandaagEinde
        }
      }
    }),
    prisma.customerPackage.count({
      where: {
        salonId: user.salonId,
        status: "ACTIEF"
      }
    }),
    prisma.user.count({
      where: {
        salonId: user.salonId,
        status: "ACTIEF",
        isPlatformAdmin: false
      }
    }),
    prisma.appointment.findMany({
      where: {
        salonId: user.salonId,
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
      where: { salonId: user.salonId },
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
        salonId: user.salonId,
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

  return (
    <div className="rooster">
      <section className="bovenbalk">
        <div>
          <span className="logo-label">Dashboard</span>
          <h2 className="pagina-titel" style={{ fontSize: "2.4rem" }}>
            Vandaag in de salon
          </h2>
          <p className="subtitel">
            Direct overzicht van afspraken, behandelingen, nieuwe klanten en open pakketten voor{" "}
            {user.salon.instellingen?.weergavenaam ?? user.salon.naam}.
          </p>
        </div>

        <div className="acties">
          <Link href="/agenda" className="knop">
            Agenda openen
          </Link>
          <Link href="/klanten/nieuwe" className="knop-secundair">
            Nieuwe klant
          </Link>
        </div>
      </section>

      <section className="statistieken">
        <article className="kaart stat-kaart">
          <h3>Afspraken vandaag</h3>
          <strong>{aantalAfsprakenVandaag}</strong>
        </article>

        <article className="kaart stat-kaart">
          <h3>Open afspraken</h3>
          <strong>{openAfsprakenVandaag}</strong>
        </article>

        <article className="kaart stat-kaart">
          <h3>Behandelingen vandaag</h3>
          <strong>{behandelingenVandaag}</strong>
        </article>

        <article className="kaart stat-kaart">
          <h3>Nieuwe klanten vandaag</h3>
          <strong>{nieuweKlantenVandaag}</strong>
        </article>

        <article className="kaart stat-kaart">
          <h3>Actieve pakketten</h3>
          <strong>{actievePakketten}</strong>
        </article>

        <article className="kaart stat-kaart">
          <h3>Actieve medewerkers</h3>
          <strong>{actieveMedewerkers}</strong>
        </article>
      </section>

      <section className="twee-kolommen">
        <article className="kaart">
          <div className="print-balk">
            <div>
              <h3>Afspraken van vandaag</h3>
              <p className="subtitel" style={{ marginTop: 6 }}>
                Handig om de dag te openen zonder eerst naar de volledige agenda te gaan.
              </p>
            </div>
            <Link href="/agenda" className="knop-zacht">
              Volledige agenda
            </Link>
          </div>

          <div className="lijst">
            {afsprakenVandaag.length === 0 ? (
              <div className="leeg">Er staan vandaag nog geen afspraken ingepland.</div>
            ) : (
              afsprakenVandaag.map((afspraak) => (
                <div className="lijst-item" key={afspraak.id}>
                  <div className="acties" style={{ justifyContent: "space-between", alignItems: "flex-start" }}>
                    <div>
                      <h4>{afspraak.customer.naam}</h4>
                      <p className="meta">
                        {afspraak.behandeling}
                        <br />
                        {formatTime(afspraak.datumStart)} - {formatTime(afspraak.datumEinde)}
                        <br />
                        {afspraak.user?.naam ?? "Nog niet toegewezen"}
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
                      {afspraak.status === "GEPLAND"
                        ? "Gepland"
                        : afspraak.status === "VOLTOOID"
                          ? "Voltooid"
                          : afspraak.status === "GEANNULEERD"
                            ? "Geannuleerd"
                            : "Niet gekomen"}
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
              <h3>Open pakketten</h3>
              <p className="subtitel" style={{ marginTop: 6 }}>
                Zie snel welke klanten nog bundels of stempelkaarten hebben lopen.
              </p>
            </div>
            <Link href="/pakketten" className="knop-zacht">
              Pakketten
            </Link>
          </div>

          <div className="lijst">
            {openPakketten.length === 0 ? (
              <div className="leeg">Er zijn nu geen actieve pakketten in deze salon.</div>
            ) : (
              openPakketten.map((pakket) => (
                <div className="lijst-item" key={pakket.id}>
                  <div className="acties" style={{ justifyContent: "space-between", alignItems: "flex-start" }}>
                    <div>
                      <h4>{pakket.customer.naam}</h4>
                      <p className="meta">
                        {pakket.naamSnapshot}
                        <br />
                        Nog {pakket.resterendeBeurten} van {pakket.totaalBeurten} over
                        <br />
                        Verkocht op {formatDate(pakket.gekochtOp)}
                      </p>
                    </div>
                    <Link href={`/klanten/${pakket.customer.id}`} className="knop-secundair">
                      Open dossier
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
          <h3>Laatste behandelingen</h3>
          <div className="lijst" style={{ marginTop: 18 }}>
            {laatsteBehandelingen.length === 0 ? (
              <div className="leeg">Er zijn nog geen behandelingen geregistreerd.</div>
            ) : (
              laatsteBehandelingen.map((behandeling) => (
                <div className="lijst-item" key={behandeling.id}>
                  <h4>{behandeling.customer.naam}</h4>
                  <p className="meta">
                    {behandeling.behandeling}
                    <br />
                    {formatDate(behandeling.datum)} door {behandeling.behandelaar}
                  </p>
                </div>
              ))
            )}
          </div>
        </article>

        <article className="kaart">
          <h3>Snelle acties</h3>
          <div className="lijst" style={{ marginTop: 18 }}>
            <Link href="/klanten/nieuwe" className="lijst-item">
              <h4>Nieuwe klant registreren</h4>
              <p className="meta">
                Voeg direct een nieuw klantdossier toe. Voor inlogaccounts gebruik je Team.
              </p>
            </Link>
            <Link href="/agenda" className="lijst-item">
              <h4>Nieuwe afspraak plannen</h4>
              <p className="meta">Open de agenda en plan direct een nieuwe klantafspraak in.</p>
            </Link>
            <a href="/api/export" className="lijst-item">
              <h4>CSV-export downloaden</h4>
              <p className="meta">Exporteer klant- en behandelgegevens voor administratie.</p>
            </a>
          </div>
        </article>
      </section>
    </div>
  );
}
