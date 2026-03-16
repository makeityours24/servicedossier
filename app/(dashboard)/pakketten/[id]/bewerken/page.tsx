import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { updatePackageTypeAction } from "@/app/(dashboard)/pakketten/actions";
import { PackageTypeForm } from "@/components/package-type-form";
import { requireSalonSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

type BewerkPakketPageProps = {
  params: Promise<{ id: string }>;
};

export default async function BewerkPakketPage({ params }: BewerkPakketPageProps) {
  const user = await requireSalonSession();

  if (user.rol === "MEDEWERKER") {
    redirect("/dashboard");
  }

  const { id } = await params;
  const packageTypeId = Number(id);

  if (!Number.isInteger(packageTypeId)) {
    notFound();
  }

  const packageType = await prisma.packageType.findFirst({
    where: {
      id: packageTypeId,
      salonId: user.salonId
    },
    select: {
      id: true,
      naam: true,
      omschrijving: true,
      totaalBeurten: true,
      pakketPrijsCents: true,
      lossePrijsCents: true,
      standaardBehandeling: true,
      isActief: true
    }
  });

  if (!packageType) {
    notFound();
  }

  return (
    <div className="rooster">
      <section className="bovenbalk">
        <div>
          <span className="logo-label">Pakketten</span>
          <h2 className="pagina-titel" style={{ fontSize: "2.2rem" }}>
            Pakkettype bewerken
          </h2>
          <p className="subtitel">
            Werk dit pakkettype bij zonder bestaande klanthistorie te beschadigen. Verkochte pakketten bewaren namelijk hun eigen momentopname.
          </p>
        </div>

        <Link href="/pakketten" className="knop-secundair">
          Terug naar pakketten
        </Link>
      </section>

      <section className="kaart">
        <PackageTypeForm
          action={updatePackageTypeAction}
          submitLabel="Pakkettype opslaan"
          packageType={packageType}
        />
      </section>
    </div>
  );
}
