import { notFound } from "next/navigation";
import { CustomerForm } from "@/components/customer-form";
import { updateCustomerAction } from "@/app/(dashboard)/klanten/actions";
import { requireSalonSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

type BewerkKlantPageProps = {
  params: Promise<{ id: string }>;
};

export default async function BewerkKlantPage({ params }: BewerkKlantPageProps) {
  const user = await requireSalonSession();
  const { id } = await params;
  const klantId = Number(id);

  if (!Number.isInteger(klantId)) {
    notFound();
  }

  const klant = await prisma.customer.findFirst({
    where: {
      id: klantId,
      salonId: user.salonId
    }
  });

  if (!klant) {
    notFound();
  }

  return (
    <div className="rooster">
      <section>
        <span className="logo-label">Klant bewerken</span>
        <h2 className="pagina-titel" style={{ fontSize: "2.2rem" }}>
          Gegevens aanpassen
        </h2>
        <p className="subtitel">
          Werk hier ook geboortedatum, haartype, haarkleur, allergieen en notities van de stylist bij.
        </p>
      </section>

      <section className="kaart" id="profiel">
        <CustomerForm
          action={updateCustomerAction}
          submitLabel="Wijzigingen opslaan"
          customer={klant}
        />
      </section>
    </div>
  );
}
