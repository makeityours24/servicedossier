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
