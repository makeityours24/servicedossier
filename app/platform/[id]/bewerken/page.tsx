import Link from "next/link";
import { notFound } from "next/navigation";
import { updateSalonAction } from "@/app/platform/actions";
import { PlatformSalonForm } from "@/components/platform-salon-form";
import { requirePlatformAdmin } from "@/lib/core/auth";
import { prisma } from "@/lib/core/prisma";

type BewerkSalonPageProps = {
  params: Promise<{ id: string }>;
};

export default async function BewerkSalonPage({ params }: BewerkSalonPageProps) {
  await requirePlatformAdmin();

  const { id } = await params;
  const salonId = Number(id);

  if (!Number.isInteger(salonId)) {
    notFound();
  }

  const salon = await prisma.salon.findUnique({
    where: { id: salonId },
    select: {
      id: true,
      naam: true,
      status: true,
      email: true,
      telefoonnummer: true,
      adres: true
    }
  });

  if (!salon) {
    notFound();
  }

  return (
    <div className="rooster">
      <section className="bovenbalk">
        <div>
          <span className="logo-label">Platform</span>
          <h2 className="pagina-titel" style={{ fontSize: "2.2rem" }}>
            Salon bewerken
          </h2>
          <p className="subtitel">
            Werk de basisgegevens van deze salon bij zonder de gekoppelde gebruikers en klanten te verliezen.
          </p>
        </div>

        <Link href="/platform" className="knop-secundair">
          Terug naar overzicht
        </Link>
      </section>

      <section className="kaart">
        <PlatformSalonForm
          action={updateSalonAction}
          submitLabel="Salon opslaan"
          salon={salon}
          showOwnerFields={false}
        />
      </section>
    </div>
  );
}
