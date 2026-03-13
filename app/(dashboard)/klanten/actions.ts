"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import type { FormState } from "@/components/customer-form";
import { requireSalonSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { customerSchema, treatmentSchema } from "@/lib/validation";

export async function createCustomerAction(
  _: FormState,
  formData: FormData
): Promise<FormState> {
  const user = await requireSalonSession();
  const parsed = customerSchema.safeParse({
    naam: formData.get("naam"),
    adres: formData.get("adres"),
    telefoonnummer: formData.get("telefoonnummer")
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

    revalidatePath("/klanten");
    redirect(`/klanten/${klant.id}`);
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
    telefoonnummer: formData.get("telefoonnummer")
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
      data: parsed.data
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

  revalidatePath("/klanten");
  revalidatePath("/dashboard");
  redirect("/klanten");
}

export async function createTreatmentAction(
  _: FormState,
  formData: FormData
): Promise<FormState> {
  const user = await requireSalonSession();

  const parsed = treatmentSchema.safeParse({
    customerId: formData.get("customerId"),
    datum: formData.get("datum"),
    behandeling: formData.get("behandeling"),
    recept: formData.get("recept"),
    behandelaar: formData.get("behandelaar"),
    notities: formData.get("notities") || undefined
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Controleer de behandelgegevens." };
  }

  try {
    await prisma.treatment.create({
      data: {
        salonId: user.salonId,
        customerId: parsed.data.customerId,
        userId: user.id,
        datum: new Date(parsed.data.datum),
        behandeling: parsed.data.behandeling,
        recept: parsed.data.recept,
        behandelaar: parsed.data.behandelaar,
        notities: parsed.data.notities
      }
    });

    revalidatePath(`/klanten/${parsed.data.customerId}`);
    revalidatePath("/dashboard");
    return { success: "Behandeling is opgeslagen." };
  } catch {
    return { error: "Opslaan van de behandeling is mislukt." };
  }
}

export async function updateTreatmentAction(
  _: FormState,
  formData: FormData
): Promise<FormState> {
  const user = await requireSalonSession();
  const treatmentId = Number(formData.get("treatmentId"));

  if (!Number.isInteger(treatmentId)) {
    return { error: "Ongeldige behandeling geselecteerd." };
  }

  const parsed = treatmentSchema.safeParse({
    customerId: formData.get("customerId"),
    datum: formData.get("datum"),
    behandeling: formData.get("behandeling"),
    recept: formData.get("recept"),
    behandelaar: formData.get("behandelaar"),
    notities: formData.get("notities") || undefined
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Controleer de behandelgegevens." };
  }

  try {
    const bestaandeBehandeling = await prisma.treatment.findFirst({
      where: {
        id: treatmentId,
        salonId: user.salonId,
        customerId: parsed.data.customerId
      },
      select: { id: true }
    });

    if (!bestaandeBehandeling) {
      return { error: "Deze behandeling hoort niet bij deze salon of klant." };
    }

    await prisma.treatment.update({
      where: { id: treatmentId },
      data: {
        datum: new Date(parsed.data.datum),
        behandeling: parsed.data.behandeling,
        recept: parsed.data.recept,
        behandelaar: parsed.data.behandelaar,
        notities: parsed.data.notities
      }
    });

    revalidatePath(`/klanten/${parsed.data.customerId}`);
    revalidatePath(`/klanten/${parsed.data.customerId}/print`);
    return { success: "Behandeling is bijgewerkt." };
  } catch {
    return { error: "Bijwerken van de behandeling is mislukt." };
  }
}

export async function deleteTreatmentAction(formData: FormData): Promise<void> {
  const user = await requireSalonSession();
  const treatmentId = Number(formData.get("treatmentId"));
  const customerId = Number(formData.get("customerId"));

  if (!Number.isInteger(treatmentId) || !Number.isInteger(customerId)) {
    throw new Error("Ongeldige behandeling geselecteerd.");
  }

  const behandeling = await prisma.treatment.findFirst({
    where: {
      id: treatmentId,
      salonId: user.salonId,
      customerId
    },
    select: { id: true }
  });

  if (!behandeling) {
    throw new Error("Behandeling niet gevonden.");
  }

  await prisma.treatment.delete({
    where: { id: treatmentId }
  });

  revalidatePath(`/klanten/${customerId}`);
  revalidatePath(`/klanten/${customerId}/print`);
  revalidatePath("/dashboard");
  redirect(`/klanten/${customerId}`);
}
