import Image from "next/image";
import Link from "next/link";
import { redirect } from "next/navigation";
import { LanguageSwitcher } from "@/components/language-switcher";
import { clearSession, getSessionUser } from "@/lib/auth";
import { getCurrentLocale, homeDictionary } from "@/lib/i18n";

const demoMailHref = "mailto:platform@miy24.nl?subject=Demo%20aanvraag%20SalonDossier";
const startMailHref = "mailto:platform@miy24.nl?subject=Startaanvraag%20SalonDossier";

export default async function HomePage() {
  const user = await getSessionUser();
  if (user) {
    if (!user.isPlatformAdmin && user.salon?.status === "GEPAUZEERD") {
      await clearSession();
      redirect(`/login?salon=${user.salon.slug}&fout=gepauzeerd`);
    }

    if (user.moetWachtwoordWijzigen) {
      redirect("/account/wachtwoord");
    }

    redirect(user.isPlatformAdmin ? "/platform" : "/dashboard");
  }

  const locale = await getCurrentLocale();
  const dict = homeDictionary[locale];

  return (
    <main className="landing-pagina">
      <section className="landing-hero container">
        <div className="landing-hero-inhoud">
          <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 16 }}>
            <LanguageSwitcher currentLocale={locale} redirectPath="/" />
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

          <p className="landing-kicker">{dict.heroKicker}</p>
          <h1 className="landing-titel">{dict.heroTitle}</h1>
          <p className="landing-subtitel">{dict.heroSubtitle}</p>

          <div className="landing-acties">
            <a href={demoMailHref} className="knop">
              {dict.requestDemo}
            </a>
            <Link href="/startgids" className="knop-secundair">
              {dict.viewGuide}
            </Link>
            <a href="#wat-je-krijgt" className="knop-zacht">
              {dict.viewFeatures}
            </a>
          </div>

          <div className="landing-voordelen">
            {dict.voordelen.map((voordeel) => (
              <div key={voordeel} className="landing-voordeel">
                <span>•</span>
                <p>{voordeel}</p>
              </div>
            ))}
          </div>
        </div>

        <aside className="landing-demo kaart">
          <div className="landing-demo-kop">
            <span className="logo-label">{dict.demoLabel}</span>
            <h2>{dict.demoTitle}</h2>
            <p>{dict.demoText}</p>
          </div>

          <div className="landing-demo-grid">
            {dict.demoItems.map((item) => (
              <div key={item.title} className="landing-demo-item">
                <strong>{item.title}</strong>
                <span>{item.text}</span>
              </div>
            ))}
          </div>
        </aside>
      </section>

      <section id="wat-je-krijgt" className="landing-sectie container">
        <div className="landing-sectie-kop">
          <span className="logo-label">{dict.sectionWhat}</span>
          <h2>{dict.sectionWhatTitle}</h2>
          <p>{dict.sectionWhatText}</p>
        </div>

        <div className="landing-kaarten">
          {dict.highlights.map((highlight) => (
            <article key={highlight.title} className="kaart landing-kaart">
              <h3>{highlight.title}</h3>
              <p>{highlight.text}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="landing-sectie container landing-band">
        <div className="landing-band-kop">
          <span className="logo-label">{dict.modulesLabel}</span>
          <h2>{dict.modulesTitle}</h2>
        </div>

        <div className="landing-module-grid">
          {dict.modules.map((module) => (
            <div key={module} className="landing-module">
              <span className="landing-module-dot" />
              <p>{module}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="landing-sectie container">
        <div className="landing-sectie-kop">
          <span className="logo-label">{dict.previewLabel}</span>
          <h2>{dict.previewTitle}</h2>
          <p>{dict.previewText}</p>
        </div>

        <div className="landing-preview-grid">
          {dict.previews.map((preview) => (
            <article key={preview.title} className="kaart landing-preview-card">
              <div className="landing-preview-window">
                <div className="landing-preview-toolbar">
                  <span />
                  <span />
                  <span />
                </div>
                <div className="landing-preview-body">
                  <p className="landing-preview-eyebrow">{preview.eyebrow}</p>
                  <strong>{preview.title}</strong>
                  <div className="landing-preview-lines">
                    {preview.lines.map((line) => (
                      <div key={line} className="landing-preview-line">
                        <span className="landing-module-dot" />
                        <p>{line}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              <p>{preview.text}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="landing-sectie container">
        <div className="landing-sectie-kop">
          <span className="logo-label">{dict.branchesLabel}</span>
          <h2>{dict.branchesTitle}</h2>
          <p>{dict.branchesText}</p>
        </div>

        <div className="landing-kaarten">
          {dict.branches.map((branch) => (
            <article key={branch.title} className="kaart landing-kaart">
              <h3>{branch.title}</h3>
              <p>{branch.text}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="landing-sectie container" id="prijzen">
        <div className="landing-sectie-kop">
          <span className="logo-label">{dict.pricingLabel}</span>
          <h2>{dict.pricingTitle}</h2>
          <p>{dict.pricingText}</p>
        </div>

        <div className="landing-pricing-grid">
          {dict.pricingPlans.map((plan) => (
            <article key={plan.name} className="kaart landing-pricing-card">
              <div className="landing-pricing-head">
                <h3>{plan.name}</h3>
                <div className="landing-pricing-price">
                  <strong>{plan.price}</strong>
                  <span>{plan.period}</span>
                </div>
                <p>{plan.audience}</p>
              </div>

              <div className="landing-pricing-features">
                {plan.features.map((feature) => (
                  <div key={feature} className="landing-pricing-feature">
                    <span className="landing-module-dot" />
                    <p>{feature}</p>
                  </div>
                ))}
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="landing-sectie container">
        <div className="landing-sectie-kop">
          <span className="logo-label">{dict.processLabel}</span>
          <h2>{dict.processTitle}</h2>
          <p>{dict.processText}</p>
        </div>

        <div className="landing-process-grid">
          {dict.processSteps.map((step) => (
            <article key={step.title} className="kaart landing-process-card">
              <strong>{step.title}</strong>
              <p>{step.text}</p>
            </article>
          ))}
        </div>

        <div className="landing-process-note kaart">
          <p>{dict.processNote}</p>
          <div className="landing-demo-request-actions">
            <a href={startMailHref} className="knop">
              {dict.startRequest}
            </a>
            <Link href="/startgids" className="knop-secundair">
              {dict.viewGuide}
            </Link>
          </div>
        </div>
      </section>

      <section className="landing-sectie container">
        <div className="landing-demo-request kaart">
          <div className="landing-demo-request-copy">
            <span className="logo-label">{dict.guideLabel}</span>
            <h2>{dict.guideTitle}</h2>
            <p>{dict.guideText}</p>
          </div>

          <div className="landing-demo-request-actions">
            <Link href="/startgids" className="knop">
              {dict.viewGuide}
            </Link>
            <a href={startMailHref} className="knop-secundair">
              {dict.startRequest}
            </a>
          </div>
        </div>
      </section>

      <section className="landing-sectie container">
        <div className="landing-demo-request kaart">
          <div className="landing-demo-request-copy">
            <span className="logo-label">{dict.demoRequestLabel}</span>
            <h2>{dict.demoRequestTitle}</h2>
            <p>{dict.demoRequestText}</p>
          </div>

          <div className="landing-demo-request-steps">
            {dict.demoSteps.map((step) => (
              <div key={step.title} className="landing-demo-step">
                <strong>{step.title}</strong>
                <p>{step.text}</p>
              </div>
            ))}
          </div>

          <div className="landing-demo-request-actions">
            <a href={demoMailHref} className="knop">
              {dict.requestDemo}
            </a>
            <Link href="/startgids" className="knop-secundair">
              {dict.viewGuide}
            </Link>
            <a href={startMailHref} className="knop-zacht">
              {dict.startRequest}
            </a>
            <a href="mailto:platform@miy24.nl" className="knop-zacht">
              {dict.sendEmail}
            </a>
            <a href="#prijzen" className="knop-secundair">
              {dict.viewPricing}
            </a>
          </div>
        </div>
      </section>
    </main>
  );
}
