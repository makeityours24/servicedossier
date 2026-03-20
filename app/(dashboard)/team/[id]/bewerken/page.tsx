import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { updateMedewerkerAction } from "@/app/(dashboard)/team/actions";
import { TeamForm } from "@/components/team-form";
import { requireSalonSession } from "@/lib/auth";
import { getCurrentLocale, managementDictionary } from "@/lib/i18n";
import { prisma } from "@/lib/prisma";

type BewerkMedewerkerPageProps = {
  params: Promise<{ id: string }>;
};

export default async function BewerkMedewerkerPage({ params }: BewerkMedewerkerPageProps) {
  const locale = await getCurrentLocale();
  const copy = managementDictionary[locale].team;
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
          <span className="logo-label">{copy.label}</span>
          <h2 className="pagina-titel" style={{ fontSize: "2.2rem" }}>
            {copy.editTitle}
          </h2>
          <p className="subtitel">{copy.editText}</p>
        </div>

        <Link href="/team" className="knop-secundair">
          {copy.backToTeam}
        </Link>
      </section>

      <section className="kaart">
        <TeamForm
          action={updateMedewerkerAction}
          submitLabel={copy.saveStaff}
          dictionary={copy.form}
          medewerker={medewerker}
          wachtwoordVerplicht={false}
        />
      </section>
    </div>
  );
}
