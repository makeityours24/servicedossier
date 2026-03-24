import type { Locale } from "@/lib/i18n";

export type BranchType = "HAIR" | "MASSAGE" | "BEAUTY";
export const BRANCH_TYPES: BranchType[] = ["HAIR", "MASSAGE", "BEAUTY"];

const branchDefaults: Record<BranchType, string[]> = {
  HAIR: [
    "Uitgroei kleuren",
    "Volledige kleuring",
    "Toner",
    "Balayage",
    "Highlights",
    "Kleurcorrectie"
  ],
  MASSAGE: [
    "Ontspanningsmassage",
    "Sportmassage",
    "Nek en schouders",
    "Rugmassage",
    "Hot stone massage",
    "Intake en klachtenanalyse"
  ],
  BEAUTY: [
    "Huidanalyse",
    "Gezichtsbehandeling",
    "Wenkbrauwen",
    "Wimpers",
    "Peeling",
    "Nazorg en productadvies"
  ]
};

type BranchProfileCopy = {
  profileTitle: string;
  profileText: string;
  formEditSubtitle: string;
  fieldOneLabel: string;
  fieldOnePlaceholder: string;
  fieldTwoLabel: string;
  fieldTwoPlaceholder: string;
  allergiesLabel: string;
  allergiesPlaceholder: string;
  notesLabel: string;
  notesPlaceholder: string;
};

