import { z } from "zod";

export const customerAccountSchema = z.object({
  type: z.enum(["PARTICULIER", "BEDRIJF"]).default("PARTICULIER"),
  naam: z.string().trim().min(2, "Naam is verplicht."),
  klantnummer: z.string().trim().max(50, "Klantnummer is te lang.").optional(),
  email: z
    .string()
    .trim()
    .optional()
    .or(z.literal(""))
    .refine((value) => !value || z.string().email().safeParse(value).success, "Gebruik een geldig e-mailadres."),
  telefoon: z.string().trim().max(30, "Telefoonnummer is te lang.").optional(),
  factuurEmail: z
    .string()
    .trim()
    .optional()
    .or(z.literal(""))
    .refine((value) => !value || z.string().email().safeParse(value).success, "Gebruik een geldig factuur e-mailadres."),
  kvkNummer: z.string().trim().max(20, "KvK-nummer is te lang.").optional(),
  btwNummer: z.string().trim().max(30, "BTW-nummer is te lang.").optional(),
  notities: z.string().trim().max(1000, "Notities zijn te lang.").optional()
}).strict();

export const contactPersonSchema = z.object({
  naam: z.string().trim().min(2, "Naam is verplicht."),
  functie: z.string().trim().max(80, "Functie is te lang.").optional(),
  email: z
    .string()
    .trim()
    .optional()
    .or(z.literal(""))
    .refine((value) => !value || z.string().email().safeParse(value).success, "Gebruik een geldig e-mailadres."),
  telefoon: z.string().trim().max(30, "Telefoonnummer is te lang.").optional(),
  isPrimary: z.enum(["true", "false"]).default("false"),
  notities: z.string().trim().max(500, "Notities zijn te lang.").optional()
}).strict();

export const serviceLocationSchema = z.object({
  naam: z.string().trim().max(120, "Locatienaam is te lang.").optional(),
  adresregel1: z.string().trim().min(4, "Adres is verplicht."),
  adresregel2: z.string().trim().max(120, "Adresregel 2 is te lang.").optional(),
  postcode: z.string().trim().min(4, "Postcode is verplicht.").max(20, "Postcode is te lang."),
  plaats: z.string().trim().min(2, "Plaats is verplicht.").max(80, "Plaats is te lang."),
  land: z.string().trim().min(2, "Land is verplicht.").max(2, "Gebruik een landcode van 2 letters.").default("NL"),
  toegangsinstructies: z.string().trim().max(500, "Toegangsinstructies zijn te lang.").optional(),
  locatieNotities: z.string().trim().max(1000, "Locatienotities zijn te lang.").optional()
}).strict();

export const assetSchema = z.object({
  type: z.enum(["CV", "WARMTEPOMP", "AIRCO", "ZONNEPANELEN", "LAADPAAL", "OVERIG"]),
  merk: z.string().trim().max(80, "Merk is te lang.").optional(),
  model: z.string().trim().max(120, "Model is te lang.").optional(),
  serienummer: z.string().trim().max(120, "Serienummer is te lang.").optional(),
  internNummer: z.string().trim().max(80, "Intern nummer is te lang.").optional(),
  status: z.enum(["ACTIEF", "BUITEN_GEBRUIK", "VERVANGEN"]).default("ACTIEF"),
  plaatsingsDatum: z
    .string()
    .optional()
    .or(z.literal(""))
    .refine((value) => !value || !Number.isNaN(new Date(value).getTime()), "Gebruik een geldige plaatsingsdatum."),
  garantieTot: z
    .string()
    .optional()
    .or(z.literal(""))
    .refine((value) => !value || !Number.isNaN(new Date(value).getTime()), "Gebruik een geldige garantiedatum."),
  omschrijving: z.string().trim().max(500, "Omschrijving is te lang.").optional(),
  notities: z.string().trim().max(1000, "Notities zijn te lang.").optional()
}).strict();

