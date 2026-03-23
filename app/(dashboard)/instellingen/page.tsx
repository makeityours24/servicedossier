import { SalonSettingsForm } from "@/components/salon-settings-form";
import { updateSalonSettingsAction } from "@/app/(dashboard)/instellingen/actions";
import { requireSalonSession } from "@/lib/auth";
import { getDefaultTreatmentPresets, normalizeBranchType } from "@/lib/branch-profile";
import { getCurrentLocale, managementDictionary } from "@/lib/i18n";

export default async function InstellingenPage() {
  const locale = await getCurrentLocale();
  const copy = managementDictionary[locale].settings;
  const user = await requireSalonSession();
  const settings = user.salon.instellingen;
  const branchType = normalizeBranchType(settings?.branchType);

  return (
    <div className="rooster">
      <section>
        <span className="logo-label">{copy.label}</span>
        <h2 className="pagina-titel" style={{ fontSize: "2.2rem" }}>
          {copy.title}
        </h2>
        <p className="subtitel">{copy.subtitle}</p>
      </section>

      <section className="kaart">
        <SalonSettingsForm
          action={updateSalonSettingsAction}
          submitLabel={copy.save}
          dictionary={copy.form}
          settings={{
            weergavenaam: settings?.weergavenaam ?? user.salon.naam,
            branchType,
            contactEmail: settings?.contactEmail ?? user.salon.email ?? "",
            contactTelefoon: settings?.contactTelefoon ?? user.salon.telefoonnummer ?? "",
            adres: settings?.adres ?? user.salon.adres ?? "",
            primaireKleur: settings?.primaireKleur ?? "#b42323",
            logoUrl: settings?.logoUrl ?? "",
            treatmentPresets: (settings?.treatmentPresets ?? getDefaultTreatmentPresets(branchType)).join("\n")
          }}
        />
      </section>
    </div>
  );
}
