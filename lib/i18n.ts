import { cookies } from "next/headers";

export type Locale = "nl" | "en" | "de";

const supportedLocales: Locale[] = ["nl", "en", "de"];
const defaultLocale: Locale = "nl";

export function isLocale(value: string | null | undefined): value is Locale {
  return Boolean(value && supportedLocales.includes(value as Locale));
}

export function getLocaleFromValue(value: string | null | undefined): Locale {
  return isLocale(value) ? value : defaultLocale;
}

export async function getCurrentLocale(): Promise<Locale> {
  const cookieStore = await cookies();
  return getLocaleFromValue(cookieStore.get("salondossier-locale")?.value);
}

export const homeDictionary = {
  nl: {
    heroKicker: "Digitaal klantdossier voor kapsalons",
    heroTitle: "Alles van je klant op een plek die je team echt gebruikt.",
    heroSubtitle:
      "SalonDossier helpt salons om behandelingen, kleurrecepten, afspraken, pakketten, digitale stempelkaarten en behandelfoto's centraal vast te leggen en snel terug te vinden.",
    login: "Inloggen",
    viewFeatures: "Bekijk functies",
    voordelen: [
      "Klantdossiers, behandelingen en kleurrecepten direct terug op één plek",
      "Digitale pakketten en stempelkaarten met automatische afboeking per bezoek",
      "Agenda met dag- en teamweergave voor meerdere behandelaars tegelijk",
      "Foto's per behandeling als visuele dossiervastlegging bij klachten of vergelijking"
    ],
    demoLabel: "Wat salons direct merken",
    demoTitle: "Van losse notities naar een compleet klantbeeld",
    demoText:
      "Laat bij een demo direct zien dat je niet alleen klantgegevens bewaart, maar ook recepten, pakketten, agenda en foto's logisch met elkaar verbindt.",
    demoItems: [
      {
        title: "Recepten terugvinden",
        text: "Gebruik vorige behandelingen opnieuw zonder opnieuw te typen."
      },
      {
        title: "Stempelkaarten digitaliseren",
        text: "Bundels en stempelkaarten lopen automatisch mee in het dossier."
      },
      {
        title: "Agenda per behandelaar",
        text: "Zie per dag wie bezet is en zet afspraken door naar behandelingen."
      },
      {
        title: "Foto's als bewijs",
        text: "Voor- en nafoto's blijven gekoppeld aan de juiste behandeling."
      }
    ],
    sectionWhat: "Wat je krijgt",
    sectionWhatTitle: "Een salonworkflow die logisch in elkaar grijpt",
    sectionWhatText:
      "Geen verzameling losse tools, maar een werkplek waarin klantdossier, agenda, behandelingen, foto's en pakketten elkaar aanvullen.",
    highlights: [
      {
        title: "Nooit meer zoeken",
        text: "Alle recepten, behandelingen, afspraken en foto's blijven gekoppeld aan dezelfde klant. Geen losse notities, geen papieren stempelkaarten, geen twijfel over wat er vorige keer is gedaan."
      },
      {
        title: "Gemaakt voor salons",
        text: "Werk met meerdere medewerkers, plan afspraken per behandelaar, verkoop bundels of stempelkaarten en zet een afspraak direct door naar een behandeling."
      },
      {
        title: "Rust in de werkdag",
        text: "SalonDossier is bedoeld om sneller te werken aan de stoel. Minder terugzoeken, minder uitleg, meer duidelijkheid voor het team en voor de klant."
      }
    ],
    modulesLabel: "Modules",
    modulesTitle: "Wat er nu al in SalonDossier zit",
    modules: [
      "Klantdossiers en behandelgeschiedenis",
      "Kleurrecepten en receptsjablonen",
      "Pakketten en digitale stempelkaarten",
      "Agenda met lijst- en teamweergave",
      "Behandelfoto's als dossierbewijs",
      "Meerdere medewerkers met eigen login"
    ],
    pricingLabel: "Prijzen",
    pricingTitle: "Eenvoudige prijzen voor salons die overzicht willen",
    pricingText:
      "SalonDossier is bedoeld voor salons die klantdossiers, behandelingen, kleurrecepten, afspraken, pakketten, digitale stempelkaarten en behandelfoto's centraal willen beheren, zonder een zwaar en duur alles-in-één systeem.",
    demoRequestLabel: "Demo aanvragen",
    demoRequestTitle: "Laat in 15 minuten zien hoe SalonDossier in jouw salon zou werken.",
    demoRequestText:
      "We lopen samen kort door je werkwijze heen en laten direct zien hoe klantdossiers, afspraken, pakketten, stempelkaarten en behandelfoto's in jouw situatie passen.",
    demoSteps: [
      {
        title: "1. Korte intake",
        text: "We bespreken hoe jullie nu werken en waar nu de meeste onrust of tijdverlies zit."
      },
      {
        title: "2. Gerichte demo",
        text: "Je ziet alleen de onderdelen die relevant zijn voor jouw salon en team."
      },
      {
        title: "3. Samen bepalen",
        text: "We kijken of SalonDossier al goed past of dat er nog iets mist voor jouw werkwijze."
      }
    ],
    requestDemo: "Vraag een demo aan",
    sendEmail: "Stuur een e-mail",
    viewPricing: "Bekijk prijzen",
    pricingPlans: [
      {
        name: "SalonDossier Start",
        price: "€24",
        period: "per maand",
        audience: "Voor solo salons en kleinere teams.",
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
        name: "SalonDossier Plus",
        price: "€49",
        period: "per maand",
        audience: "Voor salons met meerdere medewerkers.",
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
        name: "Opstart & inrichting",
        price: "€149",
        period: "eenmalig",
        audience: "Voor salons die hulp willen bij livegang.",
        features: [
          "basisinrichting",
          "hulp bij instellingen",
          "uitleg van de belangrijkste functies",
          "begeleiding bij opstart"
        ]
      }
    ]
  },
  en: {
    heroKicker: "Digital client records for hair salons",
    heroTitle: "Everything about your client in one place your team will actually use.",
    heroSubtitle:
      "SalonDossier helps salons keep treatments, colour formulas, appointments, packages, digital stamp cards and treatment photos together in one central place.",
    login: "Log in",
    viewFeatures: "View features",
    voordelen: [
      "Client records, treatments and colour formulas together in one place",
      "Digital packages and stamp cards with automatic deductions per visit",
      "Daily and team agenda views for multiple stylists at once",
      "Photos per treatment as visual documentation for complaints or comparison"
    ],
    demoLabel: "What salons notice right away",
    demoTitle: "From scattered notes to a complete client overview",
    demoText:
      "In a demo you can immediately show that you are not only storing client data, but also connecting formulas, packages, appointments and photos in a logical way.",
    demoItems: [
      { title: "Find formulas instantly", text: "Reuse previous treatments without typing everything again." },
      { title: "Digitise stamp cards", text: "Packages and stamp cards stay linked to the client file." },
      { title: "Agenda by stylist", text: "See who is booked each day and turn appointments into treatments." },
      { title: "Photos as proof", text: "Before and after photos stay linked to the correct treatment." }
    ],
    sectionWhat: "What you get",
    sectionWhatTitle: "A salon workflow that fits together naturally",
    sectionWhatText:
      "Not a collection of separate tools, but one workspace where client records, appointments, treatments, photos and packages support each other.",
    highlights: [
      {
        title: "No more searching",
        text: "All formulas, treatments, appointments and photos stay linked to the same client. No scattered notes, no paper stamp cards, no doubt about what was done last time."
      },
      {
        title: "Built for salons",
        text: "Work with multiple staff members, plan appointments per stylist, sell packages or stamp cards and turn an appointment directly into a treatment."
      },
      {
        title: "Calmer working days",
        text: "SalonDossier is designed to make work at the chair faster. Less searching, less explaining, more clarity for the team and for the client."
      }
    ],
    modulesLabel: "Modules",
    modulesTitle: "What is already included in SalonDossier",
    modules: [
      "Client records and treatment history",
      "Colour formulas and reusable templates",
      "Packages and digital stamp cards",
      "Agenda with list and team view",
      "Treatment photos as file evidence",
      "Multiple staff members with their own login"
    ],
    pricingLabel: "Pricing",
    pricingTitle: "Simple pricing for salons that want clarity",
    pricingText:
      "SalonDossier is built for salons that want to manage client files, treatments, colour formulas, appointments, packages, digital stamp cards and treatment photos without a heavy all-in-one system.",
    demoRequestLabel: "Request a demo",
    demoRequestTitle: "See in 15 minutes how SalonDossier would work in your salon.",
    demoRequestText:
      "We briefly walk through your workflow and show how client files, appointments, packages, stamp cards and treatment photos fit your salon.",
    demoSteps: [
      { title: "1. Short intake", text: "We discuss how your salon works today and where time or clarity is currently lost." },
      { title: "2. Focused demo", text: "You only see the parts that matter for your salon and team." },
      { title: "3. Decide together", text: "We check whether SalonDossier already fits well or what is still missing." }
    ],
    requestDemo: "Request a demo",
    sendEmail: "Send an email",
    viewPricing: "View pricing",
    pricingPlans: [
      {
        name: "SalonDossier Start",
        price: "€24",
        period: "per month",
        audience: "For solo salons and smaller teams.",
        features: [
          "client records",
          "treatments and colour formulas",
          "agenda",
          "packages and digital stamp cards",
          "treatment photos",
          "standard updates and support"
        ]
      },
      {
        name: "SalonDossier Plus",
        price: "€49",
        period: "per month",
        audience: "For salons with multiple staff members.",
        features: [
          "everything in Start",
          "team usage",
          "team agenda",
          "priority support",
          "faster access to new features",
          "more guidance"
        ]
      },
      {
        name: "Setup & onboarding",
        price: "€149",
        period: "one-time",
        audience: "For salons that want help getting started.",
        features: [
          "basic setup",
          "help with settings",
          "guided walkthrough of key features",
          "support during launch"
        ]
      }
    ]
  },
  de: {
    heroKicker: "Digitales Kundendossier für Friseursalons",
    heroTitle: "Alles über deine Kundin oder deinen Kunden an einem Ort, den dein Team wirklich nutzt.",
    heroSubtitle:
      "SalonDossier hilft Salons dabei, Behandlungen, Farbrezepte, Termine, Pakete, digitale Stempelkarten und Behandlungsfotos zentral festzuhalten und schnell wiederzufinden.",
    login: "Anmelden",
    viewFeatures: "Funktionen ansehen",
    voordelen: [
      "Kundendossiers, Behandlungen und Farbrezepte an einem Ort",
      "Digitale Pakete und Stempelkarten mit automatischer Abbuchung pro Besuch",
      "Tages- und Teamansicht für mehrere Behandler gleichzeitig",
      "Fotos pro Behandlung als visuelle Dokumentation bei Beschwerden oder Vergleichen"
    ],
    demoLabel: "Was Salons sofort merken",
    demoTitle: "Von losen Notizen zu einem vollständigen Kundenbild",
    demoText:
      "In einer Demo zeigst du sofort, dass nicht nur Kundendaten gespeichert werden, sondern auch Rezepte, Pakete, Termine und Fotos logisch miteinander verbunden sind.",
    demoItems: [
      { title: "Rezepte schnell finden", text: "Frühere Behandlungen wiederverwenden, ohne alles neu einzugeben." },
      { title: "Stempelkarten digitalisieren", text: "Pakete und Stempelkarten bleiben mit der Kundenakte verbunden." },
      { title: "Kalender pro Behandler", text: "Sieh täglich, wer belegt ist, und wandle Termine direkt in Behandlungen um." },
      { title: "Fotos als Nachweis", text: "Vorher- und Nachherfotos bleiben mit der richtigen Behandlung verknüpft." }
    ],
    sectionWhat: "Was du bekommst",
    sectionWhatTitle: "Ein Salon-Workflow, der logisch zusammenpasst",
    sectionWhatText:
      "Keine Sammlung einzelner Tools, sondern ein Arbeitsplatz, in dem Kundendossier, Kalender, Behandlungen, Fotos und Pakete sich gegenseitig ergänzen.",
    highlights: [
      {
        title: "Nie wieder suchen",
        text: "Alle Rezepte, Behandlungen, Termine und Fotos bleiben mit derselben Kundin oder demselben Kunden verknüpft. Keine losen Notizen, keine Papier-Stempelkarten, keine Unsicherheit darüber, was zuletzt gemacht wurde."
      },
      {
        title: "Für Salons gemacht",
        text: "Arbeite mit mehreren Mitarbeitenden, plane Termine pro Behandler, verkaufe Pakete oder Stempelkarten und wandle einen Termin direkt in eine Behandlung um."
      },
      {
        title: "Mehr Ruhe im Arbeitstag",
        text: "SalonDossier ist dafür gemacht, die Arbeit am Stuhl schneller zu machen. Weniger Suchen, weniger Erklären, mehr Klarheit für Team und Kundschaft."
      }
    ],
    modulesLabel: "Module",
    modulesTitle: "Was jetzt schon in SalonDossier enthalten ist",
    modules: [
      "Kundendossiers und Behandlungshistorie",
      "Farbrezepte und Vorlagen",
      "Pakete und digitale Stempelkarten",
      "Kalender mit Listen- und Teamansicht",
      "Behandlungsfotos als Nachweis",
      "Mehrere Mitarbeitende mit eigenem Login"
    ],
    pricingLabel: "Preise",
    pricingTitle: "Einfache Preise für Salons, die Übersicht wollen",
    pricingText:
      "SalonDossier ist für Salons gedacht, die Kundendossiers, Behandlungen, Farbrezepte, Termine, Pakete, digitale Stempelkarten und Behandlungsfotos zentral verwalten möchten, ohne ein schweres All-in-One-System.",
    demoRequestLabel: "Demo anfragen",
    demoRequestTitle: "Sieh in 15 Minuten, wie SalonDossier in deinem Salon funktionieren würde.",
    demoRequestText:
      "Wir gehen kurz deinen Ablauf durch und zeigen direkt, wie Kundendossiers, Termine, Pakete, Stempelkarten und Behandlungsfotos in deinen Salon passen.",
    demoSteps: [
      { title: "1. Kurzes Gespräch", text: "Wir besprechen, wie ihr heute arbeitet und wo aktuell Zeit oder Übersicht verloren geht." },
      { title: "2. Gezielte Demo", text: "Du siehst nur die Teile, die für deinen Salon und dein Team relevant sind." },
      { title: "3. Gemeinsam bewerten", text: "Wir prüfen, ob SalonDossier schon gut passt oder was noch fehlt." }
    ],
    requestDemo: "Demo anfragen",
    sendEmail: "E-Mail senden",
    viewPricing: "Preise ansehen",
    pricingPlans: [
      {
        name: "SalonDossier Start",
        price: "€24",
        period: "pro Monat",
        audience: "Für Solo-Salons und kleinere Teams.",
        features: [
          "Kundendossiers",
          "Behandlungen und Farbrezepte",
          "Kalender",
          "Pakete und digitale Stempelkarten",
          "Behandlungsfotos",
          "Standard-Updates und Support"
        ]
      },
      {
        name: "SalonDossier Plus",
        price: "€49",
        period: "pro Monat",
        audience: "Für Salons mit mehreren Mitarbeitenden.",
        features: [
          "alles aus Start",
          "Teamnutzung",
          "Teamkalender",
          "priorisierter Support",
          "schnellerer Zugang zu neuen Funktionen",
          "mehr Begleitung"
        ]
      },
      {
        name: "Einrichtung & Start",
        price: "€149",
        period: "einmalig",
        audience: "Für Salons, die Hilfe beim Start möchten.",
        features: [
          "Grundeinrichtung",
          "Hilfe bei den Einstellungen",
          "Einführung in die wichtigsten Funktionen",
          "Begleitung beim Start"
        ]
      }
    ]
  }
} as const;

