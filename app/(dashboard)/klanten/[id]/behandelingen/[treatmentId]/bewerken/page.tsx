import Link from "next/link";
import { notFound } from "next/navigation";
import { updateTreatmentAction } from "@/app/(dashboard)/klanten/actions";
import { uploadTreatmentPhotoAction } from "@/app/(dashboard)/klanten/photo-actions";
import { TreatmentPhotoForm } from "@/components/treatment-photo-form";
import { TreatmentPhotoGallery } from "@/components/treatment-photo-gallery";
import { TreatmentForm } from "@/components/treatment-form";
import { requireSalonSession } from "@/lib/auth";
import { customerDictionary, getCurrentLocale } from "@/lib/i18n";
import { prisma } from "@/lib/prisma";

type BewerkBehandelingPageProps = {
  params: Promise<{ id: string; treatmentId: string }>;
};

export default async function BewerkBehandelingPage({
  params
}: BewerkBehandelingPageProps) {
  const locale = await getCurrentLocale();
  const copy = customerDictionary[locale].editTreatmentPage;
  const formCopy = customerDictionary[locale].treatmentFormFields;
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
      userId: true,
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

  const medewerkers = await prisma.user.findMany({
    where: {
      salonId: user.salonId,
      isPlatformAdmin: false,
      status: "ACTIEF"
    },
    orderBy: { naam: "asc" },
    select: {
      id: true,
      naam: true
    }
  });

  return (
    <div className="rooster">
      <section className="bovenbalk">
        <div>
          <span className="logo-label">{copy.label}</span>
          <h2 className="pagina-titel" style={{ fontSize: "2.2rem" }}>
            {klant.naam}
          </h2>
          <p className="subtitel">{copy.subtitle}</p>
        </div>

        <Link href={`/klanten/${klant.id}`} className="knop-secundair">
          {copy.backToDossier}
        </Link>
      </section>

      <section className="kaart">
        <TreatmentForm
          customerId={klant.id}
          medewerkerNaam={user.naam}
          medewerkers={medewerkers}
          action={updateTreatmentAction}
          submitLabel={copy.saveTreatment}
          treatment={{
            ...behandeling,
            behandelaarUserId: behandeling.userId,
            datum: datumWaarde,
            customerPackageId: behandeling.packageUsages[0]?.customerPackageId ?? null
          }}
          activePackages={activePackages}
          dictionary={formCopy}
        />
      </section>

      <section className="twee-kolommen">
        <article className="kaart">
          <h3>{copy.treatmentPhotosTitle}</h3>
          <p className="subtitel" style={{ marginTop: 8 }}>
            {copy.treatmentPhotosText}
          </p>
          <div style={{ marginTop: 18 }}>
            <TreatmentPhotoGallery
              customerId={klant.id}
              treatmentId={behandeling.id}
              photos={behandeling.photos}
              showDelete
              dictionary={customerDictionary[locale].photoGallery}
            />
          </div>
        </article>

        <aside className="kaart">
          <h3>{copy.uploadPhotoTitle}</h3>
          <p className="subtitel" style={{ marginTop: 8 }}>
            {copy.uploadPhotoText}
          </p>
          <TreatmentPhotoForm
            customerId={klant.id}
            treatmentId={behandeling.id}
            action={uploadTreatmentPhotoAction}
            dictionary={customerDictionary[locale].photoForm}
          />
        </aside>
      </section>
    </div>
  );
}