export const workOrderSchema = z.object({
  customerAccountId: z.coerce.number().int().positive(),
  serviceLocationId: z.coerce.number().int().positive(),
  assetId: z
    .union([z.coerce.number().int().positive(), z.literal(""), z.null(), z.undefined()])
    .transform((value) => (typeof value === "number" ? value : null)),
  type: z.enum(["STORING", "ONDERHOUD", "MONTAGE", "INSPECTIE", "OPNAME"]),
  status: z.enum(["NIEUW", "INGEPLAND", "ONDERWEG", "IN_UITVOERING", "AFGEROND", "VERVOLG_NODIG", "GEANNULEERD"]).default("NIEUW"),
  prioriteit: z.enum(["LAAG", "NORMAAL", "HOOG", "SPOED"]).default("NORMAAL"),
  titel: z.string().trim().min(2, "Titel is verplicht."),
  melding: z.string().trim().min(3, "Melding is verplicht."),
  interneNotities: z.string().trim().max(1000, "Interne notities zijn te lang.").optional(),
  klantNotities: z.string().trim().max(1000, "Klantnotities zijn te lang.").optional(),
  geplandStart: z
    .string()
    .optional()
    .or(z.literal(""))
    .refine((value) => !value || !Number.isNaN(new Date(value).getTime()), "Gebruik een geldige starttijd."),
  geplandEinde: z
    .string()
    .optional()
    .or(z.literal(""))
    .refine((value) => !value || !Number.isNaN(new Date(value).getTime()), "Gebruik een geldige eindtijd.")
}).strict();

export const customerPortalUserSchema = z.object({
  naam: z.string().trim().min(2, "Naam is verplicht."),
  email: z.string().email("Gebruik een geldig e-mailadres."),
  wachtwoord: z.string().min(8, "Wachtwoord moet minimaal 8 tekens bevatten.")
}).strict();

const appointmentPreferenceSchema = z.object({
  datum: z
    .string()
    .min(1, "Datum is verplicht.")
    .refine((value) => !Number.isNaN(new Date(value).getTime()), "Gebruik een geldige datum."),
  startTijd: z.string().min(1, "Starttijd is verplicht."),
  eindTijd: z.string().min(1, "Eindtijd is verplicht.")
}).strict();

export const appointmentRequestSchema = z
  .object({
    serviceLocationId: z.coerce.number().int().positive(),
    assetId: z
      .union([z.coerce.number().int().positive(), z.literal(""), z.null(), z.undefined()])
      .transform((value) => (typeof value === "number" ? value : null)),
    type: z.enum(["ONDERHOUD", "STORING", "INSPECTIE", "OVERIG"]).default("OVERIG"),
    toelichting: z.string().trim().min(3, "Toelichting is verplicht.").max(1000, "Toelichting is te lang."),
    voorkeuren: z.array(appointmentPreferenceSchema).length(3, "Geef exact drie voorkeuren op.")
  })
  .strict()
  .superRefine((data, ctx) => {
    const dagen = new Set<string>();

    data.voorkeuren.forEach((voorkeur, index) => {
      const start = new Date(`${voorkeur.datum}T${voorkeur.startTijd}`);
      const einde = new Date(`${voorkeur.datum}T${voorkeur.eindTijd}`);

      if (Number.isNaN(start.getTime()) || Number.isNaN(einde.getTime())) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Gebruik geldige tijdsblokken.",
          path: ["voorkeuren", index]
        });
        return;
      }

      const duur = einde.getTime() - start.getTime();
      if (duur !== 2 * 60 * 60 * 1000) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Elk voorkeurblok moet exact 2 uur duren.",
          path: ["voorkeuren", index, "eindTijd"]
        });
      }

      dagen.add(voorkeur.datum);
    });

    if (dagen.size !== 3) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "De drie voorkeuren moeten op drie verschillende dagen liggen.",
        path: ["voorkeuren"]
      });
    }
  });
