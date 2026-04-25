import Link from "next/link";
import { PlatformSalonForm } from "@/components/platform-salon-form";
import { createSalonAction, deleteSalonAction } from "@/app/platform/actions";
import { DeleteCustomerButton } from "@/components/delete-customer-button";
import { getSalonLoginUrl } from "@/lib/core/app-url";
import { requirePlatformAdmin } from "@/lib/core/auth";
import { prisma } from "@/lib/core/prisma";
import { formatDate } from "@/lib/utils";

type PlatformPageProps = {
  searchParams: Promise<{
    zoek?: string;
    status?: "ACTIEF" | "GEPAUZEERD";
  }>;
};

export default async function PlatformPage({ searchParams }: PlatformPageProps) {
  await requirePlatformAdmin();
  const params = await searchParams;
  const zoek = params.zoek?.trim() ?? "";
  const status = params.status;

  const salons = await prisma.salon.findMany({
    where: {
      ...(zoek
        ? {
            OR: [
              { naam: { contains: zoek, mode: "insensitive" } },
              { slug: { contains: zoek, mode: "insensitive" } },
              { email: { contains: zoek, mode: "insensitive" } },
              {
                instellingen: {
                  is: {
                    weergavenaam: { contains: zoek, mode: "insensitive" }
                  }
                }
              }
            ]
          }
        : {}),
      ...(status ? { status } : {})
    },
    include: {
      instellingen: true,
      treatments: {
        select: {
          id: true,
          updatedAt: true
        },
        orderBy: { updatedAt: "desc" },
        take: 1
      },
      customers: {
        select: { id: true }
      },
      recipeTemplates: {
        select: { id: true }
      },
      users: {
        select: { id: true }
      }
    },
    orderBy: { createdAt: "desc" }
  });

  const owners = await prisma.user.findMany({
    where: {
      isPlatformAdmin: false,
      rol: "OWNER",
      salonId: {
        in: salons.map((salon) => salon.id)
      }
    },
    select: {
      salonId: true,
      naam: true,
      email: true
    },
    orderBy: { createdAt: "asc" }
  });

  const ownerBySalonId = new Map<number, { naam: string; email: string }>();
  for (const owner of owners) {
    if (owner.salonId && !ownerBySalonId.has(owner.salonId)) {
      ownerBySalonId.set(owner.salonId, {
        naam: owner.naam,
        email: owner.email
      });
    }
  }

  const actieveSalons = salons.filter((salon) => salon.status === "ACTIEF").length;
  const gepauzeerdeSalons = salons.filter((salon) => salon.status === "GEPAUZEERD").length;
  const totaalKlanten = salons.reduce((acc, salon) => acc + salon.customers.length, 0);
  const totaalSjablonen = salons.reduce((acc, salon) => acc + salon.recipeTemplates.length, 0);

  return (
    <div className="rooster">
      <section className="bovenbalk">
        <div>
          <span className="logo-label">Platform</span>
          <h2 className="pagina-titel" style={{ fontSize: "2.2rem" }}>
            Salonoverzicht
          </h2>
          <p className="subtitel">
            Beheer meerdere salons vanuit één centrale omgeving en gebruik SalonDossier als herkenbare demo-tenant.
          </p>
        </div>
      </section>

      <section className="kaart">
        <form className="filters" style={{ gridTemplateColumns: "2fr 1fr auto auto" }}>
          <div className="veld">
            <label htmlFor="zoek">Zoek salon</label>
            <input
              id="zoek"
              name="zoek"
              defaultValue={zoek}
              placeholder="Bijvoorbeeld SalonDossier, jouw-salon of e-mail"
            />
          </div>

          <div className="veld">
            <label htmlFor="status">Status</label>
            <select id="status" name="status" defaultValue={status ?? ""}>
              <option value="">Alle statussen</option>
              <option value="ACTIEF">Actief</option>
              <option value="GEPAUZEERD">Gepauzeerd</option>
            </select>
          </div>

          <button type="submit" className="knop-secundair">
            Filteren
          </button>

          <Link href="/platform" className="knop-zacht">
            Reset
          </Link>
        </form>
      </section>

      <section className="statistieken">
        <article className="stat-kaart">
          <h3>Actieve salons</h3>
          <strong>{actieveSalons}</strong>
        </article>
        <article className="stat-kaart">
          <h3>Gepauzeerde salons</h3>
          <strong>{gepauzeerdeSalons}</strong>
        </article>
        <article className="stat-kaart">
          <h3>Totaal klanten</h3>
          <strong>{totaalKlanten}</strong>
        </article>
      </section>

      <section className="statistieken">
        <article className="stat-kaart">
          <h3>Totaal receptsjablonen</h3>
          <strong>{totaalSjablonen}</strong>
        </article>
        <article className="stat-kaart">
          <h3>Laatste uitbreiding</h3>
          <strong>{salons[0] ? formatDate(salons[0].createdAt) : "-"}</strong>
        </article>
        <article className="stat-kaart">
          <h3>Totaal salons</h3>
          <strong>{salons.length}</strong>
        </article>
      </section>

      <section className="twee-kolommen">
        <article className="kaart">
          <h3>Salons</h3>
          {salons.length === 0 ? (
            <div className="leeg" style={{ marginTop: 18 }}>
              Geen salons gevonden voor dit filter. Pas je zoekopdracht aan of maak rechts een nieuwe salon aan.
            </div>
          ) : (
            <div className="lijst" style={{ marginTop: 18 }}>
              {salons.map((salon) => (
                <div className="lijst-item" key={salon.id}>
                  <div className="acties" style={{ justifyContent: "space-between", alignItems: "center" }}>
                    <h4>{salon.instellingen?.weergavenaam ?? salon.naam}</h4>
                    <span className="badge">
                      {salon.status === "ACTIEF" ? "Actief" : "Gepauzeerd"}
                    </span>
                  </div>
                  <p className="meta">
                    Slug: {salon.slug}
                    <br />
                    Eigenaar: {ownerBySalonId.get(salon.id)?.naam ?? "Nog geen eigenaar"}{" "}
                    {ownerBySalonId.get(salon.id)?.email
                      ? `(${ownerBySalonId.get(salon.id)?.email})`
                      : ""}
                    <br />
                    Gebruikers: {salon.users.length} · Klanten: {salon.customers.length} · Sjablonen:{" "}
                    {salon.recipeTemplates.length}
                    <br />
                    {salon.email ?? "Geen e-mail"} · {salon.telefoonnummer ?? "Geen telefoon"}
                    <br />
                    Laatste activiteit:{" "}
                    {salon.treatments[0]?.updatedAt ? formatDate(salon.treatments[0].updatedAt) : "Nog geen behandeling"}
                    <br />
                    Login:{" "}
                    <a href={getSalonLoginUrl(salon.slug)} target="_blank" rel="noreferrer">
                      {getSalonLoginUrl(salon.slug)}
                    </a>
                  </p>
                  <div className="acties" style={{ marginTop: 16 }}>
                    <Link href={`/platform/${salon.id}`} className="knop">
                      Details
                    </Link>
                    <Link href={`/platform/${salon.id}/installateurs`} className="knop-secundair">
                      Installateurs
                    </Link>
                    <Link href={`/platform/${salon.id}/bewerken`} className="knop-secundair">
                      Bewerken
                    </Link>
                    <a
                      href={getSalonLoginUrl(salon.slug)}
                      target="_blank"
                      rel="noreferrer"
                      className="knop-zacht"
                    >
                      Open login
                    </a>
                    <form action={deleteSalonAction}>
                      <input type="hidden" name="salonId" value={salon.id} />
                      <DeleteCustomerButton
                        naam={salon.instellingen?.weergavenaam ?? salon.naam}
                        confirmMessage="Weet je zeker dat je salon {naam} wilt verwijderen? Alle gekoppelde gebruikers, klanten en behandelingen van deze salon worden ook verwijderd."
                      />
                    </form>
                  </div>
                </div>
              ))}
            </div>
          )}
        </article>

        <aside className="kaart">
          <h3>Nieuwe salon aanmaken</h3>
          <p className="subtitel" style={{ marginTop: 8 }}>
            Maak een nieuwe salon-tenant aan met een eigen basisconfiguratie en instellingenrecord.
          </p>
          <div className="info-kaart" style={{ marginTop: 18 }}>
            <h3>Wat gebeurt er na aanmaken?</h3>
            <p className="meta">
              De salon krijgt direct een eigen saloncode, een loginlink en een eerste eigenaar. Bij de eerste login
              moet die eigenaar meteen een persoonlijk wachtwoord instellen.
            </p>
          </div>
          <PlatformSalonForm action={createSalonAction} />
        </aside>
      </section>
    </div>
  );
}
