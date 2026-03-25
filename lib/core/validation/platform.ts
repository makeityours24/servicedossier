import { z } from "zod";

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
