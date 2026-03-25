"use server";

import { redirect } from "next/navigation";
import { clearSession, hashPassword, needsPasswordRehash, setSession, verifyPassword } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import {
  assertLoginAllowed,
  clearLoginThrottle,
  createAuditLog,
  getRequestIp,
  registerFailedLogin
} from "@/lib/security";
import { loginSchema } from "@/lib/core/validation/auth";

export type LoginState = {
  error?: string;
};

export async function loginAction(_: LoginState, formData: FormData): Promise<LoginState> {
  const ipAddress = await getRequestIp();
  const salonInput =
    String(formData.get("salonSlug") || formData.get("salonCode") || "")
      .trim()
      .toLowerCase();
  const parsed = loginSchema.safeParse({
    email: formData.get("email"),
    wachtwoord: formData.get("wachtwoord")
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Controleer uw invoer." };
  }

  const throttle = await assertLoginAllowed({
    email: parsed.data.email,
    ipAddress,
    salonSlug: salonInput || undefined
  });

  if (!throttle.allowed) {
    await createAuditLog({
      action: "LOGIN_BLOCKED",
      entityType: "AUTH",
      message: "Login geblokkeerd door rate limiting.",
      ipAddress,
      metadata: {
        email: parsed.data.email.toLowerCase(),
        salonSlug: salonInput || null
      }
    });

    return { error: throttle.error };
  }

  const salon = salonInput
    ? await prisma.salon.findUnique({
        where: { slug: salonInput },
        select: { id: true, naam: true, status: true }
      })
    : null;

  if (salonInput && !salon) {
    await registerFailedLogin({
      key: throttle.key,
      email: parsed.data.email,
      ipAddress,
      salonSlug: salonInput
    });
    await createAuditLog({
      action: "LOGIN_FAILED",
      entityType: "AUTH",
      message: "Login mislukt: saloncode niet gevonden.",
      ipAddress,
      metadata: {
        email: parsed.data.email.toLowerCase(),
        salonSlug: salonInput
      }
    });
    redirect("/login?fout=niet-gevonden");
  }

  if (salon?.status === "GEPAUZEERD") {
    await createAuditLog({
      salonId: salon.id,
      action: "LOGIN_REJECTED",
      entityType: "SALON",
      entityId: salon.id,
      message: "Login geweigerd omdat de salon gepauzeerd is.",
      ipAddress,
      metadata: {
        email: parsed.data.email.toLowerCase(),
        salonSlug: salonInput
      }
    });
    redirect(`/login?salon=${salonInput}&fout=gepauzeerd`);
  }

  const user = await prisma.user.findUnique({
    where: { email: parsed.data.email.toLowerCase() },
    select: {
      id: true,
      wachtwoord: true,
      salonId: true,
      sessionVersion: true,
      isPlatformAdmin: true,
      moetWachtwoordWijzigen: true,
      status: true,
      salon: {
        select: {
          slug: true,
          status: true
        }
      }
    }
  });

  const isPasswordValid = user
    ? await verifyPassword(parsed.data.wachtwoord, user.wachtwoord)
    : false;

  if (!user || user.status !== "ACTIEF" || !isPasswordValid) {
    await registerFailedLogin({
      key: throttle.key,
      email: parsed.data.email,
      ipAddress,
      salonSlug: salonInput || undefined
    });
    await createAuditLog({
      salonId: user?.salonId ?? salon?.id ?? null,
      actorUserId: user?.id ?? null,
      action: "LOGIN_FAILED",
      entityType: "AUTH",
      message: "Login mislukt: onjuiste inloggegevens of account niet actief.",
      ipAddress,
      metadata: {
        email: parsed.data.email.toLowerCase(),
        salonSlug: salonInput || null
      }
    });
    return { error: "Onjuiste inloggegevens." };
  }

  if (salon && user.isPlatformAdmin) {
    await createAuditLog({
      actorUserId: user.id,
      action: "LOGIN_REJECTED",
      entityType: "AUTH",
      message: "Platformbeheerder probeerde via saloncontext in te loggen.",
      ipAddress,
      metadata: {
        email: parsed.data.email.toLowerCase(),
        salonSlug: salonInput
      }
    });
    return { error: "Platformbeheer logt in via de centrale platformlogin, niet via een salonomgeving." };
  }

  if (salon && user.salonId !== salon.id) {
    await registerFailedLogin({
      key: throttle.key,
      email: parsed.data.email,
      ipAddress,
      salonSlug: salonInput
    });
    await createAuditLog({
      salonId: salon.id,
      actorUserId: user.id,
      action: "LOGIN_REJECTED",
      entityType: "AUTH",
      message: "Account hoort niet bij de geselecteerde salon.",
      ipAddress,
      metadata: {
        email: parsed.data.email.toLowerCase(),
        userSalonId: user.salonId,
        requestedSalonId: salon.id
      }
    });
    return { error: "Dit account hoort niet bij de geselecteerde salon." };
  }

  if (!user.isPlatformAdmin && user.salon?.status === "GEPAUZEERD") {
    await createAuditLog({
      salonId: user.salonId,
      actorUserId: user.id,
      action: "LOGIN_REJECTED",
      entityType: "SALON",
      entityId: user.salonId,
      message: "Login geweigerd omdat de salon gepauzeerd is.",
      ipAddress
    });
    redirect(`/login?salon=${user.salon.slug}&fout=gepauzeerd`);
  }

  await clearLoginThrottle({
    email: parsed.data.email,
    ipAddress,
    salonSlug: salonInput || undefined
  });

  if (needsPasswordRehash(user.wachtwoord)) {
    await prisma.user.update({
      where: { id: user.id },
      data: {
        wachtwoord: await hashPassword(parsed.data.wachtwoord)
      }
    });
  }

  await createAuditLog({
    salonId: user.salonId,
    actorUserId: user.id,
    action: "LOGIN_SUCCESS",
    entityType: user.isPlatformAdmin ? "PLATFORM" : "SALON",
    entityId: user.isPlatformAdmin ? "platform" : user.salonId,
    message: "Succesvolle login.",
    ipAddress
  });
  await setSession(user.id, user.sessionVersion);
  redirect(user.moetWachtwoordWijzigen ? "/account/wachtwoord" : user.isPlatformAdmin ? "/platform" : "/dashboard");
}

export async function logoutAction() {
  await clearSession();
  redirect("/login");
}
