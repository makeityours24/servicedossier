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
    heroTitle: "Everything about every client in one place your salon team will actually use.",
    heroSubtitle:
      "SalonDossier helps salons keep client records, colour formulas, appointments, packages, digital stamp cards and treatment photos together in one clear workflow.",
    login: "Log in",
    viewFeatures: "View features",
    voordelen: [
      "Client records, services and colour formulas together in one place",
      "Digital packages and stamp cards with automatic deductions per visit",
      "Appointment book with daily and team views for multiple stylists at once",
      "Photos per treatment as visual documentation for complaints or comparison"
    ],
    demoLabel: "What salons notice right away",
    demoTitle: "From scattered notes to a complete client overview",
    demoText:
      "In a demo you can immediately show that you are not only storing client data, but also connecting formulas, packages, appointments and photos in a logical way.",
    demoItems: [
      { title: "Find formulas instantly", text: "Reuse previous treatments without typing everything again." },
      { title: "Digitise stamp cards", text: "Packages and stamp cards stay linked to the client record." },
      { title: "Appointment book by stylist", text: "See who is booked each day and turn appointments into services." },
      { title: "Photos as proof", text: "Before and after photos stay linked to the correct treatment." }
    ],
    sectionWhat: "What you get",
    sectionWhatTitle: "A salon workflow that fits together naturally",
    sectionWhatText:
      "Not a collection of separate tools, but one workspace where client records, the appointment book, services, photos and packages support each other.",
    highlights: [
      {
        title: "No more searching",
        text: "All formulas, services, appointments and photos stay linked to the same client. No scattered notes, no paper stamp cards, no doubt about what was done last time."
      },
      {
        title: "Built for salons",
        text: "Work with multiple staff members, manage appointments per stylist, sell packages or stamp cards and turn an appointment directly into a service record."
      },
      {
        title: "Calmer working days",
        text: "SalonDossier is designed to make work at the chair faster. Less searching, less explaining, more clarity for the team and for the client."
      }
    ],
    modulesLabel: "Modules",
    modulesTitle: "What is already included in SalonDossier",
    modules: [
      "Client records and service history",
      "Colour formulas and reusable templates",
      "Packages and digital stamp cards",
      "Appointment book with list and team view",
      "Treatment photos as visual proof",
      "Multiple staff members with their own login"
    ],
    pricingLabel: "Pricing",
    pricingTitle: "Simple pricing for salons that want clarity",
    pricingText:
      "SalonDossier is built for salons that want to manage client records, services, colour formulas, appointments, packages, digital stamp cards and treatment photos without a heavy all-in-one system.",
    demoRequestLabel: "Request a demo",
    demoRequestTitle: "See in 15 minutes how SalonDossier would work in your salon.",
    demoRequestText:
      "We briefly walk through your workflow and show how client records, appointments, packages, stamp cards and treatment photos fit your salon.",
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
          "services and colour formulas",
          "appointment book",
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
          "team appointment book",
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
    heroKicker: "Digitale Kundenkartei für Friseursalons",
    heroTitle: "Alles über deine Kundschaft an einem Ort, den dein Team wirklich nutzt.",
    heroSubtitle:
      "SalonDossier hilft Salons dabei, Kundenkartei, Farbrezepte, Termine, Pakete, digitale Stempelkarten und Behandlungsfotos zentral festzuhalten und schnell wiederzufinden.",
    login: "Anmelden",
    viewFeatures: "Funktionen ansehen",
    voordelen: [
      "Kundenkartei, Leistungen und Farbrezepte an einem Ort",
      "Digitale Pakete und Stempelkarten mit automatischer Abbuchung pro Besuch",
      "Terminbuch mit Tages- und Teamansicht für mehrere Mitarbeitende gleichzeitig",
      "Fotos pro Behandlung als visuelle Dokumentation bei Beschwerden oder Vergleichen"
    ],
    demoLabel: "Was Salons sofort merken",
    demoTitle: "Von losen Notizen zu einer vollständigen Kundenkartei",
    demoText:
      "In einer Demo zeigst du sofort, dass nicht nur Kundendaten gespeichert werden, sondern auch Rezepte, Pakete, Termine und Fotos logisch miteinander verbunden sind.",
    demoItems: [
      { title: "Rezepte schnell finden", text: "Frühere Behandlungen wiederverwenden, ohne alles neu einzugeben." },
      { title: "Stempelkarten digitalisieren", text: "Pakete und Stempelkarten bleiben mit der Kundenkartei verbunden." },
      { title: "Terminbuch pro Mitarbeitendem", text: "Sieh täglich, wer belegt ist, und wandle Termine direkt in Behandlungen um." },
      { title: "Fotos als Nachweis", text: "Vorher- und Nachherfotos bleiben mit der richtigen Behandlung verknüpft." }
    ],
    sectionWhat: "Was du bekommst",
    sectionWhatTitle: "Ein Salon-Workflow, der logisch zusammenpasst",
    sectionWhatText:
      "Keine Sammlung einzelner Tools, sondern ein Arbeitsplatz, in dem Kundenkartei, Terminbuch, Behandlungen, Fotos und Pakete sich gegenseitig ergänzen.",
    highlights: [
      {
        title: "Nie wieder suchen",
        text: "Alle Rezepte, Behandlungen, Termine und Fotos bleiben mit derselben Kundin oder demselben Kunden verknüpft. Keine losen Notizen, keine Papier-Stempelkarten, keine Unsicherheit darüber, was zuletzt gemacht wurde."
      },
      {
        title: "Für Salons gemacht",
        text: "Arbeite mit mehreren Mitarbeitenden, plane Termine pro Mitarbeitendem, verkaufe Pakete oder Stempelkarten und wandle einen Termin direkt in eine Behandlung um."
      },
      {
        title: "Mehr Ruhe im Arbeitstag",
        text: "SalonDossier ist dafür gemacht, die Arbeit am Stuhl schneller zu machen. Weniger Suchen, weniger Erklären, mehr Klarheit für Team und Kundschaft."
      }
    ],
    modulesLabel: "Module",
    modulesTitle: "Was jetzt schon in SalonDossier enthalten ist",
    modules: [
      "Kundenkartei und Behandlungshistorie",
      "Farbrezepte und Vorlagen",
      "Pakete und digitale Stempelkarten",
      "Terminbuch mit Listen- und Teamansicht",
      "Behandlungsfotos als Nachweis",
      "Mehrere Mitarbeitende mit eigenem Login"
    ],
    pricingLabel: "Preise",
    pricingTitle: "Einfache Preise für Salons, die Übersicht wollen",
    pricingText:
      "SalonDossier ist für Salons gedacht, die Kundenkartei, Behandlungen, Farbrezepte, Termine, Pakete, digitale Stempelkarten und Behandlungsfotos zentral verwalten möchten, ohne ein schweres All-in-One-System.",
    demoRequestLabel: "Demo anfragen",
    demoRequestTitle: "Sieh in 15 Minuten, wie SalonDossier in deinem Salon funktionieren würde.",
    demoRequestText:
      "Wir gehen kurz deinen Ablauf durch und zeigen direkt, wie Kundenkartei, Termine, Pakete, Stempelkarten und Behandlungsfotos in deinen Salon passen.",
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
          "Kundenkartei",
          "Behandlungen und Farbrezepte",
          "Terminbuch",
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
          "Team-Terminbuch",
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

