import { LanguageSwitcher } from "@/components/language-switcher";
import { PasswordResetRequestForm } from "@/components/password-reset-request-form";
import { getCurrentLocale, passwordResetDictionary } from "@/lib/i18n";

export default async function WachtwoordVergetenPage() {
  const locale = await getCurrentLocale();
  const dict = passwordResetDictionary[locale];

  return (
    <main className="inlog-scherm">
      <div className="container" style={{ display: "flex", justifyContent: "flex-end", marginBottom: 16 }}>
        <LanguageSwitcher currentLocale={locale} redirectPath="/wachtwoord-vergeten" />
      </div>

      <section className="inlog-kaart">
        <span className="logo-label">SalonDossier</span>
        <h1 className="pagina-titel">{dict.requestTitle}</h1>
        <p className="subtitel">{dict.requestSubtitle}</p>

        <PasswordResetRequestForm dictionary={dict} />
      </section>
    </main>
  );
}
