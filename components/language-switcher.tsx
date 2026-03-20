import type { Locale } from "@/lib/i18n";

type LanguageSwitcherProps = {
  currentLocale: Locale;
  redirectPath: string;
};

const localeLabels: Record<Locale, string> = {
  nl: "NL",
  en: "EN",
  de: "DE"
};

export function LanguageSwitcher({ currentLocale, redirectPath }: LanguageSwitcherProps) {
  return (
    <div className="taalwisselaar" aria-label="Language switcher">
      {(["nl", "en", "de"] as Locale[]).map((locale) => (
        <a
          key={locale}
          href={`/api/language?lang=${locale}&redirect=${encodeURIComponent(redirectPath)}`}
          className="taalknop"
          data-active={currentLocale === locale ? "true" : undefined}
          lang={locale}
        >
          {localeLabels[locale]}
        </a>
      ))}
    </div>
  );
}
