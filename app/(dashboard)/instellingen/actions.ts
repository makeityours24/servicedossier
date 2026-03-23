"use server";

import { revalidatePath } from "next/cache";
import type { Prisma } from "@prisma/client";
import type { FormState } from "@/components/customer-form";
import { requireSalonSession } from "@/lib/auth";
import { getDefaultTreatmentPresets, normalizeBranchType } from "@/lib/branch-profile";
import { prisma } from "@/lib/prisma";
import {
  assertSensitiveActionAllowed,
  clearSensitiveActionThrottle,
  createAuditLog,
  getRequestIp,
  registerSensitiveActionAttempt
} from "@/lib/security";
import { salonSettingsSchema } from "@/lib/validation";

const salonSettingsSelect = {
  weergavenaam: true,
  branchType: true,
  contactEmail: true,
  contactTelefoon: true,
  adres: true,
  primaireKleur: true,
  logoUrl: true,
  treatmentPresets: true
} satisfies Prisma.SalonSettingsSelect;

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
    branchType: formData.get("branchType"),
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
    const selectedBranchType = normalizeBranchType(parsed.data.branchType);
    const treatmentPresets = parsed.data.treatmentPresets
      .split("\n")
      .map((value) => value.trim())
      .filter(Boolean)
      .slice(0, 12);
    const effectiveTreatmentPresets =
      treatmentPresets.length > 0 ? treatmentPresets : getDefaultTreatmentPresets(selectedBranchType);

    const existingSettings = await prisma.salonSettings.findUnique({
      where: { salonId: user.salonId },
      select: salonSettingsSelect
    });

    await prisma.salonSettings.upsert({
      where: { salonId: user.salonId },
      update: {
        weergavenaam: parsed.data.weergavenaam,
        branchType: selectedBranchType,
        contactEmail: parsed.data.contactEmail || null,
        contactTelefoon: parsed.data.contactTelefoon || null,
        adres: parsed.data.adres || null,
        primaireKleur: parsed.data.primaireKleur,
        logoUrl: parsed.data.logoUrl || null,
        treatmentPresets: effectiveTreatmentPresets
      },
      create: {
        salonId: user.salonId,
        weergavenaam: parsed.data.weergavenaam,
        branchType: selectedBranchType,
        contactEmail: parsed.data.contactEmail || null,
        contactTelefoon: parsed.data.contactTelefoon || null,
        adres: parsed.data.adres || null,
        primaireKleur: parsed.data.primaireKleur,
        logoUrl: parsed.data.logoUrl || null,
        treatmentPresets: effectiveTreatmentPresets
      }
    });

    const changedFields = [
      existingSettings?.weergavenaam !== parsed.data.weergavenaam ? "weergavenaam" : null,
      existingSettings?.branchType !== selectedBranchType ? "branchType" : null,
      (existingSettings?.contactEmail ?? null) !== (parsed.data.contactEmail || null) ? "contactEmail" : null,
      (existingSettings?.contactTelefoon ?? null) !== (parsed.data.contactTelefoon || null)
        ? "contactTelefoon"
        : null,
      (existingSettings?.adres ?? null) !== (parsed.data.adres || null) ? "adres" : null,
      existingSettings?.primaireKleur !== parsed.data.primaireKleur ? "primaireKleur" : null,
      (existingSettings?.logoUrl ?? null) !== (parsed.data.logoUrl || null) ? "logoUrl" : null,
      JSON.stringify(existingSettings?.treatmentPresets ?? []) !== JSON.stringify(effectiveTreatmentPresets)
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
        branchType: selectedBranchType,
        treatmentPresetCount: effectiveTreatmentPresets.length
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
