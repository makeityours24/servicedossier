import Link from "next/link";
import { createMedewerkerAction, deleteMedewerkerAction } from "@/app/(dashboard)/team/actions";
import { DeleteCustomerButton } from "@/components/delete-customer-button";
import { TeamForm } from "@/components/team-form";
import { requireSalonSession } from "@/lib/auth";
import { getCurrentLocale, managementDictionary } from "@/lib/i18n";
import { prisma } from "@/lib/prisma";

export default async function TeamPage() {
  const locale = await getCurrentLocale();
  const copy = managementDictionary[locale].team;
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
          <span className="logo-label">{copy.label}</span>
          <h2 className="pagina-titel" style={{ fontSize: "2.2rem" }}>
            {copy.title}
          </h2>
          <p className="subtitel">{copy.subtitle}</p>
        </div>
      </section>

      <section className="info-grid">
        <article className="info-kaart">
          <h3>{copy.loginAccountsTitle}</h3>
          <p className="meta">{copy.loginAccountsText}</p>
        </article>
        <article className="info-kaart">
          <h3>{copy.clientsNoLoginTitle}</h3>
          <p className="meta">{copy.clientsNoLoginText}</p>
        </article>
      </section>

      <section className="twee-kolommen">
        <article className="kaart">
          <h3>{copy.existingStaff}</h3>
          <div className="lijst" style={{ marginTop: 18 }}>
            {medewerkers.map((medewerker) => (
              <div className="lijst-item" key={medewerker.id}>
                <h4>{medewerker.naam}</h4>
                <p className="meta">
                  {medewerker.email}
                  <br />
                  {copy.role}: {copy.roles[medewerker.rol]} · {copy.status}: {copy.statuses[medewerker.status]}
                </p>
                <div className="acties" style={{ marginTop: 16 }}>
                  <Link href={`/team/${medewerker.id}/bewerken`} className="knop-secundair">
                    {copy.edit}
                  </Link>
                  <form action={deleteMedewerkerAction}>
                    <input type="hidden" name="medewerkerId" value={medewerker.id} />
                    <DeleteCustomerButton
                      naam={medewerker.naam}
                      confirmMessage={copy.deleteConfirm}
                      label={copy.delete}
                      busyLabel={copy.deleting}
                    />
                  </form>
                </div>
              </div>
            ))}
          </div>
        </article>

        <aside className="kaart">
          <h3>{copy.newStaff}</h3>
          <p className="subtitel" style={{ marginTop: 8 }}>{copy.newStaffText}</p>
          <TeamForm action={createMedewerkerAction} submitLabel={copy.addStaff} dictionary={copy.form} />
        </aside>
      </section>
    </div>
  );
}
