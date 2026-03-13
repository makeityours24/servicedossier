"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { hashPassword, requirePlatformAdmin } from "@/lib/auth";
import { getSalonLoginUrl } from "@/lib/app-url";
import { prisma } from "@/lib/prisma";
import { platformSalonSchema, platformSalonUpdateSchema } from "@/lib/validation";

export type PlatformSalonFormState = {
  error?: string;
  success?: string;
  onboarding?: {
    salonNaam: string;
    salonSlug: string;
    eigenaarEmail: string;
    loginUrl: string;
  };
};

function slugify(value: string) {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export async function createSalonAction(
  _: PlatformSalonFormState,
  formData: FormData
): Promise<PlatformSalonFormState> {
  await requirePlatformAdmin();

  const parsed = platformSalonSchema.safeParse({
    naam: formData.get("naam"),
    status: formData.get("status") || "ACTIEF",
    email: formData.get("email") || "",
    telefoonnummer: formData.get("telefoonnummer") || "",
    adres: formData.get("adres") || "",
    eigenaarNaam: formData.get("eigenaarNaam"),
    eigenaarEmail: formData.get("eigenaarEmail"),
    eigenaarWachtwoord: formData.get("eigenaarWachtwoord")
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Controleer de ingevoerde gegevens." };
  }

  const slug = slugify(parsed.data.naam);
  if (!slug) {
    return { error: "De salonnaam kan niet worden omgezet naar een geldige slug." };
  }

  try {
    await prisma.$transaction(async (tx) => {
      const salon = await tx.salon.create({
        data: {
          naam: parsed.data.naam,
          slug,
          status: parsed.data.status,
          email: parsed.data.email || null,
          telefoonnummer: parsed.data.telefoonnummer || null,
          adres: parsed.data.adres || null,
          instellingen: {
            create: {
              weergavenaam: parsed.data.naam,
              contactEmail: parsed.data.email || null,
              contactTelefoon: parsed.data.telefoonnummer || null,
              adres: parsed.data.adres || null
            }
          }
        }
      });

      await tx.user.create({
        data: {
          salonId: salon.id,
          naam: parsed.data.eigenaarNaam,
          email: parsed.data.eigenaarEmail.toLowerCase(),
          wachtwoord: hashPassword(parsed.data.eigenaarWachtwoord),
          moetWachtwoordWijzigen: true,
          isPlatformAdmin: false,
          rol: "OWNER",
          status: "ACTIEF"
        }
      });
    });

    revalidatePath("/platform");
    return {
      success: "Salon en eigenaar zijn aangemaakt.",
      onboarding: {
        salonNaam: parsed.data.naam,
        salonSlug: slug,
        eigenaarEmail: parsed.data.eigenaarEmail.toLowerCase(),
        loginUrl: getSalonLoginUrl(slug)
      }
    };
  } catch {
    return { error: "Aanmaken is mislukt. Mogelijk bestaat de salon of het e-mailadres al." };
  }
}

export async function updateSalonAction(
  _: PlatformSalonFormState,
  formData: FormData
): Promise<PlatformSalonFormState> {
  await requirePlatformAdmin();

  const parsed = platformSalonUpdateSchema.safeParse({
    salonId: formData.get("salonId"),
    naam: formData.get("naam"),
    status: formData.get("status") || "ACTIEF",
    email: formData.get("email") || "",
    telefoonnummer: formData.get("telefoonnummer") || "",
    adres: formData.get("adres") || ""
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Controleer de ingevoerde gegevens." };
  }

  const slug = slugify(parsed.data.naam);
  if (!slug) {
    return { error: "De salonnaam kan niet worden omgezet naar een geldige slug." };
  }

  try {
    await prisma.$transaction(async (tx) => {
      const salon = await tx.salon.findUnique({
        where: { id: parsed.data.salonId },
        select: { id: true }
      });

      if (!salon) {
        throw new Error("Salon niet gevonden.");
      }

      await tx.salon.update({
        where: { id: parsed.data.salonId },
        data: {
          naam: parsed.data.naam,
          slug,
          status: parsed.data.status,
          email: parsed.data.email || null,
          telefoonnummer: parsed.data.telefoonnummer || null,
          adres: parsed.data.adres || null,
          instellingen: {
            upsert: {
              create: {
                weergavenaam: parsed.data.naam,
                contactEmail: parsed.data.email || null,
                contactTelefoon: parsed.data.telefoonnummer || null,
                adres: parsed.data.adres || null
              },
              update: {
                weergavenaam: parsed.data.naam,
                contactEmail: parsed.data.email || null,
                contactTelefoon: parsed.data.telefoonnummer || null,
                adres: parsed.data.adres || null
              }
            }
          }
        }
      });
    });

    revalidatePath("/platform");
    revalidatePath(`/platform/${parsed.data.salonId}/bewerken`);
    return { success: "Salon is bijgewerkt." };
  } catch {
    return { error: "Bijwerken is mislukt. Mogelijk bestaat de salonnaam al." };
  }
}

export async function deleteSalonAction(formData: FormData): Promise<void> {
  await requirePlatformAdmin();

  const salonId = Number(formData.get("salonId"));

  if (!Number.isInteger(salonId)) {
    throw new Error("Ongeldige salon geselecteerd.");
  }

  const salon = await prisma.salon.findUnique({
    where: { id: salonId },
    select: { id: true }
  });

  if (!salon) {
    throw new Error("Salon niet gevonden.");
  }

  await prisma.salon.delete({
    where: { id: salonId }
  });

  revalidatePath("/platform");
  redirect("/platform");
}
