"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import type { FormState } from "@/components/customer-form";
import { hashPassword, requireSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { createAuditLog, getRequestIp } from "@/lib/security";
import { passwordChangeSchema } from "@/lib/validation";

export async function changePasswordAction(
  _: FormState,
  formData: FormData
): Promise<FormState> {
  const user = await requireSession({ allowPasswordChange: true });
  const ipAddress = await getRequestIp();
  const parsed = passwordChangeSchema.safeParse({
    huidigWachtwoord: formData.get("huidigWachtwoord") || "",
    nieuwWachtwoord: formData.get("nieuwWachtwoord"),
    bevestigWachtwoord: formData.get("bevestigWachtwoord")
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Controleer de wachtwoordgegevens." };
  }

  if (!user.moetWachtwoordWijzigen) {
    const volledigeUser = await prisma.user.findUnique({
      where: { id: user.id },
      select: { wachtwoord: true }
    });

    if (!volledigeUser || volledigeUser.wachtwoord !== hashPassword(parsed.data.huidigWachtwoord || "")) {
      return { error: "Het huidige wachtwoord is onjuist." };
    }
  }

  await prisma.user.update({
    where: { id: user.id },
    data: {
      wachtwoord: hashPassword(parsed.data.nieuwWachtwoord),
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

  revalidatePath("/dashboard");
  revalidatePath("/platform");
  revalidatePath("/account/wachtwoord");
  redirect(user.isPlatformAdmin ? "/platform" : "/dashboard");
}
