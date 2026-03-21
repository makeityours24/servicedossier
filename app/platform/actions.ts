"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { hashPassword, requirePlatformAdmin } from "@/lib/auth";
import { getSalonLoginUrl } from "@/lib/app-url";
import { prisma } from "@/lib/prisma";
import {
  assertSensitiveActionAllowed,
  clearSensitiveActionThrottle,
  createAuditLog,
  getRequestIp,
  registerSensitiveActionAttempt
} from "@/lib/security";
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
  const actor = await requirePlatformAdmin();
  const ipAddress = await getRequestIp();
  const throttle = await assertSensitiveActionAllowed({
    action: "PLATFORM_SALON_CREATE",
    actorUserId: actor.id,
    ipAddress
  });

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

  if (!throttle.allowed) {
    return { error: throttle.error };
  }

  const slug = slugify(parsed.data.naam);
  if (!slug) {
    return { error: "De salonnaam kan niet worden omgezet naar een geldige slug." };
  }

  const bestaandeSalon = await prisma.salon.findFirst({
    where: {
      OR: [{ slug }, { naam: parsed.data.naam }]
    },
    select: {
      id: true,
      naam: true,
      slug: true
    }
  });

  if (bestaandeSalon) {
    return {
      error: `Deze salon bestaat al. Gebruik een andere salonnaam of saloncode. Bestaande salon: ${bestaandeSalon.naam} (${bestaandeSalon.slug}).`
    };
  }

  const bestaandeGebruiker = await prisma.user.findUnique({
    where: { email: parsed.data.eigenaarEmail.toLowerCase() },
    select: { id: true }
  });

  if (bestaandeGebruiker) {
    return {
      error: "Het e-mailadres van de eigenaar is al in gebruik. Kies een ander e-mailadres voor deze gebruiker."
    };
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
          wachtwoord: await hashPassword(parsed.data.eigenaarWachtwoord),
          moetWachtwoordWijzigen: true,
          isPlatformAdmin: false,
          rol: "OWNER",
          status: "ACTIEF"
        }
      });
    });

    revalidatePath("/platform");
    await createAuditLog({
      actorUserId: actor.id,
      action: "SALON_CREATED",
      entityType: "SALON",
      entityId: slug,
      message: "Nieuwe salon en eerste eigenaar aangemaakt.",
      ipAddress,
      metadata: {
        salonNaam: parsed.data.naam,
        salonSlug: slug,
        eigenaarEmail: parsed.data.eigenaarEmail.toLowerCase()
      }
    });
    await clearSensitiveActionThrottle(throttle.key);
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
    await registerSensitiveActionAttempt({
      key: throttle.key,
      action: "PLATFORM_SALON_CREATE",
      actorUserId: actor.id,
      ipAddress
    });
    return { error: "Aanmaken is mislukt. Mogelijk bestaat de salon of het e-mailadres al." };
  }
}

export async function updateSalonAction(
  _: PlatformSalonFormState,
  formData: FormData
): Promise<PlatformSalonFormState> {
  const actor = await requirePlatformAdmin();
  const ipAddress = await getRequestIp();
  const throttle = await assertSensitiveActionAllowed({
    action: "PLATFORM_SALON_UPDATE",
    actorUserId: actor.id,
    ipAddress
  });

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

  if (!throttle.allowed) {
    return { error: throttle.error };
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
    await createAuditLog({
      actorUserId: actor.id,
      action: "SALON_UPDATED",
      entityType: "SALON",
      entityId: parsed.data.salonId,
      message: "Salon bijgewerkt.",
      ipAddress,
      metadata: {
        salonNaam: parsed.data.naam,
        status: parsed.data.status
      }
    });
    await clearSensitiveActionThrottle(throttle.key);
    return { success: "Salon is bijgewerkt." };
  } catch {
    await registerSensitiveActionAttempt({
      key: throttle.key,
      action: "PLATFORM_SALON_UPDATE",
      actorUserId: actor.id,
      ipAddress
    });
    return { error: "Bijwerken is mislukt. Mogelijk bestaat de salonnaam al." };
  }
}

export async function deleteSalonAction(formData: FormData): Promise<void> {
  const actor = await requirePlatformAdmin();
  const ipAddress = await getRequestIp();
  const throttle = await assertSensitiveActionAllowed({
    action: "PLATFORM_SALON_DELETE",
    actorUserId: actor.id,
    ipAddress
  });

  if (!throttle.allowed) {
    throw new Error(throttle.error);
  }

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

  await createAuditLog({
    actorUserId: actor.id,
    action: "SALON_DELETED",
    entityType: "SALON",
    entityId: salonId,
    message: "Salon verwijderd.",
    ipAddress
  });
  await clearSensitiveActionThrottle(throttle.key);

  revalidatePath("/platform");
  redirect("/platform");
}
