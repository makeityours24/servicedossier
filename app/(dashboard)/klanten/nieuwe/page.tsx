import { CustomerForm } from "@/components/customer-form";
import { createCustomerAction } from "@/app/(dashboard)/klanten/actions";

export default function NieuweKlantPage() {
  return (
    <div className="rooster">
      <section>
        <span className="logo-label">Nieuwe klant</span>
        <h2 className="pagina-titel" style={{ fontSize: "2.2rem" }}>
          Klant registreren
        </h2>
        <p className="subtitel">
          Maak een nieuw klantdossier aan zodat behandelingen en kleurrecepten direct gekoppeld kunnen worden.
        </p>
      </section>

      <section className="kaart">
        <div className="info-kaart" style={{ marginBottom: 20 }}>
          <h3>Klantdossier zonder login</h3>
          <p className="meta">
            Een klant die je hier aanmaakt krijgt geen eigen account om in te loggen. Gebruik deze
            pagina alleen voor klantgegevens, kleurrecepten en behandelgeschiedenis.
          </p>
        </div>
        <CustomerForm action={createCustomerAction} submitLabel="Klant opslaan" />
      </section>
    </div>
  );
}
