import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { updateMedewerkerAction } from "@/app/(dashboard)/team/actions";
import { TeamForm } from "@/components/team-form";
import { requireSalonSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

type BewerkMedewerkerPageProps = {
  params: Promise<{ id: string }>;
};

export default async function BewerkMedewerkerPage({ params }: BewerkMedewerkerPageProps) {
  const user = await requireSalonSession();

  if (user.rol === "MEDEWERKER") {
    redirect("/dashboard");
  }

  const { id } = await params;
  const medewerkerId = Number(id);

  if (!Number.isInteger(medewerkerId)) {
    notFound();
  }

  const medewerker = await prisma.user.findFirst({
    where: {
      id: medewerkerId,
      salonId: user.salonId,
      isPlatformAdmin: false
    },
    select: {
      id: true,
      naam: true,
      email: true,
      rol: true,
      status: true
    }
  });

  if (!medewerker) {
    notFound();
  }

  return (
    <div className="rooster">
      <section className="bovenbalk">
        <div>
          <span className="logo-label">Team</span>
          <h2 className="pagina-titel" style={{ fontSize: "2.2rem" }}>
            Medewerker bewerken
          </h2>
          <p className="subtitel">
            Werk rol, status en contactgegevens bij. Een nieuw wachtwoord invullen is optioneel.
          </p>
        </div>

        <Link href="/team" className="knop-secundair">
          Terug naar team
        </Link>
      </section>

      <section className="kaart">
        <TeamForm
          action={updateMedewerkerAction}
          submitLabel="Medewerker opslaan"
          medewerker={medewerker}
          wachtwoordVerplicht={false}
        />
      </section>
    </div>
  );
}
