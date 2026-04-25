import Link from "next/link";
import { notFound } from "next/navigation";
import { getSalonLoginUrl } from "@/lib/core/app-url";
import { requirePlatformAdmin } from "@/lib/core/auth";
import { prisma } from "@/lib/core/prisma";
import { formatDate } from "@/lib/utils";

type PlatformSalonDetailPageProps = {
  params: Promise<{ id: string }>;
};

export default async function PlatformSalonDetailPage({
  params
}: PlatformSalonDetailPageProps) {
  await requirePlatformAdmin();

  const { id } = await params;
  const salonId = Number(id);

  if (!Number.isInteger(salonId)) {
    notFound();
  }

  const salon = await prisma.salon.findUnique({
    where: { id: salonId },
    include: {
      instellingen: true,
      customers: {
        select: {
          id: true,
          naam: true,
          createdAt: true
        },
        orderBy: { createdAt: "desc" },
        take: 5
      },
      users: {
        where: { isPlatformAdmin: false },
        select: {
          id: true,
          naam: true,
          email: true,
          rol: true,
          status: true,
          moetWachtwoordWijzigen: true,
          createdAt: true
        },
        orderBy: [{ rol: "asc" }, { createdAt: "asc" }]
      },
      recipeTemplates: {
        select: {
          id: true,
          naam: true,
          behandeling: true,
          updatedAt: true
        },
        orderBy: { updatedAt: "desc" },
        take: 6
      },
      treatments: {
        select: {
          id: true,
          behandeling: true,
          behandelaar: true,
          updatedAt: true,
          customer: {
            select: {
              naam: true
            }
          }
        },
        orderBy: { updatedAt: "desc" },
        take: 8
      }
    }
  });

  if (!salon) {
    notFound();
  }

  const owner =
    salon.users.find((user) => user.rol === "OWNER") ??
    salon.users.find((user) => user.rol === "ADMIN") ??
    null;

  const salonNaam = salon.instellingen?.weergavenaam ?? salon.naam;
  const laatsteActiviteit = salon.treatments[0]?.updatedAt ?? salon.updatedAt;

  return (
    <div className="rooster">
      <section className="bovenbalk">
        <div>
          <span className="logo-label">Platform detail</span>
          <h2 className="pagina-titel" style={{ fontSize: "2.2rem" }}>
            {salonNaam}
          </h2>
          <p className="subtitel">
            {salon.email ?? "Geen e-mail"} · {salon.telefoonnummer ?? "Geen telefoon"}
            <br />
            Slug: {salon.slug} · Status: {salon.status === "ACTIEF" ? "Actief" : "Gepauzeerd"}
          </p>
        </div>

        <div className="acties">
          <Link href="/platform" className="knop-zacht">
            Terug naar overzicht
          </Link>
          <Link href={`/platform/${salon.id}/installateurs`} className="knop-zacht">
            Installateurs pilot
          </Link>
          <Link href={`/platform/${salon.id}/bewerken`} className="knop-secundair">
            Salon bewerken
          </Link>
          <a href={getSalonLoginUrl(salon.slug)} target="_blank" rel="noreferrer" className="knop">
            Open login
          </a>
        </div>
      </section>

      <section className="statistieken">
        <article className="stat-kaart">
          <h3>Gebruikers</h3>
          <strong>{salon.users.length}</strong>
        </article>
        <article className="stat-kaart">
          <h3>Klanten</h3>
          <strong>{salon.customers.length}</strong>
        </article>
        <article className="stat-kaart">
          <h3>Receptsjablonen</h3>
          <strong>{salon.recipeTemplates.length}</strong>
        </article>
      </section>

      <section className="kaart">
        <div className="acties" style={{ justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <h3>Modules</h3>
            <p className="meta" style={{ marginTop: 10 }}>
              Open vanaf hier direct de installateursomgeving voor klanten, locaties, installaties, werkbonnen en portaal.
            </p>
          </div>
          <Link href={`/platform/${salon.id}/installateurs`} className="knop">
            Open installateursmodule
          </Link>
        </div>
      </section>

      <section className="twee-kolommen">
        <article className="kaart">
          <h3>Kerngegevens</h3>
          <p className="meta" style={{ marginTop: 14 }}>
            <strong>Eigenaar:</strong> {owner?.naam ?? "Nog niet toegewezen"}
            {owner?.email ? ` (${owner.email})` : ""}
            <br />
            <strong>Adres:</strong> {salon.adres ?? salon.instellingen?.adres ?? "Niet ingevuld"}
            <br />
            <strong>Laatste activiteit:</strong> {formatDate(laatsteActiviteit)}
            <br />
            <strong>Login:</strong>{" "}
            <a href={getSalonLoginUrl(salon.slug)} target="_blank" rel="noreferrer">
              {getSalonLoginUrl(salon.slug)}
            </a>
          </p>

          <h3 style={{ marginTop: 24 }}>Medewerkers</h3>
          <div className="lijst" style={{ marginTop: 14 }}>
            {salon.users.length === 0 ? (
              <div className="leeg">Nog geen medewerkers gekoppeld aan deze salon.</div>
            ) : (
              salon.users.map((medewerker) => (
                <div className="lijst-item" key={medewerker.id}>
                  <div className="acties" style={{ justifyContent: "space-between", alignItems: "center" }}>
                    <h4>{medewerker.naam}</h4>
                    <span className="badge">
                      {medewerker.status === "ACTIEF" ? "Actief" : "Uitgeschakeld"}
                    </span>
                  </div>
                  <p className="meta">
                    {medewerker.email}
                    <br />
                    Rol: {medewerker.rol}
                    <br />
                    Eerste login afronden: {medewerker.moetWachtwoordWijzigen ? "Ja" : "Nee"}
                  </p>
                </div>
              ))
            )}
          </div>
        </article>

        <aside className="kaart">
          <h3>Recente activiteit</h3>
          <div className="lijst" style={{ marginTop: 14 }}>
            {salon.treatments.length === 0 ? (
              <div className="leeg">Nog geen behandelingen binnen deze salon.</div>
            ) : (
              salon.treatments.map((treatment) => (
                <div className="lijst-item" key={treatment.id}>
                  <h4>{treatment.behandeling}</h4>
                  <p className="meta">
                    Klant: {treatment.customer.naam}
                    <br />
                    Behandelaar: {treatment.behandelaar}
                    <br />
                    Laatst bijgewerkt: {formatDate(treatment.updatedAt)}
                  </p>
                </div>
              ))
            )}
          </div>

          <h3 style={{ marginTop: 24 }}>Laatste klanten</h3>
          <div className="lijst" style={{ marginTop: 14 }}>
            {salon.customers.length === 0 ? (
              <div className="leeg">Nog geen klanten in deze salon.</div>
            ) : (
              salon.customers.map((customer) => (
                <div className="lijst-item" key={customer.id}>
                  <h4>{customer.naam}</h4>
                  <p className="meta">Toegevoegd op {formatDate(customer.createdAt)}</p>
                </div>
              ))
            )}
          </div>

          <h3 style={{ marginTop: 24 }}>Receptsjablonen</h3>
          <div className="lijst" style={{ marginTop: 14 }}>
            {salon.recipeTemplates.length === 0 ? (
              <div className="leeg">Nog geen receptsjablonen in deze salon.</div>
            ) : (
              salon.recipeTemplates.map((template) => (
                <div className="lijst-item" key={template.id}>
                  <h4>{template.naam}</h4>
                  <p className="meta">
                    Behandeling: {template.behandeling}
                    <br />
                    Laatst bijgewerkt: {formatDate(template.updatedAt)}
                  </p>
                </div>
              ))
            )}
          </div>
        </aside>
      </section>
    </div>
  );
}
