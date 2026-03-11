import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().email("Vul een geldig e-mailadres in."),
  wachtwoord: z.string().min(6, "Vul uw wachtwoord in.")
});

export const customerSchema = z.object({
  naam: z.string().min(2, "Naam is verplicht."),
  adres: z.string().min(5, "Adres is verplicht."),
  telefoonnummer: z
    .string()
    .min(8, "Telefoonnummer is verplicht.")
    .max(20, "Telefoonnummer is te lang.")
});

export const treatmentSchema = z.object({
  customerId: z.coerce.number().int().positive(),
  datum: z
    .string()
    .min(1, "Datum is verplicht.")
    .refine((value) => !Number.isNaN(new Date(value).getTime()), "Vul een geldige datum in."),
  behandeling: z.string().min(2, "Behandeling is verplicht."),
  recept: z.string().min(2, "Recept is verplicht."),
  behandelaar: z.string().min(2, "Naam behandelaar is verplicht."),
  notities: z.string().optional()
});

export const treatmentFilterSchema = z.object({
  van: z.string().optional(),
  tot: z.string().optional(),
  medewerker: z.string().optional()
});
