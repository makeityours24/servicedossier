import Image from "next/image";
import Link from "next/link";
import { LanguageSwitcher } from "@/components/language-switcher";
import { PrintHandoutButton } from "@/components/print-handout-button";
import { getCurrentLocale, onboardingGuideDictionary } from "@/lib/i18n";

const demoMailHref = "mailto:platform@miy24.nl?subject=Demo%20aanvraag%20SalonDossier";
const startMailHref = "mailto:platform@miy24.nl?subject=Startaanvraag%20SalonDossier";

export default async function StartgidsPage() {
  const locale = await getCurrentLocale();
  const dict = onboardingGuideDictionary[locale];

  return (
    <main className="landing-pagina">
      <section className="landing-hero container">
        <div className="landing-hero-inhoud">
          <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 16 }}>
            <LanguageSwitcher currentLocale={locale} redirectPath="/startgids" />
          </div>

          <div className="logo-blok landing-logo">
            <Image
              src="/logo-salon.svg"
              alt="SalonDossier logo"
              width={72}
              height={72}
              className="logo-afbeelding"
              priority
            />
            <span className="logo-label">SalonDossier</span>
          </div>

          <p className="landing-kicker">{dict.kicker}</p>
          <h1 className="landing-titel handout-titel">{dict.title}</h1>
          <p className="landing-subtitel">{dict.subtitle}</p>

          <div className="landing-acties handout-no-print">
            <Link href="/" className="knop-zacht">
              {dict.backHome}
            </Link>
            <PrintHandoutButton label={dict.printGuide} />
          </div>
        </div>

        <aside className="landing-demo kaart guide-cta-card handout-no-print">
          <div className="landing-demo-kop">
            <span className="logo-label">{dict.kicker}</span>
            <h2>{dict.supportTitle}</h2>
            <p>{dict.closing}</p>
          </div>

          <div className="landing-demo-request-actions">
            <a href={demoMailHref} className="knop">
              {dict.requestDemo}
            </a>
            <a href={startMailHref} className="knop-secundair">
              {dict.requestSetup}
            </a>
          </div>
        </aside>
      </section>

      <section className="landing-sectie container">
        <div className="landing-sectie-kop">
          <span className="logo-label">{dict.prepLabel}</span>
          <h2>{dict.prepTitle}</h2>
        </div>

        <div className="guide-card-grid">
          {dict.prepItems.map((item) => (
            <article key={item} className="kaart guide-card">
              <p>{item}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="landing-sectie container landing-band">
        <div className="landing-band-kop">
          <span className="logo-label">{dict.setupLabel}</span>
          <h2>{dict.setupTitle}</h2>
        </div>

        <div className="guide-step-grid">
          {dict.setupSteps.map((step) => (
            <article key={step.title} className="guide-step">
              <strong>{step.title}</strong>
              <p>{step.text}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="landing-sectie container guide-two-column">
        <article className="kaart guide-panel">
          <div className="landing-sectie-kop">
            <span className="logo-label">{dict.migrateLabel}</span>
            <h2>{dict.migrateTitle}</h2>
          </div>
          <div className="guide-list">
            {dict.migrateItems.map((item) => (
              <div key={item} className="guide-list-item">
                <span className="landing-module-dot" />
                <p>{item}</p>
              </div>
            ))}
          </div>
        </article>

        <article className="kaart guide-panel">
          <div className="landing-sectie-kop">
            <span className="logo-label">{dict.weekLabel}</span>
            <h2>{dict.weekTitle}</h2>
          </div>
          <div className="guide-list">
            {dict.weekItems.map((item) => (
              <div key={item} className="guide-list-item">
                <span className="landing-module-dot" />
                <p>{item}</p>
              </div>
            ))}
          </div>
        </article>
      </section>

      <section className="landing-sectie container">
        <article className="kaart guide-support-card">
          <div className="landing-sectie-kop">
            <span className="logo-label">{dict.supportLabel}</span>
            <h2>{dict.supportTitle}</h2>
            <p>{dict.closing}</p>
          </div>
          <div className="guide-list">
            {dict.supportItems.map((item) => (
              <div key={item} className="guide-list-item">
                <span className="landing-module-dot" />
                <p>{item}</p>
              </div>
            ))}
          </div>
        </article>
      </section>
    </main>
  );
}
