"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import type { FormState } from "@/components/customer-form";
import { requireSalonSession } from "@/lib/auth";
import { normalizeBranchType } from "@/lib/branch-profile";
import { parseCustomerImportFile, type CustomerImportPreview } from "@/lib/customer-import";
import { getCurrentLocale } from "@/lib/i18n";
import { prisma } from "@/lib/prisma";
import {
  assertSensitiveActionAllowed,
  clearSensitiveActionThrottle,
  createAuditLog,
  getRequestIp,
  registerSensitiveActionAttempt
} from "@/lib/security";
import { customerSchema } from "@/lib/salon/validation";

export type CustomerImportPreviewState = {
  error?: string;
  success?: string;
  preview?: CustomerImportPreview;
};

export type CustomerImportState = {
  error?: string;
  success?: string;
  importedCount?: number;
  skippedCount?: number;
};

export async function createCustomerAction(
  _: FormState,
  formData: FormData
): Promise<FormState> {
  const user = await requireSalonSession();
  const parsed = customerSchema.safeParse({
    naam: formData.get("naam"),
    adres: formData.get("adres"),
    telefoonnummer: formData.get("telefoonnummer"),
    geboortedatum: formData.get("geboortedatum"),
    allergieen: formData.get("allergieen") || undefined,
    haartype: formData.get("haartype") || undefined,
    haarkleur: formData.get("haarkleur") || undefined,
    stylistNotities: formData.get("stylistNotities") || undefined
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Controleer de klantgegevens." };
  }

  let klantId: number;

  try {
    const klant = await prisma.customer.create({
      data: {
        salonId: user.salonId,
        naam: parsed.data.naam,
        adres: parsed.data.adres,
        telefoonnummer: parsed.data.telefoonnummer,
        geboortedatum: parsed.data.geboortedatum ? new Date(parsed.data.geboortedatum) : null,
        allergieen: parsed.data.allergieen || null,
        haartype: parsed.data.haartype || null,
        haarkleur: parsed.data.haarkleur || null,
        stylistNotities: parsed.data.stylistNotities || null
      }
    });

    klantId = klant.id;
  } catch {
    return { error: "Opslaan is mislukt. Controleer of het telefoonnummer al bestaat." };
  }

  revalidatePath("/klanten");
  redirect(`/klanten/${klantId}`);
}

export async function createQuickCustomerAction(
  _: FormState,
  formData: FormData
): Promise<FormState> {
  const user = await requireSalonSession();
  const parsed = customerSchema.safeParse({
    naam: formData.get("naam"),
    adres: formData.get("adres"),
    telefoonnummer: formData.get("telefoonnummer"),
    geboortedatum: undefined,
    allergieen: undefined,
    haartype: undefined,
    haarkleur: undefined,
    stylistNotities: undefined
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Controleer de klantgegevens." };
  }

  try {
    const klant = await prisma.customer.create({
      data: {
        salonId: user.salonId,
        naam: parsed.data.naam,
        adres: parsed.data.adres,
        telefoonnummer: parsed.data.telefoonnummer
      }
    });

    revalidatePath("/agenda");
    revalidatePath("/klanten");

    return {
      success: `${klant.naam} is toegevoegd en direct beschikbaar voor deze afspraak.`,
      createdCustomerId: klant.id,
      createdCustomerName: klant.naam
    };
  } catch {
    return { error: "Opslaan is mislukt. Controleer of het telefoonnummer al bestaat." };
  }
}

export async function previewCustomerImportAction(
  _: CustomerImportPreviewState,
  formData: FormData
): Promise<CustomerImportPreviewState> {
  const user = await requireSalonSession();
  const locale = await getCurrentLocale();
  const file = formData.get("customerImportFile");

  if (!(file instanceof File)) {
    return { error: "Kies eerst een CSV-bestand." };
  }

  try {
    const { preview } = await parseCustomerImportFile({
      file,
      locale,
      branchType: normalizeBranchType(user.salon.instellingen?.branchType)
    });

    return {
      success:
        preview.invalidRows === 0
          ? "Bestand gecontroleerd. Deze rijen zijn klaar voor de importstap."
          : "Bestand gecontroleerd. Pas eerst de rijen met fouten aan.",
      preview
    };
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : "Het bestand kon niet worden gecontroleerd."
    };
  }
}

export async function importCustomersFromTemplateAction(
  _: CustomerImportState,
  formData: FormData
): Promise<CustomerImportState> {
  const user = await requireSalonSession();
  const locale = await getCurrentLocale();
  const ipAddress = await getRequestIp();
  const throttle = await assertSensitiveActionAllowed({
    action: "CUSTOMER_IMPORT",
    actorUserId: user.id,
    salonId: user.salonId,
    ipAddress
  });

  if (!throttle.allowed) {
    return { error: throttle.error };
  }

  await registerSensitiveActionAttempt({
    key: throttle.key,
    action: "CUSTOMER_IMPORT",
    actorUserId: user.id,
    salonId: user.salonId,
    ipAddress
  });

  const file = formData.get("customerImportFile");

  if (!(file instanceof File)) {
    return { error: "Kies eerst een CSV-bestand om te importeren." };
  }

  try {
    const { preview, validRecords: importableRecords } = await parseCustomerImportFile({
      file,
      locale,
      branchType: normalizeBranchType(user.salon.instellingen?.branchType)
    });

    if (preview.invalidRows > 0) {
      return { error: "Los eerst de rijen met fouten op voordat je importeert." };
    }

    if (importableRecords.length === 0) {
      return { error: "Er staan geen geldige klantregels in dit bestand." };
    }

    const phoneNumbers = importableRecords.map((record) => record.telefoonnummer);
    const existingCustomers = await prisma.customer.findMany({
      where: {
        salonId: user.salonId,
        telefoonnummer: { in: phoneNumbers }
      },
      select: {
        telefoonnummer: true
      }
    });

    const existingPhoneNumbers = new Set(existingCustomers.map((customer) => customer.telefoonnummer));
    const toCreate = importableRecords.filter((record) => !existingPhoneNumbers.has(record.telefoonnummer));
    const skippedCount = importableRecords.length - toCreate.length;

    if (toCreate.length === 0) {
      return {
        error: "Alle geldige klantregels bestaan al in deze salon op basis van telefoonnummer."
      };
    }

    await prisma.customer.createMany({
      data: toCreate.map((record) => ({
        salonId: user.salonId,
        naam: record.naam,
        telefoonnummer: record.telefoonnummer,
        adres: record.adres,
        geboortedatum: record.geboortedatum ? new Date(record.geboortedatum) : null,
        allergieen: record.allergieen || null,
        haartype: record.haartype || null,
        haarkleur: record.haarkleur || null,
        stylistNotities: record.stylistNotities || null
      })),
      skipDuplicates: true
    });

    await createAuditLog({
      salonId: user.salonId,
      actorUserId: user.id,
      action: "CUSTOMER_IMPORT",
      entityType: "CUSTOMER",
      message: "Klanten geimporteerd via template.",
      ipAddress,
      metadata: {
        importedCount: toCreate.length,
        skippedCount
      }
    });

    await clearSensitiveActionThrottle(throttle.key);
    revalidatePath("/klanten");
    revalidatePath("/dashboard");

    return {
      success:
        skippedCount > 0
          ? `${toCreate.length} klanten geimporteerd. ${skippedCount} regels zijn overgeslagen omdat het telefoonnummer al bestond.`
          : `${toCreate.length} klanten zijn succesvol geimporteerd.`,
      importedCount: toCreate.length,
      skippedCount
    };
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : "Het importeren is mislukt."
    };
  }
}

