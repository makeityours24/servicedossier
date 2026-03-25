"use server";

import { sendPasswordResetEmail } from "@/lib/email";
import { createPasswordResetToken, getPasswordResetUrl } from "@/lib/password-reset";
import { prisma } from "@/lib/prisma";
import {
  assertSensitiveActionAllowed,
  createAuditLog,
  getRequestIp,
  registerSensitiveActionAttempt
} from "@/lib/security";
import { passwordResetRequestSchema } from "@/lib/core/validation/auth";

export type PasswordResetRequestState = {
  error?: string;
  success?: string;
};

const GENERIC_SUCCESS_MESSAGE =
  "Als dit account bestaat, is er een resetlink verstuurd. Controleer je inbox en spammap.";

export async function requestPasswordResetAction(
  _: PasswordResetRequestState,
  formData: FormData
): Promise<PasswordResetRequestState> {
  const ipAddress = await getRequestIp();
  const throttle = await assertSensitiveActionAllowed({
    action: "PASSWORD_RESET_REQUEST",
    ipAddress
  });

  const parsed = passwordResetRequestSchema.safeParse({
    email: formData.get("email")
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Controleer het e-mailadres." };
  }

  if (!throttle.allowed) {
    return { error: throttle.error };
  }

  const email = parsed.data.email.toLowerCase();
  const user = await prisma.user.findUnique({
    where: { email },
    select: {
      id: true,
      naam: true,
      salonId: true,
      status: true,
      salon: {
        select: {
          naam: true
        }
      }
    }
  });

  await registerSensitiveActionAttempt({
    key: throttle.key,
    action: "PASSWORD_RESET_REQUEST",
    actorUserId: user?.id ?? null,
    salonId: user?.salonId ?? null,
    ipAddress
  });

  if (!user || user.status !== "ACTIEF") {
    return { success: GENERIC_SUCCESS_MESSAGE };
  }

  const resetToken = createPasswordResetToken();

  await prisma.passwordResetToken.deleteMany({
    where: { userId: user.id }
  });

  await prisma.passwordResetToken.create({
    data: {
      userId: user.id,
      tokenHash: resetToken.tokenHash,
      expiresAt: resetToken.expiresAt,
      requestedByIp: ipAddress
    }
  });

  const delivery = await sendPasswordResetEmail({
    to: email,
    recipientName: user.naam,
    salonName: user.salon?.naam ?? "SalonDossier",
    resetUrl: getPasswordResetUrl(resetToken.token)
  });

  if (!delivery.delivered) {
    await prisma.passwordResetToken.deleteMany({
      where: {
        userId: user.id,
        tokenHash: resetToken.tokenHash
      }
    });

    await createAuditLog({
      salonId: user.salonId,
      actorUserId: user.id,
      action: "PASSWORD_RESET_REQUEST_SKIPPED",
      entityType: "USER",
      entityId: user.id,
      message:
        delivery.reason === "not_configured"
          ? "Resetverzoek aangemaakt maar niet verstuurd omdat e-mail nog niet geconfigureerd is."
          : "Resetverzoek aangemaakt maar aflevering via e-mailprovider is mislukt.",
      ipAddress
    });

    return { success: GENERIC_SUCCESS_MESSAGE };
  }

  await createAuditLog({
    salonId: user.salonId,
    actorUserId: user.id,
    action: "PASSWORD_RESET_REQUESTED",
    entityType: "USER",
    entityId: user.id,
    message: "Wachtwoordreset aangevraagd en resetlink verstuurd.",
    ipAddress
  });

  return { success: GENERIC_SUCCESS_MESSAGE };
}
