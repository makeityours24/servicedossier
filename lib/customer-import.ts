import type { BranchType } from "@/lib/branch-profile";
import type { Locale } from "@/lib/i18n";
import { buildCsvRow } from "@/lib/utils";

type TemplateColumn = {
  label: string;
  example: string;
};

type TemplateCopy = {
  fieldOneLabel: string;
  fieldTwoLabel: string;
  notesLabel: string;
  fileName: string;
};

const templateCopy: Record<Locale, Record<BranchType, TemplateCopy>> = {
  nl: {
    HAIR: {
      fieldOneLabel: "Haartype",
      fieldTwoLabel: "Haarkleur",
      notesLabel: "Notities stylist",
      fileName: "salondossier-klanten-template.csv"
    },
    MASSAGE: {
      fieldOneLabel: "Klachtengebied",
      fieldTwoLabel: "Drukvoorkeur",
      notesLabel: "Notities masseur",
      fileName: "salondossier-klanten-template.csv"
    },
    BEAUTY: {
      fieldOneLabel: "Huidtype",
      fieldTwoLabel: "Huidconditie",
      notesLabel: "Notities specialist",
      fileName: "salondossier-klanten-template.csv"
    }
  },
  en: {
    HAIR: {
      fieldOneLabel: "Hair type",
      fieldTwoLabel: "Hair colour",
      notesLabel: "Stylist notes",
      fileName: "salondossier-customer-template.csv"
    },
    MASSAGE: {
      fieldOneLabel: "Complaint area",
      fieldTwoLabel: "Pressure preference",
      notesLabel: "Therapist notes",
      fileName: "salondossier-customer-template.csv"
    },
    BEAUTY: {
      fieldOneLabel: "Skin type",
      fieldTwoLabel: "Skin condition",
      notesLabel: "Specialist notes",
      fileName: "salondossier-customer-template.csv"
    }
  },
  de: {
    HAIR: {
      fieldOneLabel: "Haartyp",
      fieldTwoLabel: "Haarfarbe",
      notesLabel: "Notizen Stylistin / Stylist",
      fileName: "salondossier-kunden-vorlage.csv"
    },
    MASSAGE: {
      fieldOneLabel: "Beschwerdebereich",
      fieldTwoLabel: "Druckvorliebe",
      notesLabel: "Notizen Masseurin / Masseur",
      fileName: "salondossier-kunden-vorlage.csv"
    },
    BEAUTY: {
      fieldOneLabel: "Hauttyp",
      fieldTwoLabel: "Hautzustand",
      notesLabel: "Notizen Spezialistin / Spezialist",
      fileName: "salondossier-kunden-vorlage.csv"
    }
  }
};

export function getCustomerImportTemplate(locale: Locale, branchType: BranchType) {
  const copy = templateCopy[locale][branchType];

  const columns: TemplateColumn[] = [
    { label: "Naam", example: "Eva Jansen" },
    { label: "Telefoonnummer", example: "0612345678" },
    { label: "Adres", example: "Voorbeeldstraat 12, 1234 AB Amsterdam" },
    { label: "Geboortedatum (YYYY-MM-DD)", example: "1990-05-14" },
    { label: "Allergieen", example: "Parfumvrij werken" },
    {
      label: copy.fieldOneLabel,
      example:
        branchType === "HAIR"
          ? "Krullend"
          : branchType === "MASSAGE"
            ? "Nek en schouders"
            : "Gecombineerd"
    },
    {
      label: copy.fieldTwoLabel,
      example:
        branchType === "HAIR"
          ? "Donkerblond"
          : branchType === "MASSAGE"
            ? "Gemiddeld"
            : "Vochtarm"
    },
    {
      label: copy.notesLabel,
      example:
        branchType === "HAIR"
          ? "Toner volgende keer iets koeler."
          : branchType === "MASSAGE"
            ? "Meer focus op bovenrug, rustige druk op onderrug."
            : "Huid reageert goed op milde peeling."
    }
  ];

  return {
    fileName: copy.fileName,
    headers: columns.map((column) => column.label),
    exampleRow: columns.map((column) => column.example),
    csv: [buildCsvRow(columns.map((column) => column.label)), buildCsvRow(columns.map((column) => column.example))].join("\n")
  };
}