export async function updateCustomerAction(
  _: FormState,
  formData: FormData
): Promise<FormState> {
  const user = await requireSalonSession();
  const customerId = Number(formData.get("customerId"));
  const parsed = customerSchema.safeParse({
    naam: formData.get("naam"),
    adres: formData.get("adres"),
    telefoonnummer: formData.get("telefoonnummer"),
    geboortedatum: formData.get("geboortedatum"),
    allergieen: formData.get("allergieen") || undefined,
    haartype: formData.get("haartype") || undefined,
    haarkleur: formData.get("haarkleur") || undefined,
    stylistNotities: formData.get("stylistNotities") || undefined
  });

  if (!Number.isInteger(customerId)) {
    return { error: "Ongeldige klant geselecteerd." };
  }

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Controleer de klantgegevens." };
  }

  try {
    const bestaandeKlant = await prisma.customer.findFirst({
      where: {
        id: customerId,
        salonId: user.salonId
      },
      select: { id: true }
    });

    if (!bestaandeKlant) {
      return { error: "Deze klant hoort niet bij deze salon." };
    }

    await prisma.customer.update({
      where: { id: customerId },
      data: {
        naam: parsed.data.naam,
        adres: parsed.data.adres,
        telefoonnummer: parsed.data.telefoonnummer,
        geboortedatum: parsed.data.geboortedatum ? new Date(parsed.data.geboortedatum) : null,
        allergieen: parsed.data.allergieen || null,
        haartype: parsed.data.haartype || null,
        haarkleur: parsed.data.haarkleur || null,
        stylistNotities: parsed.data.stylistNotities || null
      }
    });

    revalidatePath("/klanten");
    revalidatePath(`/klanten/${customerId}`);
    return { success: "Klantgegevens zijn bijgewerkt." };
  } catch {
    return { error: "Bijwerken is mislukt. Controleer of het telefoonnummer uniek is." };
  }
}

export async function deleteCustomerAction(formData: FormData): Promise<void> {
  const user = await requireSalonSession();
  const ipAddress = await getRequestIp();
  const customerId = Number(formData.get("customerId"));

  if (!Number.isInteger(customerId)) {
    throw new Error("Ongeldige klant geselecteerd.");
  }

  const bestaandeKlant = await prisma.customer.findFirst({
    where: {
      id: customerId,
      salonId: user.salonId
    },
    select: { id: true }
  });

  if (!bestaandeKlant) {
    throw new Error("Deze klant hoort niet bij deze salon.");
  }

  await prisma.customer.delete({
    where: { id: customerId }
  });

  await createAuditLog({
    salonId: user.salonId,
    actorUserId: user.id,
    action: "CUSTOMER_DELETED",
    entityType: "CUSTOMER",
    entityId: customerId,
    message: "Klant verwijderd.",
    ipAddress
  });

  revalidatePath("/klanten");
  revalidatePath("/dashboard");
  redirect("/klanten");
}
