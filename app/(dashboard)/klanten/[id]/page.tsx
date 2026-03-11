import Link from "next/link";
import { notFound } from "next/navigation";
import { TreatmentForm } from "@/components/treatment-form";
import { createTreatmentAction } from "@/app/(dashboard)/klanten/actions";
import { requireSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { formatDate } from "@/lib/utils";

type KlantDetailPageProps = {
  params: Promise<{ id: string }>;
  searchParams: Promise<{
    van?: string;
    tot?: string;
    medewerker?: string;
  }>;
};

export default async function KlantDetailPage({
  params,
  searchParams
}: KlantDetailPageProps) {
  const { id } = await params;
  const filters = await searchParams;
  const klantId = Number(id);
  const user = await requireSession();

  if (!Number.isInteger(klantId)) {
    notFound();
  }

  const klant = await prisma.customer.findUnique({
    where: { id: klantId },
    include: {
      behandelingen: {
        where: {
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
        orderBy: { datum: "asc" }
      }
    }
  });

  if (!klant) {
    notFound();
  }

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
          <Link href={`/klanten/${klant.id}/print`} className="knop-zacht">
            Afdrukken
          </Link>
          <a href={`/api/export?customerId=${klant.id}`} className="knop">
            CSV export
          </a>
        </div>
      </section>

      <section className="detail-grid">
        <article className="kaart">
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
                </article>
              ))}
            </div>
          )}
        </article>

        <aside className="kaart">
          <h3>Nieuwe behandeling registreren</h3>
          <p className="subtitel" style={{ marginTop: 8 }}>
            Voeg direct een nieuwe kleurbehandeling of andere behandeling toe aan dit dossier.
          </p>

          <TreatmentForm
            customerId={klant.id}
            medewerkerNaam={user.naam}
            action={createTreatmentAction}
          />
        </aside>
      </section>
    </div>
  );
}
