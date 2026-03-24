import type { BranchType } from "@/lib/branch-profile";
import type { Locale } from "@/lib/i18n";
import { buildCsvRow } from "@/lib/utils";
import { customerSchema } from "@/lib/validation";

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

export type CustomerImportPreviewRow = {
  rowNumber: number;
  naam: string;
  telefoonnummer: string;
  adres: string;
};

export type CustomerImportPreviewError = {
  rowNumber: number;
  message: string;
};

export type CustomerImportPreview = {
  totalRows: number;
  validRows: number;
  invalidRows: number;
  previewRows: CustomerImportPreviewRow[];
  errors: CustomerImportPreviewError[];
};

export type CustomerImportRecord = {
  naam: string;
  telefoonnummer: string;
  adres: string;
  geboortedatum: string;
  allergieen?: string;
  haartype?: string;
  haarkleur?: string;
  stylistNotities?: string;
};

const MAX_IMPORT_FILE_SIZE_BYTES = 1024 * 1024;

export async function buildCustomerImportPreview(params: {
  file: File;
  locale: Locale;
  branchType: BranchType;
}): Promise<CustomerImportPreview> {
  return (await parseCustomerImportFile(params)).preview;
}

export async function parseCustomerImportFile(params: {
  file: File;
  locale: Locale;
  branchType: BranchType;
}): Promise<{
  preview: CustomerImportPreview;
  validRecords: CustomerImportRecord[];
}> {
  validateImportFile(params.file);

  const template = getCustomerImportTemplate(params.locale, params.branchType);
  const rows = parseCsv(params.file.name, await params.file.text());

  if (rows.length < 2) {
    throw new Error("Het bestand bevat nog geen klantregels. Vul minimaal één klant in onder de kolomnamen.");
  }

  const normalizedHeader = rows[0].map(normalizeCellValue);
  const expectedHeader = template.headers.map(normalizeCellValue);

  if (
    normalizedHeader.length !== expectedHeader.length ||
    normalizedHeader.some((value, index) => value !== expectedHeader[index])
  ) {
    throw new Error("Gebruik de SalonDossier-template en laat de kolomnamen ongewijzigd.");
  }

  const previewRows: CustomerImportPreviewRow[] = [];
  const errors: CustomerImportPreviewError[] = [];
  const seenPhoneNumbers = new Set<string>();
  const validRecords: CustomerImportRecord[] = [];
  let validRows = 0;

  for (let index = 1; index < rows.length; index += 1) {
    const rowNumber = index + 1;
    const row = rows[index];

    if (row.every((value) => !normalizeCellValue(value))) {
      continue;
    }

    const record = {
      naam: normalizeCellValue(row[0]),
      telefoonnummer: normalizeCellValue(row[1]),
      adres: normalizeCellValue(row[2]),
      geboortedatum: normalizeCellValue(row[3]),
      allergieen: normalizeCellValue(row[4]) || undefined,
      haartype: normalizeCellValue(row[5]) || undefined,
      haarkleur: normalizeCellValue(row[6]) || undefined,
      stylistNotities: normalizeCellValue(row[7]) || undefined
    };

    const parsed = customerSchema.safeParse(record);
    if (!parsed.success) {
      errors.push({
        rowNumber,
        message: parsed.error.issues[0]?.message ?? "Controleer deze rij."
      });
      continue;
    }

    const normalizedPhone = record.telefoonnummer.replace(/\s+/g, "");
    if (seenPhoneNumbers.has(normalizedPhone)) {
      errors.push({
        rowNumber,
        message: "Dit telefoonnummer komt dubbel voor in hetzelfde bestand."
      });
      continue;
    }

    seenPhoneNumbers.add(normalizedPhone);
    validRows += 1;
    validRecords.push({
      naam: parsed.data.naam,
      telefoonnummer: parsed.data.telefoonnummer,
      adres: parsed.data.adres,
      geboortedatum: parsed.data.geboortedatum ?? "",
      allergieen: parsed.data.allergieen,
      haartype: parsed.data.haartype,
      haarkleur: parsed.data.haarkleur,
      stylistNotities: parsed.data.stylistNotities
    });

    if (previewRows.length < 8) {
      previewRows.push({
        rowNumber,
        naam: parsed.data.naam,
        telefoonnummer: parsed.data.telefoonnummer,
        adres: parsed.data.adres
      });
    }
  }

  return {
    preview: {
      totalRows: validRows + errors.length,
      validRows,
      invalidRows: errors.length,
      previewRows,
      errors: errors.slice(0, 12)
    },
    validRecords
  };
}

function validateImportFile(file: File) {
  if (!file || file.size === 0) {
    throw new Error("Kies eerst een ingevuld CSV-bestand.");
  }

  if (file.size > MAX_IMPORT_FILE_SIZE_BYTES) {
    throw new Error("Het bestand is te groot. Gebruik een CSV-bestand tot maximaal 1 MB.");
  }

  if (!file.name.toLowerCase().endsWith(".csv")) {
    throw new Error("Gebruik een CSV-bestand dat uit de SalonDossier-template komt.");
  }
}

function parseCsv(fileName: string, raw: string) {
  const rows: string[][] = [];
  let currentValue = "";
  let currentRow: string[] = [];
  let inQuotes = false;
  const content = raw.replace(/^\uFEFF/, "");

  for (let index = 0; index < content.length; index += 1) {
    const character = content[index];
    const nextCharacter = content[index + 1];

    if (character === '"') {
      if (inQuotes && nextCharacter === '"') {
        currentValue += '"';
        index += 1;
      } else {
        inQuotes = !inQuotes;
      }
      continue;
    }

    if (character === "," && !inQuotes) {
      currentRow.push(currentValue);
      currentValue = "";
      continue;
    }

    if ((character === "\n" || character === "\r") && !inQuotes) {
      if (character === "\r" && nextCharacter === "\n") {
        index += 1;
      }
      currentRow.push(currentValue);
      rows.push(currentRow);
      currentRow = [];
      currentValue = "";
      continue;
    }

    currentValue += character;
  }

  if (inQuotes) {
    throw new Error(`Het CSV-bestand "${fileName}" bevat een ongeldige quote-opmaak.`);
  }

  if (currentValue.length > 0 || currentRow.length > 0) {
    currentRow.push(currentValue);
    rows.push(currentRow);
  }

  return rows;
}

function normalizeCellValue(value: string | undefined) {
  return (value ?? "").trim();
}
