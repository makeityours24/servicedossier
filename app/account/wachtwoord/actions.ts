"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import type { FormState } from "@/components/customer-form";
import { clearSession, hashPassword, requireSession, setSession, verifyPassword } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import {
  assertSensitiveActionAllowed,
  clearSensitiveActionThrottle,
  createAuditLog,
  getRequestIp,
  revokeUserSessions,
  registerSensitiveActionAttempt
} from "@/lib/security";
import { passwordChangeSchema } from "@/lib/core/validation/auth";

export async function changePasswordAction(
  _: FormState,
  formData: FormData
): Promise<FormState> {
  const user = await requireSession({ allowPasswordChange: true });
  const ipAddress = await getRequestIp();
  const throttle = await assertSensitiveActionAllowed({
    action: "PASSWORD_CHANGE",
    actorUserId: user.id,
    salonId: user.salonId,
    ipAddress
  });
  const parsed = passwordChangeSchema.safeParse({
    huidigWachtwoord: formData.get("huidigWachtwoord") || "",
    nieuwWachtwoord: formData.get("nieuwWachtwoord"),
    bevestigWachtwoord: formData.get("bevestigWachtwoord")
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Controleer de wachtwoordgegevens." };
  }

  if (!throttle.allowed) {
    return { error: throttle.error };
  }

  if (!user.moetWachtwoordWijzigen) {
    const volledigeUser = await prisma.user.findUnique({
      where: { id: user.id },
      select: { wachtwoord: true }
    });

    const isCurrentPasswordValid = volledigeUser
      ? await verifyPassword(parsed.data.huidigWachtwoord || "", volledigeUser.wachtwoord)
      : false;

    if (!isCurrentPasswordValid) {
      await registerSensitiveActionAttempt({
        key: throttle.key,
        action: "PASSWORD_CHANGE",
        actorUserId: user.id,
        salonId: user.salonId,
        ipAddress
      });
      return { error: "Het huidige wachtwoord is onjuist." };
    }
  }

  await prisma.user.update({
    where: { id: user.id },
    data: {
      wachtwoord: await hashPassword(parsed.data.nieuwWachtwoord),
      moetWachtwoordWijzigen: false
    }
  });

  await createAuditLog({
    salonId: user.salonId,
    actorUserId: user.id,
    action: "PASSWORD_CHANGED",
    entityType: user.isPlatformAdmin ? "PLATFORM_USER" : "USER",
    entityId: user.id,
    message: "Wachtwoord gewijzigd.",
    ipAddress
  });
  await clearSensitiveActionThrottle(throttle.key);
  const updatedSession = await revokeUserSessions(user.id);
  await clearSession();
  await setSession(user.id, updatedSession.sessionVersion);

  revalidatePath("/dashboard");
  revalidatePath("/platform");
  revalidatePath("/account/wachtwoord");
  redirect(user.isPlatformAdmin ? "/platform" : "/dashboard");
}
