"use server";

import { revalidatePath } from "next/cache";
import type { FormState } from "@/components/customer-form";
import { requireSalonSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import {
  assertSensitiveActionAllowed,
  clearSensitiveActionThrottle,
  createAuditLog,
  getRequestIp,
  registerSensitiveActionAttempt
} from "@/lib/security";
import { salonSettingsSchema } from "@/lib/validation";

export async function updateSalonSettingsAction(
  _: FormState,
  formData: FormData
): Promise<FormState> {
  const user = await requireSalonSession();
  const ipAddress = await getRequestIp();
  const throttle = await assertSensitiveActionAllowed({
    action: "SALON_SETTINGS_UPDATE",
    actorUserId: user.id,
    salonId: user.salonId,
    ipAddress
  });

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

  if (!throttle.allowed) {
    return { error: throttle.error };
  }

  try {
    const treatmentPresets = parsed.data.treatmentPresets
      .split("\n")
      .map((value) => value.trim())
      .filter(Boolean)
      .slice(0, 12);

    const existingSettings = await prisma.salonSettings.findUnique({
      where: { salonId: user.salonId },
      select: {
        weergavenaam: true,
        contactEmail: true,
        contactTelefoon: true,
        adres: true,
        primaireKleur: true,
        logoUrl: true,
        treatmentPresets: true
      }
    });

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

    const changedFields = [
      existingSettings?.weergavenaam !== parsed.data.weergavenaam ? "weergavenaam" : null,
      (existingSettings?.contactEmail ?? null) !== (parsed.data.contactEmail || null) ? "contactEmail" : null,
      (existingSettings?.contactTelefoon ?? null) !== (parsed.data.contactTelefoon || null)
        ? "contactTelefoon"
        : null,
      (existingSettings?.adres ?? null) !== (parsed.data.adres || null) ? "adres" : null,
      existingSettings?.primaireKleur !== parsed.data.primaireKleur ? "primaireKleur" : null,
      (existingSettings?.logoUrl ?? null) !== (parsed.data.logoUrl || null) ? "logoUrl" : null,
      JSON.stringify(existingSettings?.treatmentPresets ?? []) !== JSON.stringify(treatmentPresets)
        ? "treatmentPresets"
        : null
    ].filter(Boolean);

    await createAuditLog({
      salonId: user.salonId,
      actorUserId: user.id,
      action: "SALON_SETTINGS_UPDATED",
      entityType: "SALON_SETTINGS",
      entityId: user.salonId,
      message: "Saloninstellingen bijgewerkt.",
      ipAddress,
      metadata: {
        changedFields,
        treatmentPresetCount: treatmentPresets.length
      }
    });
    await clearSensitiveActionThrottle(throttle.key);

    revalidatePath("/dashboard");
    revalidatePath("/instellingen");
    revalidatePath("/klanten");
    return { success: "Saloninstellingen zijn bijgewerkt." };
  } catch {
    await registerSensitiveActionAttempt({
      key: throttle.key,
      action: "SALON_SETTINGS_UPDATE",
      actorUserId: user.id,
      salonId: user.salonId,
      ipAddress
    });
    return { error: "Opslaan van de instellingen is mislukt." };
  }
}
