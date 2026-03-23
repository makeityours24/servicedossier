import { notFound } from "next/navigation";
import { CustomerForm } from "@/components/customer-form";
import { updateCustomerAction } from "@/app/(dashboard)/klanten/actions";
import { requireSalonSession } from "@/lib/auth";
import { getBranchProfileCopy, normalizeBranchType } from "@/lib/branch-profile";
import { customerDictionary, getCurrentLocale } from "@/lib/i18n";
import { prisma } from "@/lib/prisma";

type BewerkKlantPageProps = {
  params: Promise<{ id: string }>;
};

export default async function BewerkKlantPage({ params }: BewerkKlantPageProps) {
  const locale = await getCurrentLocale();
  const user = await requireSalonSession();
  const branchType = normalizeBranchType(user.salon.instellingen?.branchType);
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

  const copy = customerDictionary[locale].customerFormEdit;
  const branchProfile = getBranchProfileCopy(locale, branchType);

  return (
    <div className="rooster">
      <section>
        <span className="logo-label">{copy.label}</span>
        <h2 className="pagina-titel" style={{ fontSize: "2.2rem" }}>
          {copy.title}
        </h2>
        <p className="subtitel">{branchProfile.formEditSubtitle}</p>
      </section>

      <section className="kaart" id="profiel">
        <CustomerForm
          action={updateCustomerAction}
          submitLabel={copy.submit}
          busyLabel={copy.busy}
          dictionary={{
            ...customerDictionary[locale].customerFormFields,
            hairType: branchProfile.fieldOneLabel,
            hairTypePlaceholder: branchProfile.fieldOnePlaceholder,
            hairColor: branchProfile.fieldTwoLabel,
            hairColorPlaceholder: branchProfile.fieldTwoPlaceholder,
            allergies: branchProfile.allergiesLabel,
            allergiesPlaceholder: branchProfile.allergiesPlaceholder,
            stylistNotes: branchProfile.notesLabel,
            stylistNotesPlaceholder: branchProfile.notesPlaceholder
          }}
          customer={klant}
        />
      </section>
    </div>
  );
}
