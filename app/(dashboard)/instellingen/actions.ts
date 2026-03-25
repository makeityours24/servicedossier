"use server";

import { del, put } from "@vercel/blob";
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
import { salonSettingsSchema } from "@/lib/salon/validation";

const salonSettingsSelect = {
  weergavenaam: true,
  branchType: true,
  contactEmail: true,
  contactTelefoon: true,
  adres: true,
  primaireKleur: true,
  logoUrl: true,
  logoBlobPath: true,
  treatmentPresets: true
} satisfies Prisma.SalonSettingsSelect;

const MAX_LOGO_FILE_SIZE = 2 * 1024 * 1024;
const ALLOWED_LOGO_TYPES = new Set(["image/jpeg", "image/png", "image/webp", "image/svg+xml"]);

function sanitizeFileName(value: string) {
  return value
    .normalize("NFKD")
    .replace(/[^\w.-]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
    .toLowerCase();
}

function buildSalonLogoBlobPath(params: { salonId: number; originalName: string }) {
  const sanitized = sanitizeFileName(params.originalName || "salon-logo");
  return `salons/${params.salonId}/branding/${Date.now()}-${sanitized}`;
}

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
    const uploadedLogo = formData.get("logoBestand");
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

    let nextLogoUrl = parsed.data.logoUrl || null;
    let nextLogoBlobPath = existingSettings?.logoBlobPath ?? null;

    if (uploadedLogo instanceof File && uploadedLogo.size > 0) {
      if (!ALLOWED_LOGO_TYPES.has(uploadedLogo.type)) {
        return { error: "Gebruik voor het logo alleen JPG, PNG, WEBP of SVG." };
      }

      if (uploadedLogo.size > MAX_LOGO_FILE_SIZE) {
        return { error: "Het logo is te groot. Gebruik een bestand tot maximaal 2 MB." };
      }

      if (!process.env.BLOB_READ_WRITE_TOKEN) {
        return {
          error:
            "Logo-opslag is nog niet geconfigureerd. Voeg eerst Vercel Blob toe en zet BLOB_READ_WRITE_TOKEN in je omgeving."
        };
      }

      const blob = await put(
        buildSalonLogoBlobPath({
          salonId: user.salonId,
          originalName: uploadedLogo.name
        }),
        uploadedLogo,
        {
          access: "public",
          addRandomSuffix: true,
          contentType: uploadedLogo.type
        }
      );

      nextLogoUrl = blob.url;
      nextLogoBlobPath = blob.pathname;

      if (existingSettings?.logoBlobPath) {
        await del(existingSettings.logoBlobPath);
      }
    } else if (!parsed.data.logoUrl && existingSettings?.logoBlobPath) {
      if (process.env.BLOB_READ_WRITE_TOKEN) {
        await del(existingSettings.logoBlobPath);
      }
      nextLogoBlobPath = null;
    }

    await prisma.salonSettings.upsert({
      where: { salonId: user.salonId },
      update: {
        weergavenaam: parsed.data.weergavenaam,
        branchType: selectedBranchType,
        contactEmail: parsed.data.contactEmail || null,
        contactTelefoon: parsed.data.contactTelefoon || null,
        adres: parsed.data.adres || null,
        primaireKleur: parsed.data.primaireKleur,
        logoUrl: nextLogoUrl,
        logoBlobPath: nextLogoBlobPath,
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
        logoUrl: nextLogoUrl,
        logoBlobPath: nextLogoBlobPath,
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
      (existingSettings?.logoUrl ?? null) !== nextLogoUrl ? "logoUrl" : null,
      (existingSettings?.logoBlobPath ?? null) !== nextLogoBlobPath ? "logoBlobPath" : null,
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
    revalidatePath("/login");
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