export const dashboardDictionary = {
  nl: {
    sidebarTagline: "Professioneel salonbeheer",
    loggedInAs: "Ingelogd als",
    madeBy: "Gemaakt door",
    nav: {
      dashboard: "Dashboard",
      customers: "Klanten",
      newCustomer: "Nieuwe klant (dossier)",
      agenda: "Agenda",
      recipes: "Receptsjablonen",
      packages: "Pakketten",
      team: "Team",
      settings: "Instellingen",
      password: "Wachtwoord"
    },
    logout: "Uitloggen",
    logoutBusy: "Afmelden...",
    label: "Dashboard",
    title: "Vandaag in de salon",
    subtitle:
      "Direct overzicht van afspraken, behandelingen, nieuwe klanten en open pakketten voor {salonNaam}.",
    openAgenda: "Agenda openen",
    newCustomer: "Nieuwe klant",
    stats: {
      appointmentsToday: "Afspraken vandaag",
      openAppointments: "Open afspraken",
      treatmentsToday: "Behandelingen vandaag",
      newCustomersToday: "Nieuwe klanten vandaag",
      activePackages: "Actieve pakketten",
      activeStaff: "Actieve medewerkers"
    },
    todayAppointmentsTitle: "Afspraken van vandaag",
    todayAppointmentsText: "Handig om de dag te openen zonder eerst naar de volledige agenda te gaan.",
    fullAgenda: "Volledige agenda",
    noAppointments: "Er staan vandaag nog geen afspraken ingepland.",
    unassigned: "Nog niet toegewezen",
    status: {
      GEPLAND: "Gepland",
      VOLTOOID: "Voltooid",
      GEANNULEERD: "Geannuleerd",
      NIET_GEKOMEN: "Niet gekomen"
    },
    openPackagesTitle: "Open pakketten",
    openPackagesText: "Zie snel welke klanten nog bundels of stempelkaarten hebben lopen.",
    packagesButton: "Pakketten",
    noOpenPackages: "Er zijn nu geen actieve pakketten in deze salon.",
    remaining: "Nog {remaining} van {total} over",
    soldOn: "Verkocht op {date}",
    openDossier: "Open dossier",
    latestTreatments: "Laatste behandelingen",
    noTreatments: "Er zijn nog geen behandelingen geregistreerd.",
    by: "door",
    quickActions: "Snelle acties",
    quickActionCards: {
      newCustomer: {
        title: "Nieuwe klant registreren",
        text: "Voeg direct een nieuw klantdossier toe. Voor inlogaccounts gebruik je Team."
      },
      newAppointment: {
        title: "Nieuwe afspraak plannen",
        text: "Open de agenda en plan direct een nieuwe klantafspraak in."
      },
      export: {
        title: "CSV-export downloaden",
        text: "Exporteer klant- en behandelgegevens voor administratie."
      }
    }
  },
  en: {
    sidebarTagline: "Professional salon management",
    loggedInAs: "Logged in as",
    madeBy: "Made by",
    nav: {
      dashboard: "Dashboard",
      customers: "Clients",
      newCustomer: "New client record",
      agenda: "Appointment Book",
      recipes: "Recipe templates",
      packages: "Packages",
      team: "Staff",
      settings: "Settings",
      password: "Password"
    },
    logout: "Log out",
    logoutBusy: "Signing out...",
    label: "Dashboard",
    title: "Today in the salon",
    subtitle:
      "A direct overview of appointments, treatments, new clients and open packages for {salonNaam}.",
    openAgenda: "Open appointment book",
    newCustomer: "New client record",
    stats: {
      appointmentsToday: "Appointments today",
      openAppointments: "Open appointments",
      treatmentsToday: "Treatments today",
      newCustomersToday: "New clients today",
      activePackages: "Active packages",
      activeStaff: "Active staff"
    },
    todayAppointmentsTitle: "Today's appointments",
    todayAppointmentsText: "Useful for opening the day without going to the full appointment book first.",
    fullAgenda: "Full appointment book",
    noAppointments: "There are no appointments scheduled for today yet.",
    unassigned: "Not assigned yet",
    status: {
      GEPLAND: "Planned",
      VOLTOOID: "Completed",
      GEANNULEERD: "Cancelled",
      NIET_GEKOMEN: "No-show"
    },
    openPackagesTitle: "Open packages",
    openPackagesText: "Quickly see which clients still have active packages or stamp cards.",
    packagesButton: "Packages",
    noOpenPackages: "There are no active packages in this salon right now.",
    remaining: "{remaining} of {total} remaining",
    soldOn: "Sold on {date}",
    openDossier: "Open file",
    latestTreatments: "Latest treatments",
    noTreatments: "No treatments have been recorded yet.",
    by: "by",
    quickActions: "Quick actions",
    quickActionCards: {
      newCustomer: {
        title: "Create new client record",
        text: "Add a new client record right away. Use Staff for login accounts."
      },
      newAppointment: {
        title: "Book new appointment",
        text: "Open the appointment book and schedule a new client appointment directly."
      },
      export: {
        title: "Download CSV export",
        text: "Export client and treatment data for administration."
      }
    }
  },
  de: {
    sidebarTagline: "Professionelle Salonverwaltung",
    loggedInAs: "Angemeldet als",
    madeBy: "Erstellt von",
    nav: {
      dashboard: "Dashboard",
      customers: "Kunden",
      newCustomer: "Neue Kundenkartei",
      agenda: "Terminbuch",
      recipes: "Rezeptvorlagen",
      packages: "Pakete",
      team: "Team",
      settings: "Einstellungen",
      password: "Passwort"
    },
    logout: "Abmelden",
    logoutBusy: "Abmelden...",
    label: "Dashboard",
    title: "Heute im Salon",
    subtitle:
      "Direkter Überblick über Termine, Behandlungen, neue Kundschaft und offene Pakete für {salonNaam}.",
    openAgenda: "Terminbuch öffnen",
    newCustomer: "Neue Kundenkartei",
    stats: {
      appointmentsToday: "Termine heute",
      openAppointments: "Offene Termine",
      treatmentsToday: "Behandlungen heute",
      newCustomersToday: "Neue Kundschaft heute",
      activePackages: "Aktive Pakete",
      activeStaff: "Aktive Mitarbeitende"
    },
    todayAppointmentsTitle: "Termine heute",
    todayAppointmentsText: "Praktisch, um den Tag zu starten, ohne zuerst ins vollständige Terminbuch zu gehen.",
    fullAgenda: "Vollständiges Terminbuch",
    noAppointments: "Für heute sind noch keine Termine eingeplant.",
    unassigned: "Noch nicht zugewiesen",
    status: {
      GEPLAND: "Geplant",
      VOLTOOID: "Abgeschlossen",
      GEANNULEERD: "Storniert",
      NIET_GEKOMEN: "Nicht erschienen"
    },
    openPackagesTitle: "Offene Pakete",
    openPackagesText: "Sieh schnell, welche Kundinnen oder Kunden noch aktive Pakete oder Stempelkarten haben.",
    packagesButton: "Pakete",
    noOpenPackages: "In diesem Salon gibt es aktuell keine aktiven Pakete.",
    remaining: "Noch {remaining} von {total} übrig",
    soldOn: "Verkauft am {date}",
    openDossier: "Dossier öffnen",
    latestTreatments: "Letzte Behandlungen",
    noTreatments: "Es wurden noch keine Behandlungen erfasst.",
    by: "von",
    quickActions: "Schnellaktionen",
    quickActionCards: {
      newCustomer: {
        title: "Neue Kundenkartei anlegen",
        text: "Lege direkt eine neue Kundenkartei an. Für Login-Konten nutzt du Team."
      },
      newAppointment: {
        title: "Neuen Termin buchen",
        text: "Öffne das Terminbuch und plane direkt einen neuen Kundentermin."
      },
      export: {
        title: "CSV-Export herunterladen",
        text: "Exportiere Kunden- und Behandlungsdaten für die Verwaltung."
      }
    }
  }
} as const;

