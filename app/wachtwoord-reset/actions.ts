"use server";

import { redirect } from "next/navigation";
import { clearSession, hashPassword } from "@/lib/auth";
import { hashPasswordResetToken } from "@/lib/password-reset";
import { prisma } from "@/lib/prisma";
import {
  assertSensitiveActionAllowed,
  clearSensitiveActionThrottle,
  createAuditLog,
  getRequestIp,
  registerSensitiveActionAttempt,
  revokeUserSessions
} from "@/lib/security";
import { passwordResetCompleteSchema } from "@/lib/core/validation/auth";

export type PasswordResetCompleteState = {
  error?: string;
};

const INVALID_TOKEN_MESSAGE = "Deze resetlink is ongeldig of verlopen.";

export async function completePasswordResetAction(
  _: PasswordResetCompleteState,
  formData: FormData
): Promise<PasswordResetCompleteState> {
  const ipAddress = await getRequestIp();
  const throttle = await assertSensitiveActionAllowed({
    action: "PASSWORD_RESET_COMPLETE",
    ipAddress
  });

  const parsed = passwordResetCompleteSchema.safeParse({
    token: formData.get("token"),
    nieuwWachtwoord: formData.get("nieuwWachtwoord"),
    bevestigWachtwoord: formData.get("bevestigWachtwoord")
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? INVALID_TOKEN_MESSAGE };
  }

  if (!throttle.allowed) {
    return { error: throttle.error };
  }

  const tokenHash = hashPasswordResetToken(parsed.data.token);
  const resetRecord = await prisma.passwordResetToken.findUnique({
    where: { tokenHash },
    select: {
      id: true,
      userId: true,
      usedAt: true,
      expiresAt: true,
      user: {
        select: {
          id: true,
          salonId: true
        }
      }
    }
  });

  const isInvalid =
    !resetRecord ||
    Boolean(resetRecord.usedAt) ||
    resetRecord.expiresAt <= new Date() ||
    !resetRecord.user;

  if (isInvalid) {
    await registerSensitiveActionAttempt({
      key: throttle.key,
      action: "PASSWORD_RESET_COMPLETE",
      ipAddress
    });
    return { error: INVALID_TOKEN_MESSAGE };
  }

  const newPasswordHash = await hashPassword(parsed.data.nieuwWachtwoord);

  await prisma.$transaction(async (tx) => {
    await tx.user.update({
      where: { id: resetRecord.userId },
      data: {
        wachtwoord: newPasswordHash,
        moetWachtwoordWijzigen: false
      }
    });

    await tx.passwordResetToken.update({
      where: { id: resetRecord.id },
      data: {
        usedAt: new Date()
      }
    });

    await tx.passwordResetToken.deleteMany({
      where: {
        userId: resetRecord.userId,
        id: {
          not: resetRecord.id
        }
      }
    });
  });

  await revokeUserSessions(resetRecord.userId);
  await clearSession();
  await createAuditLog({
    salonId: resetRecord.user.salonId,
    actorUserId: resetRecord.userId,
    action: "PASSWORD_RESET_COMPLETED",
    entityType: "USER",
    entityId: resetRecord.userId,
    message: "Wachtwoordreset voltooid.",
    ipAddress
  });
  await clearSensitiveActionThrottle(throttle.key);

  redirect("/login?bericht=reset-voltooid");
}
