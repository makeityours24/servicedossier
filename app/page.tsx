import Image from "next/image";
import Link from "next/link";
import { redirect } from "next/navigation";
import { clearSession, getSessionUser } from "@/lib/auth";

const voordelen = [
  "Klantdossiers, behandelingen en kleurrecepten direct terug op één plek",
  "Digitale pakketten en stempelkaarten met automatische afboeking per bezoek",
  "Agenda met dag- en teamweergave voor meerdere behandelaars tegelijk",
  "Foto's per behandeling als visuele dossiervastlegging bij klachten of vergelijking"
];

const highlights = [
  {
    titel: "Nooit meer zoeken",
    tekst:
      "Alle recepten, behandelingen, afspraken en foto's blijven gekoppeld aan dezelfde klant. Geen losse notities, geen papieren stempelkaarten, geen twijfel over wat er vorige keer is gedaan."
  },
  {
    titel: "Gemaakt voor salons",
    tekst:
      "Werk met meerdere medewerkers, plan afspraken per behandelaar, verkoop bundels of stempelkaarten en zet een afspraak direct door naar een behandeling."
  },
  {
    titel: "Rust in de werkdag",
    tekst:
      "SalonDossier is bedoeld om sneller te werken aan de stoel. Minder terugzoeken, minder uitleg, meer duidelijkheid voor het team en voor de klant."
  }
];

const modules = [
  "Klantdossiers en behandelgeschiedenis",
  "Kleurrecepten en receptsjablonen",
  "Pakketten en digitale stempelkaarten",
  "Agenda met lijst- en teamweergave",
  "Behandelfoto's als dossierbewijs",
  "Meerdere medewerkers met eigen login"
];

