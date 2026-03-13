"use server";

import { revalidatePath } from "next/cache";
import type { FormState } from "@/components/customer-form";
import { requireSalonSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { salonSettingsSchema } from "@/lib/validation";

export async function updateSalonSettingsAction(
  _: FormState,
  formData: FormData
): Promise<FormState> {
  const user = await requireSalonSession();

  const parsed = salonSettingsSchema.safeParse({
    weergavenaam: formData.get("weergavenaam"),
    contactEmail: formData.get("contactEmail") || "",
    contactTelefoon: formData.get("contactTelefoon") || "",
    adres: formData.get("adres") || "",
    primaireKleur: formData.get("primaireKleur"),
    logoUrl: formData.get("logoUrl") || "",
    treatmentPresets: formData.get("treatmentPresets") || ""
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Controleer de instellingen." };
  }

  try {
    const treatmentPresets = parsed.data.treatmentPresets
      .split("\n")
      .map((value) => value.trim())
      .filter(Boolean)
      .slice(0, 12);

    await prisma.salonSettings.upsert({
      where: { salonId: user.salonId },
      update: {
        weergavenaam: parsed.data.weergavenaam,
        contactEmail: parsed.data.contactEmail || null,
        contactTelefoon: parsed.data.contactTelefoon || null,
        adres: parsed.data.adres || null,
        primaireKleur: parsed.data.primaireKleur,
        logoUrl: parsed.data.logoUrl || null,
        treatmentPresets
      },
      create: {
        salonId: user.salonId,
        weergavenaam: parsed.data.weergavenaam,
        contactEmail: parsed.data.contactEmail || null,
        contactTelefoon: parsed.data.contactTelefoon || null,
        adres: parsed.data.adres || null,
        primaireKleur: parsed.data.primaireKleur,
        logoUrl: parsed.data.logoUrl || null,
        treatmentPresets
      }
    });

    revalidatePath("/dashboard");
    revalidatePath("/instellingen");
    revalidatePath("/klanten");
    return { success: "Saloninstellingen zijn bijgewerkt." };
  } catch {
    return { error: "Opslaan van de instellingen is mislukt." };
  }
}
