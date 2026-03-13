import Link from "next/link";
import { notFound } from "next/navigation";
import { updateTreatmentAction } from "@/app/(dashboard)/klanten/actions";
import { TreatmentForm } from "@/components/treatment-form";
import { requireSalonSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

type BewerkBehandelingPageProps = {
  params: Promise<{ id: string; treatmentId: string }>;
};

export default async function BewerkBehandelingPage({
  params
}: BewerkBehandelingPageProps) {
  const user = await requireSalonSession();
  const { id, treatmentId } = await params;
  const klantId = Number(id);
  const behandelingId = Number(treatmentId);

  if (!Number.isInteger(klantId) || !Number.isInteger(behandelingId)) {
    notFound();
  }

  const klant = await prisma.customer.findFirst({
    where: {
      id: klantId,
      salonId: user.salonId
    },
    select: {
      id: true,
      naam: true
    }
  });

  if (!klant) {
    notFound();
  }

  const behandeling = await prisma.treatment.findFirst({
    where: {
      id: behandelingId,
      customerId: klantId,
      salonId: user.salonId
    },
    select: {
      id: true,
      datum: true,
      behandeling: true,
      recept: true,
      behandelaar: true,
      notities: true
    }
  });

  if (!behandeling) {
    notFound();
  }

  const datumWaarde = new Date(behandeling.datum.getTime() - behandeling.datum.getTimezoneOffset() * 60000)
    .toISOString()
    .slice(0, 16);

  return (
    <div className="rooster">
      <section className="bovenbalk">
        <div>
          <span className="logo-label">Behandeling bewerken</span>
          <h2 className="pagina-titel" style={{ fontSize: "2.2rem" }}>
            {klant.naam}
          </h2>
          <p className="subtitel">
            Pas deze behandeling aan zonder het klantdossier of de rest van de historie te verliezen.
          </p>
        </div>

        <Link href={`/klanten/${klant.id}`} className="knop-secundair">
          Terug naar dossier
        </Link>
      </section>

      <section className="kaart">
        <TreatmentForm
          customerId={klant.id}
          medewerkerNaam={user.naam}
          action={updateTreatmentAction}
          submitLabel="Behandeling opslaan"
          treatment={{
            ...behandeling,
            datum: datumWaarde
          }}
        />
      </section>
    </div>
  );
}
