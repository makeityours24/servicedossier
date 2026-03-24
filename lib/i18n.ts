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
    heroKicker: "Digitaal klantdossier voor salons en behandelstudio's",
    heroTitle: "Alles van je klant op een plek die je team echt gebruikt.",
    heroSubtitle:
      "SalonDossier helpt kapsalons, massagesalons en schoonheidsspecialisten om behandelingen, afspraken, pakketten, digitale kaarten en behandelfoto's centraal vast te leggen en snel terug te vinden.",
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
    previewLabel: "Voorbeeld",
    previewTitle: "Zo voelt SalonDossier in de praktijk",
    previewText:
      "Geen stockbeelden, maar een snelle visuele indruk van de onderdelen die salons dagelijks gebruiken: klantdossier, agenda en pakketten.",
    previews: [
      {
        title: "Klantdossier",
        text: "Profielgegevens, behandelnotities en belangrijke aandachtspunten bij elkaar.",
        eyebrow: "Klantprofiel",
        lines: ["Eva Jansen", "Allergieën: parfumvrij", "Laatste notitie: toner koeler houden"]
      },
      {
        title: "Dagagenda",
        text: "Snel zien wie wanneer ingepland staat en welke behandeling loopt.",
        eyebrow: "Vandaag",
        lines: ["09:30 Mila · gezichtsbehandeling", "11:00 Noor · ontspanningsmassage", "14:00 Eva · uitgroei kleuren"]
      },
      {
        title: "Pakketten",
        text: "Open kaarten en resterende beurten direct zichtbaar aan de balie.",
        eyebrow: "Actieve kaarten",
        lines: ["5x massage · 2 over", "10x brows · 6 over", "6x toner · 1 over"]
      }
    ],
    branchesLabel: "Branches",
    branchesTitle: "Gemaakt voor behandelaars die met terugkerende klanten werken",
    branchesText:
      "SalonDossier is gestart vanuit kapsalons, maar de kern werkt ook goed voor massage en beauty. Per salon kies je een brancheprofiel zodat terminologie, profielvelden en standaardaccenten beter aansluiten.",
    branches: [
      {
        title: "Kapsalons",
        text: "Met kleurrecepten, haartype, haarkleur, behandelfoto's en teamplanning."
      },
      {
        title: "Massagesalons",
        text: "Met klachtengebieden, drukvoorkeur, behandelnotities, pakketten en terugkerende sessies."
      },
      {
        title: "Schoonheidsspecialisten",
        text: "Met huidtype, huidconditie, behandelnotities, productadvies en voortgangsfoto's."
      }
    ],
    pricingLabel: "Prijzen",
    pricingTitle: "Eenvoudige prijzen voor salons die overzicht willen",
    pricingText:
      "SalonDossier is bedoeld voor salons die klantdossiers, behandelingen, kleurrecepten, afspraken, pakketten, digitale stempelkaarten en behandelfoto's centraal willen beheren, zonder een zwaar en duur alles-in-één systeem.",
    processLabel: "Zo start je",
    processTitle: "Geen koude checkout, maar eerst kort samen afstemmen",
    processText:
      "SalonDossier start nu bewust met een korte intake en inrichting. Zo kijken we eerst of het goed past, spreken we de opstartkosten af en richten we de salon netjes in voordat je live gaat.",
    processSteps: [
      {
        title: "1. Aanvraag of demo",
        text: "Je laat weten dat je interesse hebt of eerst een korte demo wilt zien."
      },
      {
        title: "2. Kort contact",
        text: "We bespreken je team, jullie werkwijze, stempelkaarten en wat je als eerste goed wilt hebben."
      },
      {
        title: "3. Inrichting",
        text: "We zetten je salon goed neer en helpen waar nodig met basisinstellingen, pakketten en teamgebruik."
      },
      {
        title: "4. Livegang",
        text: "Daarna ontvang je de inloggegevens en kun je rustig starten met begeleiding."
      }
    ],
    processNote:
      "De eenmalige opstartkosten zijn bedoeld voor inrichting, uitleg en een zachte livegang. Daarom loopt starten nu nog via aanvraag en contact, niet via directe online betaling.",
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
    viewGuide: "Bekijk startgids",
    startRequest: "Startaanvraag sturen",
    guideLabel: "Startgids",
    guideTitle: "Wil je weten hoe de inrichting loopt?",
    guideText:
      "We hebben een duidelijke handout gemaakt voor de eerste inrichting, het overzetten van kaarten en de eerste week werken met SalonDossier.",
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
    heroKicker: "Digital client records for salons and treatment studios",
    heroTitle: "Everything about every client in one place your team will actually keep using.",
    heroSubtitle:
      "SalonDossier helps hair salons, massage studios and beauty professionals keep treatments, appointments, packages, digital loyalty cards and treatment photos together in one clear workflow.",
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
      "A quick demo makes it clear right away: SalonDossier does more than store client details. It connects formulas, packages, appointments and photos in one practical flow.",
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
        text: "Work with multiple team members, plan appointments per stylist or therapist, sell packages or loyalty cards and turn an appointment straight into a service record."
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
    previewLabel: "Preview",
    previewTitle: "How SalonDossier feels in daily use",
    previewText:
      "Not stock photos, but a quick visual impression of the parts teams use every day: client records, the appointment book and packages.",
    previews: [
      {
        title: "Client record",
        text: "Profile details, treatment notes and key attention points in one place.",
        eyebrow: "Client profile",
        lines: ["Eva Jansen", "Allergies: fragrance free", "Latest note: keep toner cooler"]
      },
      {
        title: "Daily schedule",
        text: "Quickly see who is booked when and which service is running.",
        eyebrow: "Today",
        lines: ["09:30 Mila · facial treatment", "11:00 Noor · relaxation massage", "14:00 Eva · root colour"]
      },
      {
        title: "Packages",
        text: "Open cards and remaining visits visible right away at the desk.",
        eyebrow: "Active cards",
        lines: ["5x massage · 2 left", "10x brows · 6 left", "6x toner · 1 left"]
      }
    ],
    branchesLabel: "Business types",
    branchesTitle: "Built for treatment businesses with returning clients",
    branchesText:
      "SalonDossier started in hair salons, but the same core workflow also fits massage and beauty businesses. Each salon can choose its own business profile so the wording, profile focus and defaults feel more natural.",
    branches: [
      {
        title: "Hair salons",
        text: "With colour formulas, hair details, treatment photos and team planning."
      },
      {
        title: "Massage salons",
        text: "With focus areas, pressure preferences, treatment notes, packages and repeat sessions."
      },
      {
        title: "Beauty professionals",
        text: "With skin type, skin condition, treatment notes, product advice and progress photos."
      }
    ],
    pricingLabel: "Pricing",
    pricingTitle: "Simple pricing for salons that want clarity",
    pricingText:
      "SalonDossier is built for salons that want client records, services, colour formulas, appointments, packages, digital loyalty cards and treatment photos in one place, without the weight of a large all-in-one system.",
    processLabel: "How onboarding works",
    processTitle: "No cold checkout, but a short intake first",
    processText:
      "SalonDossier starts with a short intake and setup session. That way we can first check whether it fits your salon, agree on the setup fee and prepare your account properly before you go live.",
    processSteps: [
      {
        title: "1. Request or demo",
        text: "You let us know you are interested or want to see a short demo first."
      },
      {
        title: "2. Short call",
        text: "We discuss your team, your workflow, your stamp cards and what needs to work first."
      },
      {
        title: "3. Setup",
        text: "We prepare your salon and help with the basic settings, packages and team usage."
      },
      {
        title: "4. Launch",
        text: "After that you receive the login details and can start with guidance."
      }
    ],
    processNote:
      "The one-time setup fee covers setup, walkthrough and a calm launch. That is why getting started currently begins with a request and short contact first, not direct online checkout.",
    demoRequestLabel: "Request a demo",
    demoRequestTitle: "See in 15 minutes how SalonDossier could fit your salon.",
    demoRequestText:
      "We briefly walk through your workflow and show how client records, appointments, packages, loyalty cards and treatment photos fit your way of working.",
    demoSteps: [
      { title: "1. Short intake", text: "We discuss how your salon works today and where time or clarity is currently lost." },
      { title: "2. Focused demo", text: "You only see the parts that matter for your salon and team." },
      { title: "3. Decide together", text: "We check whether SalonDossier already fits well or what is still missing." }
    ],
    requestDemo: "Request a demo",
    sendEmail: "Send an email",
    viewPricing: "View pricing",
    viewGuide: "View setup guide",
    startRequest: "Send start request",
    guideLabel: "Setup guide",
    guideTitle: "Want to know how onboarding works?",
    guideText:
      "We created a practical handout for your initial setup, carrying over existing cards and getting through the first week with confidence.",
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
          "packages and digital loyalty cards",
          "treatment photos",
          "regular updates and support"
        ]
      },
      {
        name: "SalonDossier Plus",
        price: "€49",
        period: "per month",
        audience: "For salons with multiple staff members.",
        features: [
          "everything in Start",
          "full team access",
          "team appointment book",
          "priority support",
          "early access to new improvements",
          "extra guidance"
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
          "guided walkthrough of the key features",
          "support during launch"
        ]
      }
    ]
  },
  de: {
    heroKicker: "Digitale Kundenkartei für Salons und Behandlungsstudios",
    heroTitle: "Alles über deine Kundschaft an einem Ort, mit dem dein Team wirklich arbeitet.",
    heroSubtitle:
      "SalonDossier hilft Friseursalons, Massagestudios und Kosmetikinstituten dabei, Behandlungen, Termine, Pakete, digitale Treuekarten und Behandlungsfotos zentral festzuhalten und schnell wiederzufinden.",
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
      "In einer kurzen Demo wird sofort klar: SalonDossier speichert nicht nur Kundendaten, sondern verbindet Rezepte, Pakete, Termine und Fotos in einem stimmigen Ablauf.",
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
        text: "Arbeite mit mehreren Mitarbeitenden, plane Termine pro Stylistin, Therapeut oder Behandlerin, verkaufe Pakete oder Treuekarten und überführe einen Termin direkt in eine Behandlung."
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
    previewLabel: "Einblick",
    previewTitle: "So fühlt sich SalonDossier im Alltag an",
    previewText:
      "Keine Stockfotos, sondern ein kurzer visueller Eindruck der Bereiche, mit denen Teams täglich arbeiten: Kundenkartei, Terminbuch und Pakete.",
    previews: [
      {
        title: "Kundenkartei",
        text: "Profildaten, Behandlungsnotizen und wichtige Hinweise an einem Ort.",
        eyebrow: "Kundenprofil",
        lines: ["Eva Jansen", "Allergien: parfumfrei", "Letzte Notiz: Toner kühler halten"]
      },
      {
        title: "Tagesplanung",
        text: "Schnell sehen, wer wann eingeplant ist und welche Behandlung läuft.",
        eyebrow: "Heute",
        lines: ["09:30 Mila · Gesichtsbehandlung", "11:00 Noor · Entspannungsmassage", "14:00 Eva · Ansatz färben"]
      },
      {
        title: "Pakete",
        text: "Offene Karten und verbleibende Besuche direkt am Empfang sichtbar.",
        eyebrow: "Aktive Karten",
        lines: ["5x Massage · 2 offen", "10x Brows · 6 offen", "6x Toner · 1 offen"]
      }
    ],
    branchesLabel: "Branchen",
    branchesTitle: "Für Behandlungsbetriebe mit wiederkehrender Kundschaft gemacht",
    branchesText:
      "SalonDossier wurde für Friseursalons entwickelt, aber der Kern passt genauso gut zu Massage und Beauty. Pro Salon lässt sich ein Branchenprofil wählen, damit Sprache, Profilfokus und Standards besser zum Betrieb passen.",
    branches: [
      {
        title: "Friseursalons",
        text: "Mit Farbrezepten, Haarinfos, Behandlungsfotos und Teamplanung."
      },
      {
        title: "Massagesalons",
        text: "Mit Fokusbereichen, Druckvorlieben, Behandlungsnotizen, Paketen und wiederkehrenden Terminen."
      },
      {
        title: "Kosmetikinstitute",
        text: "Mit Hauttyp, Hautbild, Behandlungsnotizen, Produktempfehlungen und Verlaufsfotos."
      }
    ],
    pricingLabel: "Preise",
    pricingTitle: "Einfache Preise für Salons, die Übersicht wollen",
    pricingText:
      "SalonDossier ist für Salons gedacht, die Kundenkartei, Behandlungen, Farbrezepte, Termine, Pakete, digitale Treuekarten und Behandlungsfotos zentral verwalten möchten, ohne ein schweres All-in-One-System.",
    processLabel: "So startest du",
    processTitle: "Kein kalter Checkout, sondern erst kurz gemeinsam abstimmen",
    processText:
      "SalonDossier startet bewusst mit einem kurzen Gespräch und einer begleiteten Einrichtung. So prüfen wir zuerst, ob es zu deinem Salon passt, sprechen die Einrichtungskosten ab und richten alles sauber ein, bevor ihr live geht.",
    processSteps: [
      {
        title: "1. Anfrage oder Demo",
        text: "Du meldest dich mit Interesse oder möchtest zuerst eine kurze Demo sehen."
      },
      {
        title: "2. Kurzer Kontakt",
        text: "Wir besprechen dein Team, euren Ablauf, eure Stempelkarten und was zuerst gut funktionieren muss."
      },
      {
        title: "3. Einrichtung",
        text: "Wir richten deinen Salon ein und helfen bei Grundeinstellungen, Paketen und Teamnutzung."
      },
      {
        title: "4. Start",
        text: "Danach erhältst du die Zugangsdaten und kannst mit Begleitung loslegen."
      }
    ],
    processNote:
      "Die einmaligen Einrichtungskosten decken Einrichtung, Einführung und einen ruhigen Start ab. Deshalb beginnt der Start aktuell über Anfrage und kurzen Kontakt statt über einen direkten Online-Checkout.",
    demoRequestLabel: "Demo anfragen",
    demoRequestTitle: "Sieh in 15 Minuten, wie SalonDossier zu deinem Salon passen kann.",
    demoRequestText:
      "Wir gehen kurz euren Ablauf durch und zeigen direkt, wie Kundenkartei, Termine, Pakete, Treuekarten und Behandlungsfotos dazu passen.",
    demoSteps: [
      { title: "1. Kurzes Gespräch", text: "Wir besprechen, wie ihr heute arbeitet und wo aktuell Zeit oder Übersicht verloren geht." },
      { title: "2. Gezielte Demo", text: "Du siehst nur die Teile, die für deinen Salon und dein Team relevant sind." },
      { title: "3. Gemeinsam bewerten", text: "Wir prüfen, ob SalonDossier schon gut passt oder was noch fehlt." }
    ],
    requestDemo: "Demo anfragen",
    sendEmail: "E-Mail senden",
    viewPricing: "Preise ansehen",
    viewGuide: "Startleitfaden ansehen",
    startRequest: "Startanfrage senden",
    guideLabel: "Startleitfaden",
    guideTitle: "Du willst wissen, wie die Einrichtung abläuft?",
    guideText:
      "Wir haben einen klaren Leitfaden für die erste Einrichtung, das Übernehmen bestehender Karten und die ersten Tage mit SalonDossier erstellt.",
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
          "Pakete und digitale Treuekarten",
          "Behandlungsfotos",
          "regelmäßige Updates und Support"
        ]
      },
      {
        name: "SalonDossier Plus",
        price: "€49",
        period: "pro Monat",
        audience: "Für Salons mit mehreren Mitarbeitenden.",
        features: [
          "alles aus Start",
          "voller Teamzugang",
          "Team-Terminbuch",
          "priorisierter Support",
          "früherer Zugang zu neuen Verbesserungen",
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

export const onboardingGuideDictionary = {
  nl: {
    kicker: "Startgids",
    title: "Zo richt je SalonDossier rustig en logisch in",
    subtitle:
      "Deze handout is bedoeld voor de eerste inrichting, het overzetten van bestaande klantinformatie en als naslag voor later als er opnieuw vragen zijn.",
    backHome: "Terug naar website",
    printGuide: "Print deze gids",
    requestDemo: "Vraag een demo aan",
    requestSetup: "Stuur een startaanvraag",
    prepLabel: "Vooraf klaarzetten",
    prepTitle: "Dit is handig om voor de inrichting bij de hand te hebben",
    prepItems: [
      "Naam van de salon, contactgegevens en eventueel je logo",
      "Teamleden die een eigen login nodig hebben",
      "Bestaande pakketten of stempelkaarten die je actief wilt overnemen",
      "Een paar voorbeeldbehandelingen of kleurrecepten die je vaak gebruikt",
      "Bestaande klantgegevens die je eerst wilt invoeren"
    ],
    setupLabel: "Inrichting in stappen",
    setupTitle: "Aanbevolen volgorde voor een rustige start",
    setupSteps: [
      {
        title: "1. Salon en team",
        text: "Zet eerst de saloninstellingen goed en voeg daarna de medewerkers toe die direct moeten kunnen inloggen."
      },
      {
        title: "2. Pakketten en kaarten",
        text: "Maak je pakkettypes of stempelkaarten aan voordat je ze aan klanten koppelt."
      },
      {
        title: "3. Eerste klanten",
        text: "Voeg de klanten toe die je snel nodig hebt en vul basisinformatie zoals haartype, haarkleur en allergieën aan."
      },
      {
        title: "4. Bestaande kaarten overnemen",
        text: "Gebruik bij vaste klanten de optie om een bestaande kaart over te nemen met alleen het resterende aantal beurten."
      },
      {
        title: "5. Eerste afspraken plannen",
        text: "Plan nieuwe afspraken, koppel direct de juiste klant en kies de behandelaar die de afspraak uitvoert."
      },
      {
        title: "6. Eerste behandeling vastleggen",
        text: "Werk vanuit de afspraak naar de behandeling, zodat notities, pakketafboeking en historie netjes bij elkaar blijven."
      }
    ],
    migrateLabel: "Bestaande werkwijze meenemen",
    migrateTitle: "Wat je niet allemaal handmatig hoeft te doen",
    migrateItems: [
      "Je hoeft oude stempeldatums niet terug te typen; neem alleen de huidige resterende stand over.",
      "Je hoeft niet eerst alle klanten volledig af te hebben voordat je begint; start met de klanten die je nu nodig hebt.",
      "Als een kaart ooit verkeerd is afgeboekt, kun je dat corrigeren via een gecontroleerde pakketcorrectie met reden."
    ],
    weekLabel: "Eerste week",
    weekTitle: "Hier letten we op tijdens de eerste live week",
    weekItems: [
      "Wordt elke afspraak via behandeling afgerond zodat de kaart goed wordt afgeboekt?",
      "Zijn teamleden duidelijk over waar zij klantnotities en foto’s terugvinden?",
      "Zijn actieve pakketten en resterende beurten goed zichtbaar voor de balie?",
      "Werkt de herinneringstekst of WhatsApp-flow prettig voor jullie?"
    ],
    supportLabel: "Later hulp nodig",
    supportTitle: "Ook na maanden of na een jaar kun je hierop terugvallen",
    supportItems: [
      "Mail je vraag of stuur een lijstje met wat onduidelijk is; dan kijken we gericht mee.",
      "Plan een korte opfrissessie als er nieuwe medewerkers zijn of jullie anders zijn gaan werken.",
      "Gebruik deze gids als basischecklist als je later opnieuw pakketten, teamleden of klantmigratie wilt aanpakken."
    ],
    closing:
      "SalonDossier is nu bewust ingericht als begeleide start. Zo zorgen we dat de eerste inrichting klopt en dat je later niet opnieuw hoeft te puzzelen."
  },
  en: {
    kicker: "Setup guide",
    title: "How to set up SalonDossier in a calm and practical way",
    subtitle:
      "This handout is meant for your initial setup, for carrying over existing client information and as a reference later on if questions come up again.",
    backHome: "Back to website",
    printGuide: "Print this guide",
    requestDemo: "Request a demo",
    requestSetup: "Send a start request",
    prepLabel: "Prepare first",
    prepTitle: "Helpful things to have ready before setup",
    prepItems: [
      "Salon name, contact details and optionally your logo",
      "Staff members who need their own login",
      "Existing packages or stamp cards you want to carry over",
      "A few example services or colour formulas you often use",
      "Existing client information you want to add first"
    ],
    setupLabel: "Setup steps",
    setupTitle: "Recommended order for a smooth start",
    setupSteps: [
      {
        title: "1. Salon and team",
        text: "Start with the salon settings and then add the team members who need access right away."
      },
      {
        title: "2. Packages and stamp cards",
        text: "Create your package or stamp card types before assigning them to clients."
      },
      {
        title: "3. First clients",
        text: "Add the clients you need first and fill in basics like hair type, hair colour and allergies."
      },
      {
        title: "4. Carry over existing cards",
        text: "For regular clients, use the carry-over option and only enter the remaining number of visits."
      },
      {
        title: "5. Plan first appointments",
        text: "Create new appointments, link the correct client right away and select the staff member who will handle it."
      },
      {
        title: "6. Record the first service",
        text: "Work from the appointment into the service record so notes, package deductions and history stay together."
      }
    ],
    migrateLabel: "Bring your current workflow with you",
    migrateTitle: "What you do not need to enter manually",
    migrateItems: [
      "You do not need to type in old stamp dates; just carry over the current remaining balance.",
      "You do not need to fully import every client before you start; begin with the clients you need now.",
      "If a card was deducted incorrectly, you can correct it with a controlled package correction and a reason."
    ],
    weekLabel: "First week",
    weekTitle: "What to pay attention to in the first live week",
    weekItems: [
      "Is every appointment completed through the service flow so loyalty cards are deducted correctly?",
      "Does the team clearly understand where to find client notes and photos?",
      "Are active packages and remaining visits visible enough for the front desk?",
      "Does the reminder text or WhatsApp flow feel practical for your team?"
    ],
    supportLabel: "Need help later",
    supportTitle: "You can still use this after months or after a year",
    supportItems: [
      "Email your question or a short list of what feels unclear and we will review it with you.",
      "Plan a short refresher session when new staff join or your workflow changes.",
      "Use this guide again as a checklist when you later revisit packages, team setup or client migration."
    ],
    closing:
      "SalonDossier is intentionally set up as a guided start. That way the first setup is done properly and you do not have to puzzle through it again later."
  },
  de: {
    kicker: "Startleitfaden",
    title: "So richtest du SalonDossier ruhig und sinnvoll ein",
    subtitle:
      "Dieser Leitfaden ist für die erste Einrichtung gedacht, für das Übernehmen bestehender Kundendaten und als Nachschlagehilfe, wenn später wieder Fragen auftauchen.",
    backHome: "Zurück zur Website",
    printGuide: "Leitfaden drucken",
    requestDemo: "Demo anfragen",
    requestSetup: "Startanfrage senden",
    prepLabel: "Vorab bereitlegen",
    prepTitle: "Das ist vor der Einrichtung hilfreich",
    prepItems: [
      "Salonname, Kontaktdaten und optional dein Logo",
      "Mitarbeitende, die einen eigenen Login brauchen",
      "Bestehende Pakete oder Stempelkarten, die übernommen werden sollen",
      "Ein paar Beispielbehandlungen oder Farbrezepte, die ihr oft nutzt",
      "Bestehende Kundendaten, die zuerst eingetragen werden sollen"
    ],
    setupLabel: "Einrichtung in Schritten",
    setupTitle: "Empfohlene Reihenfolge für einen ruhigen Start",
    setupSteps: [
      {
        title: "1. Salon und Team",
        text: "Lege zuerst die Salon-Einstellungen fest und füge danach die Mitarbeitenden hinzu, die direkt Zugriff brauchen."
      },
      {
        title: "2. Pakete und Stempelkarten",
        text: "Lege Paket- oder Stempelkartentypen an, bevor du sie Kundinnen und Kunden zuweist."
      },
      {
        title: "3. Erste Kundschaft",
        text: "Lege zuerst die Kundschaft an, die du direkt brauchst, und ergänze Grundlagen wie Haartyp, Haarfarbe und Allergien."
      },
      {
        title: "4. Bestehende Karten übernehmen",
        text: "Nutze bei Stammkundschaft die Übernahmefunktion und trage nur die aktuell verbleibenden Besuche ein."
      },
      {
        title: "5. Erste Termine planen",
        text: "Lege neue Termine an, verknüpfe direkt die richtige Kundin oder den richtigen Kunden und wähle die zuständige Person."
      },
      {
        title: "6. Erste Behandlung festhalten",
        text: "Arbeite vom Termin in die Behandlung, damit Notizen, Paketabbuchung und Historie sauber zusammenbleiben."
      }
    ],
    migrateLabel: "Bestehende Arbeitsweise mitnehmen",
    migrateTitle: "Was du nicht alles manuell eintragen musst",
    migrateItems: [
      "Alte Stempeldaten müssen nicht nachgetragen werden; übernimm nur den aktuellen Reststand.",
      "Du musst nicht erst alle Kundinnen und Kunden vollständig anlegen; starte mit denen, die du jetzt brauchst.",
      "Wenn eine Karte falsch abgebucht wurde, kannst du das über eine kontrollierte Paketkorrektur mit Begründung korrigieren."
    ],
    weekLabel: "Erste Woche",
    weekTitle: "Darauf achten wir in der ersten Live-Woche",
    weekItems: [
      "Wird jeder Termin über die Behandlung abgeschlossen, damit die Treuekarte korrekt abgebucht wird?",
      "Weiß das Team klar, wo Kundennotizen und Fotos zu finden sind?",
      "Sind aktive Pakete und verbleibende Besuche für den Empfang deutlich sichtbar?",
      "Fühlt sich der Erinnerungstext oder der WhatsApp-Ablauf für euch praktisch an?"
    ],
    supportLabel: "Später Hilfe nötig",
    supportTitle: "Darauf kannst du auch nach Monaten oder nach einem Jahr zurückgreifen",
    supportItems: [
      "Schicke deine Frage oder eine kurze Liste mit offenen Punkten per E-Mail, dann schauen wir gezielt mit.",
      "Plane eine kurze Auffrischung, wenn neue Mitarbeitende dazukommen oder sich euer Ablauf verändert hat.",
      "Nutze diesen Leitfaden später erneut als Checkliste, wenn ihr Pakete, Teamstruktur oder Kundenübernahme nochmals überarbeitet."
    ],
    closing:
      "SalonDossier ist bewusst als begleiteter Start aufgebaut. So sitzt die erste Einrichtung von Anfang an und ihr müsst später nicht wieder von vorn anfangen."
  }
} as const;

export const loginDictionary = {
  nl: {
    title: "Inloggen",
    subtitle: "Beheer je klanten, behandelingen en resultaten op een plek.",
    tenantActiveTitle: "Je logt in voor {salonNaam}",
    tenantActiveText: "De juiste salonomgeving is al geselecteerd. Gebruik hieronder alleen je e-mailadres en wachtwoord.",
    emailLabel: "E-mailadres",
    emailPlaceholder: "naam@salon.nl",
    passwordLabel: "Wachtwoord",
    loginLabel: "Inloggen",
    loginBusy: "Controleren...",
    formHint: "Gebruik het e-mailadres en wachtwoord van je salonaccount.",
    forgotPasswordLabel: "Wachtwoord vergeten?",
    forgotPasswordHref: "/wachtwoord-vergeten",
    pausedError: "Deze salon is tijdelijk gepauzeerd. Neem contact op met de beheerder.",
    notFoundError: "Deze saloncode is niet gevonden.",
    resetCompleted: "Je wachtwoord is opnieuw ingesteld. Log in met je nieuwe wachtwoord.",
    madeBy: "Gemaakt door"
  },
  en: {
    title: "Log in",
    subtitle: "Manage your clients, treatments and results in one place.",
    tenantActiveTitle: "You are logging in for {salonNaam}",
    tenantActiveText: "The correct salon workspace is already selected. Just enter your email address and password below.",
    emailLabel: "Email address",
    emailPlaceholder: "name@salon.com",
    passwordLabel: "Password",
    loginLabel: "Log in",
    loginBusy: "Checking...",
    formHint: "Use the email address and password of your salon account.",
    forgotPasswordLabel: "Forgot your password?",
    forgotPasswordHref: "/wachtwoord-vergeten",
    pausedError: "This salon is temporarily paused. Please contact the administrator.",
    notFoundError: "This salon code could not be found.",
    resetCompleted: "Your password has been reset. Log in with your new password.",
    madeBy: "Made by"
  },
  de: {
    title: "Anmelden",
    subtitle: "Behalte Kundschaft, Behandlungen und Ergebnisse an einem Ort im Überblick.",
    tenantActiveTitle: "Du meldest dich für {salonNaam} an",
    tenantActiveText: "Die richtige Salonumgebung ist bereits ausgewählt. Gib unten nur noch deine E-Mail-Adresse und dein Passwort ein.",
    emailLabel: "E-Mail-Adresse",
    emailPlaceholder: "name@salon.de",
    passwordLabel: "Passwort",
    loginLabel: "Anmelden",
    loginBusy: "Prüfen...",
    formHint: "Nutze die E-Mail-Adresse und das Passwort deines Salonkontos.",
    forgotPasswordLabel: "Passwort vergessen?",
    forgotPasswordHref: "/wachtwoord-vergeten",
    pausedError: "Dieser Salon ist vorübergehend pausiert. Bitte kontaktiere die Verwaltung.",
    notFoundError: "Dieser Saloncode wurde nicht gefunden.",
    resetCompleted: "Dein Passwort wurde zurückgesetzt. Melde dich mit deinem neuen Passwort an.",
    madeBy: "Erstellt von"
  }
} as const;

export const platformLoginDictionary = {
  nl: {
    title: "Platform login",
    subtitle: "Alleen voor intern platformbeheer en onboarding van nieuwe salons.",
    emailLabel: "E-mailadres",
    emailPlaceholder: "naam@miy24.nl",
    passwordLabel: "Wachtwoord",
    loginLabel: "Inloggen",
    loginBusy: "Controleren...",
    formHint: "Gebruik alleen je centrale platformaccount.",
    forgotPasswordLabel: "Wachtwoord vergeten?",
    forgotPasswordHref: "/wachtwoord-vergeten"
  },
  en: {
    title: "Platform login",
    subtitle: "For internal platform management and onboarding of new salons only.",
    emailLabel: "Email address",
    emailPlaceholder: "name@miy24.nl",
    passwordLabel: "Password",
    loginLabel: "Log in",
    loginBusy: "Checking...",
    formHint: "Use your central platform account only.",
    forgotPasswordLabel: "Forgot your password?",
    forgotPasswordHref: "/wachtwoord-vergeten"
  },
  de: {
    title: "Plattform-Login",
    subtitle: "Nur für interne Plattformverwaltung und das Onboarding neuer Salons.",
    emailLabel: "E-Mail-Adresse",
    emailPlaceholder: "name@miy24.nl",
    passwordLabel: "Passwort",
    loginLabel: "Anmelden",
    loginBusy: "Prüfen...",
    formHint: "Nutze dafür ausschließlich dein zentrales Plattformkonto.",
    forgotPasswordLabel: "Passwort vergessen?",
    forgotPasswordHref: "/wachtwoord-vergeten"
  }
} as const;

export const passwordResetDictionary = {
  nl: {
    requestTitle: "Wachtwoord opnieuw instellen",
    requestSubtitle:
      "Vul het e-mailadres van je account in. Als het bekend is, sturen we een resetlink.",
    emailLabel: "E-mailadres",
    requestLabel: "Resetlink versturen",
    requestBusy: "Verzenden...",
    requestSuccess:
      "Als dit account bestaat, is er een resetlink verstuurd. Controleer je inbox en spammap.",
    requestBack: "Terug naar login",
    completeTitle: "Kies een nieuw wachtwoord",
    completeSubtitle:
      "Deze resetlink is eenmalig en blijft 60 minuten geldig. Kies hieronder een nieuw wachtwoord.",
    newPasswordLabel: "Nieuw wachtwoord",
    confirmPasswordLabel: "Bevestig nieuw wachtwoord",
    completeLabel: "Wachtwoord opslaan",
    completeBusy: "Opslaan...",
    invalidToken: "Deze resetlink is ongeldig of verlopen.",
    backToLogin: "Terug naar login"
  },
  en: {
    requestTitle: "Reset your password",
    requestSubtitle:
      "Enter the email address of your account. If it exists, we will send a reset link.",
    emailLabel: "Email address",
    requestLabel: "Send reset link",
    requestBusy: "Sending...",
    requestSuccess:
      "If this account exists, a reset link has been sent. Please check your inbox and spam folder.",
    requestBack: "Back to login",
    completeTitle: "Choose a new password",
    completeSubtitle:
      "This reset link can only be used once and stays valid for 60 minutes. Choose a new password below.",
    newPasswordLabel: "New password",
    confirmPasswordLabel: "Confirm new password",
    completeLabel: "Save password",
    completeBusy: "Saving...",
    invalidToken: "This reset link is invalid or has expired.",
    backToLogin: "Back to login"
  },
  de: {
    requestTitle: "Passwort zurücksetzen",
    requestSubtitle:
      "Gib die E-Mail-Adresse deines Kontos ein. Falls sie bekannt ist, senden wir einen Reset-Link.",
    emailLabel: "E-Mail-Adresse",
    requestLabel: "Reset-Link senden",
    requestBusy: "Senden...",
    requestSuccess:
      "Falls dieses Konto existiert, wurde ein Reset-Link versendet. Bitte prüfe auch deinen Spam-Ordner.",
    requestBack: "Zurück zum Login",
    completeTitle: "Neues Passwort wählen",
    completeSubtitle:
      "Dieser Reset-Link ist nur einmal gültig und läuft nach 60 Minuten ab. Wähle unten ein neues Passwort.",
    newPasswordLabel: "Neues Passwort",
    confirmPasswordLabel: "Neues Passwort bestätigen",
    completeLabel: "Passwort speichern",
    completeBusy: "Speichern...",
    invalidToken: "Dieser Reset-Link ist ungültig oder abgelaufen.",
    backToLogin: "Zurück zum Login"
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
    newVisit: "Samengesteld bezoek",
    newAppointmentText:
      "Plan snel een nieuwe afspraak voor een bestaande klant. Dit is bewust een lichte dagagenda zonder zware planner.",
    newVisitText:
      "Gebruik dit wanneer één klant in hetzelfde bezoek meerdere behandelingen of behandelaars heeft.",
    addCustomerFirst: "Voeg eerst een klant toe voordat je een afspraak kunt plannen.",
    groupedVisitBadge: "Samengesteld bezoek",
    groupedVisitInfo: "Dit onderdeel hoort bij een samengesteld bezoek en heeft nog geen aparte bewerkpagina.",
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
      saveVisit: "Samengesteld bezoek opslaan",
      savingVisit: "Bezoek opslaan...",
      visitStatus: "Status van bezoek",
      visitNotes: "Algemene notities voor dit bezoek",
      visitNotesPlaceholder: "Bijvoorbeeld klant combineert kleuren met epileren in hetzelfde bezoek.",
      addSegment: "Onderdeel toevoegen",
      removeSegment: "Onderdeel verwijderen",
      segmentLabel: "Onderdelen",
      segmentHelp: "Geef per onderdeel de behandeling, behandelaar, tijd en duur op.",
      visitHelp:
        "Gebruik dit voor één klantbezoek met meerdere onderdelen, bijvoorbeeld kleuren door collega A en epileren door collega B.",
      segmentCount: "{count} onderdeel(en) in dit bezoek",
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
    newVisit: "Combined visit",
    newAppointmentText:
      "Quickly add a new appointment for an existing client. This is intentionally a lightweight appointment book, not a heavy planner.",
    newVisitText:
      "Use this when one client visit includes multiple services or different stylists in the same booking.",
    addCustomerFirst: "Add a client first before you can book an appointment.",
    groupedVisitBadge: "Combined visit",
    groupedVisitInfo: "This segment belongs to a combined visit and does not have its own edit page yet.",
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
      saveVisit: "Save combined visit",
      savingVisit: "Saving visit...",
      visitStatus: "Visit status",
      visitNotes: "General notes for this visit",
      visitNotesPlaceholder: "For example the client combines colouring with brow shaping in one visit.",
      addSegment: "Add segment",
      removeSegment: "Remove segment",
      segmentLabel: "Segments",
      segmentHelp: "Set the service, stylist, time and duration for each segment.",
      visitHelp:
        "Use this for one client visit with multiple segments, for example colouring by stylist A and brows by stylist B.",
      segmentCount: "{count} segment(s) in this visit",
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
    newVisit: "Kombinierter Besuch",
    newAppointmentText:
      "Plane schnell einen neuen Termin für eine bestehende Kundin oder einen bestehenden Kunden. Das ist bewusst ein leichtes Terminbuch ohne schweren Planer.",
    newVisitText:
      "Nutze dies, wenn ein Kundenbesuch mehrere Behandlungen oder unterschiedliche Mitarbeitende im selben Besuch umfasst.",
    addCustomerFirst: "Lege zuerst eine Kundin oder einen Kunden an, bevor du einen Termin planen kannst.",
    groupedVisitBadge: "Kombinierter Besuch",
    groupedVisitInfo: "Dieser Teil gehört zu einem kombinierten Besuch und hat noch keine eigene Bearbeitungsseite.",
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
      saveVisit: "Kombinierten Besuch speichern",
      savingVisit: "Besuch wird gespeichert...",
      visitStatus: "Status des Besuchs",
      visitNotes: "Allgemeine Notizen zu diesem Besuch",
      visitNotesPlaceholder:
        "Zum Beispiel Kundin kombiniert Färben mit Augenbrauen oder einer anderen Zusatzbehandlung im selben Besuch.",
      addSegment: "Teil hinzufügen",
      removeSegment: "Teil entfernen",
      segmentLabel: "Teile",
      segmentHelp: "Lege pro Teil Behandlung, Mitarbeitende, Zeit und Dauer fest.",
      visitHelp:
        "Nutze dies für einen Kundenbesuch mit mehreren Teilen, zum Beispiel Färben durch Mitarbeitende A und Augenbrauen durch Mitarbeitende B.",
      segmentCount: "{count} Teil(e) in diesem Besuch",
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

export const customerDictionary = {
  nl: {
    customerRecord: "Klantdossier",
    editCustomer: "Klant bewerken",
    scheduleAppointment: "Afspraak plannen",
    print: "Afdrukken",
    exportCsv: "CSV export",
    deleteCustomer: "Klant verwijderen",
    deletingCustomer: "Verwijderen...",
    deleteCustomerConfirm:
      "Weet je zeker dat je {naam} wilt verwijderen? Alle behandelingen van deze klant worden ook verwijderd.",
    upcomingAppointments: "Komende afspraken",
    upcomingAppointmentsText: "Snel zicht op wat er voor deze klant al gepland staat.",
    noUpcomingAppointments: "Voor deze klant staan nog geen komende afspraken gepland.",
    newAppointment: "Nieuwe afspraak",
    openAppointment: "Open afspraak",
    notAssigned: "Nog niet toegewezen",
    reminderLabels: {
      copied: "Herinnering gekopieerd",
      copy: "Herinnering kopiëren",
      openWhatsApp: "Open in WhatsApp"
    },
    profileTitle: "Profiel en haarinfo",
    profileText: "Werk hier snel geboortedatum, haartype, haarkleur, allergieen en stylistnotities bij.",
    editProfile: "Profiel bewerken",
    birthDate: "Geboortedatum",
    hairType: "Haartype",
    hairColor: "Haarkleur",
    allergies: "Allergieen",
    notFilledInYet: "Nog niet ingevuld",
    stylistNotes: "Notities stylist",
    latestTreatment: "Laatste behandeling",
    stylist: "Behandelaar",
    recipe: "Recept",
    notes: "Notities",
    loadLatestRecipe: "Laatste recept in formulier laden",
    editLatestTreatment: "Laatste behandeling bewerken",
    historyTitle: "Behandelgeschiedenis",
    historyText: "Chronologisch overzicht met filter op datum of medewerker.",
    fromDate: "Van datum",
    toDate: "Tot datum",
    employee: "Medewerker",
    employeePlaceholder: "Bijvoorbeeld Sanne",
    filter: "Filteren",
    noTreatmentsForFilters: "Er zijn nog geen behandelingen gevonden voor deze filters.",
    treatmentPhotos: "Foto's bij deze behandeling",
    loadRecipeIntoForm: "Recept in formulier laden",
    editTreatment: "Behandeling bewerken",
    deleteTreatment: "Behandeling verwijderen",
    deletingTreatment: "Verwijderen...",
    deleteTreatmentConfirm: "Weet je zeker dat je behandeling {naam} wilt verwijderen?",
    packagesTitle: "Pakketten",
    packageSummaryTitle: "Actieve pakketstand",
    packageBannerTitle: "Open kaarten en bundels",
    packageBannerEmpty: "Geen actieve kaarten of bundels voor deze klant.",
    packageBannerText: "{cards} actieve kaarten · {sessions} open beurten",
    packageBannerView: "Bekijk pakketten",
    packageBannerAdd: "Nieuwe kaart toevoegen",
    packageSummaryText: "Direct zichtbaar hoeveel kaarten en bundels deze klant nog open heeft.",
    activeCards: "Actieve kaarten",
    openSessionsTotal: "Open beurten totaal",
    openSessionsHint: "Nog af te boeken",
    activePackageTypes: "Actieve soorten",
    stampCardsLabel: "stempelkaarten",
    bundlePackagesLabel: "bundels",
    packageSummaryNone: "Geen actieve kaarten of bundels",
    packagesText:
      "Verkoop hier bundels of digitale stempelkaarten aan deze klant. Je kunt ook een bestaande papieren kaart overnemen door alleen de huidige resterende beurten in te voeren.",
    noPackages: "Deze klant heeft nog geen actieve of eerdere pakketten.",
    packageTreatment: "Behandeling",
    packageType: "Type",
    digitalStampCard: "Digitale stempelkaart",
    bundlePackage: "Bundelpakket",
    remaining: "Nog over",
    soldOn: "Verkocht op",
    packagePrice: "Pakketprijs",
    singlePrice: "Losse prijs",
    perSession: "per beurt",
    active: "Actief",
    activePackageCardLabel: "Actief pakket",
    remainingCounter: "{remaining} / {total} over",
    digitalStampCardTitle: "Digitale stempelkaart",
    stampedSummary: "{used} afgestempeld, {remaining} open",
    remainingShort: "{count} over",
    usedSession: "Gebruikte beurt",
    openSession: "Nog open",
    usageHistory: "Gebruiksgeschiedenis",
    restored: "Teruggezet",
    deducted: "Afgeboekt",
    sessionWord: "beurt",
    sessionsWord: "beurten",
    manualCorrection: "Handmatige correctie",
    unknown: "Onbekend",
    reason: "Reden",
    viewLinkedTreatment: "Gekoppelde behandeling bekijken",
    noUsageYet: "Nog geen beurten van dit pakket afgeboekt.",
    correctionTitle: "Correctie",
    correctionText:
      "Gebruik dit alleen als je een beurt vergeten bent af te boeken of juist moet terugzetten. De correctie blijft zichtbaar in de historie.",
    previousPackages: "Eerdere pakketten",
    previousPackagesSummary: "Bekijk eerdere pakketten en historie",
    status: "Status",
    used: "Verbruikt",
    fullyUsed: "Volledig gebruikt",
    packageStatus: {
      ACTIEF: "Actief",
      VOLLEDIG_GEBRUIKT: "Volledig gebruikt",
      GEANNULEERD: "Geannuleerd",
      VERLOPEN: "Verlopen"
    },
    sellPackageTitle: "Pakket verkopen",
    sellPackageText: "Kies een actief pakkettype van deze salon en koppel het direct aan deze klant.",
    noActivePackageTypes: "Er zijn nog geen actieve pakkettypes. Voeg eerst een pakket toe via Pakketten.",
    treatmentFormTitle: "Nieuwe behandeling registreren",
    treatmentFormText: "Voeg direct een nieuwe kleurbehandeling of andere behandeling toe aan dit dossier.",
    quickStartFromTemplate: "Snel starten vanuit een receptsjabloon:",
    clearForm: "Formulier leegmaken",
    recipeLoadedFromTreatment:
      "Recept geladen uit {date}. Controleer de velden en sla daarna als nieuwe behandeling op.",
    templateLoaded:
      "Sjabloon geladen: {name}. Controleer de velden en sla daarna als nieuwe behandeling op.",
    appointmentAlreadyConverted: "Van deze afspraak is al een behandeling gemaakt.",
    appointmentLoaded:
      "Afspraak geladen uit {date}. Sla op om deze afspraak als behandeling vast te leggen en eventuele stempelkaarten of pakketten af te boeken.",
    openCompletedTreatment: "Afgeronde behandeling openen",
    treatmentHelperFromPrevious:
      "De velden zijn vooringevuld vanuit een eerdere behandeling. Pas ze aan waar nodig en sla de nieuwe behandeling op.",
    treatmentHelperFromTemplate:
      "De velden zijn vooringevuld vanuit een receptsjabloon. Pas ze aan waar nodig en sla de nieuwe behandeling op.",
    customerFormNew: {
      label: "Nieuwe klant",
      title: "Klant registreren",
      subtitle:
        "Maak een nieuw klantdossier aan zodat behandelingen en kleurrecepten direct gekoppeld kunnen worden.",
      noteTitle: "Klantdossier zonder login",
      noteText:
        "Een klant die je hier aanmaakt krijgt geen eigen account om in te loggen. Gebruik deze pagina alleen voor klantgegevens, kleurrecepten en behandelgeschiedenis.",
      submit: "Klant opslaan",
      busy: "Opslaan..."
    },
    customerFormEdit: {
      label: "Klant bewerken",
      title: "Gegevens aanpassen",
      subtitle:
        "Werk hier ook geboortedatum, haartype, haarkleur, allergieen en notities van de stylist bij.",
      submit: "Wijzigingen opslaan",
      busy: "Opslaan..."
    },
    customerFormFields: {
      draftInfo: "Concept wordt lokaal bewaard zolang je bezig bent.",
      name: "Naam",
      phone: "Telefoonnummer",
      birthDate: "Geboortedatum",
      hairType: "Haartype",
      hairTypePlaceholder: "Bijvoorbeeld krullend, fijn, dik",
      hairColor: "Haarkleur",
      hairColorPlaceholder: "Bijvoorbeeld donkerblond, koper, zwart",
      address: "Adres",
      allergies: "Allergieen",
      allergiesPlaceholder: "Bijvoorbeeld gevoelig voor blondering, parfum of specifieke producten",
      stylistNotes: "Notities stylist",
      stylistNotesPlaceholder: "Bijvoorbeeld aandachtspunten, voorkeuren of belangrijke observaties",
      saveBusy: "Opslaan...",
      cancel: "Annuleren"
    },
    treatmentFormFields: {
      draftInfo: "Concept wordt lokaal bewaard zolang je bezig bent.",
      quickChoices: "Snelle keuze voor veelgebruikte behandelingen:",
      dateTime: "Datum en tijd",
      stylist: "Behandelaar",
      chooseStylist: "Kies een behandelaar",
      treatment: "Behandeling",
      treatmentPlaceholder: "Bijvoorbeeld uitgroei kleuren",
      recipe: "Recept",
      recipePlaceholder: "Bijvoorbeeld 7.0 + 7.1, 3% oxidatie, 25 minuten",
      notesOptional: "Notities (optioneel)",
      notesPlaceholder: "Extra opmerkingen of advies",
      deductPackageOptional: "Afboeken van pakket (optioneel)",
      noPackage: "Geen pakket gebruiken",
      stampCard: "stempelkaart",
      packageLabel: "pakket",
      saveBusy: "Opslaan...",
      soldOutSuggestionText: "Deze kaart is nu volledig gebruikt. Je kunt direct een nieuwe kaart toevoegen.",
      soldOutSuggestionLabel: "Nieuwe kaart toevoegen"
    },
    packageForm: {
      inputType: "Type invoer",
      newSoldPackage: "Nieuw verkocht pakket",
      carryOverCard: "Bestaande kaart overnemen",
      carryOverHelp:
        "Gebruik bestaande kaart overnemen als je een papieren stempelkaart of bundel met alleen de huidige stand wilt invoeren.",
      packageType: "Pakkettype",
      choosePackage: "Kies een pakket",
      stampCard: "digitale stempelkaart",
      bundlePackage: "bundelpakket",
      remainingSessions: "Nog resterende beurten",
      remainingSessionsPlaceholder: "Bijvoorbeeld 4",
      notesOptional: "Notities (optioneel)",
      carryOverNotesPlaceholder: "Bijvoorbeeld overgenomen van papieren stempelkaart.",
      soldNotesPlaceholder: "Bijvoorbeeld verkocht als bundel voor vaste klant.",
      takeOverCard: "Kaart overnemen",
      takingOver: "Overnemen...",
      sellPackage: "Pakket verkopen",
      selling: "Verkopen...",
      soldOutSuggestionText: "Deze kaart is nu volledig gebruikt. Je kunt direct een nieuwe kaart toevoegen.",
      soldOutSuggestionLabel: "Nieuwe kaart toevoegen"
    },
    correctionForm: {
      correction: "Correctie",
      deductManually: "Beurt handmatig afboeken",
      restoreSession: "Beurt terugzetten",
      sessionCount: "Aantal beurten",
      correctionReason: "Reden van correctie",
      reasonPlaceholder: "Bijvoorbeeld vergeten af te boeken op papieren kaart.",
      save: "Correctie opslaan",
      saving: "Opslaan...",
      soldOutSuggestionText: "Deze kaart is nu volledig gebruikt. Je kunt direct een nieuwe kaart toevoegen.",
      soldOutSuggestionLabel: "Nieuwe kaart toevoegen"
    },
    photoGallery: {
      empty: "Er zijn nog geen foto's aan deze behandeling gekoppeld.",
      before: "Voor",
      after: "Na",
      general: "Algemeen",
      altPhoto: "foto",
      delete: "Verwijderen",
      file: "Bestand",
      uploadedBy: "Geüpload door"
    },
    photoForm: {
      photo: "Foto",
      photoType: "Soort foto",
      before: "Voor",
      after: "Na",
      general: "Algemeen",
      noteOptional: "Notitie (optioneel)",
      notePlaceholder: "Bijvoorbeeld frontaal resultaat of beginsituatie bij intake.",
      consentHint:
        "Upload alleen foto's waarvoor de klant toestemming heeft gegeven. Toegestane formaten: JPG, PNG en WEBP tot 5 MB.",
      upload: "Foto uploaden",
      uploading: "Uploaden..."
    },
    editTreatmentPage: {
      label: "Behandeling bewerken",
      subtitle:
        "Pas deze behandeling aan zonder het klantdossier of de rest van de historie te verliezen.",
      backToDossier: "Terug naar dossier",
      saveTreatment: "Behandeling opslaan",
      treatmentPhotosTitle: "Foto's bij deze behandeling",
      treatmentPhotosText:
        "Voeg hier voor- en nafoto's toe als visuele dossieropbouw of bewijs bij een klacht.",
      uploadPhotoTitle: "Nieuwe foto uploaden",
      uploadPhotoText:
        "Upload eerst via de bewerkpagina, zodat de foto altijd direct aan de juiste behandeling gekoppeld blijft."
    }
  },
  en: {
    customerRecord: "Client record",
    editCustomer: "Edit client",
    scheduleAppointment: "Book appointment",
    print: "Print",
    exportCsv: "CSV export",
    deleteCustomer: "Delete client",
    deletingCustomer: "Deleting...",
    deleteCustomerConfirm:
      "Are you sure you want to delete {naam}? All treatments for this client will also be removed.",
    upcomingAppointments: "Upcoming appointments",
    upcomingAppointmentsText: "Quick visibility into what is already scheduled for this client.",
    noUpcomingAppointments: "There are no upcoming appointments scheduled for this client yet.",
    newAppointment: "New appointment",
    openAppointment: "Open appointment",
    notAssigned: "Not assigned yet",
    reminderLabels: {
      copied: "Reminder copied",
      copy: "Copy reminder",
      openWhatsApp: "Open in WhatsApp"
    },
    profileTitle: "Profile and hair details",
    profileText: "Quickly update date of birth, hair type, hair colour, allergies and stylist notes here.",
    editProfile: "Edit profile",
    birthDate: "Date of birth",
    hairType: "Hair type",
    hairColor: "Hair colour",
    allergies: "Allergies",
    notFilledInYet: "Not filled in yet",
    stylistNotes: "Stylist notes",
    latestTreatment: "Latest treatment",
    stylist: "Stylist",
    recipe: "Formula",
    notes: "Notes",
    loadLatestRecipe: "Load latest formula into form",
    editLatestTreatment: "Edit latest treatment",
    historyTitle: "Treatment history",
    historyText: "Chronological overview with filters by date or staff member.",
    fromDate: "From date",
    toDate: "To date",
    employee: "Staff member",
    employeePlaceholder: "For example Sanne",
    filter: "Filter",
    noTreatmentsForFilters: "No treatments were found for these filters yet.",
    treatmentPhotos: "Photos for this treatment",
    loadRecipeIntoForm: "Load formula into form",
    editTreatment: "Edit treatment",
    deleteTreatment: "Delete treatment",
    deletingTreatment: "Deleting...",
    deleteTreatmentConfirm: "Are you sure you want to delete treatment {naam}?",
    packagesTitle: "Packages",
    packageSummaryTitle: "Active package balance",
    packageBannerTitle: "Open cards and bundles",
    packageBannerEmpty: "No active cards or bundles for this client.",
    packageBannerText: "{cards} active cards · {sessions} open visits",
    packageBannerView: "View packages",
    packageBannerAdd: "Add new card",
    packageSummaryText: "See right away how many cards and bundles this client still has open.",
    activeCards: "Active cards",
    openSessionsTotal: "Open visits total",
    openSessionsHint: "Still to deduct",
    activePackageTypes: "Active types",
    stampCardsLabel: "stamp cards",
    bundlePackagesLabel: "bundles",
    packageSummaryNone: "No active cards or bundles",
    packagesText:
      "Sell packages or digital stamp cards to this client here. You can also carry over an existing paper card by entering only the current remaining visits.",
    noPackages: "This client has no active or previous packages yet.",
    packageTreatment: "Treatment",
    packageType: "Type",
    digitalStampCard: "Digital stamp card",
    bundlePackage: "Package bundle",
    remaining: "Remaining",
    soldOn: "Sold on",
    packagePrice: "Package price",
    singlePrice: "Single price",
    perSession: "per visit",
    active: "Active",
    activePackageCardLabel: "Active package",
    remainingCounter: "{remaining} / {total} left",
    digitalStampCardTitle: "Digital stamp card",
    stampedSummary: "{used} stamped, {remaining} open",
    remainingShort: "{count} left",
    usedSession: "Used visit",
    openSession: "Still open",
    usageHistory: "Usage history",
    restored: "Restored",
    deducted: "Deducted",
    sessionWord: "visit",
    sessionsWord: "visits",
    manualCorrection: "Manual correction",
    unknown: "Unknown",
    reason: "Reason",
    viewLinkedTreatment: "View linked treatment",
    noUsageYet: "No visits have been deducted from this package yet.",
    correctionTitle: "Correction",
    correctionText:
      "Use this only if you forgot to deduct a visit or need to add one back. The correction stays visible in the history.",
    previousPackages: "Previous packages",
    previousPackagesSummary: "View previous packages and history",
    status: "Status",
    used: "Used",
    fullyUsed: "Fully used",
    packageStatus: {
      ACTIEF: "Active",
      VOLLEDIG_GEBRUIKT: "Fully used",
      GEANNULEERD: "Cancelled",
      VERLOPEN: "Expired"
    },
    sellPackageTitle: "Sell package",
    sellPackageText: "Choose an active package type from this salon and link it directly to this client.",
    noActivePackageTypes: "There are no active package types yet. Add one first via Packages.",
    treatmentFormTitle: "Register new treatment",
    treatmentFormText: "Add a new colour service or other treatment directly to this client record.",
    quickStartFromTemplate: "Quick start from a formula template:",
    clearForm: "Clear form",
    recipeLoadedFromTreatment:
      "Formula loaded from {date}. Review the fields and then save it as a new treatment.",
    templateLoaded:
      "Template loaded: {name}. Review the fields and then save it as a new treatment.",
    appointmentAlreadyConverted: "A treatment has already been created from this appointment.",
    appointmentLoaded:
      "Appointment loaded from {date}. Save to register this appointment as a treatment and deduct any stamp cards or packages.",
    openCompletedTreatment: "Open completed treatment",
    treatmentHelperFromPrevious:
      "The fields are prefilled from an earlier treatment. Adjust where needed and save the new treatment.",
    treatmentHelperFromTemplate:
      "The fields are prefilled from a formula template. Adjust where needed and save the new treatment.",
    customerFormNew: {
      label: "New client",
      title: "Create client record",
      subtitle:
        "Create a new client record so treatments and colour formulas can be linked right away.",
      noteTitle: "Client record without login",
      noteText:
        "A client you create here does not get their own login account. Use this page only for client details, colour formulas and treatment history.",
      submit: "Save client",
      busy: "Saving..."
    },
    customerFormEdit: {
      label: "Edit client",
      title: "Update details",
      subtitle:
        "Update date of birth, hair type, hair colour, allergies and stylist notes here as well.",
      submit: "Save changes",
      busy: "Saving..."
    },
    customerFormFields: {
      draftInfo: "Draft is stored locally while you are working.",
      name: "Name",
      phone: "Phone number",
      birthDate: "Date of birth",
      hairType: "Hair type",
      hairTypePlaceholder: "For example curly, fine, thick",
      hairColor: "Hair colour",
      hairColorPlaceholder: "For example dark blonde, copper, black",
      address: "Address",
      allergies: "Allergies",
      allergiesPlaceholder: "For example sensitive to bleach, perfume or specific products",
      stylistNotes: "Stylist notes",
      stylistNotesPlaceholder: "For example focus points, preferences or important observations",
      saveBusy: "Saving...",
      cancel: "Cancel"
    },
    treatmentFormFields: {
      draftInfo: "Draft is stored locally while you are working.",
      quickChoices: "Quick choices for common treatments:",
      dateTime: "Date and time",
      stylist: "Stylist",
      chooseStylist: "Choose a stylist",
      treatment: "Treatment",
      treatmentPlaceholder: "For example root colour",
      recipe: "Formula",
      recipePlaceholder: "For example 7.0 + 7.1, 3% developer, 25 minutes",
      notesOptional: "Notes (optional)",
      notesPlaceholder: "Extra remarks or advice",
      deductPackageOptional: "Deduct package (optional)",
      noPackage: "Do not use a package",
      stampCard: "stamp card",
      packageLabel: "package",
      saveBusy: "Saving...",
      soldOutSuggestionText: "This card is now fully used. You can add a new card right away.",
      soldOutSuggestionLabel: "Add new card"
    },
    packageForm: {
      inputType: "Entry type",
      newSoldPackage: "New package sold",
      carryOverCard: "Carry over existing card",
      carryOverHelp:
        "Use carry over existing card if you want to add a paper stamp card or package with only the current remaining balance.",
      packageType: "Package type",
      choosePackage: "Choose a package",
      stampCard: "digital stamp card",
      bundlePackage: "package bundle",
      remainingSessions: "Remaining visits",
      remainingSessionsPlaceholder: "For example 4",
      notesOptional: "Notes (optional)",
      carryOverNotesPlaceholder: "For example carried over from a paper stamp card.",
      soldNotesPlaceholder: "For example sold as a bundle for a regular client.",
      takeOverCard: "Carry over card",
      takingOver: "Carrying over...",
      sellPackage: "Sell package",
      selling: "Selling...",
      soldOutSuggestionText: "This card is now fully used. You can add a new card right away.",
      soldOutSuggestionLabel: "Add new card"
    },
    correctionForm: {
      correction: "Correction",
      deductManually: "Deduct visit manually",
      restoreSession: "Restore visit",
      sessionCount: "Number of visits",
      correctionReason: "Reason for correction",
      reasonPlaceholder: "For example forgot to deduct it from the paper card.",
      save: "Save correction",
      saving: "Saving...",
      soldOutSuggestionText: "This card is now fully used. You can add a new card right away.",
      soldOutSuggestionLabel: "Add new card"
    },
    photoGallery: {
      empty: "There are no photos linked to this treatment yet.",
      before: "Before",
      after: "After",
      general: "General",
      altPhoto: "photo",
      delete: "Delete",
      file: "File",
      uploadedBy: "Uploaded by"
    },
    photoForm: {
      photo: "Photo",
      photoType: "Photo type",
      before: "Before",
      after: "After",
      general: "General",
      noteOptional: "Note (optional)",
      notePlaceholder: "For example front result or starting point during intake.",
      consentHint:
        "Only upload photos for which the client has given consent. Allowed formats: JPG, PNG and WEBP up to 5 MB.",
      upload: "Upload photo",
      uploading: "Uploading..."
    },
    editTreatmentPage: {
      label: "Edit treatment",
      subtitle:
        "Adjust this treatment without losing the client record or the rest of the history.",
      backToDossier: "Back to record",
      saveTreatment: "Save treatment",
      treatmentPhotosTitle: "Photos for this treatment",
      treatmentPhotosText:
        "Add before and after photos here as visual documentation or evidence in case of a complaint.",
      uploadPhotoTitle: "Upload new photo",
      uploadPhotoText:
        "Upload via the edit page first, so the photo always stays linked to the correct treatment."
    }
  },
  de: {
    customerRecord: "Kundenkartei",
    editCustomer: "Kunde bearbeiten",
    scheduleAppointment: "Termin planen",
    print: "Drucken",
    exportCsv: "CSV-Export",
    deleteCustomer: "Kunde löschen",
    deletingCustomer: "Löschen...",
    deleteCustomerConfirm:
      "Möchtest du {naam} wirklich löschen? Alle Behandlungen dieser Kundin oder dieses Kunden werden ebenfalls entfernt.",
    upcomingAppointments: "Kommende Termine",
    upcomingAppointmentsText: "Schneller Überblick über bereits geplante Termine für diese Kundin oder diesen Kunden.",
    noUpcomingAppointments: "Für diese Kundin oder diesen Kunden sind noch keine kommenden Termine geplant.",
    newAppointment: "Neuer Termin",
    openAppointment: "Termin öffnen",
    notAssigned: "Noch nicht zugewiesen",
    reminderLabels: {
      copied: "Erinnerung kopiert",
      copy: "Erinnerung kopieren",
      openWhatsApp: "In WhatsApp öffnen"
    },
    profileTitle: "Profil und Haarinfos",
    profileText:
      "Aktualisiere hier schnell Geburtsdatum, Haartyp, Haarfarbe, Allergien und Notizen der Stylistin oder des Stylisten.",
    editProfile: "Profil bearbeiten",
    birthDate: "Geburtsdatum",
    hairType: "Haartyp",
    hairColor: "Haarfarbe",
    allergies: "Allergien",
    notFilledInYet: "Noch nicht ausgefüllt",
    stylistNotes: "Notizen der Stylistin / des Stylisten",
    latestTreatment: "Letzte Behandlung",
    stylist: "Mitarbeitende",
    recipe: "Rezept",
    notes: "Notizen",
    loadLatestRecipe: "Letztes Rezept ins Formular laden",
    editLatestTreatment: "Letzte Behandlung bearbeiten",
    historyTitle: "Behandlungshistorie",
    historyText: "Chronologische Übersicht mit Filter nach Datum oder Mitarbeitenden.",
    fromDate: "Von Datum",
    toDate: "Bis Datum",
    employee: "Mitarbeitende",
    employeePlaceholder: "Zum Beispiel Sanne",
    filter: "Filtern",
    noTreatmentsForFilters: "Für diese Filter wurden noch keine Behandlungen gefunden.",
    treatmentPhotos: "Fotos zu dieser Behandlung",
    loadRecipeIntoForm: "Rezept ins Formular laden",
    editTreatment: "Behandlung bearbeiten",
    deleteTreatment: "Behandlung löschen",
    deletingTreatment: "Löschen...",
    deleteTreatmentConfirm: "Möchtest du die Behandlung {naam} wirklich löschen?",
    packagesTitle: "Pakete",
    packageSummaryTitle: "Aktiver Paketstand",
    packageBannerTitle: "Offene Karten und Bundles",
    packageBannerEmpty: "Keine aktiven Karten oder Bundles für diese Kundin oder diesen Kunden.",
    packageBannerText: "{cards} aktive Karten · {sessions} offene Besuche",
    packageBannerView: "Pakete ansehen",
    packageBannerAdd: "Neue Karte hinzufügen",
    packageSummaryText: "Direkt sichtbar, wie viele Karten und Bundles diese Kundin oder dieser Kunde noch offen hat.",
    activeCards: "Aktive Karten",
    openSessionsTotal: "Offene Besuche gesamt",
    openSessionsHint: "Noch abzubuchen",
    activePackageTypes: "Aktive Arten",
    stampCardsLabel: "Stempelkarten",
    bundlePackagesLabel: "Bundles",
    packageSummaryNone: "Keine aktiven Karten oder Bundles",
    packagesText:
      "Verkaufe hier Pakete oder digitale Stempelkarten an diese Kundin oder diesen Kunden. Du kannst auch eine bestehende Papierkarte übernehmen, indem du nur die aktuell verbleibenden Besuche eingibst.",
    noPackages: "Diese Kundin oder dieser Kunde hat noch keine aktiven oder früheren Pakete.",
    packageTreatment: "Behandlung",
    packageType: "Typ",
    digitalStampCard: "Digitale Stempelkarte",
    bundlePackage: "Paketbundle",
    remaining: "Noch übrig",
    soldOn: "Verkauft am",
    packagePrice: "Paketpreis",
    singlePrice: "Einzelpreis",
    perSession: "pro Besuch",
    active: "Aktiv",
    activePackageCardLabel: "Aktives Paket",
    remainingCounter: "{remaining} / {total} übrig",
    digitalStampCardTitle: "Digitale Stempelkarte",
    stampedSummary: "{used} abgestempelt, {remaining} offen",
    remainingShort: "{count} übrig",
    usedSession: "Genutzter Besuch",
    openSession: "Noch offen",
    usageHistory: "Nutzungshistorie",
    restored: "Zurückgesetzt",
    deducted: "Abgebucht",
    sessionWord: "Besuch",
    sessionsWord: "Besuche",
    manualCorrection: "Manuelle Korrektur",
    unknown: "Unbekannt",
    reason: "Grund",
    viewLinkedTreatment: "Verknüpfte Behandlung ansehen",
    noUsageYet: "Von diesem Paket wurden noch keine Besuche abgebucht.",
    correctionTitle: "Korrektur",
    correctionText:
      "Nutze das nur, wenn ein Besuch vergessen wurde abzubuchen oder wieder zurückgesetzt werden muss. Die Korrektur bleibt in der Historie sichtbar.",
    previousPackages: "Frühere Pakete",
    previousPackagesSummary: "Frühere Pakete und Historie ansehen",
    status: "Status",
    used: "Verbraucht",
    fullyUsed: "Vollständig verbraucht",
    packageStatus: {
      ACTIEF: "Aktiv",
      VOLLEDIG_GEBRUIKT: "Vollständig verbraucht",
      GEANNULEERD: "Storniert",
      VERLOPEN: "Abgelaufen"
    },
    sellPackageTitle: "Paket verkaufen",
    sellPackageText: "Wähle einen aktiven Pakettyp dieses Salons und verknüpfe ihn direkt mit dieser Kundin oder diesem Kunden.",
    noActivePackageTypes: "Es gibt noch keine aktiven Pakettypen. Lege zuerst eines unter Pakete an.",
    treatmentFormTitle: "Neue Behandlung erfassen",
    treatmentFormText: "Füge direkt eine neue Farb- oder andere Behandlung zu dieser Kundenkartei hinzu.",
    quickStartFromTemplate: "Schnellstart aus einer Rezeptvorlage:",
    clearForm: "Formular leeren",
    recipeLoadedFromTreatment:
      "Rezept aus {date} geladen. Prüfe die Felder und speichere es dann als neue Behandlung.",
    templateLoaded:
      "Vorlage geladen: {name}. Prüfe die Felder und speichere sie dann als neue Behandlung.",
    appointmentAlreadyConverted: "Aus diesem Termin wurde bereits eine Behandlung erstellt.",
    appointmentLoaded:
      "Termin aus {date} geladen. Speichere, um diesen Termin als Behandlung zu erfassen und eventuelle Stempelkarten oder Pakete abzubuchen.",
    openCompletedTreatment: "Abgeschlossene Behandlung öffnen",
    treatmentHelperFromPrevious:
      "Die Felder wurden aus einer früheren Behandlung vorausgefüllt. Passe sie bei Bedarf an und speichere die neue Behandlung.",
    treatmentHelperFromTemplate:
      "Die Felder wurden aus einer Rezeptvorlage vorausgefüllt. Passe sie bei Bedarf an und speichere die neue Behandlung.",
    customerFormNew: {
      label: "Neue Kundin / neuer Kunde",
      title: "Kundenkartei anlegen",
      subtitle:
        "Lege eine neue Kundenkartei an, damit Behandlungen und Farbrezepte direkt verknüpft werden können.",
      noteTitle: "Kundenkartei ohne Login",
      noteText:
        "Eine Kundin oder ein Kunde, den du hier anlegst, erhält kein eigenes Login-Konto. Nutze diese Seite nur für Kundendaten, Farbrezepte und Behandlungshistorie.",
      submit: "Kundendaten speichern",
      busy: "Speichern..."
    },
    customerFormEdit: {
      label: "Kunde bearbeiten",
      title: "Daten anpassen",
      subtitle:
        "Bearbeite hier auch Geburtsdatum, Haartyp, Haarfarbe, Allergien und Notizen der Stylistin oder des Stylisten.",
      submit: "Änderungen speichern",
      busy: "Speichern..."
    },
    customerFormFields: {
      draftInfo: "Entwurf wird lokal gespeichert, solange du arbeitest.",
      name: "Name",
      phone: "Telefonnummer",
      birthDate: "Geburtsdatum",
      hairType: "Haartyp",
      hairTypePlaceholder: "Zum Beispiel lockig, fein, dick",
      hairColor: "Haarfarbe",
      hairColorPlaceholder: "Zum Beispiel dunkelblond, kupfer, schwarz",
      address: "Adresse",
      allergies: "Allergien",
      allergiesPlaceholder: "Zum Beispiel empfindlich bei Blondierung, Parfum oder bestimmten Produkten",
      stylistNotes: "Notizen der Stylistin / des Stylisten",
      stylistNotesPlaceholder: "Zum Beispiel wichtige Hinweise, Vorlieben oder Beobachtungen",
      saveBusy: "Speichern...",
      cancel: "Abbrechen"
    },
    treatmentFormFields: {
      draftInfo: "Entwurf wird lokal gespeichert, solange du arbeitest.",
      quickChoices: "Schnellauswahl für häufige Behandlungen:",
      dateTime: "Datum und Uhrzeit",
      stylist: "Mitarbeitende",
      chooseStylist: "Mitarbeitende wählen",
      treatment: "Behandlung",
      treatmentPlaceholder: "Zum Beispiel Ansatz färben",
      recipe: "Rezept",
      recipePlaceholder: "Zum Beispiel 7.0 + 7.1, 3 % Entwickler, 25 Minuten",
      notesOptional: "Notizen (optional)",
      notesPlaceholder: "Zusätzliche Hinweise oder Beratung",
      deductPackageOptional: "Paket abbuchen (optional)",
      noPackage: "Kein Paket verwenden",
      stampCard: "Stempelkarte",
      packageLabel: "Paket",
      saveBusy: "Speichern...",
      soldOutSuggestionText: "Diese Karte ist jetzt vollständig verbraucht. Du kannst direkt eine neue Karte hinzufügen.",
      soldOutSuggestionLabel: "Neue Karte hinzufügen"
    },
    packageForm: {
      inputType: "Erfassungsart",
      newSoldPackage: "Neu verkauftes Paket",
      carryOverCard: "Bestehende Karte übernehmen",
      carryOverHelp:
        "Nutze bestehende Karte übernehmen, wenn du eine Papier-Stempelkarte oder ein Paket nur mit dem aktuellen Reststand erfassen möchtest.",
      packageType: "Pakettyp",
      choosePackage: "Paket wählen",
      stampCard: "digitale Stempelkarte",
      bundlePackage: "Paketbundle",
      remainingSessions: "Verbleibende Besuche",
      remainingSessionsPlaceholder: "Zum Beispiel 4",
      notesOptional: "Notizen (optional)",
      carryOverNotesPlaceholder: "Zum Beispiel von Papier-Stempelkarte übernommen.",
      soldNotesPlaceholder: "Zum Beispiel als Bundle für Stammkundschaft verkauft.",
      takeOverCard: "Karte übernehmen",
      takingOver: "Übernehmen...",
      sellPackage: "Paket verkaufen",
      selling: "Verkaufen...",
      soldOutSuggestionText: "Diese Karte ist jetzt vollständig verbraucht. Du kannst direkt eine neue Karte hinzufügen.",
      soldOutSuggestionLabel: "Neue Karte hinzufügen"
    },
    correctionForm: {
      correction: "Korrektur",
      deductManually: "Besuch manuell abbuchen",
      restoreSession: "Besuch zurücksetzen",
      sessionCount: "Anzahl Besuche",
      correctionReason: "Grund der Korrektur",
      reasonPlaceholder: "Zum Beispiel vergessen, auf der Papierkarte abzubuchen.",
      save: "Korrektur speichern",
      saving: "Speichern...",
      soldOutSuggestionText: "Diese Karte ist jetzt vollständig verbraucht. Du kannst direkt eine neue Karte hinzufügen.",
      soldOutSuggestionLabel: "Neue Karte hinzufügen"
    },
    photoGallery: {
      empty: "Mit dieser Behandlung sind noch keine Fotos verknüpft.",
      before: "Vorher",
      after: "Nachher",
      general: "Allgemein",
      altPhoto: "Foto",
      delete: "Löschen",
      file: "Datei",
      uploadedBy: "Hochgeladen von"
    },
    photoForm: {
      photo: "Foto",
      photoType: "Fototyp",
      before: "Vorher",
      after: "Nachher",
      general: "Allgemein",
      noteOptional: "Notiz (optional)",
      notePlaceholder: "Zum Beispiel Frontalergebnis oder Ausgangssituation beim Erstgespräch.",
      consentHint:
        "Lade nur Fotos hoch, für die die Kundin oder der Kunde zugestimmt hat. Erlaubte Formate: JPG, PNG und WEBP bis 5 MB.",
      upload: "Foto hochladen",
      uploading: "Hochladen..."
    },
    editTreatmentPage: {
      label: "Behandlung bearbeiten",
      subtitle:
        "Passe diese Behandlung an, ohne die Kundenkartei oder den Rest der Historie zu verlieren.",
      backToDossier: "Zurück zur Kartei",
      saveTreatment: "Behandlung speichern",
      treatmentPhotosTitle: "Fotos zu dieser Behandlung",
      treatmentPhotosText:
        "Füge hier Vorher- und Nachherfotos als visuelle Dokumentation oder Nachweis bei Beschwerden hinzu.",
      uploadPhotoTitle: "Neues Foto hochladen",
      uploadPhotoText:
        "Lade Fotos zuerst über die Bearbeitungsseite hoch, damit sie immer direkt mit der richtigen Behandlung verknüpft bleiben."
    }
  }
} as const;

export const managementDictionary = {
  nl: {
    packages: {
      label: "Pakketten",
      title: "Digitale stempelkaarten",
      subtitle:
        "Beheer hier pakkettypes zoals 5x epileren of 6x toner. Deze vormen later de basis voor klantbundels en automatische afboeking per bezoek.",
      packageTypesTitle: "Pakkettypes van deze salon",
      architectureTitle: "Architectuur",
      architectureText:
        "In deze eerste fase beheren we alleen de pakkettypes. Klantverkoop en afboeken per behandeling bouwen we daarna bovenop deze basis.",
      empty: "Er zijn nog geen pakkettypes voor deze salon.",
      defaultTreatment: "Standaardbehandeling",
      type: "Type",
      stampCard: "Digitale stempelkaart",
      bundlePackage: "Bundelpakket",
      packagePrice: "Pakket",
      singlePrice: "Losse prijs",
      perTreatment: "per behandeling",
      linkedCustomerPackages: "Gekoppelde klantpakketten",
      description: "Omschrijving",
      active: "Actief",
      edit: "Bewerken",
      deactivate: "Uitschakelen",
      deactivating: "Verwijderen...",
      deactivateConfirm:
        "Weet je zeker dat je pakkettype {naam} wilt uitschakelen? Het blijft wel bewaard voor bestaande klantpakketten.",
      inactivePackageTypes: "Inactieve pakkettypes",
      inactiveText:
        "Deze pakketten zijn niet meer verkoopbaar, maar blijven zichtbaar voor historie en bestaande klantbundels.",
      inactive: "Inactief",
      reactivate: "Opnieuw activeren",
      newPackageType: "Nieuw pakkettype",
      newPackageTypeText:
        "Definieer hier eerst het pakket dat deze salon verkoopt. Daarna kunnen we het aan klanten koppelen en later per behandeling afboeken.",
      editTitle: "Pakkettype bewerken",
      editText:
        "Werk dit pakkettype bij zonder bestaande klanthistorie te beschadigen. Verkochte pakketten bewaren namelijk hun eigen momentopname.",
      backToPackages: "Terug naar pakketten",
      savePackageType: "Pakkettype opslaan",
      addPackageType: "Pakkettype toevoegen",
      form: {
        packageName: "Naam pakket",
        packageNamePlaceholder: "Bijvoorbeeld 5x epileren",
        defaultTreatment: "Standaardbehandeling",
        defaultTreatmentPlaceholder: "Bijvoorbeeld Epileren",
        sessionCount: "Aantal beurten",
        packagePrice: "Pakketprijs",
        packagePricePlaceholder: "Bijvoorbeeld 30,00",
        singlePrice: "Losse prijs",
        singlePricePlaceholder: "Bijvoorbeeld 7,50",
        status: "Status",
        active: "Actief",
        inactive: "Inactief",
        displayType: "Weergavetype",
        bundlePackage: "Bundelpakket",
        stampCard: "Digitale stempelkaart",
        descriptionOptional: "Omschrijving (optioneel)",
        descriptionPlaceholder: "Bijvoorbeeld voordeliger bundelpakket voor vaste klanten.",
        saving: "Opslaan..."
      }
    },
    team: {
      label: "Team",
      title: "Medewerkersbeheer",
      subtitle: "Beheer medewerkers binnen deze salonomgeving, inclusief rol, status en toegangsgegevens.",
      loginAccountsTitle: "Loginaccounts beheer je hier",
      loginAccountsText:
        "Medewerkers die je op deze pagina toevoegt, krijgen een eigen account om in te loggen in deze salonomgeving.",
      clientsNoLoginTitle: "Klanten hebben geen login",
      clientsNoLoginText:
        "Klanten voeg je toe via Nieuwe klant. Dat zijn klantdossiers zonder eigen inlogmogelijkheid.",
      existingStaff: "Bestaande medewerkers",
      role: "Rol",
      status: "Status",
      roles: {
        OWNER: "Eigenaar",
        ADMIN: "Admin",
        MEDEWERKER: "Medewerker"
      },
      statuses: {
        ACTIEF: "Actief",
        UITGESCHAKELD: "Uitgeschakeld"
      },
      edit: "Bewerken",
      delete: "Verwijderen",
      deleting: "Verwijderen...",
      deleteConfirm:
        "Weet je zeker dat je medewerker {naam} wilt verwijderen? Dit account kan daarna niet meer inloggen.",
      newStaff: "Nieuwe medewerker",
      newStaffText: "Voeg een nieuwe medewerker toe die direct binnen de huidige salon kan inloggen.",
      editTitle: "Medewerker bewerken",
      editText: "Werk rol, status en contactgegevens bij. Een nieuw wachtwoord invullen is optioneel.",
      backToTeam: "Terug naar team",
      saveStaff: "Medewerker opslaan",
      addStaff: "Medewerker toevoegen",
      form: {
        name: "Naam",
        email: "E-mailadres",
        password: "Wachtwoord",
        newPasswordOptional: "Nieuw wachtwoord (optioneel)",
        role: "Rol",
        status: "Status",
        owner: "Eigenaar",
        admin: "Admin",
        staff: "Medewerker",
        active: "Actief",
        disabled: "Uitgeschakeld",
        saving: "Opslaan..."
      }
    },
    settings: {
      label: "Instellingen",
      title: "Saloninstellingen",
      subtitle:
        "Beheer de zichtbare salonnaam, contactgegevens, accentkleur en het logo van deze salonomgeving.",
      save: "Instellingen opslaan",
      form: {
        salonName: "Salonnaam",
        branchType: "Branche",
        branchHelp: "Deze keuze bepaalt de terminologie, profielvelden en standaardaccenten voor deze salonomgeving.",
        branchHair: "Kapsalon",
        branchMassage: "Massagesalon",
        branchBeauty: "Schoonheidssalon",
        primaryColor: "Primaire kleur",
        primaryColorHelp: "Deze kleur wordt gebruikt voor knoppen en accentdelen in de dashboardomgeving van deze salon.",
        primaryColorPicker: "Kies kleur",
        resetPrimaryColor: "Reset naar standaardkleur",
        colorPreviewTitle: "Live kleurpreview",
        colorPreviewText: "Zo zien de hoofdaccenten eruit zodra je de instellingen opslaat.",
        previewButton: "Primaire knop",
        previewSoft: "Zacht accent",
        email: "E-mailadres",
        phone: "Telefoonnummer",
        address: "Adres",
        logoUrl: "Logo URL",
        logoUrlPlaceholder: "Bijvoorbeeld /logo-salon.svg of https://...",
        logoUpload: "Logo uploaden",
        logoUploadHelp: "Gebruik bij voorkeur een vierkant logo in JPG, PNG, WEBP of SVG tot 2 MB.",
        logoPreviewHelp:
          "Dit logo wordt gebruikt in de login en in de zijbalk. Een eigen logo is dus juist handig voor herkenning.",
        logoPreviewSelected: "Voorbeeld van het nieuw gekozen bestand",
        quickTreatments: "Snelle behandelingen",
        quickTreatmentsPlaceholder:
          "Eén behandeling per regel\nUitgroei kleuren\nVolledige kleuring\nToner",
        loadBranchDefaults: "Laad standaardbehandelingen van deze branche",
        checklistTitle: "Snelle inrichting-check",
        checklistReady: "Klaar",
        checklistTodo: "Nog doen",
        checklistBranding: "Salonnaam, kleur en logo controleren",
        checklistBranch: "Juiste branche voor deze salon kiezen",
        checklistQuickTreatments: "Snelle behandelingen nalopen",
        checklistContact: "Contactgegevens invullen voor team en herinneringen",
        saving: "Opslaan..."
      }
    }
  },
  en: {
    packages: {
      label: "Packages",
      title: "Digital stamp cards",
      subtitle:
        "Manage package types here, such as 5x eyebrow shaping or 6x toner. These later form the basis for client packages and automatic deductions per visit.",
      packageTypesTitle: "Package types for this salon",
      architectureTitle: "Architecture",
      architectureText:
        "In this first phase we only manage package types. Client sales and deductions per treatment are built on top of this afterwards.",
      empty: "There are no package types for this salon yet.",
      defaultTreatment: "Default treatment",
      type: "Type",
      stampCard: "Digital stamp card",
      bundlePackage: "Package bundle",
      packagePrice: "Package",
      singlePrice: "Single price",
      perTreatment: "per treatment",
      linkedCustomerPackages: "Linked client packages",
      description: "Description",
      active: "Active",
      edit: "Edit",
      deactivate: "Deactivate",
      deactivating: "Deleting...",
      deactivateConfirm:
        "Are you sure you want to deactivate package type {naam}? It will remain available for existing client packages.",
      inactivePackageTypes: "Inactive package types",
      inactiveText:
        "These packages can no longer be sold, but remain visible for history and existing client bundles.",
      inactive: "Inactive",
      reactivate: "Reactivate",
      newPackageType: "New package type",
      newPackageTypeText:
        "Define the package this salon sells here first. After that we can link it to clients and later deduct it per treatment.",
      editTitle: "Edit package type",
      editText:
        "Update this package type without damaging existing client history. Sold packages keep their own snapshot.",
      backToPackages: "Back to packages",
      savePackageType: "Save package type",
      addPackageType: "Add package type",
      form: {
        packageName: "Package name",
        packageNamePlaceholder: "For example 5x eyebrow shaping",
        defaultTreatment: "Default treatment",
        defaultTreatmentPlaceholder: "For example Eyebrow shaping",
        sessionCount: "Number of visits",
        packagePrice: "Package price",
        packagePricePlaceholder: "For example 30.00",
        singlePrice: "Single price",
        singlePricePlaceholder: "For example 7.50",
        status: "Status",
        active: "Active",
        inactive: "Inactive",
        displayType: "Display type",
        bundlePackage: "Package bundle",
        stampCard: "Digital stamp card",
        descriptionOptional: "Description (optional)",
        descriptionPlaceholder: "For example a discounted bundle for regular clients.",
        saving: "Saving..."
      }
    },
    team: {
      label: "Staff",
      title: "Staff management",
      subtitle: "Manage staff members within this salon environment, including role, status and access details.",
      loginAccountsTitle: "Manage login accounts here",
      loginAccountsText:
        "Staff members you add on this page receive their own account to log in to this salon environment.",
      clientsNoLoginTitle: "Clients do not get a login",
      clientsNoLoginText:
        "Add clients via New client record. These are client records without their own login access.",
      existingStaff: "Existing staff",
      role: "Role",
      status: "Status",
      roles: {
        OWNER: "Owner",
        ADMIN: "Admin",
        MEDEWERKER: "Staff"
      },
      statuses: {
        ACTIEF: "Active",
        UITGESCHAKELD: "Disabled"
      },
      edit: "Edit",
      delete: "Delete",
      deleting: "Deleting...",
      deleteConfirm:
        "Are you sure you want to delete staff member {naam}? This account will no longer be able to log in afterwards.",
      newStaff: "New staff member",
      newStaffText: "Add a new staff member who can log in to the current salon right away.",
      editTitle: "Edit staff member",
      editText: "Update role, status and contact details. Entering a new password is optional.",
      backToTeam: "Back to staff",
      saveStaff: "Save staff member",
      addStaff: "Add staff member",
      form: {
        name: "Name",
        email: "Email address",
        password: "Password",
        newPasswordOptional: "New password (optional)",
        role: "Role",
        status: "Status",
        owner: "Owner",
        admin: "Admin",
        staff: "Staff",
        active: "Active",
        disabled: "Disabled",
        saving: "Saving..."
      }
    },
    settings: {
      label: "Settings",
      title: "Salon settings",
      subtitle:
        "Manage the visible salon name, contact details, accent colour and logo for this salon environment.",
      save: "Save settings",
      form: {
        salonName: "Salon name",
        branchType: "Business type",
        branchHelp: "This choice determines the terminology, profile focus and default accents for this salon environment.",
        branchHair: "Hair salon",
        branchMassage: "Massage salon",
        branchBeauty: "Beauty salon",
        primaryColor: "Primary colour",
        primaryColorHelp: "This colour is used for buttons and accent elements in this salon's dashboard.",
        primaryColorPicker: "Choose colour",
        resetPrimaryColor: "Reset to default colour",
        colorPreviewTitle: "Live colour preview",
        colorPreviewText: "This is how the main accents will look once you save the settings.",
        previewButton: "Primary button",
        previewSoft: "Soft accent",
        email: "Email address",
        phone: "Phone number",
        address: "Address",
        logoUrl: "Logo URL",
        logoUrlPlaceholder: "For example /logo-salon.svg or https://...",
        logoUpload: "Upload logo",
        logoUploadHelp: "Preferably use a square logo in JPG, PNG, WEBP or SVG up to 2 MB.",
        logoPreviewHelp:
          "This logo is used on the login screen and in the sidebar, so a custom logo helps with recognition.",
        logoPreviewSelected: "Preview of the newly selected file",
        quickTreatments: "Quick treatments",
        quickTreatmentsPlaceholder:
          "One treatment per line\nRoot colour\nFull colour\nToner",
        loadBranchDefaults: "Load the default treatments for this business type",
        checklistTitle: "Quick setup check",
        checklistReady: "Ready",
        checklistTodo: "To do",
        checklistBranding: "Check salon name, colour and logo",
        checklistBranch: "Choose the right business type for this salon",
        checklistQuickTreatments: "Review the quick treatments",
        checklistContact: "Fill in contact details for staff and reminders",
        saving: "Saving..."
      }
    }
  },
  de: {
    packages: {
      label: "Pakete",
      title: "Digitale Stempelkarten",
      subtitle:
        "Verwalte hier Pakettypen wie 5x Augenbrauen oder 6x Toner. Diese bilden später die Grundlage für Kundenpakete und automatische Abbuchungen pro Besuch.",
      packageTypesTitle: "Pakettypen dieses Salons",
      architectureTitle: "Architektur",
      architectureText:
        "In dieser ersten Phase verwalten wir nur die Pakettypen. Kundenverkäufe und Abbuchungen pro Behandlung bauen wir danach darauf auf.",
      empty: "Für diesen Salon gibt es noch keine Pakettypen.",
      defaultTreatment: "Standardbehandlung",
      type: "Typ",
      stampCard: "Digitale Stempelkarte",
      bundlePackage: "Paketbundle",
      packagePrice: "Paket",
      singlePrice: "Einzelpreis",
      perTreatment: "pro Behandlung",
      linkedCustomerPackages: "Verknüpfte Kundenpakete",
      description: "Beschreibung",
      active: "Aktiv",
      edit: "Bearbeiten",
      deactivate: "Deaktivieren",
      deactivating: "Löschen...",
      deactivateConfirm:
        "Möchtest du den Pakettyp {naam} wirklich deaktivieren? Er bleibt für bestehende Kundenpakete erhalten.",
      inactivePackageTypes: "Inaktive Pakettypen",
      inactiveText:
        "Diese Pakete sind nicht mehr verkaufbar, bleiben aber für die Historie und bestehende Kundenbundles sichtbar.",
      inactive: "Inaktiv",
      reactivate: "Erneut aktivieren",
      newPackageType: "Neuer Pakettyp",
      newPackageTypeText:
        "Definiere hier zuerst das Paket, das dieser Salon verkauft. Danach können wir es mit Kundschaft verknüpfen und später pro Behandlung abbuchen.",
      editTitle: "Pakettyp bearbeiten",
      editText:
        "Aktualisiere diesen Pakettyp, ohne die bestehende Kundenhistorie zu beschädigen. Verkaufte Pakete behalten ihren eigenen Snapshot.",
      backToPackages: "Zurück zu Paketen",
      savePackageType: "Pakettyp speichern",
      addPackageType: "Pakettyp hinzufügen",
      form: {
        packageName: "Paketname",
        packageNamePlaceholder: "Zum Beispiel 5x Augenbrauen",
        defaultTreatment: "Standardbehandlung",
        defaultTreatmentPlaceholder: "Zum Beispiel Augenbrauen",
        sessionCount: "Anzahl Besuche",
        packagePrice: "Paketpreis",
        packagePricePlaceholder: "Zum Beispiel 30,00",
        singlePrice: "Einzelpreis",
        singlePricePlaceholder: "Zum Beispiel 7,50",
        status: "Status",
        active: "Aktiv",
        inactive: "Inaktiv",
        displayType: "Anzeigetyp",
        bundlePackage: "Paketbundle",
        stampCard: "Digitale Stempelkarte",
        descriptionOptional: "Beschreibung (optional)",
        descriptionPlaceholder: "Zum Beispiel vergünstigtes Bundle für Stammkundschaft.",
        saving: "Speichern..."
      }
    },
    team: {
      label: "Team",
      title: "Mitarbeitendenverwaltung",
      subtitle: "Verwalte Mitarbeitende in dieser Salonumgebung, inklusive Rolle, Status und Zugangsdaten.",
      loginAccountsTitle: "Login-Konten verwaltest du hier",
      loginAccountsText:
        "Mitarbeitende, die du auf dieser Seite hinzufügst, erhalten ein eigenes Konto zum Einloggen in diese Salonumgebung.",
      clientsNoLoginTitle: "Kundschaft hat keinen Login",
      clientsNoLoginText:
        "Kundschaft fügst du über Neue Kundenkartei hinzu. Das sind Kundendossiers ohne eigene Login-Möglichkeit.",
      existingStaff: "Bestehende Mitarbeitende",
      role: "Rolle",
      status: "Status",
      roles: {
        OWNER: "Inhaber",
        ADMIN: "Admin",
        MEDEWERKER: "Mitarbeitende"
      },
      statuses: {
        ACTIEF: "Aktiv",
        UITGESCHAKELD: "Deaktiviert"
      },
      edit: "Bearbeiten",
      delete: "Löschen",
      deleting: "Löschen...",
      deleteConfirm:
        "Möchtest du Mitarbeitende {naam} wirklich löschen? Dieses Konto kann sich danach nicht mehr anmelden.",
      newStaff: "Neue Mitarbeitende",
      newStaffText:
        "Füge neue Mitarbeitende hinzu, die sich direkt im aktuellen Salon anmelden können.",
      editTitle: "Mitarbeitende bearbeiten",
      editText: "Bearbeite Rolle, Status und Kontaktdaten. Ein neues Passwort ist optional.",
      backToTeam: "Zurück zum Team",
      saveStaff: "Mitarbeitende speichern",
      addStaff: "Mitarbeitende hinzufügen",
      form: {
        name: "Name",
        email: "E-Mail-Adresse",
        password: "Passwort",
        newPasswordOptional: "Neues Passwort (optional)",
        role: "Rolle",
        status: "Status",
        owner: "Inhaber",
        admin: "Admin",
        staff: "Mitarbeitende",
        active: "Aktiv",
        disabled: "Deaktiviert",
        saving: "Speichern..."
      }
    },
    settings: {
      label: "Einstellungen",
      title: "Saloneinstellungen",
      subtitle:
        "Verwalte den sichtbaren Salonnamen, Kontaktdaten, Akzentfarbe und das Logo dieser Salonumgebung.",
      save: "Einstellungen speichern",
      form: {
        salonName: "Salonname",
        branchType: "Betriebsart",
        branchHelp: "Diese Auswahl bestimmt die Terminologie, den Profilfokus und die Standardakzente dieser Salonumgebung.",
        branchHair: "Friseursalon",
        branchMassage: "Massagesalon",
        branchBeauty: "Kosmetiksalon",
        primaryColor: "Primärfarbe",
        primaryColorHelp: "Diese Farbe wird für Buttons und Akzente im Dashboard dieses Salons verwendet.",
        primaryColorPicker: "Farbe wählen",
        resetPrimaryColor: "Auf Standardfarbe zurücksetzen",
        colorPreviewTitle: "Live-Farbvorschau",
        colorPreviewText: "So sehen die Hauptakzente aus, sobald du die Einstellungen speicherst.",
        previewButton: "Primärer Button",
        previewSoft: "Sanfter Akzent",
        email: "E-Mail-Adresse",
        phone: "Telefonnummer",
        address: "Adresse",
        logoUrl: "Logo-URL",
        logoUrlPlaceholder: "Zum Beispiel /logo-salon.svg oder https://...",
        logoUpload: "Logo hochladen",
        logoUploadHelp: "Verwende möglichst ein quadratisches Logo in JPG, PNG, WEBP oder SVG bis 2 MB.",
        logoPreviewHelp:
          "Dieses Logo wird im Login und in der Seitenleiste verwendet. Ein eigenes Logo ist also sinnvoll für die Wiedererkennung.",
        logoPreviewSelected: "Vorschau der neu ausgewählten Datei",
        quickTreatments: "Schnelle Behandlungen",
        quickTreatmentsPlaceholder:
          "Eine Behandlung pro Zeile\nAnsatz färben\nKomplettfärbung\nToner",
        loadBranchDefaults: "Standardbehandlungen dieser Betriebsart laden",
        checklistTitle: "Kurzer Einrichtungscheck",
        checklistReady: "Fertig",
        checklistTodo: "Noch offen",
        checklistBranding: "Salonname, Farbe und Logo prüfen",
        checklistBranch: "Die richtige Betriebsart für diesen Salon wählen",
        checklistQuickTreatments: "Schnelle Behandlungen prüfen",
        checklistContact: "Kontaktdaten für Team und Erinnerungen eintragen",
        saving: "Speichern..."
      }
    }
  }
} as const;
