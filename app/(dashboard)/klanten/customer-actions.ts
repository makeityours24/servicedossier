"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import type { FormState } from "@/components/customer-form";
import { requireSalonSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { createAuditLog, getRequestIp } from "@/lib/security";
import { customerSchema } from "@/lib/validation";

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