export const loginDictionary = {
  nl: {
    title: "Inloggen voor medewerkers",
    subtitle:
      "Registreer klanten, bewaar kleurrecepten en houd de volledige behandelgeschiedenis centraal bij.",
    salonCodeLabel: "Saloncode of subdomein (optioneel)",
    salonCodePlaceholder: "Bijvoorbeeld my-style",
    emailLabel: "E-mailadres",
    emailPlaceholder: "naam@salon.nl",
    passwordLabel: "Wachtwoord",
    loginLabel: "Inloggen",
    loginBusy: "Controleren...",
    salonLoginTitle: "Salon login",
    salonLoginText: "Gebruik het medewerkeraccount van de salon. Voorbeeld:",
    platformLoginTitle: "Platform login",
    platformLoginText:
      "Log centraal in zonder saloncode voor platformbeheer en onboarding van nieuwe salons.",
    tenantActiveTitle: "Saloncontext actief",
    tenantActiveText: "Je logt direct in voor {salonNaam}. De juiste saloncontext is al geselecteerd.",
    noSalonHint:
      "Zonder saloncode log je centraal in. Met een saloncode of subdomein log je direct in voor die salon.",
    pausedError: "Deze salon is tijdelijk gepauzeerd. Neem contact op met de beheerder.",
    notFoundError: "Deze saloncode is niet gevonden.",
    madeBy: "Gemaakt door"
  },
  en: {
    title: "Staff login",
    subtitle:
      "Register clients, save colour formulas and keep the full treatment history in one place.",
    salonCodeLabel: "Salon code or subdomain (optional)",
    salonCodePlaceholder: "For example my-style",
    emailLabel: "Email address",
    emailPlaceholder: "name@salon.com",
    passwordLabel: "Password",
    loginLabel: "Log in",
    loginBusy: "Checking...",
    salonLoginTitle: "Salon login",
    salonLoginText: "Use the salon staff account. Example:",
    platformLoginTitle: "Platform login",
    platformLoginText:
      "Log in centrally without a salon code for platform management and onboarding new salons.",
    tenantActiveTitle: "Salon context active",
    tenantActiveText: "You are logging in directly for {salonNaam}. The correct salon context is already selected.",
    noSalonHint:
      "Without a salon code you log in centrally. With a salon code or subdomain you log in directly for that salon.",
    pausedError: "This salon is temporarily paused. Please contact the administrator.",
    notFoundError: "This salon code could not be found.",
    madeBy: "Made by"
  },
  de: {
    title: "Mitarbeiter-Login",
    subtitle:
      "Erfasse Kundschaft, speichere Farbrezepte und behalte die gesamte Behandlungshistorie zentral im Blick.",
    salonCodeLabel: "Saloncode oder Subdomain (optional)",
    salonCodePlaceholder: "Zum Beispiel my-style",
    emailLabel: "E-Mail-Adresse",
    emailPlaceholder: "name@salon.de",
    passwordLabel: "Passwort",
    loginLabel: "Anmelden",
    loginBusy: "Prüfen...",
    salonLoginTitle: "Salon-Login",
    salonLoginText: "Nutze das Mitarbeiterkonto des Salons. Beispiel:",
    platformLoginTitle: "Plattform-Login",
    platformLoginText:
      "Melde dich zentral ohne Saloncode an, um die Plattform zu verwalten und neue Salons einzurichten.",
    tenantActiveTitle: "Salonkontext aktiv",
    tenantActiveText: "Du meldest dich direkt für {salonNaam} an. Der richtige Salonkontext ist bereits gewählt.",
    noSalonHint:
      "Ohne Saloncode meldest du dich zentral an. Mit einem Saloncode oder einer Subdomain meldest du dich direkt für diesen Salon an.",
    pausedError: "Dieser Salon ist vorübergehend pausiert. Bitte kontaktiere die Verwaltung.",
    notFoundError: "Dieser Saloncode wurde nicht gefunden.",
    madeBy: "Erstellt von"
  }
} as const;
