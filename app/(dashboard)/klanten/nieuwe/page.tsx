import { CustomerForm } from "@/components/customer-form";
import { createCustomerAction } from "@/app/(dashboard)/klanten/actions";
import { customerDictionary, getCurrentLocale } from "@/lib/i18n";

export default async function NieuweKlantPage() {
  const locale = await getCurrentLocale();
  const copy = customerDictionary[locale].customerFormNew;

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
        <div className="info-kaart" style={{ marginBottom: 20 }}>
          <h3>{copy.noteTitle}</h3>
          <p className="meta">{copy.noteText}</p>
        </div>
        <CustomerForm
          action={createCustomerAction}
          submitLabel={copy.submit}
          busyLabel={copy.busy}
          dictionary={customerDictionary[locale].customerFormFields}
        />
      </section>
    </div>
  );
}
