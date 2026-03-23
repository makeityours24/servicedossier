import { LanguageSwitcher } from "@/components/language-switcher";
import { LoginForm } from "@/components/login-form";
import { getCurrentLocale, platformLoginDictionary } from "@/lib/i18n";

export default async function PlatformLoginPage() {
  const locale = await getCurrentLocale();
  const dict = platformLoginDictionary[locale];

  return (
    <main className="inlog-scherm">
      <div className="container" style={{ display: "flex", justifyContent: "flex-end", marginBottom: 16 }}>
        <LanguageSwitcher currentLocale={locale} redirectPath="/platform-login" />
      </div>
      <LoginForm
        salonNaam="SalonDossier Platform"
        tenantGedetecteerd={false}
        variant="platform"
        dictionary={dict}
      />
    </main>
  );
}
