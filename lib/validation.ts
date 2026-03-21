import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().email("Vul een geldig e-mailadres in."),
  wachtwoord: z.string().min(6, "Vul uw wachtwoord in.")
}).strict();

export const passwordChangeSchema = z
  .object({
    huidigWachtwoord: z.string().optional().or(z.literal("")),
    nieuwWachtwoord: z.string().min(8, "Nieuw wachtwoord moet minimaal 8 tekens bevatten."),
    bevestigWachtwoord: z.string().min(8, "Bevestig het nieuwe wachtwoord.")
  })
  .strict()
  .refine((data) => data.nieuwWachtwoord === data.bevestigWachtwoord, {
    message: "De wachtwoorden komen niet overeen.",
    path: ["bevestigWachtwoord"]
  });

export const passwordResetRequestSchema = z
  .object({
    email: z.string().email("Vul een geldig e-mailadres in.")
  })
  .strict();

export const passwordResetCompleteSchema = z
  .object({
    token: z.string().min(20, "Deze resetlink is ongeldig of verlopen."),
    nieuwWachtwoord: z.string().min(8, "Nieuw wachtwoord moet minimaal 8 tekens bevatten."),
    bevestigWachtwoord: z.string().min(8, "Bevestig het nieuwe wachtwoord.")
  })
  .strict()
  .refine((data) => data.nieuwWachtwoord === data.bevestigWachtwoord, {
    message: "De wachtwoorden komen niet overeen.",
    path: ["bevestigWachtwoord"]
  });

export const customerSchema = z.object({
  naam: z.string().min(2, "Naam is verplicht."),
  adres: z.string().min(5, "Adres is verplicht."),
  telefoonnummer: z
    .string()
    .min(8, "Telefoonnummer is verplicht.")
    .max(20, "Telefoonnummer is te lang."),
  geboortedatum: z
    .string()
    .optional()
    .or(z.literal(""))
    .refine((value) => !value || !Number.isNaN(new Date(value).getTime()), "Gebruik een geldige geboortedatum."),
  allergieen: z.string().trim().max(500, "Allergieen zijn te lang.").optional(),
  haartype: z.string().trim().max(80, "Haartype is te lang.").optional(),
  haarkleur: z.string().trim().max(80, "Haarkleur is te lang.").optional(),
  stylistNotities: z.string().trim().max(1000, "Notities van de stylist zijn te lang.").optional()
}).strict();

export const treatmentSchema = z.object({
  customerId: z.coerce.number().int().positive(),
  appointmentId: z
    .union([z.coerce.number().int().positive(), z.literal(""), z.null(), z.undefined()])
    .transform((value) => (typeof value === "number" ? value : null)),
  datum: z
    .string()
    .min(1, "Datum is verplicht.")
    .refine((value) => !Number.isNaN(new Date(value).getTime()), "Vul een geldige datum in."),
  behandeling: z.string().min(2, "Behandeling is verplicht."),
  recept: z.string().min(2, "Recept is verplicht."),
  behandelaarUserId: z
    .union([z.coerce.number().int().positive(), z.literal(""), z.null(), z.undefined()])
    .transform((value) => (typeof value === "number" ? value : null)),
  behandelaar: z.string().min(2, "Naam behandelaar is verplicht."),
  notities: z.string().optional(),
  customerPackageId: z
    .union([z.coerce.number().int().positive(), z.literal(""), z.null(), z.undefined()])
    .transform((value) => (typeof value === "number" ? value : null))
}).strict();

export const treatmentFilterSchema = z.object({
  van: z.string().optional(),
  tot: z.string().optional(),
  medewerker: z.string().optional()
});

export const recipeTemplateSchema = z.object({
  naam: z.string().min(2, "Naam van het sjabloon is verplicht."),
  behandeling: z.string().min(2, "Behandeling is verplicht."),
  recept: z.string().min(2, "Recept is verplicht."),
  notities: z.string().optional()
}).strict();

export const recipeTemplateUpdateSchema = recipeTemplateSchema.extend({
  templateId: z.coerce.number().int().positive()
});

export const packageTypeSchema = z.object({
  naam: z.string().min(2, "Naam van het pakket is verplicht."),
  omschrijving: z.string().trim().max(300, "Omschrijving is te lang.").optional(),
  totaalBeurten: z.coerce.number().int().positive("Aantal beurten moet minimaal 1 zijn."),
  pakketPrijs: z.coerce.number().positive("Pakketprijs moet groter zijn dan 0."),
  lossePrijs: z.coerce.number().positive("Losse prijs moet groter zijn dan 0."),
  standaardBehandeling: z.string().min(2, "Standaardbehandeling is verplicht."),
  weergaveType: z.enum(["PAKKET", "STEMPELKAART"]).default("PAKKET"),
  isActief: z.enum(["true", "false"]).default("true")
}).strict();

export const packageTypeUpdateSchema = packageTypeSchema.extend({
  packageTypeId: z.coerce.number().int().positive()
});

export const customerPackageSchema = z.object({
  customerId: z.coerce.number().int().positive(),
  packageTypeId: z.coerce.number().int().positive("Kies een pakkettype."),
  invoerType: z.enum(["NIEUW", "OVERNAME"]).default("NIEUW"),
  resterendeBeurten: z
    .union([z.coerce.number().int().min(0), z.literal(""), z.null(), z.undefined()])
    .transform((value) => (typeof value === "number" ? value : null)),
  notities: z.string().trim().max(300, "Notities zijn te lang.").optional()
}).strict();