const pricingPlans = [
  {
    naam: "SalonDossier Start",
    prijs: "€24",
    periode: "per maand",
    doelgroep: "Voor solo salons en kleinere teams.",
    features: [
      "klantdossiers",
      "behandelingen en kleurrecepten",
      "agenda",
      "pakketten en digitale stempelkaarten",
      "behandelfoto's",
      "standaard updates en support"
    ]
  },
  {
    naam: "SalonDossier Plus",
    prijs: "€49",
    periode: "per maand",
    doelgroep: "Voor salons met meerdere medewerkers.",
    features: [
      "alles uit Start",
      "teamgebruik",
      "teamagenda",
      "prioriteit support",
      "snellere toegang tot nieuwe functies",
      "meer begeleiding bij gebruik"
    ]
  },
  {
    naam: "Opstart & inrichting",
    prijs: "€149",
    periode: "eenmalig",
    doelgroep: "Voor salons die hulp willen bij livegang.",
    features: [
      "basisinrichting",
      "hulp bij instellingen",
      "uitleg van de belangrijkste functies",
      "begeleiding bij opstart"
    ]
  }
];

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

  return (
    <main className="landing-pagina">
      <section className="landing-hero container">
        <div className="landing-hero-inhoud">
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

          <p className="landing-kicker">Digitaal klantdossier voor kapsalons</p>
          <h1 className="landing-titel">Alles van je klant op een plek die je team echt gebruikt.</h1>
          <p className="landing-subtitel">
            SalonDossier helpt salons om behandelingen, kleurrecepten, afspraken, pakketten,
            digitale stempelkaarten en behandelfoto&apos;s centraal vast te leggen en snel terug te
            vinden.
          </p>

          <div className="landing-acties">
            <Link href="/login" className="knop">
              Inloggen
            </Link>
            <a href="#wat-je-krijgt" className="knop-secundair">
              Bekijk functies
            </a>
          </div>

          <div className="landing-voordelen">
            {voordelen.map((voordeel) => (
              <div key={voordeel} className="landing-voordeel">
                <span>•</span>
                <p>{voordeel}</p>
              </div>
            ))}
          </div>
        </div>

        <aside className="landing-demo kaart">
          <div className="landing-demo-kop">
            <span className="logo-label">Wat salons direct merken</span>
            <h2>Van losse notities naar een compleet klantbeeld</h2>
            <p>
              Laat bij een demo direct zien dat je niet alleen klantgegevens bewaart, maar ook
              recepten, pakketten, agenda en foto&apos;s logisch met elkaar verbindt.
            </p>
          </div>

          <div className="landing-demo-grid">
            <div className="landing-demo-item">
              <strong>Recepten terugvinden</strong>
              <span>Gebruik vorige behandelingen opnieuw zonder opnieuw te typen.</span>
            </div>
            <div className="landing-demo-item">
              <strong>Stempelkaarten digitaliseren</strong>
              <span>Bundels en stempelkaarten lopen automatisch mee in het dossier.</span>
            </div>
            <div className="landing-demo-item">
              <strong>Agenda per behandelaar</strong>
              <span>Zie per dag wie bezet is en zet afspraken door naar behandelingen.</span>
            </div>
            <div className="landing-demo-item">
              <strong>Foto&apos;s als bewijs</strong>
              <span>Voor- en nafoto&apos;s blijven gekoppeld aan de juiste behandeling.</span>
            </div>
          </div>
        </aside>
      </section>

      <section id="wat-je-krijgt" className="landing-sectie container">
        <div className="landing-sectie-kop">
          <span className="logo-label">Wat je krijgt</span>
          <h2>Een salonworkflow die logisch in elkaar grijpt</h2>
          <p>
            Geen verzameling losse tools, maar een werkplek waarin klantdossier, agenda,
            behandelingen, foto&apos;s en pakketten elkaar aanvullen.
          </p>
        </div>

        <div className="landing-kaarten">
          {highlights.map((highlight) => (
            <article key={highlight.titel} className="kaart landing-kaart">
              <h3>{highlight.titel}</h3>
              <p>{highlight.tekst}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="landing-sectie container landing-band">
        <div className="landing-band-kop">
          <span className="logo-label">Modules</span>
          <h2>Wat er nu al in SalonDossier zit</h2>
        </div>

        <div className="landing-module-grid">
          {modules.map((module) => (
            <div key={module} className="landing-module">
              <span className="landing-module-dot" />
              <p>{module}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="landing-sectie container" id="prijzen">
        <div className="landing-sectie-kop">
          <span className="logo-label">Prijzen</span>
          <h2>Eenvoudige prijzen voor salons die overzicht willen</h2>
          <p>
            SalonDossier is bedoeld voor salons die klantdossiers, behandelingen, kleurrecepten,
            afspraken, pakketten, digitale stempelkaarten en behandelfoto&apos;s centraal willen
            beheren, zonder een zwaar en duur alles-in-één systeem.
          </p>
        </div>

        <div className="landing-pricing-grid">
          {pricingPlans.map((plan) => (
            <article key={plan.naam} className="kaart landing-pricing-card">
              <div className="landing-pricing-head">
                <h3>{plan.naam}</h3>
                <div className="landing-pricing-price">
                  <strong>{plan.prijs}</strong>
                  <span>{plan.periode}</span>
                </div>
                <p>{plan.doelgroep}</p>
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
        <div className="landing-demo-request kaart">
          <div className="landing-demo-request-copy">
            <span className="logo-label">Demo aanvragen</span>
            <h2>Laat in 15 minuten zien hoe SalonDossier in jouw salon zou werken.</h2>
            <p>
              We lopen samen kort door je werkwijze heen en laten direct zien hoe klantdossiers,
              afspraken, pakketten, stempelkaarten en behandelfoto&apos;s in jouw situatie passen.
            </p>
          </div>

          <div className="landing-demo-request-steps">
            <div className="landing-demo-step">
              <strong>1. Korte intake</strong>
              <p>We bespreken hoe jullie nu werken en waar nu de meeste onrust of tijdverlies zit.</p>
            </div>
            <div className="landing-demo-step">
              <strong>2. Gerichte demo</strong>
              <p>Je ziet alleen de onderdelen die voor jouw salon echt relevant zijn.</p>
            </div>
            <div className="landing-demo-step">
              <strong>3. Rustige start</strong>
              <p>Als het past, helpen we met inrichting, livegang en de eerste stappen in gebruik.</p>
            </div>
          </div>

          <div className="landing-demo-request-actions">
            <a
              href="mailto:platform@miy24.nl?subject=Demo%20aanvraag%20SalonDossier"
              className="knop"
            >
              Vraag een demo aan
            </a>
            <a href="mailto:platform@miy24.nl" className="knop-secundair">
              Stuur een e-mail
            </a>
            <a href="#prijzen" className="knop-zacht">
              Bekijk prijzen
            </a>
          </div>
        </div>
      </section>

      <section className="landing-sectie container">
        <div className="landing-cta kaart">
          <div>
            <span className="logo-label">Klaar voor demo</span>
            <h2>Laat salons zien hoe overzichtelijk hun werkdag kan worden.</h2>
            <p>
              Gebruik SalonDossier als digitaal klantdossier voor behandelingen, recepten,
              pakketten, afspraken en behandelfoto&apos;s. Alles centraal, snel terug te vinden en
              klaar voor gebruik door meerdere medewerkers.
            </p>
          </div>

          <div className="landing-acties">
            <Link href="/login" className="knop">
              Naar inloggen
            </Link>
            <a href="mailto:platform@miy24.nl" className="knop-zacht">
              Demo aanvragen
            </a>
          </div>
        </div>

        <p className="maker landing-maker">
          Gemaakt door <a href="https://miy24.nl" target="_blank" rel="noreferrer">miy24.nl</a>
        </p>
      </section>
    </main>
  );
}
