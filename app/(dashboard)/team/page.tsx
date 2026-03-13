import Link from "next/link";
import { createMedewerkerAction, deleteMedewerkerAction } from "@/app/(dashboard)/team/actions";
import { DeleteCustomerButton } from "@/components/delete-customer-button";
import { TeamForm } from "@/components/team-form";
import { requireSalonSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export default async function TeamPage() {
  const user = await requireSalonSession();

  const medewerkers = await prisma.user.findMany({
    where: {
      salonId: user.salonId,
      isPlatformAdmin: false
    },
    orderBy: { createdAt: "asc" }
  });

  return (
    <div className="rooster">
      <section className="bovenbalk">
        <div>
          <span className="logo-label">Team</span>
          <h2 className="pagina-titel" style={{ fontSize: "2.2rem" }}>
            Medewerkersbeheer
          </h2>
          <p className="subtitel">
            Beheer medewerkers binnen deze salonomgeving, inclusief rol, status en toegangsgegevens.
          </p>
        </div>
      </section>

      <section className="twee-kolommen">
        <article className="kaart">
          <h3>Bestaande medewerkers</h3>
          <div className="lijst" style={{ marginTop: 18 }}>
            {medewerkers.map((medewerker) => (
              <div className="lijst-item" key={medewerker.id}>
                <h4>{medewerker.naam}</h4>
                <p className="meta">
                  {medewerker.email}
                  <br />
                  Rol: {medewerker.rol} · Status: {medewerker.status}
                </p>
                <div className="acties" style={{ marginTop: 16 }}>
                  <Link href={`/team/${medewerker.id}/bewerken`} className="knop-secundair">
                    Bewerken
                  </Link>
                  <form action={deleteMedewerkerAction}>
                    <input type="hidden" name="medewerkerId" value={medewerker.id} />
                    <DeleteCustomerButton
                      naam={medewerker.naam}
                      confirmMessage="Weet je zeker dat je medewerker {naam} wilt verwijderen? Dit account kan daarna niet meer inloggen."
                    />
                  </form>
                </div>
              </div>
            ))}
          </div>
        </article>

        <aside className="kaart">
          <h3>Nieuwe medewerker</h3>
          <p className="subtitel" style={{ marginTop: 8 }}>
            Voeg een nieuwe medewerker toe die direct binnen de huidige salon kan inloggen.
          </p>
          <TeamForm action={createMedewerkerAction} />
        </aside>
      </section>
    </div>
  );
}
