import Link from "next/link";
import { deleteCustomerAction } from "@/app/(dashboard)/klanten/actions";
import { CustomerSearch } from "@/components/customer-search";
import { DeleteCustomerButton } from "@/components/delete-customer-button";
import { requireSalonSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

type KlantenPageProps = {
  searchParams: Promise<{
    zoek?: string;
  }>;
};

export default async function KlantenPage({ searchParams }: KlantenPageProps) {
  const user = await requireSalonSession();
  const params = await searchParams;
  const zoek = params.zoek?.trim() ?? "";

  const klanten = await prisma.customer.findMany({
    where: {
      salonId: user.salonId,
      ...(zoek
        ? {
          OR: [
            { naam: { contains: zoek, mode: "insensitive" } },
            { telefoonnummer: { contains: zoek } }
          ]
        }
        : {})
    },
    orderBy: { naam: "asc" },
    include: {
      behandelingen: {
        orderBy: { datum: "desc" },
        take: 1,
        select: {
          datum: true,
          behandeling: true
        }
      }
    }
  });

  return (
    <div className="rooster">
      <section className="bovenbalk">
        <div>
          <span className="logo-label">Klanten</span>
          <h2 className="pagina-titel" style={{ fontSize: "2.2rem" }}>
            Klantenlijst
          </h2>
          <p className="subtitel">
            Zoek razendsnel op naam of telefoonnummer en open direct het juiste dossier.
          </p>
        </div>

        <Link href="/klanten/nieuwe" className="knop">
          Klant toevoegen
        </Link>
      </section>

      <CustomerSearch initialQuery={zoek} />

      <section className="info-grid">
        <article className="info-kaart">
          <h3>Klanten zijn dossiers</h3>
          <p className="meta">
            Klanten die je hier toevoegt zijn bedoeld voor behandelgeschiedenis, kleurrecepten en
            contactgegevens. Zij krijgen geen eigen loginaccount.
          </p>
        </article>
        <article className="info-kaart">
          <h3>Loginaccounts maak je in Team</h3>
          <p className="meta">
            Moet iemand wel kunnen inloggen? Voeg die persoon dan toe via <strong>Team</strong> als
            medewerkeraccount.
          </p>
        </article>
      </section>

      <section className="kaart">
        <table className="tafel">
          <thead>
            <tr>
              <th>Naam</th>
              <th>Telefoonnummer</th>
              <th>Adres</th>
              <th>Laatste behandeling</th>
              <th />
            </tr>
          </thead>
          <tbody>
            {klanten.length === 0 ? (
              <tr>
                <td colSpan={5}>
                  <div className="leeg">Geen klanten gevonden voor deze zoekopdracht.</div>
                </td>
              </tr>
            ) : (
              klanten.map((klant) => (
                <tr key={klant.id}>
                  <td>{klant.naam}</td>
                  <td>{klant.telefoonnummer}</td>
                  <td>{klant.adres}</td>
                  <td>{klant.behandelingen[0]?.behandeling ?? "Nog geen behandeling"}</td>
                  <td>
                    <div className="acties">
                      <Link href={`/klanten/${klant.id}`} className="knop-zacht">
                        Open dossier
                      </Link>
                      <Link href={`/klanten/${klant.id}/bewerken`} className="knop-secundair">
                        Bewerken
                      </Link>
                      <form action={deleteCustomerAction}>
                        <input type="hidden" name="customerId" value={klant.id} />
                        <DeleteCustomerButton
                          naam={klant.naam}
                          confirmMessage="Weet je zeker dat je {naam} wilt verwijderen? Alle behandelingen van deze klant worden ook verwijderd."
                        />
                      </form>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </section>
    </div>
  );
}
