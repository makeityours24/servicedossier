"use server";

import { redirect } from "next/navigation";
import { clearSession, hashPassword, setSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { loginSchema } from "@/lib/validation";

export type LoginState = {
  error?: string;
};

export async function loginAction(_: LoginState, formData: FormData): Promise<LoginState> {
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

  const salon = salonInput
    ? await prisma.salon.findUnique({
        where: { slug: salonInput },
        select: { id: true, naam: true, status: true }
      })
    : null;

  if (salonInput && !salon) {
    redirect("/login?fout=niet-gevonden");
  }

  if (salon?.status === "GEPAUZEERD") {
    redirect(`/login?salon=${salonInput}&fout=gepauzeerd`);
  }

  const user = await prisma.user.findUnique({
    where: { email: parsed.data.email.toLowerCase() },
    select: {
      id: true,
      wachtwoord: true,
      salonId: true,
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

  if (!user || user.status !== "ACTIEF" || user.wachtwoord !== hashPassword(parsed.data.wachtwoord)) {
    return { error: "Onjuiste inloggegevens." };
  }

  if (salon && user.isPlatformAdmin) {
    return { error: "Platformbeheer logt in via de centrale login zonder saloncode." };
  }

  if (salon && user.salonId !== salon.id) {
    return { error: "Dit account hoort niet bij de geselecteerde salon." };
  }

  if (!user.isPlatformAdmin && user.salon?.status === "GEPAUZEERD") {
    redirect(`/login?salon=${user.salon.slug}&fout=gepauzeerd`);
  }

  await setSession(user.id);
  redirect(user.moetWachtwoordWijzigen ? "/account/wachtwoord" : user.isPlatformAdmin ? "/platform" : "/dashboard");
}

export async function logoutAction() {
  await clearSession();
  redirect("/login");
}
