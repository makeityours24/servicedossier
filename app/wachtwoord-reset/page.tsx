import Link from "next/link";
import { LanguageSwitcher } from "@/components/language-switcher";
import { PasswordResetCompleteForm } from "@/components/password-reset-complete-form";
import { getCurrentLocale, passwordResetDictionary } from "@/lib/i18n";

type PasswordResetPageProps = {
  searchParams: Promise<{
    token?: string;
  }>;
};

export default async function WachtwoordResetPage({ searchParams }: PasswordResetPageProps) {
  const params = await searchParams;
  const locale = await getCurrentLocale();
  const dict = passwordResetDictionary[locale];
  const token = params.token?.trim() ?? "";
  const redirectPath = token ? `/wachtwoord-reset?token=${encodeURIComponent(token)}` : "/wachtwoord-reset";

  return (
    <main className="inlog-scherm">
      <div className="container" style={{ display: "flex", justifyContent: "flex-end", marginBottom: 16 }}>
        <LanguageSwitcher currentLocale={locale} redirectPath={redirectPath} />
      </div>

      <section className="inlog-kaart">
        <span className="logo-label">SalonDossier</span>
        <h1 className="pagina-titel">{dict.completeTitle}</h1>
        <p className="subtitel">{dict.completeSubtitle}</p>

        {token ? (
          <PasswordResetCompleteForm token={token} dictionary={dict} />
        ) : (
          <>
            <p className="melding-fout">{dict.invalidToken}</p>
            <Link href="/login" className="link-tekst">
              {dict.backToLogin}
            </Link>
          </>
        )}
      </section>
    </main>
  );
}