export const agendaDictionary = {
  nl: {
    label: "Agenda",
    title: "Dagagenda",
    subtitle: "Plan afspraken per dag en houd eenvoudig zicht op klant, behandelaar en status.",
    date: "Datum",
    stylist: "Behandelaar",
    allStylists: "Alle behandelaars",
    filter: "Filteren",
    previousDay: "Vorige dag",
    nextDay: "Volgende dag",
    appointmentsOn: "Afspraken op {date}",
    teamViewText: "Teamweergave met kolommen per behandelaar voor salons met meerdere kappers tegelijk.",
    listViewText: "Eenvoudig dagoverzicht met klant, behandeling, behandelaar en status.",
    noAppointmentsForDay: "Er zijn nog geen afspraken gevonden voor deze dag en filtercombinatie.",
    treatment: "Behandeling",
    duration: "Duur",
    durationValue: "{count} minuten",
    stylistLabel: "Behandelaar",
    statusLabel: "Status",
    notes: "Notities",
    unassigned: "Nog niet toegewezen",
    edit: "Bewerken",
    openCompletedTreatment: "Afgeronde behandeling openen",
    registerTreatmentAndDeduct: "Behandeling registreren en afboeken",
    toClientFile: "Naar klantdossier",
    deleteAppointmentConfirm: "Weet je zeker dat je afspraak {naam} wilt verwijderen?",
    delete: "Verwijderen",
    newAppointment: "Nieuwe afspraak",
    newAppointmentText:
      "Plan snel een nieuwe afspraak voor een bestaande klant. Dit is bewust een lichte dagagenda zonder zware planner.",
    addCustomerFirst: "Voeg eerst een klant toe voordat je een afspraak kunt plannen.",
    editAppointmentTitle: "Afspraak bewerken",
    editAppointmentText: "Werk deze afspraak bij voor {customerName} zonder het dagoverzicht te verliezen.",
    backToAgenda: "Terug naar agenda",
    reminderCopy: "Herinnering kopiëren",
    openWhatsApp: "Open in WhatsApp",
    views: {
      list: "Lijst",
      team: "Team"
    },
    teamGrid: {
      scrollHint: "Scroll naar rechts voor meer behandelaars",
      time: "Tijd",
      unassigned: "Nog niet toegewezen",
      minutes: "{count} min"
    },
    status: {
      GEPLAND: "Gepland",
      VOLTOOID: "Voltooid",
      GEANNULEERD: "Geannuleerd",
      NIET_GEKOMEN: "Niet gekomen"
    },
    form: {
      addCustomerInlineTitle: "Nieuwe klant direct toevoegen",
      addCustomerInlineText:
        "Zo hoef je de agenda niet te verlaten. Na opslaan wordt de klant automatisch geselecteerd.",
      quickCustomerUnavailable: "Snelle klantaanmaak is hier niet beschikbaar.",
      name: "Naam",
      phone: "Telefoonnummer",
      address: "Adres",
      addressPlaceholder: "Bijvoorbeeld straat, huisnummer en woonplaats",
      addCustomer: "Klant toevoegen",
      addingCustomer: "Toevoegen...",
      customer: "Klant",
      close: "Sluiten",
      newCustomer: "Nieuwe klant",
      chooseCustomer: "Kies een klant",
      customerHint: "Nieuwe klant nog niet in het systeem? Voeg hem hier direct toe en plan daarna verder.",
      stylistOptional: "Behandelaar (optioneel)",
      startTime: "Starttijd",
      duration: "Duur",
      endTime: "Eindtijd",
      treatment: "Behandeling",
      treatmentPlaceholder: "Bijvoorbeeld Uitgroei kleuren",
      agendaColor: "Kleur in agenda",
      status: "Status",
      unassigned: "Nog niet toegewezen",
      statusOptions: {
        GEPLAND: "Gepland",
        VOLTOOID: "Voltooid",
        GEANNULEERD: "Geannuleerd",
        NIET_GEKOMEN: "Niet gekomen"
      },
      completeHint:
        "Rond deze afspraak af via Behandeling registreren en afboeken. Dan worden behandeling, pakket en stempelkaart direct goed verwerkt.",
      notesOptional: "Notities (optioneel)",
      notesPlaceholder: "Bijvoorbeeld klant wil iets warmer resultaat of liever in de ochtend.",
      saveAppointment: "Afspraak opslaan",
      saving: "Opslaan...",
      durations: {
        "15": "15 minuten",
        "30": "30 minuten",
        "45": "45 minuten",
        "60": "60 minuten",
        "90": "90 minuten",
        "120": "120 minuten",
        "150": "150 minuten",
        "180": "180 minuten"
      }
    }
  },
  en: {
    label: "Appointment Book",
    title: "Day view",
    subtitle: "Plan appointments by day and keep a clear overview of client, stylist and status.",
    date: "Date",
    stylist: "Stylist",
    allStylists: "All stylists",
    filter: "Filter",
    previousDay: "Previous day",
    nextDay: "Next day",
    appointmentsOn: "Appointments on {date}",
    teamViewText: "Team view with a column per stylist for salons with multiple chairs running at once.",
    listViewText: "Simple day overview with client, service, stylist and status.",
    noAppointmentsForDay: "No appointments were found for this day and filter combination.",
    treatment: "Service",
    duration: "Duration",
    durationValue: "{count} minutes",
    stylistLabel: "Stylist",
    statusLabel: "Status",
    notes: "Notes",
    unassigned: "Not assigned yet",
    edit: "Edit",
    openCompletedTreatment: "Open completed service record",
    registerTreatmentAndDeduct: "Register service and deduct package",
    toClientFile: "Open client record",
    deleteAppointmentConfirm: "Are you sure you want to delete appointment {naam}?",
    delete: "Delete",
    newAppointment: "New appointment",
    newAppointmentText:
      "Quickly add a new appointment for an existing client. This is intentionally a lightweight appointment book, not a heavy planner.",
    addCustomerFirst: "Add a client first before you can book an appointment.",
    editAppointmentTitle: "Edit appointment",
    editAppointmentText: "Update this appointment for {customerName} without losing the day overview.",
    backToAgenda: "Back to appointment book",
    reminderCopy: "Copy reminder",
    openWhatsApp: "Open in WhatsApp",
    views: {
      list: "List",
      team: "Team"
    },
    teamGrid: {
      scrollHint: "Scroll right to view more stylists",
      time: "Time",
      unassigned: "Unassigned",
      minutes: "{count} min"
    },
    status: {
      GEPLAND: "Planned",
      VOLTOOID: "Completed",
      GEANNULEERD: "Cancelled",
      NIET_GEKOMEN: "No-show"
    },
    form: {
      addCustomerInlineTitle: "Add a new client right here",
      addCustomerInlineText:
        "That way you do not have to leave the appointment book. After saving, the client will be selected automatically.",
      quickCustomerUnavailable: "Quick client creation is not available here.",
      name: "Name",
      phone: "Phone number",
      address: "Address",
      addressPlaceholder: "For example street, house number and city",
      addCustomer: "Add client",
      addingCustomer: "Adding...",
      customer: "Client",
      close: "Close",
      newCustomer: "New client",
      chooseCustomer: "Choose a client",
      customerHint: "Client not in the system yet? Add them here directly and continue booking.",
      stylistOptional: "Stylist (optional)",
      startTime: "Start time",
      duration: "Duration",
      endTime: "End time",
      treatment: "Service",
      treatmentPlaceholder: "For example Root retouch",
      agendaColor: "Calendar colour",
      status: "Status",
      unassigned: "Not assigned yet",
      statusOptions: {
        GEPLAND: "Planned",
        VOLTOOID: "Completed",
        GEANNULEERD: "Cancelled",
        NIET_GEKOMEN: "No-show"
      },
      completeHint:
        "Finish this appointment via Register service and deduct package. That way the service record, package and stamp card are processed correctly.",
      notesOptional: "Notes (optional)",
      notesPlaceholder: "For example client wants a warmer result or prefers the morning.",
      saveAppointment: "Save appointment",
      saving: "Saving...",
      durations: {
        "15": "15 minutes",
        "30": "30 minutes",
        "45": "45 minutes",
        "60": "60 minutes",
        "90": "90 minutes",
        "120": "120 minutes",
        "150": "150 minutes",
        "180": "180 minutes"
      }
    }
  },
  de: {
    label: "Terminbuch",
    title: "Tagesansicht",
    subtitle: "Plane Termine pro Tag und behalte Kundschaft, Mitarbeitende und Status übersichtlich im Blick.",
    date: "Datum",
    stylist: "Mitarbeitende",
    allStylists: "Alle Mitarbeitenden",
    filter: "Filtern",
    previousDay: "Vorheriger Tag",
    nextDay: "Nächster Tag",
    appointmentsOn: "Termine am {date}",
    teamViewText: "Teamansicht mit einer Spalte pro Mitarbeitendem für Salons mit mehreren Behandlungen gleichzeitig.",
    listViewText: "Einfache Tagesübersicht mit Kundschaft, Behandlung, Mitarbeitendem und Status.",
    noAppointmentsForDay: "Für diesen Tag und diese Filterkombination wurden keine Termine gefunden.",
    treatment: "Behandlung",
    duration: "Dauer",
    durationValue: "{count} Minuten",
    stylistLabel: "Mitarbeitende",
    statusLabel: "Status",
    notes: "Notizen",
    unassigned: "Noch nicht zugewiesen",
    edit: "Bearbeiten",
    openCompletedTreatment: "Abgeschlossene Behandlung öffnen",
    registerTreatmentAndDeduct: "Behandlung erfassen und abbuchen",
    toClientFile: "Zur Kundenkartei",
    deleteAppointmentConfirm: "Möchtest du den Termin {naam} wirklich löschen?",
    delete: "Löschen",
    newAppointment: "Neuer Termin",
    newAppointmentText:
      "Plane schnell einen neuen Termin für eine bestehende Kundin oder einen bestehenden Kunden. Das ist bewusst ein leichtes Terminbuch ohne schweren Planer.",
    addCustomerFirst: "Lege zuerst eine Kundin oder einen Kunden an, bevor du einen Termin planen kannst.",
    editAppointmentTitle: "Termin bearbeiten",
    editAppointmentText: "Bearbeite diesen Termin für {customerName}, ohne die Tagesübersicht zu verlassen.",
    backToAgenda: "Zurück zum Terminbuch",
    reminderCopy: "Erinnerung kopieren",
    openWhatsApp: "In WhatsApp öffnen",
    views: {
      list: "Liste",
      team: "Team"
    },
    teamGrid: {
      scrollHint: "Nach rechts scrollen für mehr Mitarbeitende",
      time: "Zeit",
      unassigned: "Noch nicht zugewiesen",
      minutes: "{count} Min"
    },
    status: {
      GEPLAND: "Geplant",
      VOLTOOID: "Abgeschlossen",
      GEANNULEERD: "Storniert",
      NIET_GEKOMEN: "Nicht erschienen"
    },
    form: {
      addCustomerInlineTitle: "Neue Kundin / neuen Kunden direkt hinzufügen",
      addCustomerInlineText:
        "So musst du das Terminbuch nicht verlassen. Nach dem Speichern wird die Kundin oder der Kunde automatisch ausgewählt.",
      quickCustomerUnavailable: "Die schnelle Kundenanlage ist hier nicht verfügbar.",
      name: "Name",
      phone: "Telefonnummer",
      address: "Adresse",
      addressPlaceholder: "Zum Beispiel Straße, Hausnummer und Ort",
      addCustomer: "Kundin / Kunden hinzufügen",
      addingCustomer: "Hinzufügen...",
      customer: "Kunde",
      close: "Schließen",
      newCustomer: "Neue Kundin / neuer Kunde",
      chooseCustomer: "Kundin / Kunden wählen",
      customerHint: "Noch nicht im System? Direkt hier anlegen und dann weiterplanen.",
      stylistOptional: "Mitarbeitende (optional)",
      startTime: "Startzeit",
      duration: "Dauer",
      endTime: "Endzeit",
      treatment: "Behandlung",
      treatmentPlaceholder: "Zum Beispiel Ansatz färben",
      agendaColor: "Farbe im Terminbuch",
      status: "Status",
      unassigned: "Noch nicht zugewiesen",
      statusOptions: {
        GEPLAND: "Geplant",
        VOLTOOID: "Abgeschlossen",
        GEANNULEERD: "Storniert",
        NIET_GEKOMEN: "Nicht erschienen"
      },
      completeHint:
        "Schließe diesen Termin über Behandlung erfassen und abbuchen ab. So werden Behandlung, Paket und Stempelkarte korrekt verarbeitet.",
      notesOptional: "Notizen (optional)",
      notesPlaceholder: "Zum Beispiel Kundin wünscht ein wärmeres Ergebnis oder lieber morgens.",
      saveAppointment: "Termin speichern",
      saving: "Speichern...",
      durations: {
        "15": "15 Minuten",
        "30": "30 Minuten",
        "45": "45 Minuten",
        "60": "60 Minuten",
        "90": "90 Minuten",
        "120": "120 Minuten",
        "150": "150 Minuten",
        "180": "180 Minuten"
      }
    }
  }
} as const;
