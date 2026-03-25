"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import type { FormState } from "@/components/customer-form";
import { requireSalonSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { recipeTemplateSchema, recipeTemplateUpdateSchema } from "@/lib/salon/validation";

function hasTemplateBeheerRechten(rol: "OWNER" | "ADMIN" | "MEDEWERKER") {
  return rol === "OWNER" || rol === "ADMIN";
}

export async function createRecipeTemplateAction(
  _: FormState,
  formData: FormData
): Promise<FormState> {
  const user = await requireSalonSession();

  if (!hasTemplateBeheerRechten(user.rol)) {
    return { error: "Alleen eigenaren en admins kunnen receptsjablonen beheren." };
  }

  const parsed = recipeTemplateSchema.safeParse({
    naam: formData.get("naam"),
    behandeling: formData.get("behandeling"),
    recept: formData.get("recept"),
    notities: formData.get("notities") || undefined
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Controleer de sjabloongegevens." };
  }

  try {
    await prisma.recipeTemplate.create({
      data: {
        salonId: user.salonId,
        naam: parsed.data.naam,
        behandeling: parsed.data.behandeling,
        recept: parsed.data.recept,
        notities: parsed.data.notities
      }
    });

    revalidatePath("/recepten");
    return { success: "Receptsjabloon is toegevoegd." };
  } catch {
    return { error: "Opslaan van het sjabloon is mislukt." };
  }
}

export async function updateRecipeTemplateAction(
  _: FormState,
  formData: FormData
): Promise<FormState> {
  const user = await requireSalonSession();

  if (!hasTemplateBeheerRechten(user.rol)) {
    return { error: "Alleen eigenaren en admins kunnen receptsjablonen beheren." };
  }

  const parsed = recipeTemplateUpdateSchema.safeParse({
    templateId: formData.get("templateId"),
    naam: formData.get("naam"),
    behandeling: formData.get("behandeling"),
    recept: formData.get("recept"),
    notities: formData.get("notities") || undefined
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Controleer de sjabloongegevens." };
  }

  try {
    const bestaandSjabloon = await prisma.recipeTemplate.findFirst({
      where: {
        id: parsed.data.templateId,
        salonId: user.salonId
      },
      select: { id: true }
    });

    if (!bestaandSjabloon) {
      return { error: "Dit sjabloon hoort niet bij deze salon." };
    }

    await prisma.recipeTemplate.update({
      where: { id: parsed.data.templateId },
      data: {
        naam: parsed.data.naam,
        behandeling: parsed.data.behandeling,
        recept: parsed.data.recept,
        notities: parsed.data.notities
      }
    });

    revalidatePath("/recepten");
    revalidatePath(`/recepten/${parsed.data.templateId}/bewerken`);
    return { success: "Receptsjabloon is bijgewerkt." };
  } catch {
    return { error: "Bijwerken van het sjabloon is mislukt." };
  }
}

export async function deleteRecipeTemplateAction(formData: FormData): Promise<void> {
  const user = await requireSalonSession();

  if (!hasTemplateBeheerRechten(user.rol)) {
    throw new Error("Alleen eigenaren en admins kunnen receptsjablonen beheren.");
  }

  const templateId = Number(formData.get("templateId"));

  if (!Number.isInteger(templateId)) {
    throw new Error("Ongeldig sjabloon geselecteerd.");
  }

  const template = await prisma.recipeTemplate.findFirst({
    where: {
      id: templateId,
      salonId: user.salonId
    },
    select: { id: true }
  });

  if (!template) {
    throw new Error("Sjabloon niet gevonden.");
  }

  await prisma.recipeTemplate.delete({
    where: { id: templateId }
  });

  revalidatePath("/recepten");
  redirect("/recepten");
}