const branchProfileCopy: Record<Locale, Record<BranchType, BranchProfileCopy>> = {
  nl: {
    HAIR: {
      profileTitle: "Profiel en haarinfo",
      profileText: "Werk hier snel geboortedatum, haartype, haarkleur, allergieen en stylistnotities bij.",
      formEditSubtitle: "Werk hier ook geboortedatum, haartype, haarkleur, allergieen en notities van de stylist bij.",
      fieldOneLabel: "Haartype",
      fieldOnePlaceholder: "Bijvoorbeeld krullend, fijn, dik",
      fieldTwoLabel: "Haarkleur",
      fieldTwoPlaceholder: "Bijvoorbeeld donkerblond, koper, zwart",
      allergiesLabel: "Allergieen",
      allergiesPlaceholder: "Bijvoorbeeld gevoelig voor blondering, parfum of specifieke producten",
      notesLabel: "Notities stylist",
      notesPlaceholder: "Bijvoorbeeld aandachtspunten, voorkeuren of belangrijke observaties"
    },
    MASSAGE: {
      profileTitle: "Profiel en behandelinfo",
      profileText:
        "Werk hier snel geboortedatum, klachtengebied, drukvoorkeur, allergieen of contra-indicaties en notities van de masseur bij.",
      formEditSubtitle:
        "Werk hier ook geboortedatum, klachtengebied, drukvoorkeur, allergieen of contra-indicaties en notities van de masseur bij.",
      fieldOneLabel: "Klachtengebied",
      fieldOnePlaceholder: "Bijvoorbeeld nek en schouders, onderrug, benen",
      fieldTwoLabel: "Drukvoorkeur",
      fieldTwoPlaceholder: "Bijvoorbeeld zacht, gemiddeld, stevig",
      allergiesLabel: "Allergieen of contra-indicaties",
      allergiesPlaceholder: "Bijvoorbeeld zwanger, blessure, huidgevoeligheid of bepaalde olie vermijden",
      notesLabel: "Notities masseur",
      notesPlaceholder: "Bijvoorbeeld aandachtspunten, reactie op druk of advies voor volgende sessie"
    },
    BEAUTY: {
      profileTitle: "Profiel en huidinfo",
      profileText:
        "Werk hier snel geboortedatum, huidtype, huidconditie, allergieen en notities van de specialist bij.",
      formEditSubtitle:
        "Werk hier ook geboortedatum, huidtype, huidconditie, allergieen en notities van de specialist bij.",
      fieldOneLabel: "Huidtype",
      fieldOnePlaceholder: "Bijvoorbeeld droog, gecombineerd, gevoelig",
      fieldTwoLabel: "Huidconditie",
      fieldTwoPlaceholder: "Bijvoorbeeld acnegevoelig, roodheid, vochtarm",
      allergiesLabel: "Allergieen",
      allergiesPlaceholder: "Bijvoorbeeld gevoelig voor parfum, zuren of specifieke producten",
      notesLabel: "Notities specialist",
      notesPlaceholder: "Bijvoorbeeld aandachtspunten, productadvies of behandelreactie"
    }
  },
  en: {
    HAIR: {
      profileTitle: "Profile and hair details",
      profileText: "Quickly update date of birth, hair type, hair colour, allergies and stylist notes here.",
      formEditSubtitle: "Update date of birth, hair type, hair colour, allergies and stylist notes here as well.",
      fieldOneLabel: "Hair type",
      fieldOnePlaceholder: "For example curly, fine, thick",
      fieldTwoLabel: "Hair colour",
      fieldTwoPlaceholder: "For example dark blonde, copper, black",
      allergiesLabel: "Allergies",
      allergiesPlaceholder: "For example sensitive to bleach, perfume or specific products",
      notesLabel: "Stylist notes",
      notesPlaceholder: "For example focus points, preferences or important observations"
    },
    MASSAGE: {
      profileTitle: "Profile and treatment details",
      profileText:
        "Quickly update date of birth, complaint area, pressure preference, allergies or contraindications and therapist notes here.",
      formEditSubtitle:
        "Update date of birth, complaint area, pressure preference, allergies or contraindications and therapist notes here as well.",
      fieldOneLabel: "Complaint area",
      fieldOnePlaceholder: "For example neck and shoulders, lower back, legs",
      fieldTwoLabel: "Pressure preference",
      fieldTwoPlaceholder: "For example light, medium, firm",
      allergiesLabel: "Allergies or contraindications",
      allergiesPlaceholder: "For example pregnancy, injury, skin sensitivity or avoid certain oils",
      notesLabel: "Therapist notes",
      notesPlaceholder: "For example focus points, reaction to pressure or advice for the next session"
    },
    BEAUTY: {
      profileTitle: "Profile and skin details",
      profileText:
        "Quickly update date of birth, skin type, skin condition, allergies and specialist notes here.",
      formEditSubtitle:
        "Update date of birth, skin type, skin condition, allergies and specialist notes here as well.",
      fieldOneLabel: "Skin type",
      fieldOnePlaceholder: "For example dry, combination, sensitive",
      fieldTwoLabel: "Skin condition",
      fieldTwoPlaceholder: "For example acne-prone, redness, dehydrated",
      allergiesLabel: "Allergies",
      allergiesPlaceholder: "For example sensitive to perfume, acids or specific products",
      notesLabel: "Specialist notes",
      notesPlaceholder: "For example focus points, product advice or treatment reaction"
    }
  },
  de: {
    HAIR: {
      profileTitle: "Profil und Haarinfos",
      profileText:
        "Aktualisiere hier schnell Geburtsdatum, Haartyp, Haarfarbe, Allergien und Notizen der Stylistin oder des Stylisten.",
      formEditSubtitle:
        "Bearbeite hier auch Geburtsdatum, Haartyp, Haarfarbe, Allergien und Notizen der Stylistin oder des Stylisten.",
      fieldOneLabel: "Haartyp",
      fieldOnePlaceholder: "Zum Beispiel lockig, fein, dick",
      fieldTwoLabel: "Haarfarbe",
      fieldTwoPlaceholder: "Zum Beispiel dunkelblond, kupfer, schwarz",
      allergiesLabel: "Allergien",
      allergiesPlaceholder: "Zum Beispiel empfindlich bei Blondierung, Parfum oder bestimmten Produkten",
      notesLabel: "Notizen der Stylistin / des Stylisten",
      notesPlaceholder: "Zum Beispiel wichtige Hinweise, Vorlieben oder Beobachtungen"
    },
    MASSAGE: {
      profileTitle: "Profil und Behandlungsinfos",
      profileText:
        "Aktualisiere hier schnell Geburtsdatum, Beschwerdebereich, Druckvorliebe, Allergien oder Kontraindikationen und Notizen der Masseurin oder des Masseurs.",
      formEditSubtitle:
        "Bearbeite hier auch Geburtsdatum, Beschwerdebereich, Druckvorliebe, Allergien oder Kontraindikationen und Notizen der Masseurin oder des Masseurs.",
      fieldOneLabel: "Beschwerdebereich",
      fieldOnePlaceholder: "Zum Beispiel Nacken und Schultern, unterer Rücken, Beine",
      fieldTwoLabel: "Druckvorliebe",
      fieldTwoPlaceholder: "Zum Beispiel leicht, mittel, kräftig",
      allergiesLabel: "Allergien oder Kontraindikationen",
      allergiesPlaceholder: "Zum Beispiel Schwangerschaft, Verletzung, Hautempfindlichkeit oder bestimmte Öle meiden",
      notesLabel: "Notizen der Masseurin / des Masseurs",
      notesPlaceholder: "Zum Beispiel Schwerpunkte, Reaktion auf Druck oder Empfehlung für die nächste Sitzung"
    },
    BEAUTY: {
      profileTitle: "Profil und Hautinfos",
      profileText:
        "Aktualisiere hier schnell Geburtsdatum, Hauttyp, Hautzustand, Allergien und Notizen der Spezialistin oder des Spezialisten.",
      formEditSubtitle:
        "Bearbeite hier auch Geburtsdatum, Hauttyp, Hautzustand, Allergien und Notizen der Spezialistin oder des Spezialisten.",
      fieldOneLabel: "Hauttyp",
      fieldOnePlaceholder: "Zum Beispiel trocken, Mischhaut, empfindlich",
      fieldTwoLabel: "Hautzustand",
      fieldTwoPlaceholder: "Zum Beispiel zu Unreinheiten neigend, Rötungen, feuchtigkeitsarm",
      allergiesLabel: "Allergien",
      allergiesPlaceholder: "Zum Beispiel empfindlich bei Parfum, Säuren oder bestimmten Produkten",
      notesLabel: "Notizen der Spezialistin / des Spezialisten",
      notesPlaceholder: "Zum Beispiel Hinweise, Produktempfehlung oder Reaktion auf die Behandlung"
    }
  }
};

export function normalizeBranchType(value: string | null | undefined): BranchType {
  return value === "MASSAGE" || value === "BEAUTY" ? value : "HAIR";
}

export function getDefaultTreatmentPresets(branchType: BranchType) {
  return branchDefaults[branchType];
}

export function getBranchProfileCopy(locale: Locale, branchType: BranchType) {
  return branchProfileCopy[locale][branchType];
}

export function areTreatmentPresetsEqual(left: string[], right: string[]) {
  return JSON.stringify(left) === JSON.stringify(right);
}

export function normalizeTreatmentPresetsForBranch(
  treatmentPresets: string[] | null | undefined,
  branchType: BranchType
) {
  if (!treatmentPresets || treatmentPresets.length === 0) {
    return getDefaultTreatmentPresets(branchType);
  }

  const matchesOtherBranchDefaults = BRANCH_TYPES.some(
    (candidate) =>
      candidate !== branchType && areTreatmentPresetsEqual(treatmentPresets, getDefaultTreatmentPresets(candidate))
  );

  if (matchesOtherBranchDefaults) {
    return getDefaultTreatmentPresets(branchType);
  }

  return treatmentPresets;
}
