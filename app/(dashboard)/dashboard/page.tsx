import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { formatDate } from "@/lib/utils";

export default async function DashboardPage() {
  const [aantalKlanten, aantalBehandelingen, laatsteBehandelingen, medewerkers] =
    await Promise.all([
      prisma.customer.count(),
      prisma.treatment.count(),
      prisma.treatment.findMany({
        orderBy: { datum: "desc" },
        take: 5,
        include: {
          customer: {
            select: { naam: true }
          }
        }
      }),
      prisma.user.count()
    ]);

  return (
    <div className="rooster">
      <section className="bovenbalk">
        <div>
          <span className="logo-label">Dashboard</span>
          <h2 className="pagina-titel" style={{ fontSize: "2.4rem" }}>
            Overzicht van klanten en behandelingen
          </h2>
          <p className="subtitel">
            Snel inzicht in de salonagenda, recente kleurrecepten en het aantal actieve dossiers.
          </p>
        </div>

        <div className="acties">
          <Link href="/klanten/nieuwe" className="knop">
            Nieuwe klant
          </Link>
          <Link href="/klanten" className="knop-secundair">
            Klantenlijst
          </Link>
        </div>
      </section>

      <section className="statistieken">
        <article className="kaart stat-kaart">
          <h3>Totaal aantal klanten</h3>
          <strong>{aantalKlanten}</strong>
        </article>

        <article className="kaart stat-kaart">
          <h3>Totaal aantal behandelingen</h3>
          <strong>{aantalBehandelingen}</strong>
        </article>

        <article className="kaart stat-kaart">
          <h3>Actieve medewerkers</h3>
          <strong>{medewerkers}</strong>
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
              <p className="meta">Voeg direct een nieuw klantdossier toe.</p>
            </Link>
            <Link href="/klanten" className="lijst-item">
              <h4>Behandelhistorie zoeken</h4>
              <p className="meta">Zoek snel op naam of telefoonnummer.</p>
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
