import { notFound } from "next/navigation";
import { CustomerForm } from "@/components/customer-form";
import { updateCustomerAction } from "@/app/(dashboard)/klanten/actions";
import { prisma } from "@/lib/prisma";

type BewerkKlantPageProps = {
  params: Promise<{ id: string }>;
};

export default async function BewerkKlantPage({ params }: BewerkKlantPageProps) {
  const { id } = await params;
  const klantId = Number(id);

  if (!Number.isInteger(klantId)) {
    notFound();
  }

  const klant = await prisma.customer.findUnique({
    where: { id: klantId }
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
          Werk adres- of contactgegevens bij zonder het bestaande behandeloverzicht te verliezen.
        </p>
      </section>

      <section className="kaart">
        <CustomerForm
          action={updateCustomerAction}
          submitLabel="Wijzigingen opslaan"
          customer={klant}
        />
      </section>
    </div>
  );
}
