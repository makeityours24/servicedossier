"use server";

import { redirect } from "next/navigation";
import { clearSession, hashPassword, setSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { loginSchema } from "@/lib/validation";

export type LoginState = {
  error?: string;
};

export async function loginAction(_: LoginState, formData: FormData): Promise<LoginState> {
  const parsed = loginSchema.safeParse({
    email: formData.get("email"),
    wachtwoord: formData.get("wachtwoord")
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Controleer uw invoer." };
  }

  const user = await prisma.user.findUnique({
    where: { email: parsed.data.email.toLowerCase() }
  });

  if (!user || user.wachtwoord !== hashPassword(parsed.data.wachtwoord)) {
    return { error: "Onjuiste inloggegevens." };
  }

  await setSession(user.id);
  redirect("/dashboard");
}

export async function logoutAction() {
  await clearSession();
  redirect("/login");
}
