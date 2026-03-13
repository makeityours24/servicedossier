import { SalonSettingsForm } from "@/components/salon-settings-form";
import { updateSalonSettingsAction } from "@/app/(dashboard)/instellingen/actions";
import { requireSalonSession } from "@/lib/auth";

export default async function InstellingenPage() {
  const user = await requireSalonSession();
  const settings = user.salon.instellingen;

  return (
    <div className="rooster">
      <section>
        <span className="logo-label">Instellingen</span>
        <h2 className="pagina-titel" style={{ fontSize: "2.2rem" }}>
          Saloninstellingen
        </h2>
        <p className="subtitel">
          Beheer de zichtbare salonnaam, contactgegevens, accentkleur en het logo van deze salonomgeving.
        </p>
      </section>

      <section className="kaart">
        <SalonSettingsForm
          action={updateSalonSettingsAction}
          settings={{
            weergavenaam: settings?.weergavenaam ?? user.salon.naam,
            contactEmail: settings?.contactEmail ?? user.salon.email ?? "",
            contactTelefoon: settings?.contactTelefoon ?? user.salon.telefoonnummer ?? "",
            adres: settings?.adres ?? user.salon.adres ?? "",
            primaireKleur: settings?.primaireKleur ?? "#b42323",
            logoUrl: settings?.logoUrl ?? "",
            treatmentPresets: (settings?.treatmentPresets ?? [
              "Uitgroei kleuren",
              "Volledige kleuring",
              "Toner",
              "Balayage",
              "Highlights",
              "Kleurcorrectie"
            ]).join("\n")
          }}
        />
      </section>
    </div>
  );
}
