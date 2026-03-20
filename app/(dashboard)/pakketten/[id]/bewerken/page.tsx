import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { updatePackageTypeAction } from "@/app/(dashboard)/pakketten/actions";
import { PackageTypeForm } from "@/components/package-type-form";
import { requireSalonSession } from "@/lib/auth";
import { getCurrentLocale, managementDictionary } from "@/lib/i18n";
import { prisma } from "@/lib/prisma";

type BewerkPakketPageProps = {
  params: Promise<{ id: string }>;
};

export default async function BewerkPakketPage({ params }: BewerkPakketPageProps) {
  const locale = await getCurrentLocale();
  const copy = managementDictionary[locale].packages;
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
      weergaveType: true,
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
          <span className="logo-label">{copy.label}</span>
          <h2 className="pagina-titel" style={{ fontSize: "2.2rem" }}>
            {copy.editTitle}
          </h2>
          <p className="subtitel">{copy.editText}</p>
        </div>

        <Link href="/pakketten" className="knop-secundair">
          {copy.backToPackages}
        </Link>
      </section>

      <section className="kaart">
        <PackageTypeForm
          action={updatePackageTypeAction}
          submitLabel={copy.savePackageType}
          dictionary={copy.form}
          packageType={packageType}
        />
      </section>
    </div>
  );
}
