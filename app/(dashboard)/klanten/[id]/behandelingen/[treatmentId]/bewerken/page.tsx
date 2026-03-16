import Link from "next/link";
import { notFound } from "next/navigation";
import { updateTreatmentAction } from "@/app/(dashboard)/klanten/actions";
import { uploadTreatmentPhotoAction } from "@/app/(dashboard)/klanten/photo-actions";
import { TreatmentPhotoForm } from "@/components/treatment-photo-form";
import { TreatmentPhotoGallery } from "@/components/treatment-photo-gallery";
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
      notities: true,
      photos: {
        orderBy: { createdAt: "desc" },
        select: {
          id: true,
          url: true,
          bestandNaam: true,
          soort: true,
          notitie: true,
          createdAt: true,
          uploadedByUser: {
            select: {
              naam: true
            }
          }
        }
      },
      packageUsages: {
        take: 1,
        select: {
          customerPackageId: true
        }
      }
    }
  });

  if (!behandeling) {
    notFound();
  }

  const datumWaarde = new Date(behandeling.datum.getTime() - behandeling.datum.getTimezoneOffset() * 60000)
    .toISOString()
    .slice(0, 16);

  const activePackages = await prisma.customerPackage.findMany({
    where: {
      customerId: klant.id,
      salonId: user.salonId,
      OR: [
        { status: "ACTIEF" },
        {
          id: behandeling.packageUsages[0]?.customerPackageId ?? -1
        }
      ]
    },
    orderBy: [{ status: "asc" }, { gekochtOp: "desc" }],
    select: {
      id: true,
      naamSnapshot: true,
      weergaveTypeSnapshot: true,
      resterendeBeurten: true,
      totaalBeurten: true
    }
  });

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
            datum: datumWaarde,
            customerPackageId: behandeling.packageUsages[0]?.customerPackageId ?? null
          }}
          activePackages={activePackages}
        />
      </section>

      <section className="twee-kolommen">
        <article className="kaart">
          <h3>Foto&apos;s bij deze behandeling</h3>
          <p className="subtitel" style={{ marginTop: 8 }}>
            Voeg hier voor- en nafoto&apos;s toe als visuele dossieropbouw of bewijs bij een klacht.
          </p>
          <div style={{ marginTop: 18 }}>
            <TreatmentPhotoGallery
              customerId={klant.id}
              treatmentId={behandeling.id}
              photos={behandeling.photos}
              showDelete
            />
          </div>
        </article>

        <aside className="kaart">
          <h3>Nieuwe foto uploaden</h3>
          <p className="subtitel" style={{ marginTop: 8 }}>
            Upload eerst via de bewerkpagina, zodat de foto altijd direct aan de juiste behandeling gekoppeld blijft.
          </p>
          <TreatmentPhotoForm
            customerId={klant.id}
            treatmentId={behandeling.id}
            action={uploadTreatmentPhotoAction}
          />
        </aside>
      </section>
    </div>
  );
}
