"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import type { FormState } from "@/components/customer-form";
import { requireSalonSession, hashPassword } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import {
  getTeamDeletePolicyError,
  getTeamUpdatePolicyError,
  hasTeamManagementRights
} from "@/lib/security-policies";
import {
  assertSensitiveActionAllowed,
  clearSensitiveActionThrottle,
  createAuditLog,
  getRequestIp,
  registerSensitiveActionAttempt
} from "@/lib/security";
import { medewerkerSchema, medewerkerUpdateSchema } from "@/lib/validation";

export async function createMedewerkerAction(
  _: FormState,
  formData: FormData
): Promise<FormState> {
  const user = await requireSalonSession();
  const ipAddress = await getRequestIp();
  const throttle = await assertSensitiveActionAllowed({
    action: "TEAM_CREATE",
    actorUserId: user.id,
    salonId: user.salonId,
    ipAddress
  });

  if (!hasTeamManagementRights(user.rol)) {
    return { error: "Alleen eigenaren en admins kunnen medewerkers beheren." };
  }

  if (!throttle.allowed) {
    return { error: throttle.error };
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
    const medewerker = await prisma.user.create({
      data: {
        salonId: user.salonId,
        naam: parsed.data.naam,
        email: parsed.data.email.toLowerCase(),
        wachtwoord: await hashPassword(parsed.data.wachtwoord),
        moetWachtwoordWijzigen: true,
        rol: parsed.data.rol,
        status: parsed.data.status
      }
    });

    await createAuditLog({
      salonId: user.salonId,
      actorUserId: user.id,
      action: "USER_CREATED",
      entityType: "USER",
      entityId: medewerker.id,
      message: "Medewerker aangemaakt.",
      ipAddress,
      metadata: {
        rol: parsed.data.rol,
        status: parsed.data.status
      }
    });
    await clearSensitiveActionThrottle(throttle.key);

    revalidatePath("/team");
    return { success: "Medewerker is toegevoegd." };
  } catch {
    await registerSensitiveActionAttempt({
      key: throttle.key,
      action: "TEAM_CREATE",
      actorUserId: user.id,
      salonId: user.salonId,
      ipAddress
    });
    return { error: "Opslaan is mislukt. Mogelijk bestaat het e-mailadres al." };
  }
}

export async function updateMedewerkerAction(
  _: FormState,
  formData: FormData
): Promise<FormState> {
  const user = await requireSalonSession();
  const ipAddress = await getRequestIp();
  const throttle = await assertSensitiveActionAllowed({
    action: "TEAM_UPDATE",
    actorUserId: user.id,
    salonId: user.salonId,
    ipAddress
  });

  if (!hasTeamManagementRights(user.rol)) {
    return { error: "Alleen eigenaren en admins kunnen medewerkers beheren." };
  }

  if (!throttle.allowed) {
    return { error: throttle.error };
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
        rol: true,
        status: true
      }
    });

    if (!bestaandeMedewerker) {
      return { error: "Deze medewerker hoort niet bij deze salon." };
    }

    const ownerCount = await prisma.user.count({
      where: {
        salonId: user.salonId,
        isPlatformAdmin: false,
        rol: "OWNER"
      }
    });

    const policyError = getTeamUpdatePolicyError({
      actorRole: user.rol,
      actorId: user.id,
      targetUserId: bestaandeMedewerker.id,
      currentTargetRole: bestaandeMedewerker.rol,
      nextTargetRole: parsed.data.rol,
      nextStatus: parsed.data.status,
      ownerCount
    });

    if (policyError) {
      return { error: policyError };
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
              wachtwoord: await hashPassword(parsed.data.wachtwoord),
              moetWachtwoordWijzigen: true
            }
          : {})
      }
    });

    await createAuditLog({
      salonId: user.salonId,
      actorUserId: user.id,
      action: "USER_UPDATED",
      entityType: "USER",
      entityId: parsed.data.medewerkerId,
      message: "Medewerker bijgewerkt.",
      ipAddress,
      metadata: {
        vorigeRol: bestaandeMedewerker.rol,
        nieuweRol: parsed.data.rol,
        vorigeStatus: bestaandeMedewerker.status,
        nieuweStatus: parsed.data.status,
        wachtwoordGeroteerd: Boolean(parsed.data.wachtwoord)
      }
    });
    await clearSensitiveActionThrottle(throttle.key);

    revalidatePath("/team");
    revalidatePath(`/team/${parsed.data.medewerkerId}/bewerken`);
    return { success: "Medewerker is bijgewerkt." };
  } catch {
    await registerSensitiveActionAttempt({
      key: throttle.key,
      action: "TEAM_UPDATE",
      actorUserId: user.id,
      salonId: user.salonId,
      ipAddress
    });
    return { error: "Bijwerken is mislukt. Mogelijk bestaat het e-mailadres al." };
  }
}

export async function deleteMedewerkerAction(formData: FormData): Promise<void> {
  const user = await requireSalonSession();
  const ipAddress = await getRequestIp();
  const throttle = await assertSensitiveActionAllowed({
    action: "TEAM_DELETE",
    actorUserId: user.id,
    salonId: user.salonId,
    ipAddress
  });

  if (!hasTeamManagementRights(user.rol)) {
    throw new Error("Alleen eigenaren en admins kunnen medewerkers beheren.");
  }

  if (!throttle.allowed) {
    throw new Error(throttle.error);
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

  const ownerCount = medewerker.rol === "OWNER"
    ? await prisma.user.count({
        where: {
          salonId: user.salonId,
          isPlatformAdmin: false,
          rol: "OWNER"
        }
      })
    : 0;

  const policyError = getTeamDeletePolicyError({
    actorRole: user.rol,
    actorId: user.id,
    targetUserId: medewerker.id,
    targetUserRole: medewerker.rol,
    ownerCount
  });

  if (policyError) {
    throw new Error(policyError);
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
  await clearSensitiveActionThrottle(throttle.key);

  revalidatePath("/team");
  redirect("/team");
}
