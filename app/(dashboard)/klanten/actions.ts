"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import type { FormState } from "@/components/customer-form";
import { requireSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { customerSchema, treatmentSchema } from "@/lib/validation";

export async function createCustomerAction(
  _: FormState,
  formData: FormData
): Promise<FormState> {
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

export async function createTreatmentAction(
  _: FormState,
  formData: FormData
): Promise<FormState> {
  const user = await requireSession();

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
