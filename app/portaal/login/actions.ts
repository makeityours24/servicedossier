"use server";

import { redirect } from "next/navigation";
import { hashPassword, needsPasswordRehash, verifyPassword } from "@/lib/core/auth";
import { prisma } from "@/lib/prisma";
import { assertLoginAllowed, clearLoginThrottle, createAuditLog, getRequestIp, registerFailedLogin } from "@/lib/core/security";
import { loginSchema } from "@/lib/core/validation/auth";
import { setPortalSession } from "@/lib/installateurs/portal-auth";

export type PortalLoginState = {
  error?: string;
};

export async function portalLoginAction(_: PortalLoginState, formData: FormData): Promise<PortalLoginState> {
  const ipAddress = await getRequestIp();
  const salonSlug = String(formData.get("salonSlug") || "").trim().toLowerCase();
  const parsed = loginSchema.safeParse({
    email: formData.get("email"),
    wachtwoord: formData.get("wachtwoord")
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Controleer uw invoer." };
  }

  if (!salonSlug) {
    return { error: "Kies eerst de juiste portalomgeving." };
  }

  const throttle = await assertLoginAllowed({
    email: parsed.data.email,
    ipAddress,
    salonSlug
  });

  if (!throttle.allowed) {
    return { error: throttle.error };
  }

  const salon = await prisma.salon.findUnique({
    where: { slug: salonSlug },
    select: {
      id: true,
      slug: true,
      naam: true,
      status: true
    }
  });

  if (!salon || salon.status === "GEPAUZEERD") {
    await registerFailedLogin({
      key: throttle.key,
      email: parsed.data.email,
      ipAddress,
      salonSlug
    });

    return { error: "Deze portal is niet beschikbaar." };
  }

  const portalUser = await prisma.customerPortalUser.findFirst({
    where: {
      salonId: salon.id,
      email: parsed.data.email.toLowerCase()
    },
    select: {
      id: true,
      wachtwoord: true,
      sessionVersion: true,
      status: true
    }
  });

  const isPasswordValid = portalUser
    ? await verifyPassword(parsed.data.wachtwoord, portalUser.wachtwoord)
    : false;

  if (!portalUser || portalUser.status !== "ACTIEF" || !isPasswordValid) {
    await registerFailedLogin({
      key: throttle.key,
      email: parsed.data.email,
      ipAddress,
      salonSlug
    });

    await createAuditLog({
      salonId: salon.id,
      action: "PORTAL_LOGIN_FAILED",
      entityType: "CustomerPortalUser",
      message: "Portal login mislukt.",
      ipAddress,
      metadata: {
        email: parsed.data.email.toLowerCase()
      }
    });

    return { error: "Onjuiste inloggegevens." };
  }

  await clearLoginThrottle({
    email: parsed.data.email,
    ipAddress,
    salonSlug
  });

  if (needsPasswordRehash(portalUser.wachtwoord)) {
    await prisma.customerPortalUser.update({
      where: { id: portalUser.id },
      data: {
        wachtwoord: await hashPassword(parsed.data.wachtwoord)
      }
    });
  }

  await prisma.customerPortalUser.update({
    where: { id: portalUser.id },
    data: {
      lastLoginAt: new Date()
    }
  });

  await createAuditLog({
    salonId: salon.id,
    action: "PORTAL_LOGIN_SUCCESS",
    entityType: "CustomerPortalUser",
    message: "Succesvolle klantportal-login.",
    ipAddress,
    metadata: {
      portalUserId: portalUser.id
    }
  });

  await setPortalSession(portalUser.id, portalUser.sessionVersion);
  redirect("/portaal");
}
