"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import type { FormState } from "@/components/customer-form";
import { requireSalonSession, hashPassword } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { createAuditLog, getRequestIp } from "@/lib/security";
import { medewerkerSchema, medewerkerUpdateSchema } from "@/lib/validation";

function hasTeamBeheerRechten(rol: "OWNER" | "ADMIN" | "MEDEWERKER") {
  return rol === "OWNER" || rol === "ADMIN";
}

export async function createMedewerkerAction(
  _: FormState,
  formData: FormData
): Promise<FormState> {
  const user = await requireSalonSession();

  if (!hasTeamBeheerRechten(user.rol)) {
    return { error: "Alleen eigenaren en admins kunnen medewerkers beheren." };
  }

  const parsed = medewerkerSchema.safeParse({
    naam: formData.get("naam"),
    email: formData.get("email"),
    wachtwoord: formData.get("wachtwoord"),
    rol: formData.get("rol"),
    status: formData.get("status") || "ACTIEF"
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Controleer de medewerkergegevens." };
  }

  try {
    await prisma.user.create({
      data: {
        salonId: user.salonId,
        naam: parsed.data.naam,
        email: parsed.data.email.toLowerCase(),
        wachtwoord: hashPassword(parsed.data.wachtwoord),
        moetWachtwoordWijzigen: true,
        rol: parsed.data.rol,
        status: parsed.data.status
      }
    });

    revalidatePath("/team");
    return { success: "Medewerker is toegevoegd." };
  } catch {
    return { error: "Opslaan is mislukt. Mogelijk bestaat het e-mailadres al." };
  }
}

export async function updateMedewerkerAction(
  _: FormState,
  formData: FormData
): Promise<FormState> {
  const user = await requireSalonSession();

  if (!hasTeamBeheerRechten(user.rol)) {
    return { error: "Alleen eigenaren en admins kunnen medewerkers beheren." };
  }

  const parsed = medewerkerUpdateSchema.safeParse({
    medewerkerId: formData.get("medewerkerId"),
    naam: formData.get("naam"),
    email: formData.get("email"),
    wachtwoord: formData.get("wachtwoord") || "",
    rol: formData.get("rol"),
    status: formData.get("status") || "ACTIEF"
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Controleer de medewerkergegevens." };
  }

  try {
    const bestaandeMedewerker = await prisma.user.findFirst({
      where: {
        id: parsed.data.medewerkerId,
        salonId: user.salonId,
        isPlatformAdmin: false
      },
      select: {
        id: true,
        rol: true
      }
    });

    if (!bestaandeMedewerker) {
      return { error: "Deze medewerker hoort niet bij deze salon." };
    }

    if (user.rol !== "OWNER" && parsed.data.rol === "OWNER") {
      return { error: "Alleen een eigenaar kan een andere eigenaar toewijzen." };
    }

    if (bestaandeMedewerker.id === user.id && parsed.data.status === "UITGESCHAKELD") {
      return { error: "Je kunt je eigen account niet uitschakelen." };
    }

    const ownerCount = await prisma.user.count({
      where: {
        salonId: user.salonId,
        isPlatformAdmin: false,
        rol: "OWNER"
      }
    });

    const ownerVerdwijnt =
      bestaandeMedewerker.rol === "OWNER" &&
      (parsed.data.rol !== "OWNER" || parsed.data.status === "UITGESCHAKELD");

    if (ownerVerdwijnt && ownerCount <= 1) {
      return { error: "Deze salon moet minimaal één actieve eigenaar behouden." };
    }

    await prisma.user.update({
      where: { id: parsed.data.medewerkerId },
      data: {
        naam: parsed.data.naam,
        email: parsed.data.email.toLowerCase(),
        rol: parsed.data.rol,
        status: parsed.data.status,
        ...(parsed.data.wachtwoord
          ? {
              wachtwoord: hashPassword(parsed.data.wachtwoord),
              moetWachtwoordWijzigen: true
            }
          : {})
      }
    });

    revalidatePath("/team");
    revalidatePath(`/team/${parsed.data.medewerkerId}/bewerken`);
    return { success: "Medewerker is bijgewerkt." };
  } catch {
    return { error: "Bijwerken is mislukt. Mogelijk bestaat het e-mailadres al." };
  }
}

export async function deleteMedewerkerAction(formData: FormData): Promise<void> {
  const user = await requireSalonSession();
  const ipAddress = await getRequestIp();

  if (!hasTeamBeheerRechten(user.rol)) {
    throw new Error("Alleen eigenaren en admins kunnen medewerkers beheren.");
  }

  const medewerkerId = Number(formData.get("medewerkerId"));

  if (!Number.isInteger(medewerkerId)) {
    throw new Error("Ongeldige medewerker geselecteerd.");
  }

  const medewerker = await prisma.user.findFirst({
    where: {
      id: medewerkerId,
      salonId: user.salonId,
      isPlatformAdmin: false
    },
    select: {
      id: true,
      rol: true
    }
  });

  if (!medewerker) {
    throw new Error("Medewerker niet gevonden.");
  }

  if (medewerker.id === user.id) {
    throw new Error("Je kunt je eigen account niet verwijderen.");
  }

  if (medewerker.rol === "OWNER") {
    const ownerCount = await prisma.user.count({
      where: {
        salonId: user.salonId,
        isPlatformAdmin: false,
        rol: "OWNER"
      }
    });

    if (ownerCount <= 1) {
      throw new Error("Deze salon moet minimaal één eigenaar behouden.");
    }
  }

  await prisma.user.delete({
    where: { id: medewerkerId }
  });

  await createAuditLog({
    salonId: user.salonId,
    actorUserId: user.id,
    action: "USER_DELETED",
    entityType: "USER",
    entityId: medewerkerId,
    message: "Medewerker verwijderd.",
    ipAddress
  });

  revalidatePath("/team");
  redirect("/team");
}