export const customerPackageCorrectionSchema = z.object({
  customerPackageId: z.coerce.number().int().positive(),
  richting: z.enum(["AFBOEKEN", "TERUGZETTEN"]),
  aantal: z.coerce.number().int().min(1, "Aantal moet minimaal 1 zijn.").max(20, "Aantal is te hoog."),
  notitie: z.string().trim().min(3, "Geef kort de reden van de correctie op.").max(300, "Notities zijn te lang.")
}).strict();

export const treatmentPhotoSchema = z.object({
  customerId: z.coerce.number().int().positive(),
  treatmentId: z.coerce.number().int().positive(),
  soort: z.enum(["VOOR", "NA", "ALGEMEEN"]).default("ALGEMEEN"),
  notitie: z.string().trim().max(300, "Notities zijn te lang.").optional()
}).strict();

const appointmentBaseSchema = z.object({
  customerId: z.coerce.number().int().positive("Kies een klant."),
  userId: z
    .union([z.coerce.number().int().positive(), z.literal(""), z.null(), z.undefined()])
    .transform((value) => (typeof value === "number" ? value : null)),
  datumStart: z
    .string()
    .min(1, "Starttijd is verplicht.")
    .refine((value) => !Number.isNaN(new Date(value).getTime()), "Vul een geldige starttijd in."),
  duurMinuten: z.coerce.number().int().min(15, "Duur moet minimaal 15 minuten zijn."),
  behandeling: z.string().min(2, "Behandeling is verplicht."),
  behandelingKleur: z
    .string()
    .regex(/^#[0-9A-Fa-f]{6}$/, "Gebruik een geldige kleur, bijvoorbeeld #B42323."),
  notities: z.string().trim().max(500, "Notities zijn te lang.").optional(),
  status: z.enum(["GEPLAND", "VOLTOOID", "GEANNULEERD", "NIET_GEKOMEN"]).default("GEPLAND")
}).strict();

export const appointmentSchema = appointmentBaseSchema;

export const appointmentUpdateSchema = appointmentBaseSchema.extend({
  appointmentId: z.coerce.number().int().positive()
});

export const salonSettingsSchema = z.object({
  weergavenaam: z.string().min(2, "Salonnaam is verplicht."),
  contactEmail: z
    .string()
    .trim()
    .optional()
    .or(z.literal(""))
    .refine((value) => !value || z.string().email().safeParse(value).success, "Gebruik een geldig e-mailadres."),
  contactTelefoon: z.string().trim().max(30, "Telefoonnummer is te lang.").optional(),
  adres: z.string().trim().max(200, "Adres is te lang.").optional(),
  primaireKleur: z
    .string()
    .regex(/^#[0-9A-Fa-f]{6}$/, "Gebruik een geldige hex-kleur, bijvoorbeeld #B42323."),
  logoUrl: z.string().trim().max(400, "Logo URL is te lang.").optional(),
  treatmentPresets: z.string().max(500, "De lijst met snelkeuzes is te lang.")
}).strict();

export const medewerkerSchema = z.object({
  naam: z.string().min(2, "Naam is verplicht."),
  email: z.string().email("Gebruik een geldig e-mailadres."),
  wachtwoord: z.string().min(8, "Wachtwoord moet minimaal 8 tekens bevatten."),
  rol: z.enum(["OWNER", "ADMIN", "MEDEWERKER"]),
  status: z.enum(["ACTIEF", "UITGESCHAKELD"]).default("ACTIEF")
}).strict();

export const medewerkerUpdateSchema = z.object({
  medewerkerId: z.coerce.number().int().positive(),
  naam: z.string().min(2, "Naam is verplicht."),
  email: z.string().email("Gebruik een geldig e-mailadres."),
  wachtwoord: z
    .string()
    .optional()
    .or(z.literal(""))
    .refine((value) => !value || value.length >= 8, "Wachtwoord moet minimaal 8 tekens bevatten."),
  rol: z.enum(["OWNER", "ADMIN", "MEDEWERKER"]),
  status: z.enum(["ACTIEF", "UITGESCHAKELD"]).default("ACTIEF")
}).strict();

export const platformSalonSchema = z.object({
  naam: z.string().min(2, "Salonnaam is verplicht."),
  status: z.enum(["ACTIEF", "GEPAUZEERD"]).default("ACTIEF"),
  email: z
    .string()
    .trim()
    .optional()
    .or(z.literal(""))
    .refine((value) => !value || z.string().email().safeParse(value).success, "Gebruik een geldig e-mailadres voor de salon."),
  telefoonnummer: z.string().trim().max(30, "Telefoonnummer is te lang.").optional(),
  adres: z.string().trim().max(200, "Adres is te lang.").optional(),
  eigenaarNaam: z.string().min(2, "Naam van de eigenaar is verplicht."),
  eigenaarEmail: z.string().email("Gebruik een geldig e-mailadres voor de eigenaar."),
  eigenaarWachtwoord: z.string().min(8, "Wachtwoord moet minimaal 8 tekens bevatten.")
}).strict();

export const platformSalonUpdateSchema = z.object({
  salonId: z.coerce.number().int().positive(),
  naam: z.string().min(2, "Salonnaam is verplicht."),
  status: z.enum(["ACTIEF", "GEPAUZEERD"]).default("ACTIEF"),
  email: z
    .string()
    .trim()
    .optional()
    .or(z.literal(""))
    .refine(
      (value) => !value || z.string().email().safeParse(value).success,
      "Gebruik een geldig e-mailadres voor de salon."
    ),
  telefoonnummer: z.string().trim().max(30, "Telefoonnummer is te lang.").optional(),
  adres: z.string().trim().max(200, "Adres is te lang.").optional()
}).strict();
